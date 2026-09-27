# HACKMAP-hackUMBC
hackUMBC HACKMAP project with Anaiah, Martin, Paul

## Frontend: RetrieversPath (Next.js + Tailwind + TypeScript)

The UI lives in [`retrievers-path/`](retrievers-path/).

### Run it locally
You need Node.js 18 or newer (`node -v` to check).

```bash
cd retrievers-path
npm install      # first time only, takes 1-3 min
npm run dev      # then open http://localhost:3000
```

**See it on your phone or a teammate's laptop** (same Wi-Fi): run `npm run dev:host`, then open
`http://<your-laptop-IP>:3000` on the other device. On a Mac, find your IP with `ipconfig getifaddr en0`.

Stop the server with `Ctrl+C`. Before pushing, run `npm run lint` and `npm run build`.

### Where things go
| Path | What it is |
|------|------------|
| `app/page.tsx` | Home / landing page (`/`) |
| `app/start/page.tsx` | 3-question setup: major, year, career (`/start`) |
| `app/roadmap/page.tsx` | Student's roadmap with checklist + progress (`/roadmap`) |
| `app/paths/page.tsx` | All career paths with major filter (`/paths`) |
| `app/paths/[slug]/page.tsx` | One career's details and 4-year plan (`/paths/software-engineer`, ...) |
| `lib/paths.ts` | **All career content.** Edit here to change every page at once |
| `lib/storage.ts` | Saves choices + checkmarks in the browser (no backend yet) |
| `app/layout.tsx` | Wraps every page: fonts + skip-to-content link |
| `app/globals.css` | Color tokens (light / dark / high contrast), `.glass` style |
| `components/` | Reusable pieces, e.g. `AccessibilityPanel.tsx` |
| `public/` | Logos and images |
| `tailwind.config.ts` | Color and font names for Tailwind classes |

### Color and font classes
| Class | Use it for |
|-------|------------|
| `bg-bg` | Page background |
| `bg-surface` / `bg-surface-2` | Cards and panels / stat tiles, inset areas |
| `border-line` | Borders and dividers |
| `text-ink` / `text-ink-2` / `text-ink-3` | Main text / secondary text / labels |
| `bg-gold text-ink` | The ONE primary button per screen, progress bar |
| `bg-gold-tint text-gold-deep` | Chips, "in progress" tags |
| `text-teal`, `bg-teal-tint text-teal` | Links, info |
| `bg-mint-tint text-mint` | Success / completed |
| `bg-coral-tint text-coral` | Errors only |
| `font-display` / `font-sans` / `font-mono` | Headings (Sora) / body (Manrope) / numbers (JetBrains Mono) |
| `glass` | Frosted top bar or floating panel |
