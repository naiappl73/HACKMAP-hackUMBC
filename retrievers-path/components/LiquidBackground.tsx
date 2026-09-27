// Slowly drifting color blobs behind every page. The glass panels blur them, which
// gives the "liquid glass" look. Purely decorative; motion stops for reduced-motion users.
export default function LiquidBackground() {
  return (
    <div aria-hidden="true" className="liquid-bg">
      <span className="blob blob-gold" />
      <span className="blob blob-teal" />
      <span className="blob blob-mint" />
    </div>
  );
}
