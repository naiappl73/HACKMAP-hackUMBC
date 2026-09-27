import Link from "next/link";
import { notFound } from "next/navigation";
import ProgramCard from "@/components/ProgramCard";
import { areaOf, focusAreas, getProgram, levelLabels, programs } from "@/lib/programs";
import { RESOURCE_LINKS, usajobsSearchUrl } from "@/lib/plan";

// Pre-build one page per program at build time.
export function generateStaticParams() {
  return programs.map((p) => ({ slug: p.id }));
}

// Next.js 15: route params arrive as a Promise.
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const p = getProgram((await params).slug);
  return { title: p ? `${p.name} (${p.degree}) · RetrieversPath` : "RetrieversPath" };
}

// Suggested focus areas per family, to show students how one major can go many directions.
const focusByFamily: Record<string, string[]> = {
  computing: ["healthcare", "data-ai", "ux", "security"], engineering: ["hardware", "healthcare", "environment", "research"],
  "life-science": ["premed", "research", "healthcare", "data-ai"], "physical-science": ["research", "environment", "data-ai", "education"],
  math: ["data-ai", "finance", "education", "research"], "social-science": ["policy", "law", "community", "global"],
  psychology: ["clinical", "research", "ux", "education"], humanities: ["media", "law", "education", "global"],
  arts: ["media", "ux", "education", "business"], health: ["healthcare", "policy", "community", "premed"],
  business: ["finance", "business", "data-ai", "community"], education: ["education", "community", "research", "policy"],
};

export default async function ProgramDetail({ params }: Props) {
  const p = getProgram((await params).slug);
  if (!p) notFound();
  const related = programs.filter((x) => x.id !== p.id && x.family === p.family).slice(0, 4);
  const focus = (focusByFamily[p.family] ?? []).map((id) => focusAreas.find((f) => f.id === id)!).filter(Boolean);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 lg:py-14 grid gap-8">
      <nav aria-label="Breadcrumb" className="text-sm text-ink-3">
        <Link href="/paths" className="hover:text-teal">Programs</Link> <span aria-hidden="true">/</span> {p.name}
      </nav>

      <header className="grid gap-3 max-w-3xl rise">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-teal-tint text-teal text-sm font-bold px-3 py-1">{areaOf(p)}</span>
          <span className="rounded-full bg-surface-2 text-ink-2 text-sm font-bold px-3 py-1">{levelLabels[p.level]} · {p.degree}</span>
        </div>
        <h1 className="font-display text-4xl lg:text-5xl font-bold">{p.name}</h1>
        <p className="text-lg text-ink-2">{p.summary}</p>
        <p className="text-sm text-ink-3">{p.college}</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:gap-10 lg:items-start">
        <aside className="grid gap-5 lg:col-start-2 lg:row-start-1 lg:sticky lg:top-28 stagger">
          <div className="glass-card p-6 grid gap-4">
            <p className="font-semibold">Build a plan around your goal, not a generic one.</p>
            <Link href={`/start?program=${p.id}`} className="press bg-gold text-on-gold rounded-full px-6 py-3 font-bold hover:bg-gold-soft text-center">
              ✨ Start my plan
            </Link>
            <a href={RESOURCE_LINKS.catalog.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-teal hover:underline">Official requirements (UMBC catalog) ↗</a>
          </div>
          <section aria-labelledby="skills" className="glass-card p-6 grid gap-3">
            <h2 id="skills" className="font-display text-lg font-semibold">Skills you&apos;ll build</h2>
            <ul className="flex flex-wrap gap-2">{p.skills.map((s) => <li key={s} className="rounded-full bg-teal-tint text-teal text-sm font-bold px-3 py-1">{s}</li>)}</ul>
          </section>
        </aside>

        <div className="grid gap-8 min-w-0 lg:col-start-1 lg:row-start-1">
          <section aria-labelledby="careers" className="grid gap-4">
            <h2 id="careers" className="font-display text-2xl font-bold">Where it can lead</h2>
            <ul className="grid gap-3 sm:grid-cols-2 stagger">
              {p.careers.map((c) => (
                <li key={c} className="glass-card p-4 flex items-center justify-between gap-3">
                  <span className="font-semibold">{c}</span>
                  <a href={usajobsSearchUrl(c.replace(/\(.*?\)/g, "").trim())} target="_blank" rel="noopener noreferrer"
                    className="shrink-0 text-sm font-semibold text-teal hover:underline">Jobs ↗</a>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="focus" className="grid gap-4">
            <h2 id="focus" className="font-display text-2xl font-bold">Make it your own</h2>
            <p className="text-ink-2">The same major can go in very different directions. Pick a focus when you build your plan, for example:</p>
            <ul className="grid gap-3 sm:grid-cols-2 stagger">
              {focus.map((f) => (
                <li key={f.id} className="glass-card p-4 flex items-center gap-3">
                  <span aria-hidden="true" className="text-2xl">{f.icon}</span>
                  <span className="grid"><span className="font-semibold">{p.name} + {f.label}</span></span>
                </li>
              ))}
            </ul>
          </section>

          {related.length > 0 && (
            <section aria-labelledby="related" className="grid gap-4">
              <h2 id="related" className="font-display text-2xl font-bold">Related programs</h2>
              <ul className="grid gap-5 sm:grid-cols-2">{related.map((r) => <li key={r.id}><ProgramCard program={r} /></li>)}</ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
