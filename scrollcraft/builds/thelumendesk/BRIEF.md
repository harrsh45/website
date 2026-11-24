# The Lumen Desk: Scrollcraft brief

**Self-authored under explicit creative delegation.** The founder's build brief
(THE LUMEN DESK Final Brand & Instagram-to-Portfolio Website Brief, 22 Nov 2026)
is the source of truth for audience, copy, links and honesty rules, and says "other
design decisions are delegated to the building agent". Where it gives an answer it is
quoted; everything else is an authored decision and is labelled as one.

Evidence vs assumption: project URLs, statuses, the email, the Instagram handle and
the two brand files are founder-supplied facts. Screenshot content was captured from
the live URLs on 2026-11-22. Nothing about clients, results or reviews is assumed.

---

## The eight topics

1. **Vibe.** Brief: "Distinctive, clean, modern, warm-but-professional, precise,
   editorial, design-forward." References (authored): a desk lamp switched on in a
   dark room at night; a gallery wall where each piece gets its own pool of light; a
   printed type specimen's restraint.
2. **The scroll journey, in the brief's words.** "Instagram bio / DM → site hero →
   visible project gallery → preview link → contact." Editorial priority: "Show the
   work > Explain what clients receive > Establish who is behind the studio > Answer
   objections > Invite contact."
3. **Energy curve (authored).** Calm and quick at the top (the visitor must
   understand in 3 to 5 seconds), the most energy in the gallery, quiet and close
   for the founder and FAQ, one warm lift at the close.
4. **Feeling, stage by stage, and the one moment.** Brief: the visitor should end
   thinking "These websites look excellent, they're real and interactive, and this
   is someone I can trust to build one for my business." The one moment: see Peak.
5. **One thing no other site does.** Brief's seed: "The Lumen reveal": the lamp's
   warm light reveals a real browser preview, and that illuminated surface becomes
   the bridge into the Work showcase. Developed into the signature move below.
6. **Distance from premium-minimal.** Editorial, warm-but-professional. Not dark
   luxury, not neon, not SaaS. The brand's own three colours: ink navy, off-white,
   lamp amber.
7. **One unbroken world or distinct scenes?** Distinct scenes. The brief forbids
   long pinned heroes and long animations before the work. No worldflight.
8. **Assets.** Supplied: `brand/the-lumen-desk-logo.png` (1254px still) and
   `brand/the-lumen-desk-animated.gif` (512px, 40 frames: laptop opens, lamp light
   switches on, holds, switches off). Real screenshots of 10 live project URLs
   captured with Playwright. No founder photo. No generation, no spend.

## Journey (beats)

```
1  Recognition   "This is a real studio, and that is a real website."
2  Proof         Big, real, clickable websites, one after another
3  Range         More previews, other industries
4  Substance     What a client actually gets
5  Ease          Four plain steps from idea to launch
6  Trust         The one person behind it
7  Relief        The objections, answered briefly
8  Commitment    DM or email, no forms required
```

## Page grammar: Lit showroom (new, defined here)

Closest to Gallery / catalog (§2.6), which wins over the other seven because the
visitor's real question is "can I see it working?", not "should I believe you?".
Filmic, chaptered editorial, typographic poster and rhythmic cutlist all spend the
visitor's first screens on the studio instead of the work. Live surface needs a
product to operate. Continuous world needs a geography. Split stage needs two sides.

It is a new grammar, not a relabel, because the founder's brief requires a single
hero claim and contact chrome that Gallery forbids, and adds bans Gallery does not:

- **Fits:** a portfolio of live, clickable websites shown to a sceptical visitor who
  arrived from a DM and gives the page five seconds.
- **The scroll feels like:** walking along a desk at night with one lamp. Each piece
  of work is dim until you reach it, then the light comes on over it, and stays on.
- **Nav:** compact bar (studio mark, four anchors, one CTA "Start a project"), plus
  an index of the objects at the top of the collection that jumps to each one.
- **Hero:** one short claim, and real work already in view and lit (three real
  phone screenshots standing on the edge of the dark "desk" the gallery is set on).
  The brand lamp switches on once.
- **Sequence:** claim, collection (same label schema on every object, varied scale),
  compact substance, the person, objections, close.
- **Close:** the last object in the collection is the visitor's own website: an empty
  screen, lit like the others, labelled with the same schema, holding the two
  contact actions. The ask reads as part of the collection.
- **Bans:** any pinned act (`pin`, `scrub`, `pan`: nothing may hold the visitor
  before the work); `kinetic` headlines; `count` (no verified figures exist);
  `spotlight`, `magnet`, `drift`; scroll cues; text or scrims over screenshots;
  persuasion inside project labels; carousels that hide items; any screenshot that
  dims again after it has been lit.

## Signature move: the lamp switches on over the work

