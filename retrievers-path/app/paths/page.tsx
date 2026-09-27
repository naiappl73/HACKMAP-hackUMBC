"use client";
import { useState } from "react";
import PathCard from "@/components/PathCard";
import { majors, paths } from "@/lib/paths";

export default function Paths() {
  const [filter, setFilter] = useState<string>("All");
  const shown = filter === "All" ? paths : paths.filter((p) => p.major === filter);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14 grid gap-8">
      <header className="grid gap-3">
        <h1 className="font-display text-3xl sm:text-4xl font-bold">Explore career paths</h1>
        <p className="text-lg text-ink-2 max-w-2xl">Pick a career to see the classes, skills, and experiences that lead there.</p>
      </header>

      <div role="group" aria-label="Filter by major" className="flex flex-wrap gap-2">
        {["All", ...majors].map((m) => (
          <button key={m} type="button" aria-pressed={filter === m} onClick={() => setFilter(m)}
            className={`rounded-full px-4 py-2 text-sm font-semibold border ${filter === m ? "bg-ink text-bg border-ink" : "bg-surface border-line hover:bg-surface-2"}`}>
            {m}
          </button>
        ))}
      </div>

      <p className="sr-only" aria-live="polite">{shown.length} career paths shown</p>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {shown.map((p) => <li key={p.slug}><PathCard path={p} /></li>)}
      </ul>
    </div>
  );
}
