// Plan types + the built-in (no-AI) planner. The AI route in app/api/plan returns the same shape.
import { z } from "zod";
import { focusAreas, getProgram, levelLabels, yearsByLevel, type Family, type Level, type Program } from "@/lib/programs";

export const itemKinds = ["Class", "Project", "Experience", "Internship", "Skill", "Career"] as const;
export type ItemKind = (typeof itemKinds)[number];

// ---------- Student profile (what setup collects) ----------
export const ProfileSchema = z.object({
  level: z.enum(["undergrad", "grad", "phd"]),
  programIds: z.array(z.string()).min(1).max(2),
  minors: z.array(z.string()).max(3),
  focusIds: z.array(z.string()).max(4),
  customFocus: z.string().max(200),
  careerGoal: z.string().max(300),
  year: z.string(),
  experience: z.array(z.string()),
  notes: z.string().max(500),
});
export type Profile = z.infer<typeof ProfileSchema>;

// ---------- Plan (what the planner returns) ----------
// Kept simple so it works as a Claude structured-output schema.
export const PlanSchema = z.object({
  headline: z.string(),
  summary: z.string(),
  careerTargets: z.array(z.object({ title: z.string(), why: z.string(), searchKeyword: z.string() })),
  keySkills: z.array(z.string()),
  years: z.array(z.object({
    label: z.string(),
    theme: z.string(),
    items: z.array(z.object({ title: z.string(), kind: z.enum(itemKinds), detail: z.string() })),
    resources: z.array(z.object({ name: z.string(), url: z.string(), why: z.string() })),
  })),
});
export type PlanBody = z.infer<typeof PlanSchema>;
export type PlanItem = PlanBody["years"][number]["items"][number] & { id: string };
export type Plan = Omit<PlanBody, "years"> & {
  id: string;
  createdAt: string;
  generatedBy: "ai" | "builtin";
  years: (Omit<PlanBody["years"][number], "items"> & { items: PlanItem[] })[];
};

// Give every item a stable id so checkmarks survive reloads.
export function finalizePlan(body: PlanBody, generatedBy: Plan["generatedBy"]): Plan {
  const id = `p${Date.now().toString(36)}`;
  return {
    ...body,
    id,
    createdAt: new Date().toISOString(),
    generatedBy,
    years: body.years.map((y, yi) => ({
      ...y,
      items: y.items.map((it, ii) => ({ ...it, id: `${id}-y${yi}-i${ii}` })),
      resources: y.resources.filter((r) => isAllowedUrl(r.url)),
    })),
  };
}

// ---------- Trusted links (AI may only cite these hosts) ----------
export const RESOURCE_LINKS = {
  careerCenter: { name: "UMBC Career Center & Handshake", url: "https://careers.umbc.edu" },
  research: { name: "UMBC Undergraduate Research (URCAD)", url: "https://ur.umbc.edu" },
  shriver: { name: "Shriver Center (internships & service)", url: "https://shriver.umbc.edu" },
  catalog: { name: "UMBC Catalog (official requirements)", url: "https://catalog.umbc.edu" },
  clubs: { name: "myUMBC Groups (clubs & orgs)", url: "https://my.umbc.edu/groups" },
  gradSchool: { name: "UMBC Graduate School", url: "https://gradschool.umbc.edu" },
  hackumbc: { name: "hackUMBC", url: "https://hackumbc.org" },
  ooh: { name: "BLS Occupational Outlook Handbook", url: "https://www.bls.gov/ooh/" },
  onet: { name: "O*NET OnLine career explorer", url: "https://www.onetonline.org" },
  usajobs: { name: "USAJOBS (federal jobs & internships)", url: "https://www.usajobs.gov" },
  pathways: { name: "Federal Pathways internships", url: "https://www.usajobs.gov/help/working-in-government/unique-hiring-paths/students/" },
} as const;

const ALLOWED_HOSTS = ["umbc.edu", "hackumbc.org", "bls.gov", "onetonline.org", "usajobs.gov", "nih.gov", "nsf.gov", "apa.org", "aamc.org", "kaggle.com", "github.com"];
export function isAllowedUrl(url: string) {
  try {
    const h = new URL(url).hostname;
    return url.startsWith("https://") && ALLOWED_HOSTS.some((a) => h === a || h.endsWith("." + a));
  } catch {
    return false;
  }
}

export function usajobsSearchUrl(keyword: string) {
  return `https://www.usajobs.gov/Search/Results?k=${encodeURIComponent(keyword)}`;
}

