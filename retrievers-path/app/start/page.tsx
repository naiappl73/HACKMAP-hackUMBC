"use client";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  areaOf, areas, experienceOptions, focusAreas, getProgram, levelLabels, minors as minorList, programs, yearsByLevel,
  type Level,
} from "@/lib/programs";
import type { Plan, Profile } from "@/lib/plan";
import { loadProfile, saveNewPlan } from "@/lib/storage";

const steps = [
  { name: "Program", title: "What are you studying?" },
  { name: "Minors & focus", title: "Make it yours: minors and focus areas" },
  { name: "Career goal", title: "Where do you want this to take you?" },
  { name: "Where you are", title: "Where are you right now?" },
  { name: "Review", title: "Review and build your plan" },
];

const empty: Profile = {
  level: "undergrad", programIds: [], minors: [], focusIds: [], customFocus: "", careerGoal: "", year: "", experience: [], notes: "",
};

function Chip({ selected, onClick, children, disabled }: { selected: boolean; onClick: () => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button type="button" aria-pressed={selected} onClick={onClick} disabled={disabled && !selected}
      className={`press rounded-full border px-3.5 py-2 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed ${selected ? "bg-teal text-white border-teal" : "bg-surface border-line hover:border-teal"}`}>
      {children}
    </button>
  );
}

