"use client";
import { useMemo, useState } from "react";
import ProgramCard from "@/components/ProgramCard";
import { areaOf, areas, levelLabels, programs, type Level } from "@/lib/programs";

export default function Programs() {
  const [area, setArea] = useState<string>("All");
  const [level, setLevel] = useState<Level | "all">("all");
  const [query, setQuery] = useState("");

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return programs.filter((p) => (area === "All" || areaOf(p) === area) && (level === "all" || p.level === level)
      && (!q || `${p.name} ${p.degree} ${p.summary} ${p.careers.join(" ")}`.toLowerCase().includes(q)));
  }, [area, level, query]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 lg:py-14 grid gap-8">
      <header className="grid gap-3 rise">
        <h1 className="font-display text-3xl lg:text-4xl font-bold">Explore UMBC programs</h1>
        <p className="text-lg text-ink-2 max-w-3xl">
          {programs.length} majors and graduate programs across STEM, the arts and humanities, social sciences, health, business, and education.
          Pick one to see the careers it can lead to, then build a plan around your own goal.
        </p>
      </header>

      <div className="glass glass-strong p-4 lg:p-5 grid gap-4 rise">
        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <label className="grid gap-1">
            <span className="sr-only">Search programs and careers</span>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search a program or a career, e.g. “therapist” or “GIS”"
              className="rounded-xl border border-line bg-surface px-4 py-3 outline-none focus:border-teal" />
          </label>
          <div role="group" aria-label="Filter by degree level" className="flex flex-wrap gap-2">
            {(["all", "undergrad", "grad", "phd"] as const).map((l) => (
              <button key={l} type="button" aria-pressed={level === l} onClick={() => setLevel(l)}
                className={`press rounded-full px-4 py-2 text-sm font-semibold border ${level === l ? "bg-ink text-bg border-ink" : "bg-surface border-line hover:bg-surface-2"}`}>
                {l === "all" ? "All levels" : levelLabels[l]}
              </button>
            ))}
          </div>
        </div>
        <div role="group" aria-label="Filter by area" className="flex flex-wrap gap-2">
          {["All", ...areas].map((a) => (
            <button key={a} type="button" aria-pressed={area === a} onClick={() => setArea(a)}
              className={`press rounded-full px-4 py-2 text-sm font-semibold border ${area === a ? "bg-teal text-white border-teal" : "bg-surface border-line hover:border-teal"}`}>
              {a}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-ink-3" aria-live="polite">{shown.length} programs shown</p>
      <ul key={`${area}-${level}`} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 stagger">
        {shown.map((p) => <li key={p.id}><ProgramCard program={p} /></li>)}
      </ul>
      <p className="text-xs text-ink-3">Program list compiled for this prototype. Confirm names and requirements in the UMBC catalog (catalog.umbc.edu).</p>
    </div>
  );
}