// =====================================================================
// Built-in planner: used when no AI key is configured (or the AI call fails).
// It layers: family template (by stage) + focus-area modules + minors + career goal.
// =====================================================================
type Stage = 0 | 1 | 2 | 3; // explore, build, launch-prep, launch
type Item = { title: string; kind: ItemKind; detail: string };
const it = (kind: ItemKind, title: string, detail: string): Item => ({ kind, title, detail });

// What students in each family of majors typically do at each stage.
const familyStages: Record<Family, Item[][]> = {
  computing: [
    [it("Class", "Intro programming sequence (e.g. CMSC 201/202)", "Build the foundation every later course assumes."),
     it("Skill", "Set up GitHub and commit weekly", "Employers look at activity; small consistent commits count."),
     it("Experience", "Attend hackUMBC or a club build night", "Low-pressure way to ship something with a team.")],
    [it("Class", "Data structures & discrete math", "Core for technical interviews and upper-level electives."),
     it("Experience", "Join a club project team or research group", "Team experience is the #1 thing internship interviewers ask about."),
     it("Career", "Get your résumé reviewed at the Career Center", "Aim for one page with 2-3 projects.")],
    [it("Internship", "Apply to 20+ summer internships (Aug-Oct)", "Big companies and federal programs recruit early in the fall."),
     it("Skill", "Weekly technical interview practice", "Two problems a week beats cramming."),
     it("Class", "Upper-level electives in your focus area", "Pick the electives that match your target career.")],
    [it("Career", "Apply to full-time roles or grad school in the fall", "Most offers for new grads go out Oct-Feb."),
     it("Project", "Capstone or portfolio centerpiece", "One polished project you can demo in 2 minutes."),
     it("Experience", "Mentor a first-year student", "Leadership stories strengthen interviews.")],
  ],
  engineering: [
    [it("Class", "Calculus, physics, and intro engineering design", "These gate most sophomore engineering courses."),
     it("Experience", "Join an engineering team (robotics, SAE-style, EWB)", "Hands-on building is what employers look for."),
     it("Skill", "Learn CAD or a programming language for your field", "SolidWorks, MATLAB, or C are common starting points.")],
    [it("Class", "Core engineering sciences (statics, circuits, thermo)", "Keep your GPA strong here; it matters for co-ops."),
     it("Career", "Build a résumé and project portfolio", "Photos and short write-ups of what you built."),
     it("Internship", "Apply for co-ops or summer engineering internships", "Defense, energy, and med-device companies hire sophomores and juniors.")],
    [it("Class", "Technical electives + lab courses", "Choose electives aligned with your target industry."),
     it("Career", "Consider the FE exam timeline", "Many engineers take the FE exam near graduation."),
     it("Experience", "Research with a faculty lab", "Great if you are considering grad school.")],
    [it("Project", "Senior design capstone", "Treat it like your first job: document everything."),
     it("Career", "Apply to full-time roles (fall)", "Use career fairs and your internship network."),
     it("Skill", "Professional communication & design reviews", "Practice presenting technical trade-offs.")],
  ],
  "life-science": [
    [it("Class", "Intro biology and chemistry sequence", "These are prerequisites for nearly everything else."),
     it("Skill", "Learn to read a research paper", "Start with review articles in your interest area."),
     it("Career", "Email 3 faculty about their research", "Short, specific emails get replies.")],
    [it("Class", "Genetics, cell biology, or organic chemistry", "The core of the major; form a study group."),
     it("Experience", "Join a research lab", "Commit 8-10 hrs/week for at least two semesters."),
     it("Skill", "Learn basic R or Python for data", "Biology is increasingly computational.")],
    [it("Internship", "Apply to summer research programs (REUs, NIH SIP)", "Deadlines are often December-February."),
     it("Experience", "Present a poster at URCAD", "UMBC's undergraduate research showcase each spring."),
     it("Class", "Upper-level lab course in your focus", "Builds techniques you can list on your résumé.")],
    [it("Project", "Honors thesis or independent research", "A strong signal for grad and professional schools."),
     it("Career", "Apply to grad school, professional school, or industry roles", "Start applications the summer before."),
     it("Career", "Ask your research mentor for a recommendation letter", "Give them 4+ weeks and your résumé.")],
  ],
  "physical-science": [
    [it("Class", "Calculus and intro sequence for the major", "Math fluency makes everything else easier."),
     it("Skill", "Python for scientific computing", "NumPy and plotting show up in every lab."),
     it("Experience", "Join the department club", "Meet upper-level students and faculty.")],
    [it("Class", "Core major courses + first lab-intensive course", "Keep a lab notebook you'd be proud to show."),
     it("Experience", "Start undergraduate research", "Ask faculty whose papers interest you."),
     it("Career", "Build a résumé with lab skills", "List instruments and methods specifically.")],
    [it("Internship", "Apply to REUs, NASA, NIST, or industry internships", "Many deadlines are in the winter."),
     it("Experience", "Present research at URCAD or a conference", "Practice explaining your work to non-experts."),
     it("Class", "Advanced electives aligned with your goal", "Choose depth over breadth now.")],
    [it("Project", "Senior research project or thesis", "Aim for a result you can present."),
     it("Career", "Apply to grad programs or jobs", "Research experience is key for both."),
     it("Career", "Line up recommendation letters", "Ask early; share your goals.")],
  ],
  math: [
    [it("Class", "Calculus sequence and intro proofs", "Proof writing is the big shift from high school math."),
     it("Skill", "Learn Python or R", "Pair math with computing for more career options."),
     it("Experience", "Join a math or actuarial club", "Find study partners for tougher courses.")],
    [it("Class", "Linear algebra and probability", "The two most career-relevant math courses."),
     it("Experience", "Try a modeling competition or research project", "Great résumé material."),
     it("Career", "Explore actuarial, data, teaching, and research paths", "Talk to alumni in each.")],
    [it("Internship", "Apply to analytics, actuarial, or research internships", "Actuarial exams (P/FM) help for insurance roles."),
     it("Class", "Statistics, numerical methods, or optimization electives", "Match electives to your target career."),
     it("Project", "Data analysis project with a real dataset", "Publish the notebook on GitHub.")],
    [it("Career", "Apply to jobs or grad school", "Quantitative roles recruit in the fall."),
     it("Project", "Senior capstone or independent study", "Showcase applied math."),
     it("Experience", "Tutor at the Learning Resources Center", "Teaching deepens mastery.")],
  ],
  "social-science": [
    [it("Class", "Intro courses and a research methods course", "Methods classes unlock research roles."),
     it("Experience", "Join a club tied to your interest (debate, Model UN, advocacy)", "Builds public speaking and network."),
     it("Skill", "Build strong academic writing habits", "Visit the Writing Center with your first big paper.")],
    [it("Class", "Statistics for social science", "Quantitative skills set you apart."),
     it("Experience", "Volunteer or work with a local organization", "The Shriver Center connects students to community partners."),
     it("Career", "Informational interviews with 3 professionals", "Ask what they wish they knew as students.")],
    [it("Internship", "Internship in government, nonprofit, or research", "Consider Annapolis, D.C., or Baltimore City programs."),
     it("Experience", "Research assistant for a faculty project", "Great for grad school and policy careers."),
     it("Class", "Advanced seminar in your focus", "Write a paper you can use as a writing sample.")],
    [it("Project", "Senior thesis or capstone research", "Doubles as a writing sample for jobs and grad school."),
     it("Career", "Apply to jobs, fellowships, or grad/law school", "Many fellowships have fall deadlines."),
     it("Career", "Prepare for the GRE or LSAT if needed", "Plan test dates around application deadlines.")],
  ],
  psychology: [
    [it("Class", "Intro Psychology and Research Methods", "Research methods is the gateway to upper-level courses."),
     it("Experience", "Join Psychology Club or Psi Chi", "Meet students who are already in labs."),
     it("Skill", "Learn APA-style writing", "You'll use it in nearly every psychology course.")],
    [it("Class", "Statistics for psychology", "Needed for research positions and grad school."),
     it("Experience", "Join a faculty research lab as an RA", "Most psychology grad programs expect research experience."),
     it("Experience", "Volunteer in a helping role (crisis line, mentoring)", "Shows commitment to working with people.")],
    [it("Internship", "Clinical or applied internship / practicum", "Hospitals, schools, and community mental-health settings."),
     it("Class", "Upper-level electives in your specialty", "e.g., abnormal, developmental, health, or I-O psychology."),
     it("Experience", "Present research at URCAD", "Posters are a strong grad-school signal.")],
    [it("Project", "Honors thesis or independent study", "Especially important for Ph.D. applicants."),
     it("Career", "Apply to grad programs (M.A., M.S.W., Psy.D., Ph.D.) or jobs", "Deadlines are often December."),
     it("Career", "Prepare for the GRE if your programs require it", "Many programs are now GRE-optional; check each.")],
  ],
  humanities: [
    [it("Class", "Intro courses + a writing-intensive course", "Writing is the core professional skill here."),
     it("Experience", "Join a publication, club, or cultural organization", "Build a portfolio from day one."),
     it("Skill", "Start a writing or content portfolio", "Save your best work in one place.")],
    [it("Class", "Language study or digital humanities course", "Languages and digital skills widen your options."),
     it("Experience", "Work or volunteer with a museum, archive, or nonprofit", "Hands-on work makes your degree concrete."),
     it("Career", "Explore careers: publishing, law, UX writing, education", "Talk to alumni via LinkedIn.")],
    [it("Internship", "Internship in communications, publishing, education, or cultural orgs", "Many are paid through federal or campus programs."),
     it("Class", "Advanced seminar in your focus area", "Produce a strong writing sample."),
     it("Experience", "Study abroad or a global program", "Especially valuable for language majors.")],
    [it("Project", "Senior thesis, portfolio, or public project", "Show employers what you can create."),
     it("Career", "Apply to jobs, fellowships, or grad/law school", "Start in early fall."),
     it("Skill", "Polish your portfolio website", "A simple site with your best 5 pieces.")],
  ],
  arts: [
    [it("Class", "Foundation studio or performance courses", "Build technique and critique skills."),
     it("Experience", "Show or perform your work on campus", "Get comfortable sharing work early."),
     it("Skill", "Start documenting your work", "Photograph or record everything you make.")],
    [it("Class", "Intermediate studio + digital tools course", "Digital skills open design and media careers."),
     it("Experience", "Join or start a collaborative project", "Collaborations lead to references and credits."),
     it("Career", "Build an online portfolio", "Quality over quantity.")],
    [it("Internship", "Internship at a studio, agency, theater, or arts org", "Baltimore has a strong arts and design scene."),
     it("Experience", "Enter a juried show, festival, or competition", "Deadlines are listed by arts councils."),
     it("Class", "Advanced courses in your specialty", "Develop a recognizable body of work.")],
    [it("Project", "Senior exhibition, recital, or capstone production", "Treat it as a professional launch."),
     it("Career", "Apply to jobs, residencies, or M.F.A. programs", "Portfolio deadlines are often in winter."),
     it("Skill", "Learn freelancing basics: contracts & pricing", "Many arts careers include freelance work.")],
  ],
  health: [
    [it("Class", "Intro courses in health, biology, or social systems", "Check prerequisites for your target program."),
     it("Experience", "Volunteer in a health or community setting", "Direct patient or client contact is valued."),
     it("Career", "Shadow a professional in your target role", "Confirms your interest early.")],
    [it("Class", "Core major courses + statistics", "Data skills matter across health careers."),
     it("Experience", "Get certified (CPR, EMT, CNA, Mental Health First Aid)", "Opens paid clinical or community work."),
     it("Career", "Meet with pre-health or career advising", "Map out prerequisites and timelines.")],
    [it("Internship", "Field placement or health internship", "Hospitals, public health departments, and nonprofits."),
     it("Experience", "Leadership role in a health-related organization", "Shows initiative and teamwork."),
     it("Class", "Upper-level courses in policy, management, or practice", "Align with your target role.")],
    [it("Project", "Capstone or community health project", "Measure an outcome you can talk about."),
     it("Career", "Apply to jobs, licensure steps, or graduate programs", "Check licensure requirements for your state."),
     it("Career", "Secure recommendation letters", "Supervisors from placements are ideal.")],
  ],
  business: [
    [it("Class", "Intro economics, accounting, and business courses", "Foundations for everything else."),
     it("Experience", "Join a business, finance, or entrepreneurship club", "Case competitions build real skills."),
     it("Skill", "Get fluent in Excel", "Pivot tables, lookups, and charts.")],
    [it("Class", "Statistics and finance/management core", "Quantitative confidence stands out."),
     it("Experience", "Start or join a small venture or case competition", "UMBC's entrepreneurship programs can help."),
     it("Career", "Build your LinkedIn and network with alumni", "Aim for 2 coffee chats a month.")],
    [it("Internship", "Summer internship in finance, consulting, or tech", "Many firms recruit juniors in the fall."),
     it("Skill", "Learn SQL or a BI tool (Tableau, Power BI)", "Data skills are in demand in every business role."),
     it("Class", "Electives in your focus area", "Finance, analytics, or management.")],
    [it("Career", "Convert your internship or apply for full-time roles", "Return offers are the most common path."),
     it("Project", "Capstone or consulting project with a real client", "Great interview story."),
     it("Career", "Consider certifications (e.g., CAPM, SHRM, CFA Level I)", "Pick one aligned with your role.")],
  ],
  education: [
    [it("Class", "Intro education and content-area courses", "Check certification course requirements early."),
     it("Experience", "Tutor or mentor students", "The Learning Resources Center and local schools need tutors."),
     it("Career", "Decide on grade level and subject area", "Observe classrooms at different levels.")],
    [it("Class", "Educational psychology and methods courses", "Learn how students learn."),
     it("Experience", "Classroom observation hours", "Required for most certification pathways."),
     it("Skill", "Build lesson-planning skills", "Save your best lesson plans in a portfolio.")],
    [it("Internship", "Student teaching / internship placement", "Your most important experience; plan the timing."),
     it("Career", "Prepare for Praxis or other licensure exams", "Schedule them before your final year."),
     it("Class", "Content-area methods + inclusive teaching", "Serving all learners is essential.")],
    [it("Career", "Apply for teaching positions (spring hiring season)", "Maryland districts hire heavily in spring."),
     it("Project", "Teaching portfolio with evidence of student learning", "Used in interviews."),
     it("Experience", "Join a professional association", "Find mentors and job leads.")],
  ],
};

