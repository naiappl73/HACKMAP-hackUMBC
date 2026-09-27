"use client";
import { useEffect, useRef, useState } from "react";
import AccessibilityPanel from "@/components/AccessibilityPanel";

const links = [
  { href: "#how", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#paths", label: "Career paths" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  // Close the panel on Escape or a click outside it.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    const onClick = (e: MouseEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onClick); };
  }, [open]);

  return (
    <header className="sticky top-0 z-20 px-4 pt-3">
      <nav aria-label="Main" className="glass mx-auto max-w-6xl flex items-center justify-between gap-4 px-4 py-2.5">
        <a href="#top" className="flex items-center gap-2 font-display font-bold text-lg">
          <span aria-hidden="true" className="grid place-items-center w-8 h-8 rounded-full bg-gold text-ink text-sm">RP</span>
          RetrieversPath
        </a>
        <ul className="hidden md:flex gap-6 text-ink-2 font-medium">
          {links.map((l) => (
            <li key={l.href}><a href={l.href} className="hover:text-ink">{l.label}</a></li>
          ))}
        </ul>
        {/* Panel stays mounted (just hidden) so the checkboxes keep their state. */}
        <div ref={wrap} className="relative">
          <button
            type="button"
            aria-expanded={open}
            aria-controls="a11y-panel"
            onClick={() => setOpen((o) => !o)}
            className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold hover:bg-surface-2"
          >
            Accessibility
          </button>
          <div id="a11y-panel" hidden={!open} className="absolute right-0 mt-2 [&>div]:bg-surface [&>div]:border-line">
            <AccessibilityPanel />
          </div>
        </div>
      </nav>
    </header>
  );
}
