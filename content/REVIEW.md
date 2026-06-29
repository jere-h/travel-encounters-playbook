# Travel Encounters Playbook — Native-Speaker Content Review Gate

This file is the **load-bearing correctness gate** for Travel Encounters Playbook.

The dev-only validator (`validate-content.mjs`) and the deploy workflow can only
prove that every step has the required fields *present and non-empty*. They
**cannot** tell whether the local language is correct, the romanization is right,
or a phrase is polite, natural, or appropriate for the situation. A field can be
fully populated and still be **wrong or offensive**. This applies to **every
city** — Tokyo (Japanese) and Seoul (Korean) — each reviewed by a native speaker
of that city's language.

That last mile is a human's job. **A current sign-off in the table below is a
required item on the README release checklist.** Do not deploy a situation whose
row is not signed off against the content currently in `content.js`.

---

## What a reviewer checks

For each situation, a fluent / native speaker of that city's language reviews
every `Step` in `content.js` against these criteria:

1. **Romanization** — `staffPhraseRomanized` is an accurate, readable
   transcription of `staffPhraseNative` (Hepburn for Japanese, Revised
   Romanization for Korean). Long vowels, particles, and spacing are consistent.
   A first-time traveler reading it aloud is understood.
2. **Native-script accuracy** — `staffPhraseNative` is correct, natural language
   as it would actually be heard in that venue (script, spacing, politeness
   level). No machine-translation artifacts.
3. **Visitor response fit** — `visitorResponse` is polite, natural, and
   genuinely usable by a non-speaker. It is not rude, not over-formal to the
   point of being odd, and actually answers what the staff said.
4. **Cultural accuracy / non-offensiveness** — `whatHappens`, the situation
   `summary`, the `expect` "what to expect" lines, each step `title`, and any
   `tip` describe the real interaction without stereotype, condescension, or
   error. Nothing in the situation could embarrass or offend the traveler or the
   staff. The per-step `yourTurn` flag (does the visitor actually have to act
   here?) is accurate.
5. **Scope honesty** — content stays within the shipped scope ("Tokyo · 3
   situations" and "Seoul · 3 situations") and the disclaimer (informal, may be
   imperfect, not official) holds true.

A situation **passes** only when all five hold for **every** step in it.

---

## How to record a review

1. Review the situation's steps in `content.js` as they currently stand.
2. Add a **new row** to that situation's table below (do not overwrite history —
   append, so the sign-off trail is auditable).
3. Fill in: reviewer name, today's date (`YYYY-MM-DD`), the short content
   revision you reviewed (a commit short-hash or a one-line tag), the verdict,
   and notes.
4. **Verdict** is one of:
   - `PASS` — ship as-is.
   - `PASS w/ fixes` — only after the listed fixes are applied to `content.js`
     **and** re-validated; note the fixing commit.
   - `FAIL` — do **not** deploy this situation; the notes say why.
5. A sign-off is **current** for release only if it covers the content revision
   being deployed. If `content.js` changed for a situation after its last `PASS`,
   that situation must be re-reviewed before the next deploy.

> Each situation is independent. A `FAIL` on one situation blocks **that
> situation**, but a release may proceed with the situations that currently pass,
> provided every shipped situation has a current `PASS` (or `PASS w/ fixes`).

---

## Sign-off tables

Each city's `rescuePhrases` are shown on every screen (the Phrases drawer) and
are **situation-independent**, so they get their own per-city sign-off row,
reviewed to the same romanization + native-script bar as the situation steps.

## Tokyo (Japanese) — `cities.tokyo`

### Convenience Store (`convenience_store`)

| Reviewer | Date | Content rev reviewed | Romanization | Cultural accuracy | Verdict | Notes |
|----------|------|----------------------|--------------|-------------------|---------|-------|
| _pending_ | _YYYY-MM-DD_ | _commit / tag_ | _ok / issues_ | _ok / issues_ | _PASS / PASS w/ fixes / FAIL_ | _Authored content has NOT yet been reviewed by a native speaker. Do not deploy this situation until this row is replaced with a real sign-off._ |

### Izakaya (`izakaya`)

| Reviewer | Date | Content rev reviewed | Romanization | Cultural accuracy | Verdict | Notes |
|----------|------|----------------------|--------------|-------------------|---------|-------|
| _pending_ | _YYYY-MM-DD_ | _commit / tag_ | _ok / issues_ | _ok / issues_ | _PASS / PASS w/ fixes / FAIL_ | _Authored content has NOT yet been reviewed by a native speaker. Do not deploy this situation until this row is replaced with a real sign-off._ |

