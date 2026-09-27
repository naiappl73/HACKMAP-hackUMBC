"use client";
import Link from "next/link";
import { getPath, kindStyle, years, type Task } from "@/lib/paths";
import { useDone, useProfile } from "@/lib/storage";

// Desktop-first: sidebar (progress) + main column (years). Stacks into one column below lg.
export default function Roadmap() {
  const { profile, ready, clear } = useProfile();
  const { done, toggle } = useDone();

  if (!ready) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 lg:py-14 grid gap-6 lg:grid-cols-[340px_1fr] lg:gap-10 animate-pulse" aria-busy="true" aria-label="Loading your roadmap">
        <div className="h-80 rounded-2xl bg-surface-2" />
        <div className="grid gap-6">
          <div className="h-10 w-2/3 rounded-xl bg-surface-2" />
          <div className="h-56 rounded-2xl bg-surface-2" />
        </div>
      </div>
    );
  }

  const path = profile && getPath(profile.slug);
  if (!profile || !path) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-24 grid gap-5 justify-items-start">
        <p className="rounded-full bg-gold-tint text-gold-deep text-sm font-bold px-3 py-1">No roadmap yet</p>
        <h1 className="font-display text-4xl font-bold">Let&apos;s build your roadmap</h1>
        <p className="text-lg text-ink-2">Answer three quick questions and we&apos;ll lay out your plan, semester by semester.</p>
        <Link href="/start" className="bg-gold text-on-gold rounded-full px-6 py-3 font-bold hover:bg-gold-soft">Get started</Link>
      </section>
    );
  }

  const all = path.plan.flatMap((s) => s.tasks);
  const doneCount = all.filter((t) => done.includes(t.id)).length;
  const pct = Math.round((doneCount / all.length) * 100);
  const currentIdx = Math.max(0, years.indexOf(profile.year as (typeof years)[number]));
  const nextTask = all.find((t) => !done.includes(t.id));
  const kinds = Object.keys(kindStyle) as Task["kind"][];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 lg:py-14 grid gap-6 lg:grid-cols-[340px_1fr] lg:gap-x-10 lg:items-start">
      {/* Title comes first in the page (phones, screen readers); on desktop it sits atop the right column. */}
      <h1 className="font-display text-3xl lg:text-4xl font-bold lg:col-start-2 lg:row-start-1">Your path to {path.role}</h1>

      {/* Sidebar: stays in view while the years scroll (desktop) */}
      <aside aria-label="Progress" className="grid gap-5 lg:col-start-1 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-28">
        <div className="bg-surface border border-line rounded-2xl shadow-card p-6 grid gap-5">
          <div className="grid gap-1">
            <p className="text-sm font-semibold text-ink-3">{profile.major} · {profile.year}</p>
            <p className="font-display text-xl font-semibold">{path.role}</p>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-ink-2 font-medium">Overall progress</span>
              <span className="font-mono">{pct}%</span>
            </div>
            <div className="h-3 rounded-full bg-surface-2" role="progressbar" aria-label="Roadmap progress" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-3 rounded-full bg-gold transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>

          <dl className="grid grid-cols-3 gap-3">
            {[
              { label: "Done", value: doneCount },
              { label: "To go", value: all.length - doneCount },
              { label: "Year", value: currentIdx + 1 },
            ].map((s) => (
              <div key={s.label} className="bg-surface-2 rounded-xl p-3">
                <dt className="text-xs text-ink-3 font-medium">{s.label}</dt>
                <dd className="font-display text-2xl font-bold">{s.value}</dd>
              </div>
            ))}
          </dl>

          {nextTask ? (
            <p className="rounded-xl bg-gold-tint text-ink px-4 py-3"><span className="font-bold">Up next:</span> {nextTask.title}</p>
          ) : (
            <p className="rounded-xl bg-mint-tint text-mint font-bold px-4 py-3">🎉 You finished every step on this roadmap!</p>
          )}

          <div className="flex flex-wrap gap-2">
            <Link href={`/paths/${path.slug}`} className="whitespace-nowrap rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold hover:bg-surface-2">About this career</Link>
            <button type="button" onClick={() => { if (confirm("Start over? This clears your roadmap and checkmarks.")) clear(); }}
              className="whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold text-coral hover:bg-coral-tint">
              Start over
            </button>
          </div>
        </div>

        {/* Legend: desktop only, where there's room */}
        <div className="hidden lg:grid gap-2 px-1" aria-label="Task types">
          <p className="text-xs font-semibold text-ink-3 uppercase tracking-wide">Task types</p>
          <ul className="flex flex-wrap gap-2">
            {kinds.map((k) => <li key={k} className={`rounded-full text-xs font-bold px-2.5 py-1 ${kindStyle[k]}`}>{k}</li>)}
          </ul>
        </div>
      </aside>

      {/* Main column: the years */}
      <div className="min-w-0 lg:col-start-2">
        <ol className="grid gap-5 xl:grid-cols-2">
          {path.plan.map((sem, i) => {
            const semDone = sem.tasks.filter((t) => done.includes(t.id)).length;
            const isCurrent = i === currentIdx;
            return (
              <li key={sem.term} className={`rounded-2xl border p-5 lg:p-6 bg-surface ${isCurrent ? "border-gold ring-2 ring-gold" : "border-line"}`}>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h2 className="font-display text-xl font-semibold flex items-center gap-2">
                    {sem.term}
                    {isCurrent && <span className="rounded-full bg-gold-tint text-gold-deep text-xs font-bold px-2.5 py-1">You are here</span>}
                  </h2>
                  <span className="text-sm font-mono text-ink-3">{semDone}/{sem.tasks.length}</span>
                </div>
                <ul className="grid gap-2">
                  {sem.tasks.map((t) => {
                    const checked = done.includes(t.id);
                    return (
                      <li key={t.id}>
                        <label className="flex items-center gap-3 rounded-xl bg-bg border border-line px-3 py-3 cursor-pointer hover:border-teal">
                          <input type="checkbox" checked={checked} onChange={() => toggle(t.id)} className="w-5 h-5 accent-[var(--rp-mint)] shrink-0" />
                          <span className={`flex-1 font-medium ${checked ? "line-through text-ink-3" : ""}`}>{t.title}</span>
                          <span className={`shrink-0 rounded-full text-xs font-bold px-2.5 py-1 ${kindStyle[t.kind]}`}>{t.kind}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