Bespoke, page-local (`src/components/LampLight.tsx`), not an engine device. Each
project sits on the dark navy desk under a veil. As it rises into the reading zone,
a cone of lamp-amber light (the same trapezoid geometry as the logo's cone) fades in
above it, the veil lifts, and a warm pool spills onto the desk below. Progress is
scroll-driven and ratcheted: light only ever comes on, never goes off. The hero's
phones switch on in time with the supplied animation's own light-on (frames 14 to 22).
Reduced motion, no JavaScript or a slow script: everything is simply lit.

**Tell-someone sentence:** "It's the site where a little desk lamp switches on, and
then each website lights up as you scroll to it, and at the end there's an empty lit
screen waiting for your business."

## Feeling curve (written before the score)

```
1  Recognition    Hero: the lamp switches on and three real phone sites light up beside the claim
2  Anticipation   The ground goes dark: a short navy band holding only the heading and the index
3  Delight        PEAK. The first real website switches on under the lamp, at full scale
4  Curiosity      Each next site switches on in a different style and position
5  Breadth        Smaller pieces, other industries, a faster rhythm
6  Confidence     Back on paper: four plain promises, type on space, no cards
7  Ease           Four steps on a single line
8  Intimacy       Small type, first person, the studio mark, no pitch
9  Relief         Six short answers, opened one at a time
10 Resolve        An empty screen lights up with your business in the address bar, DM or email
```

No two adjacent rows share a feeling. Acts 6 to 9 are administrative and are
compressed as flow sections at short stagger.

## The peak

> "The page went dark like the room lights went off, then a lamp clicked on over a
> real website, then over the next one."

Lives in act 3 (Sarah Ollivierre Beauty, the one completed client site, at the
largest scale on the page). It gets the best asset (real paid client work, desktop
and phone captures), the authored silence before it (act 2: a navy band with only
the heading, legend and index, about half a viewport), and the most room (the
featured collection is the longest stretch of the page).

**Authored silence:** the dark band at the top of #work is intentional, not dead
scroll. It is short (about 0.5 viewport-heights) and always holds the section heading.

## Score

| Act | Beat | Device | Why this one |
|---|---|---|---|
| 1 Hero | Recognition | `flow` + `parallax` (three phone planes and a glow plane) + play-once brand animation | Depth without pinning: real screenshots at different rates, no wait before the work |
| 2 Work intro | Anticipation | `flow` + `in` | The quiet before the peak: just words and an index |
| 3 to 4 Featured | Proof | bespoke lamp-on + `in` on labels | The signature move: the work is lit by the hand that scrolls |
| 5 More to explore | Range | lamp-on (small) in a two-up grid | Same light, faster rhythm, smaller objects |
| 6 What you get | Substance | `flow` + `in` stagger | Administrative: compressed |
| 7 Process | Ease | `reveal` (left wipe on the rule joining the steps) | A line drawing across is the change of state from idea to launch |
| 8 Founder | Trust | `flow` + `in` | Quiet on purpose |
| 9 FAQ | Relief | native `<details>` | Information, not experience |
| 10 Close | Resolve | lamp-on + `reveal` (iris on the lit screen) | Ends on the signature, resolved and held |

Device families: flow/in, parallax, reveal, bespoke lamp-on (4). No family twice in
a row as the defining device. No scrub, so the two-scrub cap is moot. Total length
is content-driven (about 9 to 11 viewport-heights on desktop) and nothing is padded.

## Fingerprint gate

Registry (`scrollcraft/FINGERPRINTS.md`) was empty: first build in this workspace,
nothing to clear. Row appended after verification.

---

## Feel check (feel.md §6), after the first full build

Felt, one word per act from the contact sheets, before re-reading this file:

```
1 Hero          recognition  (lamp, claim, three real sites: works)
2 Work intro    calm         (the index makes it a little busy, still quiet)
3 Sarah         confidence   <- intended "delight"; NOT the biggest thing on the page
4 Next pieces   curiosity
5 More          breadth
6 Services      confidence
7 Process       ease
8 Founder       (nothing strong) quiet
9 FAQ           relief
10 Close        resolve      (the lit "yourbusiness.com" screen lands)
```

Diff and what changed:

- **The peak was not the largest visual change.** The later "wide" pieces (Nikki,
  Perfection) were bigger than Sarah's. Fixed: Sarah now uses a full-width
  `feature` layout, the largest stage on the page, first to switch on.
- **The light read as a brown shape, not light.** Low-alpha amber over navy goes
  muddy. Four cone treatments were compared on the real page; the warm-gold
  gradient (transparent at the lamp end, strongest where it lands) reads as
  lamplight and replaced the original.
- **Peak is "confidence" more than "delight".** Accepted, not padded: the founder
  brief forbids delaying the work, so the silence before the peak stays short and
  the switch-on stays tied to the hand rather than becoming a pinned spectacle.
- Founder act stays quiet by design; no portrait exists and none was invented.

## Verification summary (final build)

See `docs/VERIFICATION.md` in the project for the full report. In short: five
viewport profiles walked frame by frame (desktop 1440, phone 390, compact 360x640,
reduced-motion desktop and phone) with 0 console errors, 0 failed requests, no
horizontal overflow, no tap targets under 44px, every project lit, engine mounted.
The Scrollcraft harness (`shoot.mjs`) reports no dead scroll at desktop, 390 and
reduced motion (contact sheets built with sharp: no ffmpeg on this machine).
15/15 interaction checks and 13/13 enquiry-form checks pass.
