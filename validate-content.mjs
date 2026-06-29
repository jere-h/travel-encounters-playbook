#!/usr/bin/env node
// validate-content.mjs — DEV-ONLY content validator for Travel Encounters Playbook.
//
// Run with:  node validate-content.mjs
//
// This is NOT shipped to the browser and has NO runtime dependency: it is not
// loaded by index.html, app.js, or sw.js. It exists only to gate the bundled
// content at build/deploy time (see .github/workflows/deploy.yml). It imports
// the SAME `cities` export the app uses, so the data the validator checks is
// byte-for-byte the data the app renders.
//
// SCOPE — what this does and does NOT verify:
//   * It checks the documented SHAPE and FIELD PRESENCE only:
//       - `CITY_ORDER` matches the `cities` keys,
//       - each city has non-empty label / language / langCode, a non-empty
//         `situationOrder` that matches its `situations` keys, and a non-empty
//         `rescuePhrases` array of { en, romanized, native },
//       - each situation has non-empty label / summary and a non-empty `expect`
//         array of non-empty strings,
//       - each step has non-empty title / whatHappens / staffPhraseRomanized /
//         staffPhraseNative / visitorResponse and a boolean `yourTurn`,
//       - `tip`, when present, is a non-empty string.
//   * It does NOT and CANNOT check CORRECTNESS — whether the romanization is
//     right, the native script is accurate, or the phrasing is polite/appropriate.
//     That is the job of the native-speaker review gate (content/REVIEW.md),
//     which is the load-bearing defense this validator deliberately does not
//     try to replace.
//
// EXIT BEHAVIOUR:
//   * Any missing/empty REQUIRED field (or inconsistent key set) is an ERROR:
//     all errors are collected and printed, then the process exits non-zero so
//     the deploy fails before bad-shaped content can reach a user.
//   * The 6–12 step-count bound is a SOFT WARNING only: it is logged but never
//     fails the run, so an accurate short or long script is not rejected.

import { cities, CITY_ORDER } from './content.js';

// Step fields that must be present and non-empty STRINGS on every step.
const REQUIRED_STEP_FIELDS = [
  'title',
  'whatHappens',
  'staffPhraseRomanized',
  'staffPhraseNative',
  'visitorResponse',
];

// Step fields that must be present and of BOOLEAN type on every step.
const REQUIRED_STEP_BOOL_FIELDS = ['yourTurn'];

// Optional step fields that, IF present, must be non-empty.
const OPTIONAL_STEP_FIELDS = ['tip'];

// REQUIRED non-empty string fields on every city.
const REQUIRED_CITY_STRING_FIELDS = ['label', 'language', 'langCode'];

// REQUIRED non-empty string fields on every situation (besides `steps`).
const REQUIRED_SITUATION_STRING_FIELDS = ['label', 'summary'];

// REQUIRED non-empty string fields on every rescue phrase.
const REQUIRED_PHRASE_FIELDS = ['en', 'romanized', 'native'];

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

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function checkCityOrder() {
  if (!isPlainObject(cities)) {
    errors.push(`cities: expected a plain object keyed by cityId, got ${
      Array.isArray(cities) ? 'array' : typeof cities
    }.`);
    return;
  }
  if (!Array.isArray(CITY_ORDER) || CITY_ORDER.length === 0) {
    errors.push('CITY_ORDER: REQUIRED non-empty array of cityIds is missing or empty.');
    return;
  }
  const cityKeys = new Set(Object.keys(cities));
  const orderSet = new Set(CITY_ORDER);
  const missing = CITY_ORDER.filter((id) => !cityKeys.has(id));
  const extra = Object.keys(cities).filter((id) => !orderSet.has(id));
  if (missing.length > 0) {
    errors.push(`CITY_ORDER: references unknown city id(s): ${missing.join(', ')}.`);
  }
  if (extra.length > 0) {
    errors.push(`cities: city id(s) not listed in CITY_ORDER: ${extra.join(', ')}.`);
  }
}

function checkPhrases(where, phrases) {
  if (!Array.isArray(phrases)) {
    errors.push(`${where}: REQUIRED rescuePhrases must be an array.`);
    return;
  }
  if (phrases.length === 0) {
    errors.push(`${where}: must contain at least one rescue phrase (found 0).`);
    return;
  }
  phrases.forEach((phrase, index) => {
    const at = `${where}[${index}]`;
    if (!isPlainObject(phrase)) {
      errors.push(`${at}: expected a { en, romanized, native } object.`);
      return;
    }
    for (const field of REQUIRED_PHRASE_FIELDS) {
      if (!isNonEmptyString(phrase[field])) {
        errors.push(`${at}.${field}: REQUIRED field must be a non-empty string.`);
      }
    }
  });
}

