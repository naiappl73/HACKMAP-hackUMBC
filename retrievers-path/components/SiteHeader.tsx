"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AccessibilityPanel from "@/components/AccessibilityPanel";

const links = [
  { href: "/#how", label: "How it works" },
  { href: "/paths", label: "Programs" },
  { href: "/roadmap", label: "My plan" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const wrap = useRef<HTMLDivElement>(null);

  // Close the panel on Escape, a click outside it, or a page change.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    const onClick = (e: MouseEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onClick); };
  }, [open]);
  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) => href !== "/#how" && (pathname === href || pathname.startsWith(href + "/"));

  return (
    <header className="sticky top-0 z-30 px-4 pt-3">
      <nav aria-label="Main" className="glass glass-strong mx-auto max-w-6xl flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2.5">
        <Link href="/" className="press flex items-center gap-2 font-display font-bold text-lg">
          <span aria-hidden="true" className="logo-orb grid place-items-center w-8 h-8 rounded-full bg-gold text-on-gold text-sm">RP</span>
          RetrieversPath
        </Link>
        <ul className="order-last w-full flex justify-center gap-1 text-sm border-t border-line pt-2 md:order-none md:w-auto md:text-base md:border-0 md:pt-0 text-ink-2 font-medium">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} aria-current={isActive(l.href) ? "page" : undefined}
                className={`nav-pill rounded-full px-3 py-1.5 hover:text-ink ${isActive(l.href) ? "is-active text-ink font-semibold" : ""}`}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <Link href="/settings" aria-label="Settings" title="Settings" aria-current={pathname === "/settings" ? "page" : undefined}
            className="press grid place-items-center w-9 h-9 rounded-full border border-line bg-surface hover:bg-surface-2">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="w-[18px] h-[18px] gear" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
            </svg>
          </Link>
          {/* Panel stays mounted (just hidden) so its settings stay in sync. */}
          <div ref={wrap} className="relative">
            <button type="button" aria-expanded={open} aria-controls="a11y-panel" onClick={() => setOpen((o) => !o)}
              className="press flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 sm:px-4 py-2 text-sm font-semibold whitespace-nowrap hover:bg-surface-2">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                <circle cx="12" cy="4" r="2" />
                <path d="M4 7.5 12 9l8-1.5.4 2L15 10.6V14l2 7-1.9.6L12 15l-3.1 6.6L7 21l2-7v-3.4L3.6 9.5z" />
              </svg>
              <span className="sr-only sm:not-sr-only">Accessibility</span>
            </button>
            <div id="a11y-panel" hidden={!open} className="popover absolute right-0 mt-2">
              <AccessibilityPanel />
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
