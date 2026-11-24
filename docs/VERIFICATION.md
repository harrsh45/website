# Verification report

Build: Next.js 16.4.6 production build (smooth scrolling: Lenis 1.3.27) (`next build` + `next start`), 22 Nov 2026.
All checks below ran against the final build unless marked otherwise.
Evidence (frames, contact sheets, JSON reports) is in `scrollcraft/builds/thelumendesk/lab/`
(git-ignored; regenerate with the scripts in the README).

## Build quality

| Check | Result |
|---|---|
| `tsc --noEmit` | Pass, 0 errors |
| `eslint .` | Pass, 0 errors, 0 warnings |
| `next build` | Pass. `/` is static; `/api/enquiry` is the only dynamic route |
| Browser console (5 viewport profiles) | 0 errors, 0 hydration warnings |
| Failed or 4xx/5xx requests | 0 |

## Links

Tested in headless Chrome and with curl on 22 Nov 2026 (`npm run check-links`).

| Project | URL | Result | On the site |
|---|---|---|---|
| Sarah Ollivierre Beauty (client) | https://sarahollivierrebeauty.co.uk/ | 200, correct site | Featured (first) |
| (same, Vercel deployment) | https://sarahollivierrebeauty.vercel.app/ | 200, identical content | Kept in data as `altUrls` only |
| Bel's Beauty Studio | https://bel-s-beauty-studio.vercel.app/ | 200 | Featured |
| Nails & Beauty by Nikki | https://nails-and-beauty-by-nikki.vercel.app/ | 200 | Featured |
| Kimberly Nails | https://kimberlynails.vercel.app/en | 200 (also `/es`) | Featured |
| The Beauty Surgery | https://thebeautysurgery.vercel.app/ | 200 | Featured |
| Perfection Beauty & Body | https://pbb-nu.vercel.app/ | 200 | Featured |
| Beauty by Jayde | https://beautybyjayde.vercel.app/ | 200 | More to explore |
| Lisvel Silvestre | https://lisvelsilvestre.vercel.app/ | 200 | More to explore |
| Vela Studio (photography) | https://photographers-seven.vercel.app/ | 200 | More to explore |
| Ironhaus (gym) | https://gym-livid-rho.vercel.app/ | 200 | More to explore |
| **Kapiti Barbers** | https://kapitibarbers.vercel.app/ | **404 NOT_FOUND** (also `/en`, `kapiti-barbers`, `kapitibarber`) | **Hidden**, kept in data |
| Instagram | https://www.instagram.com/the.lumen.desk/ | 200; Chrome page title "(@the.lumen.desk) • Instagram photos and videos" | Hero, close, footer |
| Studio domain | https://thelumendesk.com/ | 200, Hostinger "parked domain" page | Not deployed yet |

Every external link on the page opens in a new tab with `rel="noopener noreferrer"`,
and every project link on the page matches `src/data/projects.ts` exactly (automated check).

Brief items marked [VERIFY] that are now resolved: the Sarah custom domain is live;
Lisvel Silvestre's category is "Bronx hair stylist and nail technician" (from the live
site); the Instagram profile resolves.

## Screenshots

Real captures of the 10 reachable projects, made with Playwright in Chrome
(`npm run capture`): desktop 1440×900 and phone 390×844, both at 2× pixel density,
after fonts and images settled. A second desktop capture one screen down is used
where it lands on a clean section (6 projects). Screenshots are resized and encoded
only, never edited. Kapiti Barbers has none (404).

Art direction after reviewing the captures: Beauty by Jayde moved from featured to
"More to explore" because its desktop hero shows placeholder image panels;
Perfection Beauty & Body took its featured slot.

## Visual walk (`scripts/verify-site.mjs`)

Each profile scrolled top to bottom in 0.7-viewport steps, every frame saved and
reviewed on a contact sheet.

| Profile | Frames | Horizontal overflow | Tap targets < 44px | All projects lit | Engine mounted |
|---|---|---|---|---|---|
| Desktop 1440×900 | 20 | No | n/a | Yes | Yes |
| Phone 390×844 | 25 | No | 0 | Yes | Yes |
| Compact phone 360×640 | 33 | No | 0 | Yes | Yes |
| Desktop, reduced motion | 20 | No | n/a | Yes | Yes |
| Phone, reduced motion | 25 | No | 0 | Yes | Yes |

Issues found by looking at the frames and fixed: wordmark colliding with the CTA at
390px; the About logo rendered stretched (width overridden, height not); the
"Email me" button invisible on the lit screen; the closing cone mispositioned;
header showing content through a translucent background; the light cones reading
as brown shapes; the peak (client site) smaller than later projects.

## Scrollcraft harness (`shoot.mjs`)

