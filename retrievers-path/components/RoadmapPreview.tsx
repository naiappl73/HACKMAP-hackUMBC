// Static preview card for the hero. Example data only, not a real student's plan.
const steps = [
  { term: "Fall · Year 2", title: "CMSC 341: Data Structures", status: "done" },
  { term: "Spring · Year 2", title: "Join a club project team", status: "done" },
  { term: "Summer · Year 2", title: "Apply to 15 internships", status: "now" },
  { term: "Fall · Year 3", title: "Build a portfolio project", status: "next" },
] as const;

const badge = {
  done: { text: "Done", cls: "bg-mint-tint text-mint" },
  now: { text: "In progress", cls: "bg-gold-tint text-gold-deep" },
  next: { text: "Up next", cls: "bg-surface-2 text-ink-2" },
};

export default function RoadmapPreview() {
  return (
    <figure className="bg-surface border border-line rounded-2xl shadow-card p-5 sm:p-6 w-full max-w-md">
      <figcaption className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-sm text-ink-3 font-medium">Example roadmap</p>
          <p className="font-display font-semibold text-lg">Software Engineer</p>
        </div>
        <span className="rounded-full bg-teal-tint text-teal text-xs font-bold px-3 py-1">Computer Science</span>
      </figcaption>

      <div className="mb-5">
        <div className="flex justify-between text-sm mb-1.5">
          <span className="text-ink-2">Progress</span>
          <span className="font-mono">50%</span>
        </div>
        <div className="h-2 rounded-full bg-surface-2" role="progressbar" aria-label="Roadmap progress" aria-valuenow={50} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-2 rounded-full bg-gold w-1/2" />
        </div>
      </div>

      <ol className="grid gap-3">
        {steps.map((s) => (
          <li key={s.title} className="flex items-center justify-between gap-3 rounded-xl bg-bg border border-line px-3 py-2.5">
            <div>
              <p className="text-xs text-ink-3">{s.term}</p>
              <p className="font-semibold text-sm">{s.title}</p>
            </div>
            <span className={`shrink-0 rounded-full text-xs font-bold px-2.5 py-1 ${badge[s.status].cls}`}>{badge[s.status].text}</span>
          </li>
        ))}
      </ol>
    </figure>
  );
}