function StartWizard() {
  const router = useRouter();
  const params = useSearchParams();
  const [step, setStep] = useState(0);
  const [p, setP] = useState<Profile>(empty);
  const [query, setQuery] = useState("");
  const [area, setArea] = useState<string>("All");
  const [customMinor, setCustomMinor] = useState("");
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);

  // Start from the saved profile (editing) or a program picked on a program page.
  useEffect(() => {
    const saved = loadProfile();
    const preset = params.get("program");
    const prog = preset ? getProgram(preset) : undefined;
    if (prog) setP({ ...(saved ?? empty), level: prog.level, programIds: [prog.id], year: saved?.level === prog.level ? saved.year : "" });
    else if (saved?.programIds?.length) setP(saved);
  }, [params]);

  useEffect(() => { heading.current?.focus(); }, [step]);

  const set = (patch: Partial<Profile>) => setP((prev) => ({ ...prev, ...patch }));
  const toggleIn = (key: "programIds" | "minors" | "focusIds" | "experience", value: string, max = 99) => {
    setP((prev) => {
      const list = prev[key];
      if (list.includes(value)) return { ...prev, [key]: list.filter((v) => v !== value) };
      return list.length >= max ? prev : { ...prev, [key]: [...list, value] };
    });
  };

  const levelPrograms = useMemo(() => {
    const q = query.trim().toLowerCase();
    return programs.filter((x) => x.level === p.level && (area === "All" || areaOf(x) === area)
      && (!q || `${x.name} ${x.degree} ${x.careers.join(" ")}`.toLowerCase().includes(q)));
  }, [p.level, query, area]);

  const chosen = p.programIds.map(getProgram).filter(Boolean);
  const careerIdeas = Array.from(new Set(chosen.flatMap((x) => x!.careers))).slice(0, 10);
  const canNext = [p.programIds.length > 0, true, true, p.year !== "", true][step];
  const answers = [
    chosen.map((x) => x!.name).join(" + "),
    [...p.minors, ...p.focusIds.map((f) => focusAreas.find((x) => x.id === f)?.label)].filter(Boolean).join(", "),
    p.careerGoal,
    p.year,
    "",
  ];

  async function build() {
    setBuilding(true);
    setError("");
    try {
      const res = await fetch("/api/plan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ profile: p }) });
      const data = (await res.json()) as { plan?: Plan; note?: string; error?: string };
      if (!res.ok || !data.plan) throw new Error(data.error || "Could not build a plan.");
      saveNewPlan(p, data.plan);
      try { if (data.note) sessionStorage.setItem("rp-plan-note", data.note); } catch { /* optional */ }
      router.push("/roadmap");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setBuilding(false);
    }
  }

  function next(e: React.FormEvent) {
    e.preventDefault();
    if (!canNext) return;
    if (step < steps.length - 1) setStep(step + 1);
    else build();
  }

  if (building) return <BuildingScreen />;

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 lg:py-14 grid gap-8 lg:grid-cols-[280px_1fr] lg:gap-12 lg:items-start">
      <aside className="grid gap-5 lg:sticky lg:top-28">
        <div className="grid gap-2">
          <p className="text-sm font-semibold text-ink-3">Step {step + 1} of {steps.length}</p>
          <div className="h-2 rounded-full bg-surface-2" role="progressbar" aria-label="Setup progress" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={steps.length}>
            <div className="bar-fill h-2 rounded-full bg-gold" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
          </div>
        </div>
        <ol className="hidden lg:grid gap-2" aria-label="Setup steps">
          {steps.map((s, i) => {
            const state = i < step ? "done" : i === step ? "current" : "todo";
            return (
              <li key={s.name}>
                <button type="button" disabled={i > step} onClick={() => setStep(i)} aria-current={state === "current" ? "step" : undefined}
                  className={`press w-full text-left flex items-center gap-3 rounded-xl border px-4 py-3 disabled:cursor-default ${state === "current" ? "glass-card border-teal" : "border-line"}`}>
                  <span aria-hidden="true" className={`grid place-items-center w-7 h-7 rounded-full text-sm font-bold shrink-0 ${state === "done" ? "bg-mint text-white" : state === "current" ? "bg-gold text-on-gold" : "bg-surface-2 text-ink-3"}`}>
                    {state === "done" ? "✓" : i + 1}
                  </span>
                  <span className="grid min-w-0">
                    <span className="font-semibold">{s.name}</span>
                    <span className="text-sm text-ink-3 truncate">{answers[i] || (state === "todo" ? "Not yet" : i === 4 ? "Almost done" : "Optional")}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </aside>

      <form onSubmit={next} className="grid gap-6 min-w-0">
        <h1 ref={heading} tabIndex={-1} className="font-display text-3xl lg:text-4xl font-bold outline-none">{steps[step].title}</h1>

        <div key={step} className="grid gap-6 rise">
          {step === 0 && (
            <>
              <fieldset className="grid gap-2">
                <legend className="font-semibold mb-2">Degree level</legend>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(levelLabels) as Level[]).map((l) => (
                    <Chip key={l} selected={p.level === l} onClick={() => set({ level: l, programIds: [], year: "" })}>{levelLabels[l]}</Chip>
                  ))}
                </div>
              </fieldset>
              <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                <label className="grid gap-1.5">
                  <span className="font-semibold">Search programs</span>
                  <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Try “psychology”, “data”, or “nurse”…"
                    className="rounded-xl border border-line bg-surface px-4 py-3 outline-none focus:border-teal" />
                </label>
                <label className="grid gap-1.5">
                  <span className="font-semibold">Area</span>
                  <select value={area} onChange={(e) => setArea(e.target.value)} className="rounded-xl border border-line bg-surface px-4 py-3">
                    <option>All</option>
                    {areas.map((a) => <option key={a}>{a}</option>)}
                  </select>
                </label>
              </div>
              {chosen.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 rounded-xl bg-teal-tint px-4 py-3" aria-live="polite">
                  <span className="text-sm font-semibold text-teal">Selected:</span>
                  {chosen.map((x) => (
                    <button key={x!.id} type="button" onClick={() => toggleIn("programIds", x!.id)} aria-label={`Remove ${x!.name}`}
                      className="press flex items-center gap-1.5 rounded-full bg-surface border border-teal px-3 py-1 text-sm font-semibold">
                      {x!.name} ({x!.degree}) <span aria-hidden="true" className="text-ink-3">✕</span>
                    </button>
                  ))}
                </div>
              )}
              <p className="text-sm text-ink-3">Pick your major. Double major? Pick up to 2. ({levelPrograms.length} programs shown)</p>
              <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 max-h-[26rem] overflow-y-auto pr-1 -mr-1">
                {levelPrograms.map((x) => {
                  const on = p.programIds.includes(x.id);
                  return (
                    <li key={x.id}>
                      <button type="button" aria-pressed={on} onClick={() => toggleIn("programIds", x.id, 2)}
                        className={`glass-card interactive w-full h-full text-left p-4 grid gap-1 ${on ? "!border-teal ring-2 ring-teal" : ""}`}>
                        <span className="flex items-start justify-between gap-2">
                          <span className="font-semibold">{x.name}</span>
                          <span className="shrink-0 rounded-full bg-surface-2 text-ink-2 text-xs font-bold px-2 py-0.5">{x.degree}</span>
                        </span>
                        <span className="text-xs text-ink-3">{areaOf(x)}</span>
                      </button>
                    </li>
                  );
                })}
                {levelPrograms.length === 0 && <li className="text-ink-3">No programs match. Try another search or area.</li>}
              </ul>
            </>
          )}

          {step === 1 && (
            <>
              <fieldset className="grid gap-3">
                <legend className="font-semibold mb-1">Minors <span className="font-normal text-ink-3">(up to 3, optional)</span></legend>
                <div className="flex flex-wrap gap-2">
                  {[...minorList, ...p.minors.filter((m) => !minorList.includes(m))].map((m) => (
                    <Chip key={m} selected={p.minors.includes(m)} disabled={p.minors.length >= 3} onClick={() => toggleIn("minors", m, 3)}>{m}</Chip>
                  ))}
                </div>
                <div className="flex gap-2 max-w-md">
                  <input value={customMinor} onChange={(e) => setCustomMinor(e.target.value)} placeholder="Another minor or certificate"
                    className="flex-1 rounded-xl border border-line bg-surface px-4 py-2.5 outline-none focus:border-teal" />
                  <button type="button" className="press rounded-full border border-line bg-surface px-4 font-semibold hover:bg-surface-2"
                    onClick={() => { const m = customMinor.trim(); if (m) { toggleIn("minors", m, 3); setCustomMinor(""); } }}>Add</button>
                </div>
              </fieldset>
              <fieldset className="grid gap-3">
                <legend className="font-semibold mb-1">Focus areas <span className="font-normal text-ink-3">(up to 4): what direction do you want your major to go?</span></legend>
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {focusAreas.map((f) => {
                    const on = p.focusIds.includes(f.id);
                    return (
                      <button key={f.id} type="button" aria-pressed={on} disabled={!on && p.focusIds.length >= 4} onClick={() => toggleIn("focusIds", f.id, 4)}
                        className={`press flex items-center gap-3 rounded-xl border px-4 py-3 text-left disabled:opacity-40 ${on ? "border-teal bg-teal-tint" : "border-line bg-surface hover:border-teal"}`}>
                        <span aria-hidden="true" className="text-xl">{f.icon}</span>
                        <span className="font-semibold text-sm">{f.label}</span>
                      </button>
                    );
                  })}
                </div>
                <label className="grid gap-1.5 max-w-xl">
                  <span className="font-semibold">Something more specific?</span>
                  <input value={p.customFocus} onChange={(e) => set({ customFocus: e.target.value })} maxLength={200}
                    placeholder="e.g. medical devices, sports analytics, child therapy, voting rights"
                    className="rounded-xl border border-line bg-surface px-4 py-3 outline-none focus:border-teal" />
                </label>
              </fieldset>
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-ink-2">Pick an idea or describe it in your own words. The more specific, the better your plan.</p>
              <div className="flex flex-wrap gap-2">
                {careerIdeas.map((c) => <Chip key={c} selected={p.careerGoal === c} onClick={() => set({ careerGoal: c })}>{c}</Chip>)}
                <Chip selected={p.careerGoal === "Not sure yet"} onClick={() => set({ careerGoal: "Not sure yet" })}>Not sure yet</Chip>
              </div>
              <label className="grid gap-1.5">
                <span className="font-semibold">My career goal</span>
                <textarea value={p.careerGoal} onChange={(e) => set({ careerGoal: e.target.value })} rows={3} maxLength={300}
                  placeholder="e.g. “Build software for medical devices at a hospital or med-tech company” or “Become a licensed clinical psychologist working with teens”"
                  className="rounded-xl border border-line bg-surface px-4 py-3 outline-none focus:border-teal" />
              </label>
            </>
          )}

          {step === 3 && (
            <>
              <fieldset className="grid gap-2">
                <legend className="font-semibold mb-2">Current year</legend>
                <div className="flex flex-wrap gap-2">
                  {yearsByLevel[p.level].map((y) => <Chip key={y} selected={p.year === y} onClick={() => set({ year: y })}>{y}</Chip>)}
                </div>
              </fieldset>
              <fieldset className="grid gap-2">
                <legend className="font-semibold mb-2">Experience so far <span className="font-normal text-ink-3">(pick any)</span></legend>
                <div className="flex flex-wrap gap-2">
                  {experienceOptions.map((x) => <Chip key={x} selected={p.experience.includes(x)} onClick={() => toggleIn("experience", x)}>{x}</Chip>)}
                </div>
              </fieldset>
              <label className="grid gap-1.5">
                <span className="font-semibold">Anything else we should know?</span>
                <textarea value={p.notes} onChange={(e) => set({ notes: e.target.value })} rows={3} maxLength={500}
                  placeholder="e.g. I work 20 hours a week, I transferred from community college, my advisor said to take STAT 355, I want to study abroad"
                  className="rounded-xl border border-line bg-surface px-4 py-3 outline-none focus:border-teal" />
              </label>
            </>
          )}

          {step === 4 && (
            <div className="glass-card p-6 grid gap-4">
              <dl className="grid gap-3 sm:grid-cols-2">
                {[
                  ["Level", levelLabels[p.level]],
                  ["Program(s)", chosen.map((x) => `${x!.name} (${x!.degree})`).join(" + ")],
                  ["Minors", p.minors.join(", ") || "None"],
                  ["Focus", [...p.focusIds.map((f) => focusAreas.find((x) => x.id === f)?.label), p.customFocus].filter(Boolean).join(", ") || "Not set"],
                  ["Career goal", p.careerGoal || "Not sure yet"],
                  ["Year", p.year],
                  ["Experience", p.experience.join(", ") || "None listed"],
                  ["Notes", p.notes || "None"],
                ].map(([k, v]) => (
                  <div key={k} className="grid gap-0.5">
                    <dt className="text-xs font-semibold text-ink-3 uppercase tracking-wide">{k}</dt>
                    <dd className="font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="text-sm text-ink-3">Your plan is made with AI when it&apos;s set up, using UMBC programs and real career data. Always confirm course requirements with your advisor and the UMBC catalog.</p>
            </div>
          )}
        </div>

        {error && <p role="alert" className="rounded-xl bg-coral-tint text-coral font-semibold px-4 py-3">{error}</p>}

        <div className="flex items-center justify-between gap-3 border-t border-line pt-6">
          <button type="button" onClick={() => setStep(step - 1)} disabled={step === 0}
            className="press rounded-full px-5 py-2.5 font-semibold text-teal hover:bg-teal-tint disabled:invisible">← Back</button>
          <button type="submit" disabled={!canNext}
            className="press bg-gold text-on-gold rounded-full px-6 py-3 font-bold hover:bg-gold-soft disabled:opacity-40 disabled:cursor-not-allowed">
            {step < steps.length - 1 ? "Next" : "✨ Build my plan"}
          </button>
        </div>
      </form>
    </section>
  );
}

// Shown while the plan is generated (AI can take 20-60 seconds).
function BuildingScreen() {
  const lines = ["Reading your program and focus areas…", "Matching careers to your goal…", "Choosing classes and skills for each year…", "Finding project and internship ideas…", "Putting your plan together…"];
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => Math.min(n + 1, lines.length - 1)), 4500);
    return () => clearInterval(t);
  }, [lines.length]);
  return (
    <section className="mx-auto max-w-xl px-4 py-24 grid gap-6 justify-items-center text-center" aria-live="polite" aria-busy="true">
      <div className="building-orb" aria-hidden="true"><span /><span /><span /></div>
      <h1 className="font-display text-3xl font-bold">Building your plan</h1>
      <p key={i} className="text-lg text-ink-2 rise">{lines[i]}</p>
      <p className="text-sm text-ink-3">This can take up to a minute.</p>
    </section>
  );
}

export default function Start() {
  return <Suspense><StartWizard /></Suspense>;
}
