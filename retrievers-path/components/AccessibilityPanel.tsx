"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePrefs, type Prefs } from "@/lib/a11y";
import ThemeSwitcher from "@/components/ThemeSwitcher";

const toggles: { key: Exclude<keyof Prefs, "theme">; label: string }[] = [
  { key: "contrast", label: "High contrast" },
  { key: "dys", label: "Easier-to-read font" },
  { key: "reduceMotion", label: "Reduce motion" },
];

export default function AccessibilityPanel() {
  const { prefs, update } = usePrefs();
  const [reading, setReading] = useState(false);
  const pathname = usePathname();

  // Stop reading when the student moves to another page (or the panel unmounts).
  useEffect(() => {
    return () => { if ("speechSynthesis" in window) speechSynthesis.cancel(); setReading(false); };
  }, [pathname]);

  function readAloud() {
    const main = document.getElementById("main");
    if (!main || !("speechSynthesis" in window)) return;
    if (reading) { speechSynthesis.cancel(); setReading(false); return; }
    const u = new SpeechSynthesisUtterance(main.innerText);
    u.rate = 0.95;
    u.onend = () => setReading(false);
    u.onerror = () => setReading(false);
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
    setReading(true);
  }

  return (
    <div className="glass glass-strong p-4 grid gap-3 w-72" role="group" aria-label="Accessibility options">
      <h2 className="font-display font-semibold">Display & accessibility</h2>
      <ThemeSwitcher size="sm" />
      {toggles.map((o) => (
        <label key={o.key} className="flex justify-between items-center gap-3 cursor-pointer">
          {o.label}
          {/* The server can't know saved settings, so a brief mismatch here is expected. */}
          <input type="checkbox" role="switch" checked={prefs[o.key]} onChange={(e) => update({ [o.key]: e.target.checked })}
            autoComplete="off" suppressHydrationWarning className="switch" />
        </label>
      ))}
      <button type="button" onClick={readAloud} aria-pressed={reading}
        className="press bg-teal-tint text-teal rounded-full px-4 py-2 font-bold w-max">
        {reading ? "Stop reading" : "Read this page aloud"}
      </button>
      <Link href="/settings" className="text-sm font-semibold text-teal hover:underline">All settings →</Link>
    </div>
  );
}
