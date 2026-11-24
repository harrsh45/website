# Launch checklist

Everything the site needs from you before (and soon after) it goes public. Nothing
here was guessed or filled in on your behalf.

## Must do before publishing

- [ ] **Permission to show each project.** Every project is currently
  `rightsCleared: false` in `src/data/projects.ts`. The previews show real
  businesses' names, logos, photos and prices. Labelling them as independent
  concepts is honest, but it doesn't grant permission to publish their branding.
  For each one, either get a "yes, you can show it" (a DM reply is fine; keep it),
  swap to an anonymised version, or set `group: "hidden"`.

  | Project | Business shown | Ask |
  |---|---|---|
  | Sarah Ollivierre Beauty | Your UK client | OK to feature as completed client work, with name and screenshots? |
  | Bel's Beauty Studio | Real studio, Birmingham | OK to show the preview you made? |
  | Nails & Beauty by Nikki | Real nail artist, Houston | same |
  | Kimberly Nails | Real nail tech, Chicago | same |
  | The Beauty Surgery | Real salon, Lancashire | same |
  | Perfection Beauty & Body | Real lash studio, Christchurch | same |
  | Beauty by Jayde | Real therapist, Dunedin | same |
  | Lisvel Silvestre | Real stylist, the Bronx | same |
  | Vela Studio | Unclear if a real business | Confirm it is fictional, or ask |
  | Ironhaus | Unclear if a real business | Confirm it is fictional, or ask |

  When you have them, set `rightsCleared: true` per project and, if you want the
  site to enforce it, set `NEXT_PUBLIC_REQUIRE_RIGHTS_CLEARANCE=true`.
- [ ] **Deploy and connect the domain.** `thelumendesk.com` is currently a Hostinger
  parked page. Follow "Deploying" in the README, and keep the email (MX) records as they are.
- [ ] **Re-run `npm run check-links`** on deploy day, and open a couple of previews
  from the live site on your own phone.
- [ ] **Open the site from your Instagram bio on a real phone** (iPhone and Android if
  you can): check the hero, tap "Explore the websites", open a preview and come
  back, and tap "Message on Instagram". This in-app browser path was only emulated.

## Recommended

- [ ] **Kapiti Barbers:** the supplied URL returns 404. Redeploy it or send the right
  URL, run `npm run capture -- kapiti-barbers`, then set `available: true` and
  `group: "more"`.
- [ ] **Run PageSpeed Insights** on https://thelumendesk.com once it's live
  (mobile). Local tests: first paint ~1.3 s on a slow-4G connection; CPU-throttled
  numbers were too noisy to rely on.
- [ ] **Enquiry form:** decide whether you want it. Instagram and email already
  work. If yes, set up Resend (README) and send yourself a real test enquiry.
- [x] **Brand GIF:** confirmed on 24 Nov. The file you sent is now
  `brand/the-lumen-desk-animated.gif` (hero animation, and the 404 page's lamp-off frame).

## Optional additions (only if real)

- [ ] **A founder photo.** The About section is type-led because none was supplied.
  Drop a real photo in and it can replace the logo tile there.
- [ ] **A short quote from Sarah**, with her permission. Never use reviews from the
  preview businesses' own sites.
- [ ] **Direct DM link.** `https://ig.me/m/the.lumen.desk` opens a message thread
  directly in many cases. If you test it and like it, swap it into the "Message on
  Instagram" buttons via `src/data/site.ts`.
- [ ] **Analytics.** Off by default. If you add one, prefer a cookie-free provider
  and add a short privacy note (see README "Analytics").
- [ ] **Privacy page.** Only needed once a form or analytics is switched on. Write it
  yourself so it matches what you actually do.
- [ ] **Automation services.** Mentioned in one quiet line at the close. Expand only
  when you want to sell them.

## Missing assets and information (none of these were invented)

| Item | Status |
|---|---|
| Permission per project to publish screenshots and names | Missing |
| Client's OK to be shown as completed work | Missing |
| Working URL for Kapiti Barbers | Missing (404) |
| Founder portrait | Not supplied (optional) |
| Permissioned client testimonial | Not supplied (optional) |
| Resend account, API key and verified sending domain | Not set up (optional) |
| Analytics choice | Not decided (optional) |
| Hosting account and DNS change | Not done |