// Focus-area add-ons by stage: project ideas, internships, and skills specific to the student's direction.
const focusModules: Record<string, Item[][]> = {
  healthcare: [
    [it("Skill", "Learn basic medical terminology & HIPAA", "Speaks the language of healthcare teams.")],
    [it("Project", "Health data project using a public dataset", "e.g., analyze CDC or CMS data on a health question you care about.")],
    [it("Internship", "Health-sector internship (Johns Hopkins, UMMS, NIH, FDA, CMS)", "Maryland has one of the densest health ecosystems in the U.S.")],
    [it("Project", "Capstone with a clinical or public-health partner", "Solve a real problem for patients or providers.")],
  ],
  "data-ai": [
    [it("Skill", "Python + pandas fundamentals", "The toolkit for nearly all data work.")],
    [it("Project", "Kaggle-style analysis with a clear question", "Publish the notebook and a short write-up.")],
    [it("Internship", "Data analytics or ML internship", "Also look at federal data roles (Census Bureau, SSA, NIH).")],
    [it("Project", "End-to-end ML project deployed as a web app", "Shows you can go from data to a working product.")],
  ],
  ux: [
    [it("Skill", "Learn Figma and basic design principles", "Free tutorials + redesign an app you use daily.")],
    [it("Project", "Usability test of a campus website or app", "Recruit 5 students, write up findings and a redesign.")],
    [it("Internship", "UX research or design internship", "Build a case-study portfolio first.")],
    [it("Project", "Accessibility-focused design case study", "Apply WCAG guidelines; a strong differentiator.")],
  ],
  security: [
    [it("Experience", "Join the cybersecurity club and play CTFs", "Capture-the-flag events build practical skills.")],
    [it("Skill", "Networking and Linux fundamentals", "Prep for Security+ if you want a certification.")],
    [it("Internship", "Security internship (federal, defense, or industry)", "Many Maryland roles require U.S. citizenship and clearance.")],
    [it("Project", "Home lab or vulnerability research write-up", "Document what you broke and how you'd defend it.")],
  ],
  software: [
    [it("Project", "Build and ship a small web app", "Something a friend actually uses.")],
    [it("Project", "Team project with real users (club or hackathon)", "Practice code review and Git workflows.")],
    [it("Internship", "Software engineering internship", "Apply broadly: big tech, startups, government, and banks.")],
    [it("Project", "Open-source contribution", "Start with documentation or good-first-issues.")],
  ],
  research: [
    [it("Experience", "Attend a research talk or lab meeting", "See what research actually looks like.")],
    [it("Experience", "Join a lab and aim for a semester-long project", "Ask for a defined question you can own.")],
    [it("Internship", "Summer research program (REU / NIH / national labs)", "Apply broadly; acceptance rates vary.")],
    [it("Project", "First-author poster or paper", "Present at URCAD or a national conference.")],
  ],
  clinical: [
    [it("Experience", "Volunteer with a crisis line or peer support program", "Builds listening skills and confirms fit.")],
    [it("Experience", "Research assistant in a clinical psychology lab", "Critical for clinical Ph.D. applications.")],
    [it("Internship", "Practicum at a hospital, clinic, or community mental-health center", "Ask your department about approved sites.")],
    [it("Career", "Compare paths: Ph.D., Psy.D., M.S.W., LPC master's", "Each leads to licensure differently; talk to professionals in each.")],
  ],
  premed: [
    [it("Career", "Meet with pre-health advising", "Map prerequisites and a timeline.")],
    [it("Experience", "Clinical hours (scribe, EMT, CNA, hospital volunteer)", "Most programs expect hundreds of hours.")],
    [it("Career", "MCAT / GRE / DAT prep plan", "Give yourself 3-4 months of focused study.")],
    [it("Career", "Primary applications (AMCAS / CASPA etc.)", "Submit early in the cycle.")],
  ],
  policy: [
    [it("Experience", "Attend a city council or state legislative hearing", "Annapolis is close; watch policy happen.")],
    [it("Project", "Write a 2-page policy memo on an issue you care about", "A great writing sample.")],
    [it("Internship", "Legislative or agency internship (Annapolis, D.C., federal)", "Also look at federal Pathways internships.")],
    [it("Project", "Program evaluation or policy research capstone", "Use real data from a public agency.")],
  ],
  law: [
    [it("Experience", "Join mock trial, debate, or pre-law society", "Builds argumentation and public speaking.")],
    [it("Career", "Shadow or interview attorneys in 2 practice areas", "Find the area that fits you.")],
    [it("Internship", "Internship at a law office, court, or legal nonprofit", "Paralegal-style work is valuable.")],
    [it("Career", "LSAT prep and law school applications", "Apply in the fall for the next year.")],
  ],
  business: [
    [it("Experience", "Enter a pitch or case competition", "Great practice working under pressure.")],
    [it("Project", "Launch a small side venture or campus service", "Track revenue or users.")],
    [it("Internship", "Business, consulting, or startup internship", "Startups give broad responsibility early.")],
    [it("Project", "Business plan or consulting project for a real client", "Use it as a portfolio piece.")],
  ],
  finance: [
    [it("Skill", "Personal finance + Excel modeling basics", "Build a simple budget and investment model.")],
    [it("Experience", "Join an investment or finance club", "Manage a paper portfolio.")],
    [it("Internship", "Finance internship (banking, asset management, federal agencies)", "T. Rowe Price and other Baltimore firms recruit locally.")],
    [it("Career", "Pursue a certification (e.g., CFA Level I, FMVA)", "Signals commitment.")],
  ],
  education: [
    [it("Experience", "Tutor or mentor K-12 students", "Local schools and after-school programs need volunteers.")],
    [it("Project", "Design a mini-lesson or learning resource", "Test it with real learners.")],
    [it("Internship", "Education internship or summer teaching program", "Also consider educational technology companies.")],
    [it("Career", "Certification and licensure planning", "Check Maryland State Department of Education requirements.")],
  ],
  environment: [
    [it("Experience", "Join a sustainability or environmental club", "Campus projects make great résumé lines.")],
    [it("Skill", "Learn GIS basics", "Mapping skills are used across environmental careers.")],
    [it("Internship", "Environmental internship (EPA, NOAA, DNR, nonprofits)", "The Chesapeake Bay region has many opportunities.")],
    [it("Project", "Field or data project on a local environmental issue", "Present findings to a community group.")],
  ],
  media: [
    [it("Experience", "Write, film, or design for a campus outlet", "Get published early.")],
    [it("Project", "Create a content series or short film", "Show consistency and voice.")],
    [it("Internship", "Media, marketing, or communications internship", "Agencies, newsrooms, museums, and nonprofits.")],
    [it("Project", "Portfolio website with case studies", "Explain your process, not just the result.")],
  ],
  community: [
    [it("Experience", "Volunteer through the Shriver Center", "Find a cause you care about.")],
    [it("Project", "Organize a small community event or drive", "Leadership plus measurable impact.")],
    [it("Internship", "Nonprofit internship or AmeriCorps program", "Learn how nonprofits run.")],
    [it("Project", "Community-based capstone with a local partner", "Evaluate the impact you made.")],
  ],
  hardware: [
    [it("Project", "Arduino or Raspberry Pi mini-project", "Start with a sensor that measures something useful.")],
    [it("Experience", "Join robotics or a maker space team", "Build with others.")],
    [it("Internship", "Hardware, robotics, or medical device internship", "Maryland has strong defense and med-device employers.")],
    [it("Project", "Prototype a device that solves a real problem", "Document design iterations with photos.")],
  ],
  global: [
    [it("Skill", "Commit to a language sequence", "Consistency matters more than speed.")],
    [it("Experience", "Study abroad or a virtual exchange", "Plan finances and credits early.")],
    [it("Internship", "Internship with an international org or embassy", "Also look at State Department student programs.")],
    [it("Career", "Apply to fellowships (Fulbright, Gilman, Boren)", "Prestigious scholarships advising can help.")],
  ],
};

