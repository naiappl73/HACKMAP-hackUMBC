"use client";
import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { isJobTitle, itemKinds, RESOURCE_LINKS, usajobsSearchUrl, type ItemKind, type Plan } from "@/lib/plan";
import { focusAreas, getProgram, yearsByLevel } from "@/lib/programs";
import { useRoadmap, type CustomItem } from "@/lib/storage";
import type { Job } from "@/app/api/jobs/route";

const kindStyle: Record<ItemKind, string> = {
  Class: "bg-teal-tint text-teal",
  Project: "bg-gold-tint text-gold-deep",
  Experience: "bg-mint-tint text-mint",
  Internship: "bg-coral-tint text-coral",
  Skill: "bg-surface-2 text-ink-2",
  Career: "bg-surface-2 text-ink",
};
const kindIcon: Record<ItemKind, string> = { Class: "📘", Project: "🛠️", Experience: "🌱", Internship: "💼", Skill: "⚡", Career: "🎯" };
type Filter = "All" | ItemKind | "Mine";
type Row = { id: string; title: string; kind: ItemKind; detail: string; mine: boolean };

export default function Roadmap() {
  const { ready, profile, plan, done, custom, hidden, toggle, addItem, removeItem, restoreAll, reset } = useRoadmap();
  const [yearIdx, setYearIdx] = useState<number | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    try { const n = sessionStorage.getItem("rp-plan-note"); if (n) { setNote(n); sessionStorage.removeItem("rp-plan-note"); } } catch { /* optional */ }
  }, []);

  if (!ready) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 lg:py-14 grid gap-6 lg:grid-cols-[320px_1fr] lg:gap-10 animate-pulse" aria-busy="true" aria-label="Loading your plan">
        <div className="h-96 rounded-2xl bg-surface-2" />
        <div className="grid gap-6"><div className="h-10 w-2/3 rounded-xl bg-surface-2" /><div className="h-80 rounded-2xl bg-surface-2" /></div>
      </div>
    );
  }

  if (!profile || !plan) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-24 grid gap-5 justify-items-start rise">
        <p className="rounded-full bg-gold-tint text-gold-deep text-sm font-bold px-3 py-1">No plan yet</p>
        <h1 className="font-display text-4xl font-bold">Let&apos;s build your plan</h1>
        <p className="text-lg text-ink-2">Tell us your program, focus, and career goal, and we&apos;ll lay out every year: classes, projects, internships, and more.</p>
        <Link href="/start" className="press bg-gold text-on-gold rounded-full px-6 py-3 font-bold hover:bg-gold-soft">Get started</Link>
      </section>
    );
  }

  const currentIdx = Math.max(0, yearsByLevel[profile.level].indexOf(profile.year));
  const active = yearIdx ?? Math.min(currentIdx, plan.years.length - 1);
  const rowsFor = (yi: number): Row[] => [
    ...plan.years[yi].items.filter((i) => !hidden.includes(i.id)).map((i) => ({ ...i, mine: false })),
    ...custom.filter((c) => c.yearIndex === yi).map((c) => ({ ...c, mine: true })),
  ];
  const allRows = plan.years.flatMap((_, yi) => rowsFor(yi));
  const doneCount = allRows.filter((r) => done.includes(r.id)).length;
  const pct = allRows.length ? Math.round((doneCount / allRows.length) * 100) : 0;
  const nextUp = rowsFor(currentIdx).find((r) => !done.includes(r.id)) ?? allRows.find((r) => !done.includes(r.id));
  const programs = profile.programIds.map(getProgram).filter(Boolean);
  const focus = [...profile.focusIds.map((f) => focusAreas.find((x) => x.id === f)?.label), profile.customFocus].filter(Boolean);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 lg:py-14 grid gap-6 lg:grid-cols-[320px_1fr] lg:gap-x-10 lg:items-start">
      <header className="grid gap-2 lg:col-start-2 lg:row-start-1 rise">
        <p className="text-sm font-semibold text-ink-3 flex items-center gap-2">
          {plan.generatedBy === "ai" ? <span className="rounded-full bg-teal-tint text-teal text-xs font-bold px-2.5 py-1">✨ AI-personalized</span>
            : <span className="rounded-full bg-surface-2 text-ink-2 text-xs font-bold px-2.5 py-1">Offline planner</span>}
          <span>{plan.headline}</span>
        </p>
        <h1 className="font-display text-3xl lg:text-4xl font-bold">
          {isJobTitle(profile.careerGoal) ? `Your path to ${profile.careerGoal}` : `Your path to ${plan.careerTargets[0]?.title ?? "your goal"}`}
        </h1>
        {profile.careerGoal && !isJobTitle(profile.careerGoal) && profile.careerGoal !== "Not sure yet" && (
          <p className="text-ink font-medium"><span aria-hidden="true">🎯 </span>Your goal: “{profile.careerGoal}”</p>
        )}
        <p className="text-ink-2 max-w-3xl">{plan.summary}</p>
        {note && <p role="status" className="rounded-xl bg-gold-tint text-ink text-sm px-4 py-2.5">{note}</p>}
      </header>

      {/* ---------- Sidebar: profile + progress ---------- */}
      <aside aria-label="Your profile and progress" className="grid gap-5 lg:col-start-1 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-28 stagger">
        <div className="glass-card p-6 grid gap-5">
          <div className="grid gap-1">
            <p className="text-sm font-semibold text-ink-3">{profile.year}</p>
            <p className="font-display text-lg font-semibold leading-snug">{programs.map((x) => `${x!.name} (${x!.degree})`).join(" + ")}</p>
            {profile.minors.length > 0 && <p className="text-sm text-ink-2">Minor: {profile.minors.join(", ")}</p>}
            {focus.length > 0 && (
              <ul className="flex flex-wrap gap-1.5 mt-2" aria-label="Focus areas">
                {focus.map((f) => <li key={f} className="rounded-full bg-teal-tint text-teal text-xs font-bold px-2.5 py-1">{f}</li>)}
              </ul>
            )}
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1.5"><span className="text-ink-2 font-medium">Overall progress</span><span className="font-mono">{pct}%</span></div>
            <div className="h-3 rounded-full bg-surface-2" role="progressbar" aria-label="Plan progress" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
              <div className="bar-fill h-3 rounded-full bg-gold" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <dl className="grid grid-cols-3 gap-3">
            {[{ label: "Done", value: doneCount }, { label: "To go", value: allRows.length - doneCount }, { label: "Year", value: currentIdx + 1 }].map((s) => (
              <div key={s.label} className="bg-surface-2 rounded-xl p-3">
                <dt className="text-xs text-ink-3 font-medium">{s.label}</dt>
                <dd className="font-display text-2xl font-bold">{s.value}</dd>
              </div>
            ))}
          </dl>
          {nextUp ? <p className="rounded-xl bg-gold-tint text-ink px-4 py-3"><span className="font-bold">Up next:</span> {nextUp.title}</p>
            : <p className="rounded-xl bg-mint-tint text-mint font-bold px-4 py-3">🎉 You finished every step!</p>}
          <div className="flex flex-wrap gap-2">
            <Link href="/start" className="press whitespace-nowrap rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold hover:bg-surface-2">Edit answers</Link>
            {programs[0] && <Link href={`/paths/${programs[0].id}`} className="press whitespace-nowrap rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold hover:bg-surface-2">About my program</Link>}
            <button type="button" onClick={() => { if (confirm("Start over? This deletes your plan, checkmarks, and added items.")) reset(); }}
              className="press whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold text-coral hover:bg-coral-tint">Start over</button>
          </div>
        </div>
        {plan.keySkills.length > 0 && (
          <div className="glass-card p-5 grid gap-2">
            <p className="text-xs font-semibold text-ink-3 uppercase tracking-wide">Key skills to build</p>
            <ul className="flex flex-wrap gap-1.5">{plan.keySkills.map((s) => <li key={s} className="rounded-full bg-surface-2 text-ink-2 text-xs font-bold px-2.5 py-1">{s}</li>)}</ul>
          </div>
        )}
      </aside>

      {/* ---------- Main: the selected year ---------- */}
      <div className="grid gap-6 min-w-0 lg:col-start-2">
        <nav aria-label="Years" className="flex gap-2 overflow-x-auto pb-1">
          {plan.years.map((y, yi) => {
            const rows = rowsFor(yi);
            const d = rows.filter((r) => done.includes(r.id)).length;
            return (
              <button key={y.label} type="button" onClick={() => setYearIdx(yi)} aria-current={yi === active ? "true" : undefined}
                className={`press shrink-0 rounded-2xl border px-4 py-2.5 text-left ${yi === active ? "glass-card !border-gold ring-2 ring-gold" : "border-line bg-surface hover:border-teal"}`}>
                <span className="block text-sm font-semibold whitespace-nowrap">{y.label.split(" · ")[0]}{yi === currentIdx && <span className="ml-1.5 text-gold-deep">● now</span>}</span>
                <span className="block text-xs text-ink-3 font-mono">{d}/{rows.length} done</span>
              </button>
            );
          })}
        </nav>

        <YearPanel key={`${plan.id}-${active}`} plan={plan} yearIdx={active} isCurrent={active === currentIdx}
          rows={rowsFor(active)} done={done} hiddenCount={plan.years[active].items.filter((i) => hidden.includes(i.id)).length}
          onToggle={toggle} onAdd={(item) => addItem({ ...item, yearIndex: active })} onRemove={removeItem} onRestore={restoreAll} />

        <JobsPanel plan={plan} />
      </div>
    </div>
  );
}

