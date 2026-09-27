"use client";
import { useState } from "react";

// Starter accessibility panel. Wire the switches to <html data-*> attributes;
// globals.css already styles [data-contrast="high"].
export default function AccessibilityPanel() {
  const [reading, setReading] = useState(false);

  function readAloud() {
    const main = document.getElementById("main");
    if (!main || !("speechSynthesis" in window)) return;
    if (reading) { speechSynthesis.cancel(); setReading(false); return; }
    const u = new SpeechSynthesisUtterance(main.innerText);
    u.rate = 0.95;
    u.onend = () => setReading(false);
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
    setReading(true);
  }

  function setAttr(name: string, value: string | null) {
    const html = document.documentElement;
    if (value) html.setAttribute(name, value); else html.removeAttribute(name);
  }

  return (
    <div className="glass p-4 grid gap-3 w-72" role="group" aria-label="Accessibility options">
      <h2 className="font-display font-semibold">Accessibility</h2>
      <label className="flex justify-between items-center gap-3">High contrast
        <input type="checkbox" onChange={(e) => setAttr("data-contrast", e.target.checked ? "high" : null)} />
      </label>
      <label className="flex justify-between items-center gap-3">Easier-to-read font
        <input type="checkbox" onChange={(e) => document.body.classList.toggle("font-dys", e.target.checked)} />
      </label>
      <button type="button" onClick={readAloud} className="bg-gold text-ink rounded-full px-4 py-2 font-bold w-max">
        {reading ? "Stop reading" : "Read this page aloud"}
      </button>
    </div>
  );
}
