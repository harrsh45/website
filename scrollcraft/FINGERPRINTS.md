# Fingerprints

Every site you build with **scroll-craft** gets one row here, appended after it
ships. The registry exists so your next build can prove it is a different page
rather than a re-skin of one you already made.

This file is **yours**. It starts empty on purpose: the gate is about not
repeating *yourself*, so it has nothing to say until you have built something.

The rules and the gate live in the skill's
`references/uniqueness.md`. Short version:

**A new build must differ from EVERY row below on at least 4 of the 6
dimensions.** Four against each row individually, not four on average across the
table. If a planned build fails, change the plan. Never edit a row to make room
for it.

The six dimensions are: **grammar**, **nav treatment**, **hero device**,
**act-sequence shape**, **close pattern**, **signature move**.

Dimension 6 is free, because a signature move is unique by definition. So the
gate really asks for three more out of the remaining five, and a build that
changes only grammar and world will fail it.

---

## The registry

| Build | Grammar | Nav treatment | Hero device | Act-sequence shape | Close pattern | Signature move | World | Port |
|---|---|---|---|---|---|---|---|---|
| thelumendesk (2026-11-22) | Lit showroom (new; Gallery-adjacent, proof-first, no pinning) | Opaque paper bar: studio mark + 4 anchors + one CTA "Start a project"; plus a jump index of every project at the top of the collection | Natural-flow split hero: claim left; three real phone screenshots fanned on the edge of the dark section below, 3-plane `parallax` + glow plane; supplied logo animation plays once and the phones switch on in sync | 7 acts, all flow (no pin/scrub/pan): hero, collection (6 featured + 4 compact), services, process (`reveal` rule), founder, FAQ (`<details>`), close. ~14 vh desktop, content-driven | The last object of the collection: an empty browser screen at "yourbusiness.com", lit by the same lamp with an `iris` reveal, holding DM + email; labelled with the project label schema ("Next on the desk") | The lamp switches on over each project: scroll-driven, ratcheted `--lit` raises a logo-geometry light cone, lifts a veil and spills a pool of light; never dims again | Flat brand graphic + real website screenshots; navy desk at night, paper by day | Next.js (4600 locally) |

*(first build in this workspace: nothing to clear.)*

---

## What is taken

Add a bullet here whenever a build claims something a later build should avoid
reusing: a grammar, a nav treatment, a close pattern, a signature move, an
act-count-and-length band. The shared columns are what the next build inherits
as a constraint, so writing them down is the whole point.

- **Lit showroom** grammar (portfolio of live sites, no pinned acts, jump index, ask typeset as the last object).
- **Ratcheted lamp-on per object** (scroll-driven light cone + veil + pool) as a signature move.
- **"Your site, next" close**: an empty lit screen with the visitor's placeholder domain holding the CTAs.
- **Hero of fanned real phone screenshots standing on the edge of the next section's ground.**

---

## Appending a row

After shipping, add one line to the table and one bullet to **What is taken** if
the build claimed something new. Fill every column. Say what the build shares
with existing rows.

Rows are append-only. A build that has been superseded stays in the table,
because the space it occupies is still occupied.

---

## Worked example

The skill's author kept a registry of twelve builds across eight page grammars.
If you want to see what a filled-in table looks like, and which shapes tend to
collide, read `EXAMPLES.md` in the scroll-craft repository. Treat it as
illustration only: those rows are somebody else's builds and they do **not**
constrain yours.