### Ramen Ticket Machine (`ramen_ticket_machine`)

| Reviewer | Date | Content rev reviewed | Romanization | Cultural accuracy | Verdict | Notes |
|----------|------|----------------------|--------------|-------------------|---------|-------|
| _pending_ | _YYYY-MM-DD_ | _commit / tag_ | _ok / issues_ | _ok / issues_ | _PASS / PASS w/ fixes / FAIL_ | _Authored content has NOT yet been reviewed by a native speaker. Do not deploy this situation until this row is replaced with a real sign-off._ |

### Tokyo rescue phrases (`cities.tokyo.rescuePhrases`)

| Reviewer | Date | Content rev reviewed | Romanization | Cultural accuracy | Verdict | Notes |
|----------|------|----------------------|--------------|-------------------|---------|-------|
| _pending_ | _YYYY-MM-DD_ | _commit / tag_ | _ok / issues_ | _ok / issues_ | _PASS / PASS w/ fixes / FAIL_ | _Japanese rescue phrases have NOT yet been reviewed by a native speaker._ |

## Seoul (Korean) — `cities.seoul`

### Convenience Store (`convenience_store` / 편의점)

| Reviewer | Date | Content rev reviewed | Romanization | Cultural accuracy | Verdict | Notes |
|----------|------|----------------------|--------------|-------------------|---------|-------|
| _pending_ | _YYYY-MM-DD_ | _commit / tag_ | _ok / issues_ | _ok / issues_ | _PASS / PASS w/ fixes / FAIL_ | _Newly authored Korean content — NOT yet reviewed by a native speaker. Do not deploy this situation until this row is replaced with a real sign-off._ |

### Korean BBQ (`korean_bbq` / 고깃집)

| Reviewer | Date | Content rev reviewed | Romanization | Cultural accuracy | Verdict | Notes |
|----------|------|----------------------|--------------|-------------------|---------|-------|
| _pending_ | _YYYY-MM-DD_ | _commit / tag_ | _ok / issues_ | _ok / issues_ | _PASS / PASS w/ fixes / FAIL_ | _Newly authored Korean content — NOT yet reviewed by a native speaker. Do not deploy this situation until this row is replaced with a real sign-off._ |

### Self-Order Kiosk (`kiosk` / 키오스크)

| Reviewer | Date | Content rev reviewed | Romanization | Cultural accuracy | Verdict | Notes |
|----------|------|----------------------|--------------|-------------------|---------|-------|
| _pending_ | _YYYY-MM-DD_ | _commit / tag_ | _ok / issues_ | _ok / issues_ | _PASS / PASS w/ fixes / FAIL_ | _Newly authored Korean content — NOT yet reviewed by a native speaker. Do not deploy this situation until this row is replaced with a real sign-off._ |

### Seoul rescue phrases (`cities.seoul.rescuePhrases`)

| Reviewer | Date | Content rev reviewed | Romanization | Cultural accuracy | Verdict | Notes |
|----------|------|----------------------|--------------|-------------------|---------|-------|
| _pending_ | _YYYY-MM-DD_ | _commit / tag_ | _ok / issues_ | _ok / issues_ | _PASS / PASS w/ fixes / FAIL_ | _Korean rescue phrases have NOT yet been reviewed by a native speaker._ |

---

## Release gate (summary)

A deploy is allowed only when **all** of the following hold:

- [ ] `node validate-content.mjs` exits `0` (field presence — automated).
- [ ] Every situation being shipped (in **every** city) has a **current** `PASS`
      (or `PASS w/ fixes`, with the fixes applied and re-validated) row above,
      covering the exact content revision being deployed. All Tokyo and Seoul
      situation rows are currently **pending/stale** and must be reviewed before
      they ship as reviewed content.
- [ ] Each shipped city's **rescue phrases** row has a current `PASS` (the rescue
      phrases contain language the situation sign-offs do not cover).
- [ ] No shipped situation has an open `FAIL`.

If a situation's `content.js` changed since its last `PASS`, its sign-off is
**stale** — re-review before deploy. When in doubt, re-review: this gate is the
only defense against wrong or offensive content reaching a traveler, and the
validator deliberately does not cover it.