function stageFor(yearIndex: number, total: number): Stage {
  if (total <= 2) return (yearIndex === 0 ? 1 : 3) as Stage;
  const r = yearIndex / (total - 1);
  return (r < 0.25 ? 0 : r < 0.5 ? 1 : r < 0.85 ? 2 : 3) as Stage;
}

const themes = ["Explore & build foundations", "Build skills & experience", "Get real-world experience", "Launch your career"];

export function buildBuiltinPlan(profile: Profile): PlanBody {
  const progs = profile.programIds.map(getProgram).filter(Boolean) as Program[];
  const main = progs[0];
  const yearNames = yearsByLevel[profile.level as Level];
  const focus = profile.focusIds.map((f) => focusAreas.find((x) => x.id === f)).filter(Boolean);
  const goal = profile.careerGoal.trim() && profile.careerGoal !== "Not sure yet" ? profile.careerGoal.trim() : main.careers[0];
  const levelName = levelLabels[profile.level as Level];
  const targets = careerTargetsFor(profile, main, goal);
  const role = targets[0]?.title ?? main.careers[0];

  const years = yearNames.map((name, yi) => {
    const stage = stageFor(yi, yearNames.length);
    const items: Item[] = [];

    if (profile.level === "phd") {
      items.push(...phdStage(yi, main));
    } else {
      items.push(...familyStages[main.family][stage]);
      // Second major adds its core courses.
      if (progs[1]) items.push(it("Class", `${progs[1].name}: core ${stage < 2 ? "intro" : "upper-level"} requirement`, "Plan double-major courses with both advisors so nothing conflicts."));
    }
    for (const f of profile.focusIds) focusModules[f]?.[stage]?.forEach((x) => items.push(x));
    // Minors: one course per year until finished.
    profile.minors.forEach((m, mi) => {
      if (yi <= 2 && (yi + mi) % 2 === 0) items.push(it("Class", `${m} minor course`, `Space minor courses out so they don't crowd your ${main.name} requirements.`));
    });
    if (profile.customFocus && stage >= 1) {
      items.push(it("Project", `Project that combines ${main.name} with ${profile.customFocus}`, "Pick a small, specific problem where both fields meet."));
    }
    if (stage === 2) items.push(it("Career", `Informational interviews with 2 people working as a ${role}`, "Ask how they got there and what skills matter most."));

    const resources: PlanBody["years"][number]["resources"] = [];
    const R = RESOURCE_LINKS;
    if (stage === 0) resources.push({ ...R.catalog, why: "Check exact course requirements for your program." }, { ...R.clubs, why: "Find clubs related to your goals." });
    if (stage === 1) resources.push({ ...R.careerCenter, why: "Résumé reviews and Handshake job listings." }, { ...R.research, why: "Find research opportunities and URCAD." });
    if (stage === 2) resources.push({ ...R.shriver, why: "Internships, service-learning, and community placements." }, { ...R.pathways, why: "Paid federal internships for students." });
    if (stage === 3) resources.push({ ...R.usajobs, why: "Federal roles related to your goal." }, { ...R.ooh, why: "Salary and job-outlook data." });
    if (profile.level !== "undergrad" && yi === 0) resources.push({ ...R.gradSchool, why: "Funding, policies, and professional development." });

    return { label: `Year ${yi + 1} · ${name}`, theme: themes[stage], items: dedupe(items).slice(0, 10), resources };
  });

  const focusText = [...focus.map((f) => f!.label.toLowerCase()), profile.customFocus].filter(Boolean).join(", ");
  return {
    headline: `${progs.map((x) => `${x.name} (${x.degree})`).join(" + ")} → ${role}`,
    summary: `A ${yearNames.length}-year ${levelName.toLowerCase()} plan toward ${isJobTitle(goal) ? goal : `your goal: “${goal}”`}${focusText ? `, focused on ${focusText}` : ""}${profile.minors.length ? `, with a minor in ${profile.minors.join(" and ")}` : ""}. Built from typical UMBC pathways; confirm course requirements with your advisor.`,
    careerTargets: targets,
    keySkills: uniq([...main.skills, ...(progs[1]?.skills ?? [])]).slice(0, 8),
    years,
  };
}

