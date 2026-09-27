import Link from "next/link";
import { areaOf, levelLabels, type Program } from "@/lib/programs";

// Whole card is one link, so it's a single tab stop for keyboard users.
export default function ProgramCard({ program }: { program: Program }) {
  return (
    <Link href={`/paths/${program.id}`} className="glass-card interactive group h-full p-5 grid gap-3 content-start">
      <div className="flex items-center justify-between gap-2 text-xs font-semibold">
        <span className="text-ink-3">{areaOf(program)}</span>
        <span className="rounded-full bg-surface-2 text-ink-2 px-2 py-0.5">{levelLabels[program.level]} · {program.degree}</span>
      </div>
      <h3 className="font-display text-lg font-semibold group-hover:text-teal transition-colors">{program.name}</h3>
      <p className="text-sm text-ink-2 line-clamp-2">{program.summary}</p>
      <ul className="flex flex-wrap gap-1.5" aria-label={`Example careers for ${program.name}`}>
        {program.careers.slice(0, 3).map((c) => (
          <li key={c} className="rounded-full bg-teal-tint text-teal text-xs font-bold px-2.5 py-1">{c}</li>
        ))}
      </ul>
      <span className="text-sm font-semibold text-teal mt-1">Explore →</span>
    </Link>
  );
}
