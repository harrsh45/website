# The Lumen Desk website

The portfolio site for **The Lumen Desk** (https://thelumendesk.com): a one-page,
proof-first showroom of real, clickable websites for people arriving from Instagram.
Built with Next.js 16 (App Router, TypeScript) and Nate Herk's
[Scrollcraft](https://github.com/nateherkai/scroll-craft) skill and engine.

- **Before going live:** read [`docs/LAUNCH_CHECKLIST.md`](docs/LAUNCH_CHECKLIST.md).
- **What was tested and what was not:** [`docs/VERIFICATION.md`](docs/VERIFICATION.md).

---

## Quick start

Requires Node 20.9+ (tested on Node 22).

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build (also type-checks)
npm start            # serve the production build
npm run lint
npm run typecheck
```

## Where things live

| What | File |
|---|---|
| Studio facts (email, Instagram, domain, SEO title/description) | `src/data/site.ts` |
| **Every project** (links, labels, descriptions, order) | `src/data/projects.ts` |
| Hero | `src/components/Hero.tsx` |
| Work gallery and project labels | `src/components/Work.tsx`, `src/components/ProjectPiece.tsx` |
| Services, process, about, FAQ, footer copy | `src/components/Sections.tsx` |
| Closing contact section and enquiry form | `src/components/Contact.tsx`, `src/components/EnquiryForm.tsx` |
| Colours, type, layout | `src/app/globals.css` (tokens at the top) |
| SEO metadata, fonts, structured data | `src/app/layout.tsx` |
| Social share image | `src/app/opengraph-image.tsx` |
| Original brand files (never edit) | `brand/` |
| Web versions of the brand files | `public/brand/` (made by `npm run brand`) |
| Project screenshots | `public/projects/` (made by `npm run capture`) |

## Editing projects

All projects are in **`src/data/projects.ts`**. Each entry has:

- `status`: `"client"` only for work a business commissioned and paid for. Everything
  else is `"preview"`, and the site labels it "Website preview" with the line
  *"Independent design concept. Not an official collaboration with the featured business."*
- `group`: `"featured"` (large, with desktop + phone screenshots), `"more"` (smaller
  grid), or `"hidden"` (kept in the data, never shown).
- `order`: display order. The first featured project gets the largest, full-width slot.
- `available`: set to `false` if the link stops working. Unavailable projects are never shown.
- `rightsCleared`: set to `true` once you have permission to show that project (see the checklist).
- `description`: one honest sentence about what was built. Do not add results,
  testimonials or claims you cannot back up.

**Add a project:** copy an entry, give it a new `slug` and `url`, then capture its screenshots:

```bash
npm run capture -- my-new-slug      # one project
npm run capture                     # all projects
```

This opens each URL in Chrome and saves real screenshots to `public/projects/`
(`<slug>-desktop.webp` at 1440px, `<slug>-desktop-mid.webp` one screen down,
`<slug>-mobile.webp` at 390px). Look at them before publishing. Set
`CHROME_PATH` if Chrome is not in a standard location.

**Re-test every link** (projects, Instagram, the live domain):

```bash
npm run check-links
```

## Brand files

`brand/the-lumen-desk-logo.png` and `brand/the-lumen-desk-animated.gif` are the
supplied originals and are never edited. `npm run brand` (Python 3 + Pillow) derives
the web files from them: the hero animation (the GIF's first 23 frames, so it plays
once and stops with the lamp lit), the lit still used for reduced motion, resized
logos and the favicons.

## Environment variables

See `.env.example`. None are required: with no variables set, the site works with
Instagram and email contact only.

| Variable | Purpose |
|---|---|
| `RESEND_API_KEY`, `ENQUIRY_FROM_EMAIL` | Turn on the enquiry form (delivered by email through [Resend](https://resend.com)) |
| `ENQUIRY_TO_EMAIL` | Where enquiries go (default `harsh@thelumendesk.com`) |
| `NEXT_PUBLIC_REQUIRE_RIGHTS_CLEARANCE` | `true` hides every project not marked `rightsCleared: true` |

The homepage is generated at build time, so **redeploy after changing variables**.

### Turning on the enquiry form

1. Create a Resend account and verify `thelumendesk.com` as a sending domain
   (Resend shows the DNS records to add; add them where your DNS is managed).
2. Create an API key.
3. Set `RESEND_API_KEY` and `ENQUIRY_FROM_EMAIL` (e.g. `The Lumen Desk <website@thelumendesk.com>`).
4. Redeploy, then send yourself a test enquiry from the live site.

The form has a honeypot field, a minimum-time check, same-origin checking,
server-side validation and a best-effort rate limit. It never shows "sent" unless
Resend accepted the message. Without JavaScript it still posts safely (no personal
details in the URL).

## Analytics (optional, off by default)

No analytics or cookies ship with the site. If you add a privacy-friendly provider
such as [Plausible](https://plausible.io), add its script tag in `src/app/layout.tsx`
and these events are sent automatically: `view_portfolio`, `open_preview`,
`click_contact`, `submit_enquiry` (see `src/lib/track.ts`). Check whether your
provider and your visitors' locations require a consent banner or privacy notice first.

## Deploying (Vercel)

1. Push this folder to a Git repository (GitHub, GitLab or Bitbucket).
2. In Vercel: **Add New Project**, import the repository. Framework preset: Next.js.
   No build settings need changing.
3. Add any environment variables (optional, above).
4. Deploy, and check the `*.vercel.app` URL works.

Any Node host that runs `npm run build && npm start` also works.

### Connecting thelumendesk.com

On 22 Nov 2026 `thelumendesk.com` showed a Hostinger "parked domain" page, so DNS is
managed at Hostinger. Nothing has been changed there.

1. Vercel: **Project > Settings > Domains**, add `thelumendesk.com` and
   `www.thelumendesk.com`. Set `www` to redirect to `thelumendesk.com` (the canonical
   address the site declares).
2. Vercel then shows the exact DNS records to create. Historically these are an
   `A` record for `@` pointing to `76.76.21.21` and a `CNAME` for `www` pointing to
   `cname.vercel-dns.com`, but **use the values Vercel shows you**.
3. Hostinger: **hPanel > Domains > thelumendesk.com > DNS / Nameservers > DNS records**.
   Remove the parking `A`/`CNAME` records for `@` and `www`, then add Vercel's.
4. **Do not touch the `MX`, `TXT` (SPF/DKIM/DMARC) or other email records**:
   `harsh@thelumendesk.com` depends on them. For the same reason, change individual
   records rather than switching nameservers to Vercel.
5. Wait for Vercel to show the domain as valid (minutes to a few hours), then open
   https://thelumendesk.com and run `npm run check-links`.

## Verification scripts

Run against a local production build (`npm run build && npm start -- -p 4600`):

```bash
node scripts/verify-site.mjs           # walks the page at 5 viewport profiles, contact sheets + report
node scripts/verify-interactions.mjs   # keyboard, menu, links, API honesty, throttled load
node scripts/verify-form.mjs           # only with a build made with the enquiry variables set
node .claude/skills/scroll-craft/scripts/shoot.mjs --url http://localhost:4600 --out scrollcraft/builds/thelumendesk/lab/shots
```

Output goes to `scrollcraft/builds/thelumendesk/lab/` (git-ignored).

## Scrollcraft

- The skill is installed in `.claude/skills/scroll-craft/` (Claude Code project
  skill, copied intact from the official repository, MIT licence). Its preflight:
  `node .claude/skills/scroll-craft/scripts/doctor.mjs`.
- The design brief, journey, feeling curve, signature move and feel-check are in
  `scrollcraft/builds/thelumendesk/BRIEF.md`; the fingerprint registry is
  `scrollcraft/FINGERPRINTS.md`.
- The engine is vendored **unmodified** in `src/vendor/scrollcraft/` (checksums in
  its README). It is mounted by `src/components/ScrollcraftMount.tsx`. The signature
  "lamp switches on" behaviour is page code in `src/components/LampLight.tsx`.
- Fail-safe by design: with JavaScript off, a slow script or reduced motion, every
  section is visible and every project is fully lit.
