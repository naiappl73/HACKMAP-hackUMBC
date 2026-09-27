# HACKMAP-hackUMBC
hackUMBC HACKMAP project with Anaiah, Martin, Paul

## Frontend: RetrieversPath (Next.js 15 + React 19 + Tailwind + TypeScript)

The UI lives in [`retrievers-path/`](retrievers-path/).

### Run it locally
You need **Node.js 18.18 or newer** (20 recommended). Check with `node -v`.

You can run these from the repo root **or** from inside `retrievers-path/`:

```bash
npm install      # first time only (and after pulling new changes)
npm run dev      # then open http://localhost:3000
```

**See it on your phone or a teammate's laptop** (same Wi-Fi): run `npm run dev:host`, then open
`http://<your-laptop-IP>:3000` on the other device. On a Mac, find your IP with `ipconfig getifaddr en0`.

Stop the server with `Ctrl+C`. Before pushing, run `npm run lint` and `npm run build`.

### If something goes wrong
| Problem | Fix |
|---------|-----|
| `Could not read package.json` | Pull the latest `main`; `npm run dev` now works from the repo root too. |
| `next: command not found` / `Cannot find module` | Run `npm install` again (needed after every pull that changes `package.json`). |
| `Port 3000 is in use` | Another dev server is running. Stop it with `Ctrl+C`, or Next will offer port 3001. |
| Page looks unstyled or stale | Stop the server, delete the `retrievers-path/.next` folder, run `npm run dev` again. |
| Round **N** button in the bottom-left corner | That's the Next.js dev tools. It only appears in `npm run dev`, not in the real site. |
| Old Node version errors | Install Node 20 LTS from nodejs.org (or `nvm use`, the repo has an `.nvmrc`). |

Fonts are bundled with the app (no Google download), so it runs even on blocked or offline networks.

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
| `lib/a11y.ts` | Saves Accessibility settings (dark mode, contrast, font) in the browser |
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
| `bg-gold text-on-gold` | The ONE primary button per screen, progress bar (`text-on-gold` stays dark in dark mode) |
| `bg-gold-tint text-gold-deep` | Chips, "in progress" tags |
| `text-teal`, `bg-teal-tint text-teal` | Links, info |
| `bg-mint-tint text-mint` | Success / completed |
| `bg-coral-tint text-coral` | Errors only |
| `font-display` / `font-sans` / `font-mono` | Headings (Sora) / body (Manrope) / numbers (JetBrains Mono) |
| `glass` | Frosted top bar or floating panel |