function checkCity(cityId, city) {
  const where = `cities.${cityId}`;
  if (!isPlainObject(city)) {
    errors.push(`${where}: expected a city object, got ${
      Array.isArray(city) ? 'array' : typeof city
    }.`);
    return;
  }

  for (const field of REQUIRED_CITY_STRING_FIELDS) {
    if (!isNonEmptyString(city[field])) {
      errors.push(`${where}.${field}: REQUIRED non-empty string is missing or empty.`);
    }
  }

  checkPhrases(`${where}.rescuePhrases`, city.rescuePhrases);

  if (!isPlainObject(city.situations)) {
    errors.push(`${where}.situations: REQUIRED object of situations is missing.`);
    return;
  }
  if (!Array.isArray(city.situationOrder) || city.situationOrder.length === 0) {
    errors.push(`${where}.situationOrder: REQUIRED non-empty array is missing or empty.`);
  } else {
    // situationOrder and situations keys must agree, so the picker never points
    // at a missing situation and no situation is silently unreachable.
    const sitKeys = new Set(Object.keys(city.situations));
    const orderSet = new Set(city.situationOrder);
    const missing = city.situationOrder.filter((id) => !sitKeys.has(id));
    const extra = Object.keys(city.situations).filter((id) => !orderSet.has(id));
    if (missing.length > 0) {
      errors.push(`${where}.situationOrder: references unknown situation(s): ${missing.join(', ')}.`);
    }
    if (extra.length > 0) {
      errors.push(`${where}.situations: situation(s) not listed in situationOrder: ${extra.join(', ')}.`);
    }
  }

  for (const situationId of Object.keys(city.situations)) {
    checkSituation(cityId, situationId, city.situations[situationId]);
  }
}

function checkSituation(cityId, situationId, situation) {
  const where = `cities.${cityId}.situations.${situationId}`;

  if (!isPlainObject(situation)) {
    errors.push(`${where}: expected an object { label, summary, expect, steps }, got ${
      Array.isArray(situation) ? 'array' : typeof situation
    }.`);
    return;
  }

  for (const field of REQUIRED_SITUATION_STRING_FIELDS) {
    if (!isNonEmptyString(situation[field])) {
      errors.push(`${where}.${field}: REQUIRED non-empty string is missing or empty.`);
    }
  }

  // `expect` — REQUIRED non-empty array of non-empty strings.
  if (!Array.isArray(situation.expect)) {
    errors.push(`${where}.expect: REQUIRED array of strings is missing or not an array.`);
  } else if (situation.expect.length === 0) {
    errors.push(`${where}.expect: must contain at least one "what to expect" line (found 0).`);
  } else {
    situation.expect.forEach((line, i) => {
      if (!isNonEmptyString(line)) {
        errors.push(`${where}.expect[${i}]: must be a non-empty string.`);
      }
    });
  }

  if (!Array.isArray(situation.steps)) {
    errors.push(`${where}.steps: REQUIRED array of steps is missing or not an array.`);
    return;
  }
  if (situation.steps.length === 0) {
    errors.push(`${where}.steps: must contain at least one step (found 0).`);
    return;
  }
  if (
    situation.steps.length < SOFT_MIN_STEPS ||
    situation.steps.length > SOFT_MAX_STEPS
  ) {
    warnings.push(
      `${where}.steps: ${situation.steps.length} steps is outside the suggested ${SOFT_MIN_STEPS}–${SOFT_MAX_STEPS} range (soft guideline — not failing the build).`
    );
  }

  situation.steps.forEach((step, index) => {
    checkStep(where, index, step);
  });
}

function checkStep(situationWhere, index, step) {
  const where = `${situationWhere}.steps[${index}]`;

  if (!isPlainObject(step)) {
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

  for (const field of REQUIRED_STEP_BOOL_FIELDS) {
    if (!(field in step)) {
      errors.push(`${where}.${field}: REQUIRED field is missing.`);
    } else if (typeof step[field] !== 'boolean') {
      errors.push(`${where}.${field}: REQUIRED field must be a boolean (true/false).`);
    }
  }

  for (const field of OPTIONAL_STEP_FIELDS) {
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

  checkCityOrder();

  if (isPlainObject(cities)) {
    for (const cityId of Object.keys(cities)) {
      checkCity(cityId, cities[cityId]);
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

  const cityCount = isPlainObject(cities) ? Object.keys(cities).length : 0;
  const sitCount = isPlainObject(cities)
    ? Object.values(cities).reduce(
        (n, c) => n + (isPlainObject(c.situations) ? Object.keys(c.situations).length : 0),
        0
      )
    : 0;
  console.log(
    `Content validation PASSED: ${cityCount} cities, ${sitCount} situations OK` +
      `${warnings.length ? `, ${warnings.length} soft warning(s)` : ''}.`
  );
  console.log(
    'Reminder: correctness (accurate romanization/native script, polite phrasing) ' +
      'is verified by the native-speaker review gate (content/REVIEW.md), not by this script.'
  );
}

main();
