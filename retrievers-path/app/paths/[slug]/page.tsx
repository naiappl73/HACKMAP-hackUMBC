import Link from "next/link";
import { notFound } from "next/navigation";
import { getPath, kindStyle, paths } from "@/lib/paths";

// Pre-build one page per career at build time.
export function generateStaticParams() {
  return paths.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const path = getPath(params.slug);
  return { title: path ? `${path.role} · RetrieversPath` : "RetrieversPath" };
}

export default function PathDetail({ params }: { params: { slug: string } }) {
  const path = getPath(params.slug);
  if (!path) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14 grid gap-10">
      <nav aria-label="Breadcrumb" className="text-sm text-ink-3">
        <Link href="/paths" className="hover:text-teal">Career paths</Link> <span aria-hidden="true">/</span> {path.role}
      </nav>

      <header className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="grid gap-3">
          <p className="w-max rounded-full bg-teal-tint text-teal text-sm font-bold px-3 py-1">{path.major}</p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold">{path.role}</h1>
          <p className="text-lg text-ink-2 max-w-2xl">{path.summary}</p>
        </div>
        <Link href={`/start?path=${path.slug}`} className="bg-gold text-ink rounded-full px-6 py-3 font-bold hover:bg-gold-soft w-max">
          Start this roadmap
        </Link>
      </header>

      <div className="grid gap-5 md:grid-cols-2">
        <section aria-labelledby="skills" className="bg-surface border border-line rounded-2xl p-6 grid gap-3 content-start">
          <h2 id="skills" className="font-display text-xl font-semibold">Skills you&apos;ll build</h2>
          <ul className="flex flex-wrap gap-2">
            {path.skills.map((s) => <li key={s} className="rounded-full bg-teal-tint text-teal text-sm font-bold px-3 py-1">{s}</li>)}
          </ul>
        </section>
        <section aria-labelledby="resources" className="bg-surface border border-line rounded-2xl p-6 grid gap-3 content-start">
          <h2 id="resources" className="font-display text-xl font-semibold">Helpful resources</h2>
          <ul className="grid gap-2 text-ink-2">
            {path.resources.map((r) => <li key={r} className="flex gap-2"><span aria-hidden="true" className="text-mint">●</span>{r}</li>)}
          </ul>
        </section>
      </div>

      <section aria-labelledby="plan" className="grid gap-5">
        <h2 id="plan" className="font-display text-2xl font-bold">The 4-year plan</h2>
        <ol className="grid gap-5 md:grid-cols-2">
          {path.plan.map((sem) => (
            <li key={sem.term} className="bg-surface border border-line rounded-2xl p-5 grid gap-3 content-start">
              <h3 className="font-display text-lg font-semibold">{sem.term}</h3>
              <ul className="grid gap-2">
                {sem.tasks.map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-3 rounded-xl bg-bg border border-line px-3 py-2.5">
                    <span className="text-sm font-medium">{t.title}</span>
                    <span className={`shrink-0 rounded-full text-xs font-bold px-2.5 py-1 ${kindStyle[t.kind]}`}>{t.kind}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