// Job titles that match each focus area; used when the student's goal is a sentence, not a title.
const focusJobs: Record<string, { title: string; keyword: string; hint: RegExp }> = {
  healthcare: { title: "Health Informatics Specialist", keyword: "health informatics", hint: /health|medical|biomed|clinical/i },
  "data-ai": { title: "Data Scientist", keyword: "data scientist", hint: /data|machine learning|ml|analytics|statistic/i },
  ux: { title: "UX Researcher", keyword: "user experience", hint: /ux|design|user/i },
  security: { title: "Cybersecurity Specialist", keyword: "cybersecurity", hint: /secur|cyber/i },
  software: { title: "Software Developer", keyword: "software developer", hint: /software|developer/i },
  research: { title: "Research Scientist", keyword: "research scientist", hint: /research/i },
  clinical: { title: "Clinical Psychologist", keyword: "clinical psychologist", hint: /clinical|therap|counsel|social worker/i },
  premed: { title: "Medical Officer", keyword: "medical officer", hint: /physician|pre-med|medic/i },
  policy: { title: "Policy Analyst", keyword: "policy analyst", hint: /policy|government|legislat/i },
  law: { title: "Paralegal / Legal Specialist", keyword: "paralegal", hint: /law|attorney|legal/i },
  business: { title: "Management Analyst", keyword: "management analyst", hint: /business|manag|consult/i },
  finance: { title: "Financial Analyst", keyword: "financial analyst", hint: /financ|invest|bank/i },
  education: { title: "Education Program Specialist", keyword: "education specialist", hint: /teach|educat/i },
  environment: { title: "Environmental Scientist", keyword: "environmental scientist", hint: /environment|climate|sustain/i },
  media: { title: "Public Affairs Specialist", keyword: "public affairs", hint: /media|communicat|writ|design/i },
  community: { title: "Program Coordinator", keyword: "program coordinator", hint: /community|nonprofit|advoca/i },
  hardware: { title: "Electronics Engineer", keyword: "electronics engineer", hint: /hardware|device|robot|embedded/i },
  global: { title: "Foreign Affairs Officer", keyword: "foreign affairs", hint: /international|global|foreign/i },
};

