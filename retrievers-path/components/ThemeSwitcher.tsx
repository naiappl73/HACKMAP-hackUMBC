"use client";
import { usePrefs, type Theme } from "@/lib/a11y";

const options: { value: Theme; label: string; icon: string }[] = [
  { value: "light", label: "Light", icon: "☀️" },
  { value: "dark", label: "Dark", icon: "🌙" },
  { value: "system", label: "Auto", icon: "💻" },
];

// Segmented Light / Dark / Auto control with a sliding glass "thumb".
export default function ThemeSwitcher({ size = "md" }: { size?: "sm" | "md" }) {
  const { prefs, update } = usePrefs();
  const index = options.findIndex((o) => o.value === prefs.theme);

  return (
    <div role="radiogroup" aria-label="Color theme"
      className={`segmented relative grid grid-cols-3 rounded-full border border-line bg-surface-2 p-1 ${size === "sm" ? "text-xs" : "text-sm"}`}>
      <span aria-hidden="true" className="segmented-thumb" style={{ transform: `translateX(${index * 100}%)` }} />
      {options.map((o) => (
        <button key={o.value} type="button" role="radio" aria-checked={prefs.theme === o.value}
          onClick={() => update({ theme: o.value })}
          className={`relative z-10 rounded-full px-3 ${size === "sm" ? "py-1" : "py-1.5"} font-semibold transition-colors ${prefs.theme === o.value ? "text-ink" : "text-ink-3 hover:text-ink"}`}>
          <span aria-hidden="true" className="mr-1">{o.icon}</span>{o.label}
        </button>
      ))}
    </div>
  );
}
