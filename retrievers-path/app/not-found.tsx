import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-24 grid gap-5 justify-items-start">
      <p className="rounded-full bg-coral-tint text-coral text-sm font-bold px-3 py-1">404 · Page not found</p>
      <h1 className="font-display text-4xl font-bold">This path doesn&apos;t exist (yet)</h1>
      <p className="text-lg text-ink-2">The page may have moved, or the link has a typo.</p>
      <div className="flex flex-wrap gap-3">
        <Link href="/" className="bg-gold text-on-gold rounded-full px-6 py-3 font-bold hover:bg-gold-soft">Go home</Link>
        <Link href="/paths" className="rounded-full px-6 py-3 font-semibold text-teal hover:bg-teal-tint">Browse career paths</Link>
      </div>
    </section>
  );
}
