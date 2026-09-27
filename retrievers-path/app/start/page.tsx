"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { majors, paths, years } from "@/lib/paths";
import { saveProfile } from "@/lib/storage";

const stepTitles = ["What's your major?", "What year are you?", "Which career are you aiming for?"];

function Choice({ name, value, label, hint, checked, onSelect }: {
  name: string; value: string; label: string; hint?: string; checked: boolean; onSelect: (v: string) => void;
}) {
  return (
    <label className={`flex items-center gap-3 rounded-xl border p-4 cursor-pointer bg-surface hover:border-teal ${checked ? "border-teal ring-2 ring-teal" : "border-line"}`}>
      <input type="radio" name={name} value={value} checked={checked} onChange={() => onSelect(value)} className="accent-[var(--rp-teal)] w-4 h-4" />
      <span className="grid">
        <span className="font-semibold">{label}</span>
        {hint && <span className="text-sm text-ink-3">{hint}</span>}
      </span>
    </label>
  );
}

function StartForm() {
  const router = useRouter();
  const preset = useSearchParams().get("path");
  const presetPath = paths.find((p) => p.slug === preset);

  const [step, setStep] = useState(0);
  const [major, setMajor] = useState(presetPath?.major ?? "");
  const [year, setYear] = useState("");
  const [slug, setSlug] = useState(presetPath?.slug ?? "");
  const heading = useRef<HTMLHeadingElement>(null);

  // Move focus to the new question so keyboard and screen-reader users land in the right place.
  useEffect(() => { heading.current?.focus(); }, [step]);

  const canNext = [major, year, slug][step] !== "";
  // Show careers for the chosen major first.
  const sorted = [...paths].sort((a, b) => Number(b.major === major) - Number(a.major === major));

  function next(e: React.FormEvent) {
    e.preventDefault();
    if (!canNext) return;
    if (step < 2) { setStep(step + 1); return; }
    saveProfile({ major, year, slug });
    router.push("/roadmap");
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
      <p className="text-sm font-semibold text-ink-3 mb-2">Step {step + 1} of 3</p>
      <div className="h-2 rounded-full bg-surface-2 mb-8" role="progressbar" aria-label="Setup progress" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={3}>
        <div className="h-2 rounded-full bg-gold transition-all" style={{ width: `${((step + 1) / 3) * 100}%` }} />
      </div>

      <form onSubmit={next} className="grid gap-6">
        <fieldset className="grid gap-3">
          <legend className="contents">
            <h1 ref={heading} tabIndex={-1} className="font-display text-3xl sm:text-4xl font-bold mb-3 outline-none">{stepTitles[step]}</h1>
          </legend>

          {step === 0 && majors.map((m) => (
            <Choice key={m} name="major" value={m} label={m} checked={major === m} onSelect={setMajor} />
          ))}
          {step === 1 && years.map((y) => (
            <Choice key={y} name="year" value={y} label={y} checked={year === y} onSelect={setYear} />
          ))}
          {step === 2 && sorted.map((p) => (
            <Choice key={p.slug} name="path" value={p.slug} label={p.role}
              hint={p.major === major ? `Popular with ${major} majors` : p.major}
              checked={slug === p.slug} onSelect={setSlug} />
          ))}
        </fieldset>

        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={() => setStep(step - 1)} disabled={step === 0}
            className="rounded-full px-5 py-2.5 font-semibold text-teal hover:bg-teal-tint disabled:invisible">
            ← Back
          </button>
          <button type="submit" disabled={!canNext}
            className="bg-gold text-on-gold rounded-full px-6 py-3 font-bold hover:bg-gold-soft disabled:opacity-40 disabled:cursor-not-allowed">
            {step < 2 ? "Next" : "Build my roadmap"}
          </button>
        </div>
      </form>
    </section>
  );
}

// useSearchParams needs a Suspense boundary so the page can still be pre-rendered.
export default function Start() {
  return <Suspense><StartForm /></Suspense>;
}
