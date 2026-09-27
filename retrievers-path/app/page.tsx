import Link from "next/link";
import PathCard from "@/components/PathCard";
import RoadmapPreview from "@/components/RoadmapPreview";
import { paths } from "@/lib/paths";

const steps = [
  { n: "1", title: "Tell us where you are", body: "Pick your major, your year, and the careers you're curious about. No résumé needed." },
  { n: "2", title: "Get your roadmap", body: "See a semester-by-semester plan: classes, skills, clubs, and internships, in order." },
  { n: "3", title: "Check things off", body: "Track progress as you go. Your roadmap updates when your plans change." },
];

const features = [
  { title: "Built around UMBC", body: "Roadmaps use UMBC courses, clubs, and campus resources, not generic advice.", tint: "bg-gold-tint text-gold-deep", icon: "🎓" },
  { title: "One step at a time", body: "Each semester shows a short list of next steps, so the plan never feels like too much.", tint: "bg-teal-tint text-teal", icon: "🧭" },
  { title: "See your progress", body: "A clear progress bar and checklist show how far you've come.", tint: "bg-mint-tint text-mint", icon: "✅" },
  { title: "Accessible by default", body: "High contrast, dark mode, an easier-to-read font, and read-aloud are one click away.", tint: "bg-coral-tint text-coral", icon: "♿" },
];

export default function Home() {
  return (
    <div id="top" className="scroll-mt-24">
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-12 pb-16 sm:pt-20 sm:pb-24 grid gap-12 lg:grid-cols-2 lg:items-center">
        <div className="grid gap-6">
          <p className="w-max rounded-full bg-gold-tint text-gold-deep text-sm font-bold px-3 py-1">For UMBC Retrievers</p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
            Your career, mapped out one semester at a time.
          </h1>
          <p className="text-lg text-ink-2 max-w-xl">
            RetrieversPath turns &ldquo;what should I be doing?&rdquo; into a clear plan: the classes, skills, and
            experiences that get you to the job you want.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/start" className="bg-gold text-ink rounded-full px-6 py-3 font-bold hover:bg-gold-soft">
              Build my roadmap
            </Link>
            <a href="#how" className="rounded-full px-6 py-3 font-semibold text-teal hover:bg-teal-tint">
              See how it works
            </a>
          </div>
        </div>
        <div className="flex justify-center lg:justify-end">
          <RoadmapPreview />
        </div>
      </section>

      {/* How it works */}
      <section id="how" aria-labelledby="how-title" className="scroll-mt-24 bg-surface border-y border-line">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <h2 id="how-title" className="font-display text-3xl font-bold mb-10">How it works</h2>
          <ol className="grid gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <li key={s.n} className="grid gap-3 content-start">
                <span aria-hidden="true" className="grid place-items-center w-10 h-10 rounded-full bg-gold text-ink font-display font-bold">{s.n}</span>
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
        <ul className="grid gap-5 sm:grid-cols-2">
          {features.map((f) => (
            <li key={f.title} className="bg-surface border border-line rounded-2xl shadow-card p-6 grid gap-3 content-start">
              <span aria-hidden="true" className={`grid place-items-center w-11 h-11 rounded-xl text-xl ${f.tint}`}>{f.icon}</span>
              <h3 className="font-display text-lg font-semibold">{f.title}</h3>
              <p className="text-ink-2">{f.body}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Career paths */}
      <section id="paths" aria-labelledby="paths-title" className="scroll-mt-24 bg-surface-2 border-y border-line">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <h2 id="paths-title" className="font-display text-3xl font-bold mb-3">Explore career paths</h2>
          <p className="text-ink-2 mb-10 max-w-2xl">A few of the roadmaps you can start from. Each one is a starting point you can change.</p>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {paths.map((p) => <li key={p.slug}><PathCard path={p} /></li>)}
          </ul>
          <Link href="/paths" className="inline-block mt-8 font-semibold text-teal hover:underline">See all career paths →</Link>
        </div>
      </section>

      {/* Final call to action */}
      <section id="get-started" aria-labelledby="cta-title" className="scroll-mt-24 mx-auto max-w-6xl px-4 py-16 sm:py-24">
        <div className="rounded-2xl bg-ink text-bg p-8 sm:p-12 grid gap-5 justify-items-start">
          <h2 id="cta-title" className="font-display text-3xl sm:text-4xl font-bold max-w-2xl">
            Ready to see your path?
          </h2>
          <p className="text-lg opacity-80 max-w-xl">It takes about two minutes to build your first roadmap.</p>
          <Link href="/start" className="bg-gold text-ink rounded-full px-6 py-3 font-bold hover:bg-gold-soft">
            Get started
          </Link>
        </div>
      </section>
    </div>
  );
}
