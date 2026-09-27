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

  const answers = [major, year, paths.find((p) => p.slug === slug)?.role ?? ""];
  const stepNames = ["Major", "Year", "Career"];

  // Desktop-first: step tracker on the left, question on the right. Stacks on phones.
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 lg:py-16 grid gap-8 lg:grid-cols-[300px_1fr] lg:gap-14 lg:items-start">
      <aside className="grid gap-5 lg:sticky lg:top-28">
        <div className="grid gap-2">
          <p className="text-sm font-semibold text-ink-3">Step {step + 1} of 3</p>
          <div className="h-2 rounded-full bg-surface-2" role="progressbar" aria-label="Setup progress" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={3}>
            <div className="h-2 rounded-full bg-gold transition-all" style={{ width: `${((step + 1) / 3) * 100}%` }} />
          </div>
        </div>
        {/* Step list with the answers so far: desktop only, phones use the bar above */}
        <ol className="hidden lg:grid gap-2" aria-label="Setup steps">
          {stepNames.map((name, i) => {
            const state = i < step ? "done" : i === step ? "current" : "todo";
            return (
              <li key={name} aria-current={state === "current" ? "step" : undefined}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${state === "current" ? "border-teal bg-surface" : "border-line"}`}>
                <span aria-hidden="true" className={`grid place-items-center w-7 h-7 rounded-full text-sm font-bold shrink-0 ${state === "done" ? "bg-mint text-white" : state === "current" ? "bg-gold text-on-gold" : "bg-surface-2 text-ink-3"}`}>
                  {state === "done" ? "✓" : i + 1}
                </span>
                <span className="grid min-w-0">
                  <span className="font-semibold">{name}</span>
                  <span className="text-sm text-ink-3 truncate">{answers[i] || (state === "todo" ? "Not yet" : "Choose one")}</span>
                </span>
              </li>
            );
          })}
        </ol>
        <p className="hidden lg:block text-sm text-ink-3">Takes about two minutes. You can change your answers anytime with Start over.</p>
      </aside>

      <form onSubmit={next} className="grid gap-6 min-w-0">
        <fieldset className="grid gap-3 sm:grid-cols-2">
          <legend className="contents">
            <h1 ref={heading} tabIndex={-1} className="sm:col-span-2 font-display text-3xl lg:text-4xl font-bold mb-3 outline-none">{stepTitles[step]}</h1>
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

        <div className="flex items-center justify-between gap-3 border-t border-line pt-6">
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