export function isJobTitle(goal: string) {
  return goal.trim().split(/\s+/).length <= 5 && goal !== "Not sure yet";
}

// A goal like "Clinical Psychologist" is already a job title; a sentence becomes titles from the focus areas.
function careerTargetsFor(profile: Profile, main: Program, goal: string): PlanBody["careerTargets"] {
  const clean = (t: string) => t.replace(/\(.*?\)/g, "").trim();
  const isTitle = isJobTitle(goal);
  const out: PlanBody["careerTargets"] = [];
  if (isTitle) out.push({ title: goal, why: "Your stated goal.", searchKeyword: clean(goal) });
  for (const f of profile.focusIds) {
    const j = focusJobs[f];
    if (!j) continue;
    // Prefer a career from the student's own program that fits this focus (e.g. CS + healthcare -> Health Informatics Developer).
    const fromProgram = main.careers.find((c) => j.hint.test(c) && !out.some((o) => o.title === c));
    const title = fromProgram ?? j.title;
    if (!out.some((o) => o.title === title)) {
      out.push({ title, why: `Combines ${main.name} with your ${focusAreas.find((x) => x.id === f)?.label.toLowerCase()} focus.`, searchKeyword: fromProgram ? clean(fromProgram) : j.keyword });
    }
  }
  for (const c of main.careers) {
    if (out.length >= 4) break;
    if (!out.some((o) => o.title === c)) out.push({ title: c, why: `A common path for ${main.name} graduates.`, searchKeyword: clean(c) });
  }
  return out.slice(0, 4);
}