function YearPanel({ plan, yearIdx, isCurrent, rows, done, hiddenCount, onToggle, onAdd, onRemove, onRestore }: {
  plan: Plan; yearIdx: number; isCurrent: boolean; rows: Row[]; done: string[]; hiddenCount: number;
  onToggle: (id: string) => void; onAdd: (item: Omit<CustomItem, "id" | "yearIndex">) => void; onRemove: (id: string) => void; onRestore: () => void;
}) {
  const year = plan.years[yearIdx];
  const [filter, setFilter] = useState<Filter>("All");
  const [adding, setAdding] = useState(false);
  const counts = useMemo(() => {
    const c: Record<string, number> = { All: rows.length, Mine: rows.filter((r) => r.mine).length };
    for (const k of itemKinds) c[k] = rows.filter((r) => r.kind === k).length;
    return c;
  }, [rows]);
  const shown = rows.filter((r) => filter === "All" || (filter === "Mine" ? r.mine : r.kind === filter));
  const d = rows.filter((r) => done.includes(r.id)).length;
  const filters: Filter[] = ["All", ...itemKinds.filter((k) => counts[k] > 0), ...(counts.Mine ? (["Mine"] as const) : [])];

  return (
    <section aria-labelledby="year-title" className={`glass-card p-5 lg:p-7 grid gap-5 rise ${isCurrent ? "ring-2 ring-gold" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-1">
          <h2 id="year-title" className="font-display text-2xl font-bold flex flex-wrap items-center gap-2">
            {year.label}
            {isCurrent && <span className="rounded-full bg-gold-tint text-gold-deep text-xs font-bold px-2.5 py-1">You are here</span>}
          </h2>
          <p className="text-ink-2">{year.theme}</p>
        </div>
        <span className="font-mono text-sm text-ink-3">{d}/{rows.length} done</span>
      </div>

      <div role="group" aria-label="Filter by type" className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}
            className={`press rounded-full px-3.5 py-1.5 text-sm font-semibold border ${filter === f ? "bg-ink text-bg border-ink" : "bg-surface border-line hover:border-teal"}`}>
            {f === "Mine" ? "✍️ Added by me" : f === "All" ? "All" : `${kindIcon[f]} ${f === "Class" ? "Classes" : f === "Internship" ? "Internships" : f + "s"}`}
            <span className="ml-1.5 font-mono text-xs opacity-70">{counts[f]}</span>
          </button>
        ))}
      </div>

      <ul className="grid gap-2 stagger" aria-live="polite">
        {shown.map((r) => {
          const checked = done.includes(r.id);
          return (
            <li key={r.id} className="group flex items-start gap-3 rounded-xl bg-bg border border-line px-3 py-3 hover:border-teal transition-colors">
              <input type="checkbox" checked={checked} onChange={() => onToggle(r.id)} aria-label={r.title}
                className="tick mt-0.5 w-5 h-5 accent-[var(--rp-mint)] shrink-0 cursor-pointer" />
              <div className="flex-1 min-w-0 grid gap-0.5">
                <p className={`font-semibold ${checked ? "line-through text-ink-3" : ""}`}>{r.title}</p>
                {r.detail && <p className="text-sm text-ink-2">{r.detail}</p>}
              </div>
              <span className={`shrink-0 rounded-full text-xs font-bold px-2.5 py-1 ${kindStyle[r.kind]}`}>{kindIcon[r.kind]} {r.kind}</span>
              {r.mine && <span className="shrink-0 rounded-full bg-surface-2 text-ink-2 text-xs font-bold px-2 py-1" title="Added by you">✍️</span>}
              <button type="button" onClick={() => onRemove(r.id)} aria-label={`Remove “${r.title}”`} title="Remove"
                className="press shrink-0 grid place-items-center w-7 h-7 rounded-full text-ink-3 hover:text-coral hover:bg-coral-tint opacity-60 group-hover:opacity-100 focus:opacity-100">✕</button>
            </li>
          );
        })}
        {shown.length === 0 && <li className="text-ink-3 px-1">Nothing here yet for this filter.</li>}
      </ul>

      <div className="flex flex-wrap items-center gap-3">
        {!adding && (
          <button type="button" onClick={() => setAdding(true)} className="press flex items-center gap-2 rounded-full border-2 border-dashed border-teal text-teal px-4 py-2 font-bold hover:bg-teal-tint">
            <span aria-hidden="true" className="text-lg leading-none">＋</span> Add to this year
          </button>
        )}
        {hiddenCount > 0 && (
          <button type="button" onClick={onRestore} className="press text-sm font-semibold text-ink-3 hover:text-teal">Restore {hiddenCount} removed item{hiddenCount > 1 ? "s" : ""}</button>
        )}
      </div>
      {adding && <AddItemForm onCancel={() => setAdding(false)} onSave={(item) => { onAdd(item); setAdding(false); }} />}

      {year.resources.length > 0 && (
        <div className="grid gap-2 border-t border-line pt-5">
          <h3 className="text-xs font-semibold text-ink-3 uppercase tracking-wide">Helpful for this year</h3>
          <ul className="grid gap-2 sm:grid-cols-2">
            {year.resources.map((res) => (
              <li key={res.url + res.name}>
                <a href={res.url} target="_blank" rel="noopener noreferrer" className="press block rounded-xl border border-line bg-surface px-4 py-3 hover:border-teal">
                  <span className="font-semibold text-teal">{res.name} ↗</span>
                  <span className="block text-sm text-ink-2">{res.why}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function AddItemForm({ onSave, onCancel }: { onSave: (item: { title: string; kind: ItemKind; detail: string }) => void; onCancel: () => void }) {
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<ItemKind>("Class");
  const [detail, setDetail] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);
  const uid = useId();
  // Move focus into the form when it opens (instead of autoFocus, which the a11y linter flags).
  useEffect(() => { titleRef.current?.focus(); }, []);
  return (
    <form className="pop grid gap-3 rounded-2xl border border-teal bg-surface p-4"
      onSubmit={(e) => { e.preventDefault(); if (title.trim()) onSave({ title: title.trim(), kind, detail: detail.trim() }); }}>
      <p className="font-semibold">Add your own item</p>
      <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
        <div className="grid gap-1">
          <label htmlFor={`${uid}-title`} className="text-sm font-semibold">What is it?</label>
          <input id={`${uid}-title`} ref={titleRef} required value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120}
            placeholder="e.g. Take STAT 355 (advisor suggested)" className="rounded-xl border border-line bg-bg px-3 py-2.5 outline-none focus:border-teal" />
        </div>
        <div className="grid gap-1">
          <label htmlFor={`${uid}-kind`} className="text-sm font-semibold">Type</label>
          <select id={`${uid}-kind`} value={kind} onChange={(e) => setKind(e.target.value as ItemKind)} className="rounded-xl border border-line bg-bg px-3 py-2.5">
            {itemKinds.map((k) => <option key={k}>{k}</option>)}
          </select>
        </div>
      </div>
      <div className="grid gap-1">
        <label htmlFor={`${uid}-detail`} className="text-sm font-semibold">Notes <span className="font-normal text-ink-3">(optional)</span></label>
        <input id={`${uid}-detail`} value={detail} onChange={(e) => setDetail(e.target.value)} maxLength={200}
          placeholder="Why it matters, a deadline, or who suggested it" className="rounded-xl border border-line bg-bg px-3 py-2.5 outline-none focus:border-teal" />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="press bg-teal text-white rounded-full px-5 py-2 font-bold">Add</button>
        <button type="button" onClick={onCancel} className="press rounded-full px-5 py-2 font-semibold text-ink-2 hover:bg-surface-2">Cancel</button>
      </div>
    </form>
  );
}

// Live federal job postings (USAJOBS) for the plan's target careers.
function JobsPanel({ plan }: { plan: Plan }) {
  const targets = plan.careerTargets;
  const [sel, setSel] = useState(0);
  const [state, setState] = useState<{ loading: boolean; configured: boolean; jobs: Job[]; error?: string }>({ loading: true, configured: true, jobs: [] });
  const keyword = targets[sel]?.searchKeyword ?? "";

  useEffect(() => {
    if (!keyword) return;
    let alive = true;
    setState((s) => ({ ...s, loading: true }));
    fetch(`/api/jobs?q=${encodeURIComponent(keyword)}`)
      .then((r) => r.json())
      .then((d) => alive && setState({ loading: false, configured: d.configured !== false, jobs: d.jobs ?? [], error: d.error }))
      .catch(() => alive && setState({ loading: false, configured: true, jobs: [], error: "Job search is unavailable right now." }));
    return () => { alive = false; };
  }, [keyword]);

  if (!targets.length) return null;
  return (
    <section aria-labelledby="jobs-title" className="glass-card p-5 lg:p-7 grid gap-4 rise">
      <div className="grid gap-1">
        <h2 id="jobs-title" className="font-display text-xl font-bold">Careers you&apos;re building toward</h2>
        <p className="text-sm text-ink-3">Tap a career to see live federal postings from USAJOBS.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {targets.map((t, i) => (
          <button key={t.title} type="button" aria-pressed={i === sel} onClick={() => setSel(i)}
            className={`press rounded-full px-3.5 py-1.5 text-sm font-semibold border ${i === sel ? "bg-teal text-white border-teal" : "bg-surface border-line hover:border-teal"}`}>{t.title}</button>
        ))}
      </div>
      <p className="text-ink-2 text-sm"><span className="font-semibold text-ink">{targets[sel].title}:</span> {targets[sel].why}</p>

      {state.loading ? (
        <ul className="grid gap-2 animate-pulse" aria-busy="true">{[0, 1, 2].map((i) => <li key={i} className="h-16 rounded-xl bg-surface-2" />)}</ul>
      ) : state.jobs.length > 0 ? (
        <ul className="grid gap-2 stagger">
          {state.jobs.map((j) => (
            <li key={j.url}>
              <a href={j.url} target="_blank" rel="noopener noreferrer" className="press block rounded-xl border border-line bg-surface px-4 py-3 hover:border-teal">
                <span className="font-semibold">{j.title} ↗</span>
                <span className="block text-sm text-ink-2">{j.agency}{j.location ? ` · ${j.location}` : ""}</span>
                <span className="block text-sm font-mono text-teal">{j.salary}{j.closes ? <span className="text-ink-3"> · closes {j.closes}</span> : null}</span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl bg-surface-2 px-4 py-3 text-sm text-ink-2">
          {!state.configured ? "Live job listings aren't set up yet (needs a free USAJOBS API key)." : state.error ?? "No open federal postings for this search right now."} Try the links below.
        </p>
      )}

      <div className="flex flex-wrap gap-2 text-sm">
        <a href={usajobsSearchUrl(keyword)} target="_blank" rel="noopener noreferrer" className="press rounded-full border border-line bg-surface px-3.5 py-1.5 font-semibold hover:border-teal">Search USAJOBS ↗</a>
        <a href={`https://www.onetonline.org/find/quick?s=${encodeURIComponent(keyword)}`} target="_blank" rel="noopener noreferrer" className="press rounded-full border border-line bg-surface px-3.5 py-1.5 font-semibold hover:border-teal">O*NET career profile ↗</a>
        <a href={RESOURCE_LINKS.ooh.url} target="_blank" rel="noopener noreferrer" className="press rounded-full border border-line bg-surface px-3.5 py-1.5 font-semibold hover:border-teal">Salary & outlook (BLS) ↗</a>
      </div>
    </section>
  );
}
