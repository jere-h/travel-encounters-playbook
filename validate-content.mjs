#!/usr/bin/env node
// validate-content.mjs — DEV-ONLY content validator for Travel Encounters Playbook.
//
// Run with:  node validate-content.mjs
//
// This is NOT shipped to the browser and has NO runtime dependency: it is not
// loaded by index.html, app.js, or sw.js. It exists only to gate the bundled
// content at build/deploy time (see .github/workflows/deploy.yml). It imports
// the SAME `situations` export the app uses, so the data the validator checks is
// byte-for-byte the data the app renders.
//
// SCOPE — what this does and does NOT verify:
//   * It checks the documented SHAPE and FIELD PRESENCE only:
//       - exactly the three situation keys,
//       - each step has non-empty whatHappens / staffPhraseRomaji /
//         staffPhraseKanji / visitorResponse,
//       - `tip`, when present, is a non-empty string.
//   * It does NOT and CANNOT check CORRECTNESS — whether the romanization is
//     right, the kanji is accurate, or the phrasing is polite/appropriate.
//     That is the job of the native-speaker review gate (content/REVIEW.md),
//     which is the load-bearing defense this validator deliberately does not
//     try to replace.
//
// EXIT BEHAVIOUR:
//   * Any missing/empty REQUIRED field (or wrong situation key set) is an ERROR:
//     all errors are collected and printed, then the process exits non-zero so
//     the deploy fails before bad-shaped content can reach a user.
//   * The 6–12 step-count bound is a SOFT WARNING only: it is logged but never
//     fails the run, so an accurate short or long script is not rejected.

import { situations } from './content.js';

// The exact situation keys the app and this validator agree on (data_shapes).
const EXPECTED_KEYS = ['convenience_store', 'izakaya', 'ramen_ticket_machine'];

// Step fields that must be present and non-empty on every step.
const REQUIRED_STEP_FIELDS = [
  'whatHappens',
  'staffPhraseRomaji',
  'staffPhraseKanji',
  'visitorResponse',
];

// Optional step fields that, IF present, must be non-empty.
const OPTIONAL_STEP_FIELDS = ['tip'];

// Soft (non-fatal) step-count bounds.
const SOFT_MIN_STEPS = 6;
const SOFT_MAX_STEPS = 12;

const errors = [];
const warnings = [];

/** A value counts as a non-empty string only if it is a string with
 *  non-whitespace content. */
function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function checkSituationKeys(data) {
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    errors.push(
      `situations: expected a plain object keyed by situationId, got ${
        Array.isArray(data) ? 'array' : typeof data
      }.`
    );
    return false;
  }

  const actualKeys = Object.keys(data);
  const expectedSet = new Set(EXPECTED_KEYS);
  const actualSet = new Set(actualKeys);

  const missing = EXPECTED_KEYS.filter((k) => !actualSet.has(k));
  const extra = actualKeys.filter((k) => !expectedSet.has(k));

  if (missing.length > 0) {
    errors.push(`situations: missing situation key(s): ${missing.join(', ')}.`);
  }
  if (extra.length > 0) {
    errors.push(
      `situations: unexpected situation key(s): ${extra.join(
        ', '
      )} (expected exactly: ${EXPECTED_KEYS.join(', ')}).`
    );
  }

  return missing.length === 0 && extra.length === 0;
}

function checkSituation(situationId, situation) {
  const where = `situations.${situationId}`;

  if (situation === null || typeof situation !== 'object' || Array.isArray(situation)) {
    errors.push(`${where}: expected an object { label, steps }, got ${
      Array.isArray(situation) ? 'array' : typeof situation
    }.`);
    return;
  }

  if (!isNonEmptyString(situation.label)) {
    errors.push(`${where}.label: REQUIRED non-empty string is missing or empty.`);
  }

  if (!Array.isArray(situation.steps)) {
    errors.push(`${where}.steps: REQUIRED array of steps is missing or not an array.`);
    return;
  }

  if (situation.steps.length === 0) {
    errors.push(`${where}.steps: must contain at least one step (found 0).`);
    return;
  }

  // Soft step-count bound — logged, never fatal.
  if (
    situation.steps.length < SOFT_MIN_STEPS ||
    situation.steps.length > SOFT_MAX_STEPS
  ) {
    warnings.push(
      `${where}.steps: ${situation.steps.length} steps is outside the suggested ${SOFT_MIN_STEPS}–${SOFT_MAX_STEPS} range (soft guideline — not failing the build).`
    );
  }

  situation.steps.forEach((step, index) => {
    checkStep(situationId, index, step);
  });
}

function checkStep(situationId, index, step) {
  const where = `situations.${situationId}.steps[${index}]`;

  if (step === null || typeof step !== 'object' || Array.isArray(step)) {
    errors.push(`${where}: expected a Step object, got ${
      Array.isArray(step) ? 'array' : typeof step
    }.`);
    return;
  }

  for (const field of REQUIRED_STEP_FIELDS) {
    if (!(field in step)) {
      errors.push(`${where}.${field}: REQUIRED field is missing.`);
    } else if (!isNonEmptyString(step[field])) {
      errors.push(`${where}.${field}: REQUIRED field must be a non-empty string.`);
    }
  }

  for (const field of OPTIONAL_STEP_FIELDS) {
    // PRESENCE-aware, not REQUIRED: only validate when the field is provided.
    if (field in step && step[field] !== undefined && step[field] !== null) {
      if (!isNonEmptyString(step[field])) {
        errors.push(
          `${where}.${field}: optional field, when present, must be a non-empty string.`
        );
      }
    }
  }
}

function main() {
  console.log('Travel Encounters Playbook — content shape validator (presence only, NOT correctness).');

  const keysOk = checkSituationKeys(situations);

  if (keysOk || (situations && typeof situations === 'object' && !Array.isArray(situations))) {
    // Validate each EXPECTED situation that is actually present, so we report
    // as many concrete problems as possible in one pass.
    for (const situationId of EXPECTED_KEYS) {
      if (situations && Object.prototype.hasOwnProperty.call(situations, situationId)) {
        checkSituation(situationId, situations[situationId]);
      }
    }
  }

  for (const warning of warnings) {
    console.warn(`WARN  ${warning}`);
  }

  if (errors.length > 0) {
    for (const error of errors) {
      console.error(`ERROR ${error}`);
    }
    console.error(
      `\nContent validation FAILED: ${errors.length} error(s)${
        warnings.length ? `, ${warnings.length} warning(s)` : ''
      }.`
    );
    console.error(
      'Note: this checks field PRESENCE only. Romanization & cultural accuracy ' +
        'are signed off in content/REVIEW.md, not here.'
    );
    process.exit(1);
  }

  console.log(
    `Content validation PASSED: ${EXPECTED_KEYS.length} situations OK` +
      `${warnings.length ? `, ${warnings.length} soft warning(s)` : ''}.`
  );
  console.log(
    'Reminder: correctness (accurate romaji/kanji, polite phrasing) is verified ' +
      'by the native-speaker review gate (content/REVIEW.md), not by this script.'
  );
}

main();
