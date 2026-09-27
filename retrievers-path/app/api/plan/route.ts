import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { NextResponse } from "next/server";
import { buildBuiltinPlan, finalizePlan, PlanSchema, ProfileSchema, RESOURCE_LINKS, type Profile } from "@/lib/plan";
import { focusAreas, getProgram, levelLabels, yearsByLevel } from "@/lib/programs";

export const runtime = "nodejs";
export const maxDuration = 180;

// POST { profile } -> { plan, note? }
// Uses Claude when an API key is configured; otherwise (or on failure) the built-in planner,
// so the app always works in a demo.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = ProfileSchema.safeParse(body?.profile);
  if (!parsed.success || !getProgram(parsed.data.programIds[0])) {
    return NextResponse.json({ error: "Invalid profile" }, { status: 400 });
  }
  const profile = parsed.data;

  const hasKey = Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
  if (!hasKey) {
    return NextResponse.json({
      plan: finalizePlan(buildBuiltinPlan(profile), "builtin"),
      note: "Built with the offline planner. Add ANTHROPIC_API_KEY to .env.local for AI-personalized plans.",
    });
  }

  try {
    const plan = await planWithClaude(profile);
    return NextResponse.json({ plan: finalizePlan(plan, "ai") });
  } catch (error) {
    // Log the specific failure for developers; students still get a plan.
    if (error instanceof Anthropic.AuthenticationError) console.error("[plan] Invalid Anthropic API key");
    else if (error instanceof Anthropic.RateLimitError) console.error("[plan] Rate limited by Anthropic API");
    else if (error instanceof Anthropic.APIError) console.error(`[plan] Anthropic API error ${error.status}:`, error.message);
    else console.error("[plan] AI planning failed:", error);
    return NextResponse.json({
      plan: finalizePlan(buildBuiltinPlan(profile), "builtin"),
      note: "The AI planner was unavailable, so this plan was built with the offline planner.",
    });
  }
}

const SYSTEM_PROMPT = `You are RetrieversPath, an academic and career planning assistant for students at UMBC (University of Maryland, Baltimore County).

You create a specific, year-by-year plan for one student that connects their program(s), minors, focus areas, and career goal. The value of the plan is its specificity: a Computer Science student aiming for biomedical computation should see a different plan than one aiming for game development; a Psychology student aiming to be a clinical psychologist should see research-lab, practicum, and Ph.D./Psy.D. preparation, not generic advice.

Guidelines:
- Each year gets 7-10 checklist items that mix kinds: Class, Project, Experience, Internship, Skill, Career. Include at least one Project and, from the second year on, at least one Internship item.
- Projects are concrete ideas the student could actually build or run that year (name the dataset, tool, or audience when possible) and fit their focus.
- Internships name realistic kinds of employers, including Maryland/DC ones (e.g., Johns Hopkins, NIH, NASA Goddard, Social Security Administration, T. Rowe Price, state agencies, nonprofits) and federal Pathways programs where relevant. Do not promise specific openings.
- Classes: only cite a UMBC course number when you are confident it exists; otherwise describe the course ("an upper-level biostatistics elective"). Tell the student to confirm requirements with their advisor and the UMBC catalog.
- "detail" is one or two sentences explaining why the item matters or how to do it.
- careerTargets: 3-4 specific job titles that fit the goal, each with a searchKeyword that works in a job-board search (e.g., "health informatics", "clinical psychologist").
- resources: 1-3 per year, using ONLY URLs from this list: ${Object.values(RESOURCE_LINKS).map((r) => r.url).join(", ")}.
- Be encouraging and practical. Plain language; students may be first-generation or have ADHD, so keep sentences short.`;

async function planWithClaude(profile: Profile) {
  const client = new Anthropic({ timeout: 150_000, maxRetries: 1 });
  const programs = profile.programIds.map((id) => getProgram(id)!).filter(Boolean);
  const years = yearsByLevel[profile.level];
  const focus = profile.focusIds.map((f) => focusAreas.find((x) => x.id === f)?.label).filter(Boolean);

  const studentBrief = [
    `Level: ${levelLabels[profile.level]}`,
    `Program(s): ${programs.map((p) => `${p.name} (${p.degree})`).join(" and ")}`,
    `Minor(s): ${profile.minors.join(", ") || "none"}`,
    `Focus areas: ${[...focus, profile.customFocus].filter(Boolean).join(", ") || "not specified"}`,
    `Career goal (student's words): ${profile.careerGoal || "not sure yet; suggest options"}`,
    `Current year: ${profile.year}`,
    `Experience so far: ${profile.experience.join(", ") || "none listed"}`,
    `Anything else: ${profile.notes || "none"}`,
    `Write exactly ${years.length} years, labeled "Year N · <name>" using: ${years.join(", ")}.`,
  ].join("\n");

  const response = await client.beta.messages.parse({
    model: "claude-opus-5",
    max_tokens: 16000,
    // Medium effort keeps plan generation fast enough for students waiting on the page.
    output_config: { effort: "medium", format: betaZodOutputFormat(PlanSchema) },
    thinking: { type: "adaptive" },
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: `Create a personalized plan for this student.\n\n${studentBrief}` }],
  });

  if (response.stop_reason === "refusal") throw new Error("Model declined the request");
  if (!response.parsed_output) throw new Error(`No parsed output (stop_reason: ${response.stop_reason})`);
  return response.parsed_output;
}
