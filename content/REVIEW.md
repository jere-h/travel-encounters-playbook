# Tokyo Doorway — Native-Speaker Content Review Gate

This file is the **load-bearing correctness gate** for Tokyo Doorway.

The dev-only validator (`validate-content.mjs`) and the deploy workflow can only
prove that every step has the required fields *present and non-empty*. They
**cannot** tell whether the Japanese is correct, the romanization is right, or a
phrase is polite, natural, or appropriate for the situation. A field can be
fully populated and still be **wrong or offensive**.

That last mile is a human's job. **A current sign-off in the table below is a
required item on the README release checklist.** Do not deploy a situation whose
row is not signed off against the content currently in `content.js`.

---

## What a reviewer checks

For each situation, a fluent / native Japanese speaker reviews every `Step`
in `content.js` against these criteria:

1. **Romanization** — `staffPhraseRomaji` is an accurate, readable Hepburn-style
   transcription of `staffPhraseKanji`. Long vowels, `n`/`m`, and particles are
   consistent. A first-time traveler reading the romaji aloud is understood.
2. **Script accuracy** — `staffPhraseKanji` is correct, natural Japanese as it
   would actually be heard in that Tokyo venue (kanji/kana, spacing, politeness
   level). No machine-translation artifacts.
3. **Visitor response fit** — `visitorResponse` is polite, natural, and
   genuinely usable by a non-speaker. It is not rude, not over-formal to the
   point of being odd, and actually answers what the staff said.
4. **Cultural accuracy / non-offensiveness** — `whatHappens` and any `tip`
   describe the real interaction without stereotype, condescension, or error.
   Nothing in the situation could embarrass or offend the traveler or the staff.
5. **Scope honesty** — content stays within the shipped "Tokyo · 3 situations"
   scope and the disclaimer (informal, may be imperfect, not official) holds true.

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

> The three situations are independent. A `FAIL` on one situation blocks **that
> situation**, but a release may proceed with the situations that currently pass,
> provided every shipped situation has a current `PASS` (or `PASS w/ fixes`).

---

## Sign-off tables

### Convenience Store (`convenience_store`)

| Reviewer | Date | Content rev reviewed | Romanization | Cultural accuracy | Verdict | Notes |
|----------|------|----------------------|--------------|-------------------|---------|-------|
| _pending_ | _YYYY-MM-DD_ | _commit / tag_ | _ok / issues_ | _ok / issues_ | _PASS / PASS w/ fixes / FAIL_ | _Initial authored content has NOT yet been reviewed by a native speaker. Do not deploy this situation until this row is replaced with a real sign-off._ |

### Izakaya (`izakaya`)

| Reviewer | Date | Content rev reviewed | Romanization | Cultural accuracy | Verdict | Notes |
|----------|------|----------------------|--------------|-------------------|---------|-------|
| _pending_ | _YYYY-MM-DD_ | _commit / tag_ | _ok / issues_ | _ok / issues_ | _PASS / PASS w/ fixes / FAIL_ | _Initial authored content has NOT yet been reviewed by a native speaker. Do not deploy this situation until this row is replaced with a real sign-off._ |

### Ramen Ticket Machine (`ramen_ticket_machine`)

| Reviewer | Date | Content rev reviewed | Romanization | Cultural accuracy | Verdict | Notes |
|----------|------|----------------------|--------------|-------------------|---------|-------|
| _pending_ | _YYYY-MM-DD_ | _commit / tag_ | _ok / issues_ | _ok / issues_ | _PASS / PASS w/ fixes / FAIL_ | _Initial authored content has NOT yet been reviewed by a native speaker. Do not deploy this situation until this row is replaced with a real sign-off._ |

---

## Release gate (summary)

A deploy is allowed only when **all** of the following hold:

- [ ] `node validate-content.mjs` exits `0` (field presence — automated).
- [ ] Every situation being shipped has a **current** `PASS` (or `PASS w/ fixes`,
      with the fixes applied and re-validated) row above, covering the exact
      content revision being deployed.
- [ ] No shipped situation has an open `FAIL`.

If a situation's `content.js` changed since its last `PASS`, its sign-off is
**stale** — re-review before deploy. When in doubt, re-review: this gate is the
only defense against wrong or offensive content reaching a traveler, and the
validator deliberately does not cover it.