function phdStage(yi: number, main: Program): Item[] {
  const s: Item[][] = [
    [it("Class", "Core doctoral coursework", "Build the theory and methods your research needs."),
     it("Experience", "Lab rotations or meet with 3+ potential advisors", "Fit with your advisor matters most."),
     it("Career", "Apply for fellowships (e.g., NSF GRFP)", "Fall deadlines; ask for feedback on drafts.")],
    [it("Class", "Finish coursework and qualifying exam prep", "Form a study group with your cohort."),
     it("Project", `First research project in ${main.name}`, "Aim for a conference paper or poster."),
     it("Skill", "Scientific writing and peer review", "Offer to review for workshops.")],
    [it("Project", "Dissertation proposal", "Define the questions you'll answer."),
     it("Internship", "Research internship in industry, government, or a national lab", "Summer internships broaden options after the Ph.D."),
     it("Experience", "Teach or mentor undergraduates", "Valuable for academic job applications.")],
    [it("Project", "Publish 1-2 papers from your dissertation", "Target venues your field respects."),
     it("Experience", "Present at a national conference", "Network with future employers and collaborators."),
     it("Career", "Decide: academia, industry, government, or nonprofit", "Talk to alumni in each.")],
    [it("Project", "Write and defend your dissertation", "Set a timeline with your committee."),
     it("Career", "Apply to postdocs, faculty, or industry roles", "Start 12 months before you finish."),
     it("Career", "Prepare job talk and research statement", "Practice with your lab.")],
  ];
  return s[Math.min(yi, s.length - 1)];
}

function dedupe(items: Item[]) {
  const seen = new Set<string>();
  return items.filter((x) => (seen.has(x.title) ? false : (seen.add(x.title), true)));
}
function uniq(xs: string[]) {
  return Array.from(new Set(xs));
}
