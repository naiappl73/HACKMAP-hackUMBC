"use client";
import { useEffect, useState } from "react";

// Display & accessibility preferences, saved in this browser and applied to <html>:
//   .dark                 dark colors (theme "dark", or "system" when the computer is in dark mode)
//   data-contrast="high"  high-contrast colors
//   data-font="dys"       Atkinson Hyperlegible everywhere
//   data-motion="reduced" turns off animations
export type Theme = "light" | "dark" | "system";
export type Prefs = { theme: Theme; contrast: boolean; dys: boolean; reduceMotion: boolean };

export const A11Y_KEY = "rp-a11y";
const EVENT = "rp-prefs-change";
export const defaultPrefs: Prefs = { theme: "system", contrast: false, dys: false, reduceMotion: false };

function systemDark() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function readPrefs(): Prefs {
  try {
    const raw = JSON.parse(localStorage.getItem(A11Y_KEY) || "null") || {};
    // Older saves stored dark: true/false instead of a theme.
    const theme: Theme = raw.theme ?? (typeof raw.dark === "boolean" ? (raw.dark ? "dark" : "light") : "system");
    return { ...defaultPrefs, ...raw, theme };
  } catch {
    return defaultPrefs;
  }
}

export function applyPrefs(p: Prefs) {
  const html = document.documentElement;
  html.classList.toggle("dark", p.theme === "dark" || (p.theme === "system" && systemDark()));
  if (p.contrast) html.setAttribute("data-contrast", "high"); else html.removeAttribute("data-contrast");
  if (p.dys) html.setAttribute("data-font", "dys"); else html.removeAttribute("data-font");
  if (p.reduceMotion) html.setAttribute("data-motion", "reduced"); else html.removeAttribute("data-motion");
}

export function savePrefs(p: Prefs) {
  try { localStorage.setItem(A11Y_KEY, JSON.stringify(p)); } catch { /* storage blocked: still works for this visit */ }
  applyPrefs(p);
  window.dispatchEvent(new CustomEvent(EVENT));
}

// Shared by the Accessibility popover and the Settings page; both stay in sync.
export function usePrefs() {
  const [prefs, setPrefs] = useState<Prefs>(defaultPrefs);
  useEffect(() => {
    const sync = () => setPrefs(readPrefs());
    sync();
    window.addEventListener(EVENT, sync);
    // Follow the computer's light/dark setting live when theme is "system".
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystem = () => applyPrefs(readPrefs());
    mq.addEventListener("change", onSystem);
    return () => { window.removeEventListener(EVENT, sync); mq.removeEventListener("change", onSystem); };
  }, []);
  const update = (patch: Partial<Prefs>) => {
    const next = { ...readPrefs(), ...patch };
    setPrefs(next);
    savePrefs(next);
  };
  return { prefs, update };
}
