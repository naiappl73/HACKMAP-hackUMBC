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

### Turn on AI plans and live job data (optional)
The app works without any keys (it uses a built-in offline planner). To turn on the extras:

1. In `retrievers-path/`, copy `.env.example` to `.env.local`.
2. Add `ANTHROPIC_API_KEY` for **AI-personalized plans** (Claude). Plans take about 20–60 seconds to generate.
3. Add `USAJOBS_API_KEY` and `USAJOBS_EMAIL` for **live federal job postings** ([free key](https://developer.usajobs.gov/APIRequest/Index)).
4. Restart `npm run dev`.

Never commit `.env.local`; it's in `.gitignore`.

### What's in the app
| Page | What it does |
|------|--------------|
| `/` | Landing page |
| `/paths` | Browse ~70 UMBC programs; filter by area (STEM, Arts & Humanities, Social & Behavioral Sciences, Health & Human Services, Business, Education) and degree level |
| `/paths/[id]` | One program: careers, skills, focus ideas, related programs |
| `/start` | 5-step setup: program(s), minors & focus areas, career goal, year & experience, review |
| `/roadmap` | Dashboard: current year first, filters by type, add/remove your own items, live USAJOBS postings |
| `/settings` | Light / Dark / Auto theme, contrast, easy-read font, reduce motion, delete plan data |
| `/api/plan` | Builds a plan with Claude (falls back to the offline planner) |
| `/api/jobs` | USAJOBS search proxy |

Program data lives in `lib/programs.ts`; the offline planner is in `lib/plan.ts`. The program list was compiled for this prototype. **Verify names and requirements against the UMBC catalog (catalog.umbc.edu) before launch.**

### If something goes wrong
| Problem | Fix |
|---------|-----|
| `Could not read package.json` | Pull the latest `main`; `npm run dev` now works from the repo root too. |
| `next: command not found` / `Cannot find module` | Run `npm install` again (needed after every pull that changes `package.json`). |
| `Port 3000 is in use` | Another dev server is running. Stop it with `Ctrl+C`, or Next will offer port 3001. |
| Pages take minutes to load | `npm run dev` now uses Turbopack (much faster). Also check `node -p process.arch` prints `arm64` on Apple-chip Macs, and keep the project out of an iCloud-synced folder. |
| Page looks unstyled or stale | Stop the server, delete the `retrievers-path/.next` folder, run `npm run dev` again. |
| Round **N** button in the bottom-left corner | That's the Next.js dev tools. It only appears in `npm run dev`, not in the real site. |
| Old Node version errors | Install Node 20 LTS from nodejs.org (or `nvm use`, the repo has an `.nvmrc`). |

Fonts are bundled with the app (no Google download), so it runs even on blocked or offline networks.

### Layout: desktop first
RetrieversPath is designed for **desktop** first (1280px and wider), then adapts down to phones.
Tailwind classes without a prefix apply to every size; use `lg:` (1024px+) and `xl:` (1280px+) for the desktop layout,
e.g. `grid gap-6 lg:grid-cols-[340px_1fr]` = one column on phones, sidebar + main column on desktop.
Pages with sidebars: `/start`, `/roadmap`, `/paths/[slug]`.

### Where things go
| Path | What it is |
|------|------------|
| `app/page.tsx` | Home / landing page (`/`) |
| `app/start/page.tsx` | 5-step setup wizard (`/start`) |
| `app/roadmap/page.tsx` | Student dashboard (`/roadmap`) |
| `app/paths/page.tsx` | Program browser (`/paths`) |
| `app/paths/[slug]/page.tsx` | One program's page (`/paths/cs-bs`, ...) |
| `lib/programs.ts` | **All UMBC programs, minors, and focus areas.** Edit here to change every page |
| `lib/plan.ts` | Plan format + the offline planner |
| `lib/storage.ts` | Saves profile, plan, checkmarks, added/removed items in the browser (no backend yet) |
| `lib/a11y.ts` | Theme + accessibility settings (saved in the browser) |
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
