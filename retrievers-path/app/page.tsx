import Link from "next/link";
import ProgramCard from "@/components/ProgramCard";
import RoadmapPreview from "@/components/RoadmapPreview";
import { areaOf, areas, getProgram, programs } from "@/lib/programs";

// One featured program per area, so students see it's not only tech.
const featured = ["cs-bs", "psyc-ba", "posi-ba", "happ-ba", "art-ba", "bioinf-bs", "fin-econ-ba", "mat"]
  .map(getProgram).filter((p) => p !== undefined);

const steps = [
  { n: "1", title: "Tell us your direction", body: "Your major (or two), minors, focus areas like healthcare or UX, and the career you actually want." },
  { n: "2", title: "Get a plan made for you", body: "AI builds a year-by-year plan: classes, project ideas, internships, and skills specific to your goal." },
  { n: "3", title: "Make it yours", body: "Filter by classes or projects, add your advisor's suggestions, remove what doesn't fit, and check things off." },
];

const features = [
  { title: "Specific, not generic", body: "CS + healthcare, psychology + clinical practice, poli sci + voting rights: your plan follows your exact direction.", tint: "bg-gold-tint text-gold-deep", icon: "🎯" },
  { title: "Every field, not just tech", body: `${programs.length} UMBC programs across ${areas.length} areas, from STEM to the arts, health, and education.`, tint: "bg-teal-tint text-teal", icon: "🎓" },
  { title: "Your year, front and center", body: "Open your plan and see exactly what to do this year, with real federal job postings for your target careers.", tint: "bg-mint-tint text-mint", icon: "🧭" },
  { title: "Accessible by default", body: "High contrast, dark mode, an easier-to-read font, and read-aloud are one click away.", tint: "bg-coral-tint text-coral", icon: "♿" },
];

export default function Home() {
  return (
    // overflow-x-clip: the hero glow bleeds past the edges but must never cause sideways scrolling.
    <div id="top" className="scroll-mt-24 overflow-x-clip">
      {/* Hero */}
      <section className="hero-glow mx-auto max-w-6xl px-4 pt-12 pb-16 sm:pt-20 sm:pb-24 grid gap-12 lg:grid-cols-2 lg:items-center">
        <div className="grid gap-6 stagger">
          <p className="w-max rounded-full bg-gold-tint text-gold-deep text-sm font-bold px-3 py-1">For UMBC Retrievers</p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
            Your career, mapped out one semester at a time.
          </h1>
          <p className="text-lg text-ink-2 max-w-xl">
            RetrieversPath turns &ldquo;what should I be doing?&rdquo; into a clear plan: the classes, skills, and
            experiences that get you to the job you want.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/start" className="press bg-gold text-on-gold rounded-full px-6 py-3 font-bold hover:bg-gold-soft">
              ✨ Build my plan
            </Link>
            <a href="#how" className="press rounded-full px-6 py-3 font-semibold text-teal hover:bg-teal-tint">
              See how it works
            </a>
          </div>
        </div>
        <div className="flex justify-center lg:justify-end pop">
          <RoadmapPreview />
        </div>
      </section>

      {/* How it works */}
      <section id="how" aria-labelledby="how-title" className="scroll-mt-24 glass-strong border-y border-line">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <h2 id="how-title" className="font-display text-3xl font-bold mb-10">How it works</h2>
          <ol className="grid gap-6 md:grid-cols-3 stagger">
            {steps.map((s) => (
              <li key={s.n} className="grid gap-3 content-start">
                <span aria-hidden="true" className="grid place-items-center w-10 h-10 rounded-full bg-gold text-on-gold font-display font-bold">{s.n}</span>
                <h3 className="font-display text-xl font-semibold">{s.title}</h3>
                <p className="text-ink-2">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Features */}
      <section id="features" aria-labelledby="features-title" className="scroll-mt-24 mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <h2 id="features-title" className="font-display text-3xl font-bold mb-10">Made for how students actually plan</h2>
        <ul className="grid gap-5 sm:grid-cols-2 stagger">
          {features.map((f) => (
            <li key={f.title} className="glass-card interactive p-6 grid gap-3 content-start">
              <span aria-hidden="true" className={`grid place-items-center w-11 h-11 rounded-xl text-xl ${f.tint}`}>{f.icon}</span>
              <h3 className="font-display text-lg font-semibold">{f.title}</h3>
              <p className="text-ink-2">{f.body}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Career paths */}
      <section id="paths" aria-labelledby="paths-title" className="scroll-mt-24 border-y border-line">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <h2 id="paths-title" className="font-display text-3xl font-bold mb-3">Explore UMBC programs</h2>
          <p className="text-ink-2 mb-4 max-w-2xl">From computer science to psychology, political science, health, the arts, and education.</p>
          <ul className="flex flex-wrap gap-2 mb-10" aria-label="Areas">
            {areas.map((a) => <li key={a} className="rounded-full bg-surface border border-line text-sm font-semibold px-3 py-1">{a} <span className="text-ink-3 font-mono text-xs">{programs.filter((p) => areaOf(p) === a).length}</span></li>)}
          </ul>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 stagger">
            {featured.map((p) => <li key={p.id}><ProgramCard program={p} /></li>)}
          </ul>
          <Link href="/paths" className="inline-block mt-8 font-semibold text-teal hover:underline">See all {programs.length} programs →</Link>
        </div>
      </section>

      {/* Final call to action */}
      <section id="get-started" aria-labelledby="cta-title" className="scroll-mt-24 mx-auto max-w-6xl px-4 py-16 sm:py-24">
        <div className="rounded-2xl bg-ink text-bg p-8 sm:p-12 grid gap-5 justify-items-start">
          <h2 id="cta-title" className="font-display text-3xl sm:text-4xl font-bold max-w-2xl">
            Ready to see your path?
          </h2>
          <p className="text-lg opacity-80 max-w-xl">It takes about two minutes to tell us your direction.</p>
          <Link href="/start" className="press bg-gold text-on-gold rounded-full px-6 py-3 font-bold hover:bg-gold-soft">
            Get started
          </Link>
        </div>
      </section>
    </div>
  );
}
