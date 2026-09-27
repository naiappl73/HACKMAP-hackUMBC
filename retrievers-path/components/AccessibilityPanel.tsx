"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { applyPrefs, currentPrefs, savePrefs, type A11yPrefs } from "@/lib/a11y";

const options: { key: keyof A11yPrefs; label: string }[] = [
  { key: "contrast", label: "High contrast" },
  { key: "dark", label: "Dark mode" },
  { key: "dys", label: "Easier-to-read font" },
];

export default function AccessibilityPanel() {
  const [prefs, setPrefs] = useState<A11yPrefs>({ dark: false, contrast: false, dys: false });
  const [reading, setReading] = useState(false);
  const pathname = usePathname();

  // Start from whatever the <head> script already applied.
  useEffect(() => { setPrefs(currentPrefs()); }, []);

  // Stop reading when the student moves to another page (or the panel unmounts).
  useEffect(() => {
    return () => { if ("speechSynthesis" in window) speechSynthesis.cancel(); setReading(false); };
  }, [pathname]);

  function update(key: keyof A11yPrefs, value: boolean) {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    applyPrefs(next);
    savePrefs(next);
  }

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
    <div className="glass p-4 grid gap-3 w-72" role="group" aria-label="Accessibility options">
      <h2 className="font-display font-semibold">Accessibility</h2>
      {options.map((o) => (
        <label key={o.key} className="flex justify-between items-center gap-3 cursor-pointer">
          {o.label}
          {/* The server can't know saved settings, so a brief mismatch here is expected. */}
          <input type="checkbox" checked={prefs[o.key]} onChange={(e) => update(o.key, e.target.checked)}
            autoComplete="off" suppressHydrationWarning
            className="w-4 h-4 accent-[var(--rp-teal)]" />
        </label>
      ))}
      <button type="button" onClick={readAloud} aria-pressed={reading}
        className="bg-teal-tint text-teal rounded-full px-4 py-2 font-bold w-max">
        {reading ? "Stop reading" : "Read this page aloud"}
      </button>
      <p className="text-xs text-ink-3">Your choices are saved on this device.</p>
    </div>
  );
}
