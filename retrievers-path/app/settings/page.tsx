"use client";
import Link from "next/link";
import { useState } from "react";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { usePrefs, type Prefs } from "@/lib/a11y";
import { clearEverything } from "@/lib/storage";

const toggles: { key: Exclude<keyof Prefs, "theme">; label: string; hint: string }[] = [
  { key: "contrast", label: "High contrast", hint: "Stronger text and borders; turns off glass effects." },
  { key: "dys", label: "Easier-to-read font", hint: "Switches every page to Atkinson Hyperlegible." },
  { key: "reduceMotion", label: "Reduce motion", hint: "Turns off page transitions and moving backgrounds." },
];

export default function Settings() {
  const { prefs, update } = usePrefs();
  const [cleared, setCleared] = useState(false);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 lg:py-14 grid gap-8">
      <header className="grid gap-2 rise">
        <h1 className="font-display text-3xl lg:text-4xl font-bold">Settings</h1>
        <p className="text-ink-2">Everything here is saved on this device.</p>
      </header>

      <div className="grid gap-6 stagger">
        <section aria-labelledby="appearance" className="glass-card p-6 grid gap-5">
          <div>
            <h2 id="appearance" className="font-display text-xl font-semibold">Appearance</h2>
            <p className="text-sm text-ink-3">Choose light or dark, or let RetrieversPath follow your computer.</p>
          </div>
          <div className="max-w-sm"><ThemeSwitcher /></div>
          <div className="grid grid-cols-2 gap-4 max-w-md" aria-hidden="true">
            {(["light", "dark"] as const).map((t) => (
              <button key={t} type="button" tabIndex={-1} onClick={() => update({ theme: t })}
                className={`press rounded-2xl border-2 p-3 text-left ${prefs.theme === t ? "border-teal" : "border-line"}`}>
                <div className={`rounded-xl p-3 grid gap-2 ${t === "dark" ? "bg-[#111214]" : "bg-[#FBF9F4]"}`}>
                  <div className={`h-2 w-2/3 rounded-full ${t === "dark" ? "bg-[#F2EFE7]" : "bg-[#1C1B19]"}`} />
                  <div className={`h-2 w-1/2 rounded-full ${t === "dark" ? "bg-[#7E7B72]" : "bg-[#8B887F]"}`} />
                  <div className="h-4 w-16 rounded-full bg-[#FDB515]" />
                </div>
                <p className="mt-2 text-sm font-semibold capitalize">{t}</p>
              </button>
            ))}
          </div>
        </section>

        <section aria-labelledby="access" className="glass-card p-6 grid gap-4">
          <h2 id="access" className="font-display text-xl font-semibold">Accessibility & motion</h2>
          {toggles.map((t) => (
            <div key={t.key} className="flex items-center justify-between gap-4">
              <label htmlFor={`pref-${t.key}`} className="grid cursor-pointer">
                <span className="font-semibold">{t.label}</span>
                <span className="text-sm text-ink-3">{t.hint}</span>
              </label>
              <input id={`pref-${t.key}`} type="checkbox" role="switch" className="switch" checked={prefs[t.key]}
                onChange={(e) => update({ [t.key]: e.target.checked })} autoComplete="off" suppressHydrationWarning />
            </div>
          ))}
        </section>

        <section aria-labelledby="plan" className="glass-card p-6 grid gap-4">
          <div>
            <h2 id="plan" className="font-display text-xl font-semibold">My plan</h2>
            <p className="text-sm text-ink-3">Change your major, minors, focus, or career goal and build a fresh plan.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/start" className="press bg-gold text-on-gold rounded-full px-5 py-2.5 font-bold hover:bg-gold-soft">Edit my answers</Link>
            <Link href="/roadmap" className="press rounded-full border border-line bg-surface px-5 py-2.5 font-semibold hover:bg-surface-2">Go to my plan</Link>
            <button type="button"
              onClick={() => { if (confirm("Delete your plan, checkmarks, and added items from this device?")) { clearEverything(); setCleared(true); } }}
              className="press rounded-full px-5 py-2.5 font-semibold text-coral hover:bg-coral-tint">
              Delete my plan data
            </button>
          </div>
          <p role="status" className="text-sm text-mint font-semibold">{cleared ? "Your plan data was deleted from this device." : ""}</p>
        </section>
      </div>
    </div>
  );
}
