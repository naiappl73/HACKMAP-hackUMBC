import Link from "next/link";
import type { CareerPath } from "@/lib/paths";

// Whole card is one link, so it's a single tab stop for keyboard users.
export default function PathCard({ path }: { path: CareerPath }) {
  return (
    <Link href={`/paths/${path.slug}`}
      className="group h-full bg-surface border border-line rounded-2xl p-5 grid gap-3 content-start hover:border-teal hover:shadow-card lift">
      <p className="text-sm text-ink-3 font-medium">{path.major}</p>
      <h3 className="font-display text-lg font-semibold group-hover:text-teal">{path.role}</h3>
      <p className="text-sm text-ink-2 line-clamp-2">{path.summary}</p>
      <ul className="flex flex-wrap gap-2" aria-label={`Key skills for ${path.role}`}>
        {path.skills.slice(0, 3).map((s) => (
          <li key={s} className="rounded-full bg-teal-tint text-teal text-xs font-bold px-2.5 py-1">{s}</li>
        ))}
      </ul>
      <span className="text-sm font-semibold text-teal mt-1">View roadmap →</span>
    </Link>
  );
}
