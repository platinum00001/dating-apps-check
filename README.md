# Dating Apps Check

A private, consent-based web app for reviewing **your own** dating-app accounts — plus an opt-in mode where two people compare what they each chose to share.

Plain HTML, CSS, and JavaScript. No build step, no backend, no tracking. Hosted free on Vercel.

## What it does

**Solo self-check** (`self-check.html`)
- Guided checklist for 11 apps: Tinder, Bumble, Hinge, Match, OkCupid, Plenty of Fish, Facebook Dating, Feeld, HER, Grindr, Ashley Madison (discreet wording).
- For each app: status (No account / Active / Paused or deleted / Not sure), last-checked date, private notes, short official steps, and links to the app's own site and help center.
- Animated progress ring, status totals, filters (to review / reviewed / active), "review next app" button.
- Progress is saved automatically in your browser's `localStorage`.
- Copy or download a text or JSON summary.

**Mutual opt-in** (`mutual.html`)
- Each person makes a share code (`DAC1:…`) from their own self-check, choosing whether to include notes.
- Send it as a code, a link (`mutual.html#pkg=…`, the code lives in the URL fragment, which browsers never send to the server), or a `.json` file.
- Paste both codes to see a side-by-side comparison with **Matched / Different / Incomplete** badges.
- "Try with sample data" shows how it looks using fictional people.

## What it does NOT do

- ❌ No phone, email, or name lookup of anyone.
- ❌ No scraping, no API calls to dating apps, no fake "scan".
- ❌ No accounts, server, database, analytics, or cookies.
- ❌ It can't prove anything. Comparisons only show what each person reported about themselves.

Dating apps don't reveal accounts or last-active times to outsiders, and the copy says so plainly.

## Privacy

- Everything runs in the browser. The site's Content-Security-Policy (`vercel.json`) blocks all network requests from scripts (`connect-src 'none'`).
- Self-check data stays in `localStorage` under `datingAppsCheck_selfCheck_v1` until the user clicks **Clear all saved data** or clears site data.
- Nothing is shared unless the user copies, downloads, or sends it themselves.

## Design

- Gradient + soft-glass look, per-app brand-color accents with emoji icons (no trademarked logos).
- Dark / light mode (follows the system, remembers your choice).
- Sticky bottom action bar on mobile, toast notifications, smooth expand/collapse, empty states.
- Mobile-first, keyboard friendly (real buttons and radio inputs, visible focus rings, skip link), respects `prefers-reduced-motion`.

## Project structure

```
index.html          Landing page: hero, how it works, modes, limits, FAQ
self-check.html     Solo checklist
mutual.html         Share code + side-by-side comparison
css/styles.css      All styles (light + dark tokens at the top)
js/apps-data.js     The list of apps: name, emoji, brand color, links, steps
js/common.js        Theme, toasts, clipboard, downloads, storage helpers
js/self-check.js    Solo checklist logic
js/mutual.js        Share package encode/decode + comparison
vercel.json         Security headers
favicon.svg
```

## How to edit

- **Add or change an app:** edit `js/apps-data.js`. Each entry needs `id`, `name`, `icon` (an emoji), `color` (hex), `officialUrl`, `helpUrl` (must be `https://`), and `steps`. Optional: `discreet: true` with a `disclaimer`.
- **Change colors or fonts:** edit the CSS variables at the top of `css/styles.css` (`:root` for light, `[data-theme="dark"]` for dark).
- **Change wording:** edit the HTML files directly.

## Run locally

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

## Deploy

Pushes to `main` redeploy on Vercel automatically (static site, no build command, output directory = repo root). It also works on Netlify, Cloudflare Pages, or GitHub Pages as-is.
