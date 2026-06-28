# Tokyo Doorway — In-the-Moment Social Scripts

A fully static, offline-capable PWA that gives a frozen, first-time traveler in
Tokyo a large-text, **one-step-per-screen** social script for three concrete
venues:

- **Convenience Store** (konbini checkout)
- **Izakaya** (being seated + ordering)
- **Ramen Ticket Machine** (buying a meal ticket before you sit)

Pick a situation, then step through what staff will say (English + romaji +
kanji), exactly what *you* say back, and an optional per-step Cultural Tips
drawer — all reachable in **at most three taps**.

There is **no bundler and no backend**. Plain HTML, one stylesheet, and two ES
modules (`content.js` holds the data, `app.js` holds the logic) render a
view-switch over a flat content bundle. A relative-pathed manifest + service
worker precache the shell and content so the whole thing works in **airplane
mode** under the GitHub Pages `/<repo>/` base.

---

## Scope (deliberate, and on purpose)

This app intentionally ships **Tokyo · 3 situations** and nothing more. The
picker prints that scope line (`#scope-line`: "Tokyo · 3 situations · more
coming") so the user is never misled about coverage. Three fully authored,
native-reviewed scripts that actually work in the moment beat fifty thin,
unreviewed ones. Adding a situation is a deliberate, reviewed act (see the
release checklist), not a drive-by edit.

### Disclaimer (persistent, on every screen)

A `.disclaimer` line is present on **both** the picker and the step view. It
states plainly that the phrasing is **informal, may be imperfect, and is not
official guidance**. Real interactions vary; the script is a confidence aid, not
a guarantee. This line ships on purpose and must not be removed — it is part of
the honesty contract of the product.

---

## How to run

There is **no build step**. The repo *is* the app.

### Option A — open the file (quickest sanity check)

Open `index.html` directly in a browser. The UI is populated on first paint (the
content is bundled inline as an ES module — no fetch), so you'll see the picker
immediately.

> Caveat: opening via `file://` will **not** register the service worker (browsers
> block SW on `file://`) and ES-module imports can be blocked by some browsers
> under `file://`. Use Option B to exercise offline/PWA behavior.

### Option B — serve statically (recommended for real testing)

Any static file server over the app directory works. From the app root:

```sh
# Python 3 (no dependencies)
python3 -m http.server 8000

# or Node, if you have it
npx --yes serve -l 8000 .
```

Then open <http://localhost:8000/>. Because **every asset path is relative
(`./…`)** — in `index.html`, `manifest.webmanifest`, `sw.js`, and the
`app.js → content.js` import — the app also works unchanged when served from a
sub-path like `https://<owner>.github.io/<repo>/`. Do **not** rewrite any path to
a root-absolute `/…`; that breaks the GitHub Pages base.

### Files

| Path | Role |
|------|------|
| `index.html` | Semantic shell: `#picker` + `#stepview` views, disclaimer, iOS install hint, Tips drawer. Links `./styles.css`, `./manifest.webmanifest`, loads `./app.js` as a module. No inline app logic, no inline SW registration. |
| `styles.css` | Design tokens, large-text hierarchy, mobile-first responsive layout. |
| `content.js` | Authoritative content. `export const situations` + `export const SITUATION_ORDER`. All three situations fully authored. |
| `app.js` | Sole module entry. Renders picker + step view, owns in-memory state, registers `./sw.js`, shows the iOS hint. |
| `manifest.webmanifest` | PWA manifest; relative `start_url`/`scope` (`./`). |
| `sw.js` | Service worker; versioned cache, relative precache list, cache-first. |
| `validate-content.mjs` | Dev-only Node validator (field presence). |
| `.github/workflows/deploy.yml` | Pages deploy; runs the validator, fails the deploy on violation. |
| `content/REVIEW.md` | Native-speaker sign-off gate (load-bearing). |

---

## Content correctness — how it's actually defended

The app cannot itself know whether a Japanese phrase is correct or polite, so
correctness is defended by **two distinct gates**, and we are honest about which
covers what.

### 1. Presence gate — `validate-content.mjs` (automated, dev-only)

A dependency-free Node script (no bundler, no Zod) that imports the same
`situations` export the app uses and asserts the **shape**:

```sh
node validate-content.mjs
```

It checks:

- exactly the three keys `convenience_store`, `izakaya`, `ramen_ticket_machine`;
- every step has **non-empty** `whatHappens`, `staffPhraseRomaji`,
  `staffPhraseKanji`, and `visitorResponse`;
- when a `tip` is present, it is non-empty.

It **exits non-zero** on any missing/empty REQUIRED field — that's the deploy
blocker. The **6–12 step count** is a **soft warning only** (logged, non-fatal):
an accurate 5-step script must not be rejected, and an accurate 13-step one is a
nudge, not a wall.

> This validator checks **presence, not correctness.** A field full of nonsense
> passes. Correctness is the human review's job (below). Do not mistake a green
> validator for "the Japanese is right."

### 2. Correctness gate — `content/REVIEW.md` (human, load-bearing)

`content/REVIEW.md` is a checked-in sign-off table, **one row per situation**,
recording reviewer name, date, and pass/notes for **romanization** and **cultural
accuracy**. This is the real defense against wrong or offensive phrasing — the
thing the validator structurally cannot cover. A release requires a **current**
sign-off here (see checklist).

---

## Deploy process

Deployment is **Actions-only**. The app is published to GitHub Pages with
**Source = "GitHub Actions"** via `.github/workflows/deploy.yml`, which:

1. checks out the repo,
2. runs `node validate-content.mjs` — **the deploy fails here** if any required
   content field is missing/empty, so bad-shaped content can never reach a user
   from the deploy path,
3. uploads the static repo as-is as the Pages artifact, and
4. deploys it.

There is no compilation, no bundling, and no transform — what's in the repo is
what ships.

> **Hand-deploy is out of process.** Pushing files to the Pages branch, or
> uploading a Pages artifact, *outside* this workflow bypasses the validator and
> the review gate. Don't. The only sanctioned path to production is merging to the
> default branch and letting `deploy.yml` run. If you must change the live site,
> change the repo and re-run the workflow.

---

## Release checklist

Do **not** deploy unless **all** of these are true:

- [ ] `node validate-content.mjs` exits **0** locally (and the Actions run is green).
- [ ] `content/REVIEW.md` has a **current** sign-off row for **every** situation
      you are shipping — reviewer name + date + pass for both romanization and
      cultural accuracy. If content for a situation changed since its last
      sign-off, that row is **stale** and must be re-signed before release.
- [ ] The persistent `.disclaimer` line still renders on **both** the picker and
      the step view.
- [ ] The `#scope-line` still honestly reflects coverage ("Tokyo · 3 situations").
- [ ] The **offline acceptance steps below pass on a real iOS Safari device**
      against the actual Pages URL — not just localhost, not just desktop.
- [ ] No uncaught errors in the browser console on the picker and across a full
      step-through of each situation.

---

## Acceptance: offline / airplane-mode (the core promise)

The whole point is that a frozen traveler with **no signal** can still pull up
their script. The service worker precaches the shell **and** all content on the
first online load, so after that, **zero network requests should fail**.

### Desktop smoke test (fast, not sufficient on its own)

1. Serve statically (Option B) and load the app once, online.
2. In DevTools → Application → Service Workers, confirm `sw.js` is **activated**
   and the versioned cache contains `./`, `./index.html`, `./styles.css`,
   `./app.js`, `./content.js`, `./manifest.webmanifest`, and the manifest icons.
3. Switch DevTools → Network to **Offline**.
4. Hard-reload. The picker must render, all three situations must open, and you
   must be able to step through every step (incl. kanji/romaji and the Tips
   drawer) with **no failed requests** in the Network panel.

### REAL iOS-Safari airplane-mode cold reload (required for release)

This is the acceptance that actually counts, because the target user is on an
iPhone with their data turned off. Run it against the **deployed Pages URL**
(`https://<owner>.github.io/<repo>/`), on a **physical iPhone**, in **Safari**:

1. **Online, in Safari**, open the live Pages URL. Let it fully load (this is the
   one chance the service worker has to precache the shell + content).
2. Tap **Share → Add to Home Screen**. (The app shows `#ios-install-hint` to
   prompt exactly this.) Confirm the home-screen icon appears.
3. **Fully close** Safari and any open instance of the app (swipe it away from the
   app switcher) so the next launch is a genuine **cold** start, not a warm tab.
4. Put the phone in **Airplane Mode** — toggle it from Control Center and confirm
   Wi-Fi and Cellular are both **off**. (No Wi-Fi-still-on cheating; the test is
   *no connectivity at all*.)
5. **Cold-launch** the app from the **home-screen icon** (standalone, not the
   Safari tab).
6. **Acceptance — all must hold with the device fully offline:**
   - The app opens in standalone (full-screen, no Safari chrome).
   - The **picker** renders with exactly **three** cards in
     `convenience_store → izakaya → ramen_ticket_machine` order, the scope line,
     and the disclaimer.
   - Opening any situation shows **populated** step content (English, romaji,
     kanji, your response) with **no blank fields and no spinner/offline error**.
   - You can advance with **swipe-left / the Next zone** and go **back** with
     swipe-right / Back; a full-screen tap **does not** advance.
   - The **Tips** drawer opens and closes **without** changing the current step.
   - Stepping through **all three** situations end to end works with **no**
     network and no error screen.

If step 5 shows the browser's offline/dinosaur page or any blank field, the
precache is incomplete — **do not release.** The most common cause is a
root-absolute path (`/…`) that the `/<repo>/` Pages base can't resolve, or an
asset missing from the `sw.js` precache list. Both must stay **relative (`./`)**
and the precache list must match the assets `index.html` references.

> Re-run this iOS test after **every** content change or `sw.js` version bump.
> Because the cache name is versioned, a redeploy busts the old cache — the first
> post-deploy launch must be **online once** before airplane mode will work again.

---

## Interaction model (so reviewers test the right thing)

- **Three taps, max:** tap a situation card (tap 1) → step through (tap Next /
  swipe-left) → optionally open Tips (tap). Nothing essential is deeper.
- **Forward advance is intentional only:** swipe-**left** or the explicit
  `#next-zone`. A **full-screen tap never advances** — so reaching for Tips or
  Back can't skip a step.
- **Back** is swipe-right or `#back-btn`; the step index is clamped to bounds.
- **Tips** open/close `#tips-drawer` without mutating the step index.
- State is **in-memory only** and never persisted — relaunching always starts
  fresh at the picker.

---

## Customizing the content

A user can fork this and swap in their own scripts by editing the `situations`
object in `content.js` — keeping the exact three keys and the Step shape
(`whatHappens`, `staffPhraseRomaji`, `staffPhraseKanji`, `visitorResponse`,
optional `tip`). Then: run `node validate-content.mjs`, get a fresh
`content/REVIEW.md` sign-off, and deploy via the workflow. The same two gates
apply to your content as to ours.