Run at desktop, 390×844 and reduced motion: **no dead scroll detected**, 0 console
errors, 0 failed requests. The page has no pinned acts or scrub clips, so the
harness's clip and cue checks have nothing to grade. Its ffmpeg contact sheet was
skipped (ffmpeg is not installed here); sheets were built with sharp instead.

`doctor.mjs`: Node, Chrome and workspace OK. **ffmpeg missing** (only needed to
encode scrub video; this build has none). `KIE_AI_API_KEY` not set (no generated
assets; nothing was purchased).

## Interactions (`scripts/verify-interactions.mjs`): 20/20 (re-run 24 Nov with Lenis)

Keyboard: first 14 tab stops visible, in order, with a focus outline; content inside
fade-in groups is forced visible when focused. "Explore the websites", the skip link
and the project index all land their target exactly 12px below the sticky header,
update the URL hash and move keyboard focus to the target. Mobile menu opens, reports
`aria-expanded`, closes on Escape and after choosing a link, and the link reaches its
section. FAQ items open and close. Instagram and email links present. With no form
configured, `POST /api/enquiry` answers `503 not_configured` and no form is shown.

Smooth scrolling (Lenis 1.3.27): an 800px wheel turn glides through 14 distinct
positions and ends exactly 800px down. Scrolling the whole page by mouse wheel reaches
the bottom with every project lit (11/11), every fade-in revealed (22/22) and no
console errors. Under reduced motion Lenis is not started and anchors jump natively.
Touch scrolling is left native by design; it was not exercised on a real phone.

Fixed along the way: project-index jumps previously landed ~70px low because the
pieces carried a scroll margin on top of the page's scroll padding.

## Enquiry form (`scripts/verify-form.mjs`): 13/13

Run on a separate build with placeholder settings so the form renders. Covered:
form renders, posts (never GET), "Want something similar?" prefills the message,
empty submit shows four field errors and focuses the first, malformed email caught,
honeypot rejected server-side, the UI does not claim success on a failed send,
server-side field validation (422), instant bot submissions rejected, no-JavaScript
post gets a readable page with nothing in the URL, and no request left the machine.
The site was rebuilt without those settings afterwards.

**Not tested:** a real successful delivery through Resend (needs a real API key and
verified domain).

## Accessibility and contrast

WCAG contrast measured for every text/background pair used: lowest body text is
6.1:1 (secondary text on the light grey band); headings and buttons 7.6:1 to 14.4:1;
focus rings 8.4:1 (amber on navy) and 14.4:1 (navy on paper). Semantic landmarks,
one `h1`, descriptive alt text on every screenshot, a skip link, `aria-expanded`
on the menu, native `<details>` for the FAQ, `prefers-reduced-motion` honoured
(static lit logo, no parallax, every project lit, fade-ins become simple opacity).

## Performance

Phone profile, 390px at 3× density, Slow-4G-like network (150 ms RTT, 1.6 Mbps):
**first paint and largest paint 1.3 to 1.4 s**, 19 requests and ~520 KB by the load
event, ~143 KB of JavaScript (React and Next.js runtime plus page code).

Adding 4× CPU throttling gave first paint between 2.7 and 4.5 s, but the same
configuration varied from 2.3 to 7.5 s between runs on this machine, so treat those
numbers as indicative only. Fonts were cut from about 290 KB to 96 KB preloaded after
measuring. Run PageSpeed Insights against the deployed URL for a reliable figure.

## Brand assets

Originals in `brand/` are untouched. The animated GIF is the export the founder
confirmed on 24 Nov (512px, 40 frames, md5 `f4d61f34…`); it replaced an earlier,
near-identical export that had a faint 1px outline on its canvas edge, so the
display-time crop for that outline was removed. The still PNG has no outline.

The GIF is used in two places: frames 0 to 22 as the hero animation (plays once,
holds lit; reduced motion shows frame 22 as a still) and frame 0 (lamp off, laptop
closed) as a still on the 404 page. The derived animation keeps the original frame
timings (500 ms hold … 1.35 s lit frame) and loop count 1. Headless Chrome confirmed
it stops on the lit frame and holds without looping (8 s sampled). Its real-time
pacing in Safari and the Instagram app was not observed.

404 page (24 Nov): returns HTTP 404 with `noindex`, 0 console errors at desktop and
390px, and "See the work" leads to `/#work`.

## Not verified (needs a real device, an account or a decision)

- A real iPhone or Android phone, and the **Instagram in-app browser** itself. All
  mobile checks were headless Chrome emulation.
- Safari and Firefox rendering (Chrome only).
- Deployment and DNS for thelumendesk.com (nothing was deployed or changed).
- Real email delivery from the enquiry form.
- Whether the Instagram "Message" flow works for a logged-in visitor (the profile
  page itself resolves).
- Permission to show each project publicly (see the launch checklist).
