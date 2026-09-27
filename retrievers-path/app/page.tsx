import AccessibilityPanel from "@/components/AccessibilityPanel";

export default function Home() {
  return (
    <div className="p-8 grid gap-4">
      <h1 className="font-display text-4xl font-bold">RetrieversPath</h1>
      <button className="bg-gold text-ink rounded-full px-5 py-2 font-bold w-max">Continue</button>
      <AccessibilityPanel />
    </div>
  );
}
