// Travel Encounters Playbook — In-the-Moment Social Scripts (neurodivergent-first)
// ES-module app logic. No framework. Imports the authoritative content bundle
// and mounts a three-view switch (picker <-> overview <-> stepview) over the DOM
// in index.html.
//
// Design intent: a neurodivergent traveler should be able to (a) see the WHOLE
// interaction before it happens (the overview), and (b) jump straight to the
// exact moment they're in right now (the jump list), without scrolling through
// every step. Plus always-available "rescue" phrases for when things go
// off-script.
//
// Cross-module surface is pinned by the shared contract:
//  - imports { situations, SITUATION_ORDER, rescuePhrases } from './content.js'
//  - this is the SOLE module entry; it bootstraps on load (no init() call from HTML)
//  - it registers the service worker itself (single owner)
//  - all in-memory state lives here; communication is via the named exports only.

import { situations, SITUATION_ORDER, rescuePhrases } from './content.js';

// ---------------------------------------------------------------------------
// In-memory state (never persisted)
// ---------------------------------------------------------------------------
const state = {
  selectedSituation: null, // situationId | null
  currentStepIndex: 0, // 0-based, clamped to [0, steps.length-1]
};

// ---------------------------------------------------------------------------
// DOM references (resolved once on bootstrap)
// ---------------------------------------------------------------------------
let el = {};

function cacheDom() {
  el = {
    main: document.getElementById('main'),
    // Picker (home)
    picker: document.getElementById('picker'),
    pickerCards: document.getElementById('picker-cards'),
    // Overview
    overview: document.getElementById('overview'),
    overviewName: document.getElementById('overview-title'),
    overviewSummary: document.getElementById('overview-summary'),
    overviewExpect: document.getElementById('overview-expect'),
    overviewSteps: document.getElementById('overview-steps'),
    backToPickerBtn: document.getElementById('back-to-picker-btn'),
    startBtn: document.getElementById('start-btn'),
    // Step view
    stepview: document.getElementById('stepview'),
    stepsBtn: document.getElementById('steps-btn'),
    stepTitle: document.getElementById('step-title'),
    stepTurn: document.getElementById('step-turn'),
    stepWhat: document.getElementById('step-what'),
    stepRomaji: document.getElementById('step-romaji'),
    stepKanji: document.getElementById('step-kanji'),
    stepResponse: document.getElementById('step-response'),
    stepProgress: document.getElementById('step-progress'),
    nextZone: document.getElementById('next-zone'),
    backBtn: document.getElementById('back-btn'),
    // Tips drawer
    tipsBtn: document.getElementById('tips-btn'),
    tipsDrawer: document.getElementById('tips-drawer'),
    tipsBody: document.getElementById('tips-body'),
    tipsClose: document.getElementById('tips-close'),
    // Phrases drawer
    phrasesDrawer: document.getElementById('phrases-drawer'),
    phrasesBody: document.getElementById('phrases-body'),
    phrasesClose: document.getElementById('phrases-close'),
    // iOS install hint
    iosInstallHint: document.getElementById('ios-install-hint'),
    iosInstallDismiss: document.querySelector('.ios-install-dismiss'),
  };
}

// ---------------------------------------------------------------------------
// Inline venue thumbnails (self-contained SVG, no external assets)
// ---------------------------------------------------------------------------
const VENUE_ICONS = {
  convenience_store: `
    <svg viewBox="0 0 64 64" role="img" aria-hidden="true" focusable="false">
      <rect x="6" y="20" width="52" height="34" rx="4" fill="#fde7d6"/>
      <rect x="6" y="14" width="52" height="10" rx="3" fill="#c2410c"/>
      <rect x="12" y="30" width="16" height="18" rx="2" fill="#ffffff" stroke="#e7e2da"/>
      <rect x="36" y="30" width="16" height="18" rx="2" fill="#ffffff" stroke="#e7e2da"/>
      <line x1="20" y1="30" x2="20" y2="48" stroke="#e7e2da"/>
      <line x1="44" y1="30" x2="44" y2="48" stroke="#e7e2da"/>
      <rect x="12" y="6" width="6" height="10" rx="2" fill="#1c1b1a"/>
    </svg>`,
  izakaya: `
    <svg viewBox="0 0 64 64" role="img" aria-hidden="true" focusable="false">
      <rect x="10" y="10" width="44" height="44" rx="6" fill="#7c2d12"/>
      <circle cx="32" cy="26" r="11" fill="#fde7d6"/>
      <text x="32" y="32" font-size="14" text-anchor="middle" fill="#7c2d12" font-family="sans-serif">居</text>
      <rect x="20" y="42" width="24" height="4" rx="2" fill="#fdba74"/>
      <rect x="20" y="48" width="24" height="3" rx="1.5" fill="#fdba74"/>
    </svg>`,
  ramen_ticket_machine: `
    <svg viewBox="0 0 64 64" role="img" aria-hidden="true" focusable="false">
      <rect x="14" y="6" width="36" height="52" rx="5" fill="#1f2937"/>
      <rect x="20" y="12" width="24" height="14" rx="2" fill="#fcd34d"/>
      <rect x="20" y="30" width="11" height="8" rx="1.5" fill="#c2410c"/>
      <rect x="33" y="30" width="11" height="8" rx="1.5" fill="#c2410c"/>
      <rect x="20" y="40" width="11" height="8" rx="1.5" fill="#c2410c"/>
      <rect x="33" y="40" width="11" height="8" rx="1.5" fill="#c2410c"/>
      <rect x="22" y="50" width="20" height="5" rx="2" fill="#9ca3af"/>
    </svg>`,
};

function venueIcon(situationId) {
  return VENUE_ICONS[situationId] || '';
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getSteps() {
  const sit = state.selectedSituation && situations[state.selectedSituation];
  return (sit && Array.isArray(sit.steps)) ? sit.steps : [];
}

function clampIndex(idx, steps) {
  const max = steps.length - 1;
  if (max < 0) return 0;
  if (idx < 0) return 0;
  if (idx > max) return max;
  return idx;
}

function setView(name) {
  // Show exactly one .view; the inactive ones carry [hidden].
  // name is one of: 'picker' | 'overview' | 'stepview'.
  if (el.picker) el.picker.hidden = name !== 'picker';
  if (el.overview) el.overview.hidden = name !== 'overview';
  if (el.stepview) el.stepview.hidden = name !== 'stepview';
}

// ---------------------------------------------------------------------------
// Picker (home) rendering — the three situations for the current scope (Tokyo)
// ---------------------------------------------------------------------------
function renderPicker() {
  if (!el.pickerCards) return;
  el.pickerCards.textContent = '';

  SITUATION_ORDER.forEach((id) => {
    const sit = situations[id];
    if (!sit) return;

    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'situation-card';
    card.setAttribute('role', 'listitem');
    card.setAttribute('data-situation-id', id);
    card.setAttribute('aria-label', `Open ${sit.label} — see what to expect`);

    const thumb = document.createElement('span');
    thumb.className = 'situation-thumb';
    thumb.innerHTML = venueIcon(id);

    const label = document.createElement('span');
    label.className = 'situation-label';
    label.textContent = sit.label;

    // Outer wrapper forces the badge onto its own indented line; the inner pill
    // hugs its text so the chip never stretches the whole card width.
    const count = document.createElement('span');
    count.className = 'situation-count';
    const countPill = document.createElement('span');
    countPill.className = 'situation-count-pill';
    const n = Array.isArray(sit.steps) ? sit.steps.length : 0;
    countPill.textContent = `${n} step${n === 1 ? '' : 's'}`;
    count.appendChild(countPill);

    card.appendChild(thumb);
    card.appendChild(label);
    card.appendChild(count);
    el.pickerCards.appendChild(card);
  });
}

// ---------------------------------------------------------------------------
// Overview rendering — "what to expect" + a tappable, jumpable step list.
// This is the screen that serves both core needs: knowing the whole arc, and
// jumping straight to a specific moment.
// ---------------------------------------------------------------------------
function turnLabel(yourTurn) {
  return yourTurn ? 'Your turn' : 'Just listen';
}

function renderOverview() {
  const sit = state.selectedSituation && situations[state.selectedSituation];
  if (!sit) return;

  if (el.overviewName) el.overviewName.textContent = sit.label;
  if (el.overviewSummary) el.overviewSummary.textContent = sit.summary || '';

  // "What to expect" bullets.
  if (el.overviewExpect) {
    el.overviewExpect.textContent = '';
    const expect = Array.isArray(sit.expect) ? sit.expect : [];
    expect.forEach((line) => {
      const li = document.createElement('li');
      li.className = 'expect-item';
      li.textContent = line;
      el.overviewExpect.appendChild(li);
    });
  }

  // Jump list — one tappable row per step.
  if (el.overviewSteps) {
    el.overviewSteps.textContent = '';
    const steps = Array.isArray(sit.steps) ? sit.steps : [];
    steps.forEach((step, index) => {
      const row = document.createElement('button');
      row.type = 'button';
      row.className = 'step-jump-row';
      row.setAttribute('role', 'listitem');
      row.setAttribute('data-step-index', String(index));
      row.setAttribute('aria-label', `Step ${index + 1}: ${step.title || ''} — jump here`);

      const num = document.createElement('span');
      num.className = 'step-jump-num';
      num.textContent = String(index + 1);

      const title = document.createElement('span');
      title.className = 'step-jump-title';
      title.textContent = step.title || `Step ${index + 1}`;

      const tag = document.createElement('span');
      tag.className = `step-jump-tag ${step.yourTurn ? 'is-act' : 'is-listen'}`;
      tag.textContent = turnLabel(!!step.yourTurn);

      row.appendChild(num);
      row.appendChild(title);
      row.appendChild(tag);
      el.overviewSteps.appendChild(row);
    });
  }
}

// ---------------------------------------------------------------------------
// Step rendering
// ---------------------------------------------------------------------------
function showStep() {
  const steps = getSteps();
  if (steps.length === 0) return;

  state.currentStepIndex = clampIndex(state.currentStepIndex, steps);
  const step = steps[state.currentStepIndex] || {};

  if (el.stepTitle) el.stepTitle.textContent = step.title || '';

  // "Your turn" vs "Just listen" marker — removes ambiguity about when the user
  // actually has to do or say something.
  if (el.stepTurn) {
    const yourTurn = !!step.yourTurn;
    el.stepTurn.textContent = yourTurn
      ? 'Your turn — you respond here'
      : 'Just listen — no reply needed';
    el.stepTurn.classList.toggle('is-act', yourTurn);
    el.stepTurn.classList.toggle('is-listen', !yourTurn);
  }

  if (el.stepWhat) el.stepWhat.textContent = step.whatHappens || '';
  if (el.stepRomaji) el.stepRomaji.textContent = step.staffPhraseRomaji || '';
  if (el.stepKanji) el.stepKanji.textContent = step.staffPhraseKanji || '';
  if (el.stepResponse) el.stepResponse.textContent = step.visitorResponse || '';
  if (el.stepProgress) {
    el.stepProgress.textContent = `Step ${state.currentStepIndex + 1} of ${steps.length}`;
  }

  // Inline Tips button — present only when this step actually has a tip, so the
  // control never appears as a dead end.
  if (el.tipsBtn) {
    const hasTip = !!(step.tip && String(step.tip).trim());
    el.tipsBtn.hidden = !hasTip;
  }
}

// ---------------------------------------------------------------------------
// Navigation — forward advance is swipe-LEFT or the explicit Next zone ONLY.
// ---------------------------------------------------------------------------
function selectSituation(id) {
  if (!situations[id]) return;
  state.selectedSituation = id;
  state.currentStepIndex = 0;
  closeDrawer(); // ensure a fresh entry without a stale drawer
  renderOverview();
  setView('overview');
}

function goToStep(index) {
  const steps = getSteps();
  if (steps.length === 0) return;
  state.currentStepIndex = clampIndex(index, steps);
  setView('stepview');
  showStep();
}

function next() {
  const steps = getSteps();
  if (steps.length === 0) return;
  const target = clampIndex(state.currentStepIndex + 1, steps);
  if (target === state.currentStepIndex) return; // already at the end
  state.currentStepIndex = target;
  showStep();
}

function prev() {
  const steps = getSteps();
  if (steps.length === 0 || state.currentStepIndex === 0) {
    // Back from the first step returns to the overview.
    backToOverview();
    return;
  }
  state.currentStepIndex = clampIndex(state.currentStepIndex - 1, steps);
  showStep();
}

function backToOverview() {
  // Back to the OVERVIEW (the jump list) for the current situation.
  closeDrawer();
  renderOverview();
  setView('overview');
}

function backToPicker() {
  // Return to the situation picker (home), resetting situation/step state.
  closeDrawer();
  state.selectedSituation = null;
  state.currentStepIndex = 0;
  setView('picker');
}

// ---------------------------------------------------------------------------
// Drawers (Tips + Phrases) — a single reusable, accessible bottom-sheet helper.
// A drawer opens/closes WITHOUT mutating the step index, traps Tab focus while
// open, and restores focus to the opener on close (WCAG 2.4.3).
// ---------------------------------------------------------------------------
let activeDrawer = null; // { drawer: Element, lastFocus: Element|null } | null

function openDrawer(drawer) {
  if (!drawer) return;
  // If a different drawer is open, close it first (restores its opener focus).
  if (activeDrawer && activeDrawer.drawer !== drawer) closeDrawer();

  activeDrawer = { drawer, lastFocus: document.activeElement };
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  // Make the rest of the app uninteractive to keyboard/AT while the modal is open.
  if (el.main) el.main.inert = true;
  const closeBtn = drawer.querySelector('.drawer-close');
  if (closeBtn) closeBtn.focus();
}

function closeDrawer() {
  if (!activeDrawer) return;
  const { drawer, lastFocus } = activeDrawer;
  activeDrawer = null;
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
  if (el.main) el.main.inert = false;
  if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
}

function trapTab(e, drawer) {
  const focusable = drawer.querySelectorAll(
    'button, a[href], input, [tabindex]:not([tabindex="-1"])'
  );
  if (focusable.length === 0) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    last.focus();
    e.preventDefault();
  } else if (!e.shiftKey && document.activeElement === last) {
    first.focus();
    e.preventDefault();
  }
}

// Tips drawer — fills from the current step's tip, then opens.
function openTips() {
  const steps = getSteps();
  const step = steps[state.currentStepIndex] || {};
  const tip = step.tip && String(step.tip).trim();
  if (el.tipsBody) {
    if (tip) {
      el.tipsBody.textContent = tip;
      el.tipsBody.classList.remove('tips-empty');
    } else {
      el.tipsBody.textContent = 'No extra tips for this step — you’re good to go.';
      el.tipsBody.classList.add('tips-empty');
    }
  }
  openDrawer(el.tipsDrawer);
}

// Phrases drawer — static content; filled once at bootstrap.
function renderPhrases() {
  if (!el.phrasesBody) return;
  el.phrasesBody.textContent = '';
  (Array.isArray(rescuePhrases) ? rescuePhrases : []).forEach((phrase) => {
    const li = document.createElement('li');
    li.className = 'phrase-item';

    const en = document.createElement('p');
    en.className = 'phrase-en';
    en.textContent = phrase.en || '';

    const romaji = document.createElement('p');
    romaji.className = 'phrase-romaji';
    romaji.lang = 'ja';
    romaji.textContent = phrase.romaji || '';

    const kanji = document.createElement('p');
    kanji.className = 'phrase-kanji';
    kanji.lang = 'ja';
    kanji.textContent = phrase.kanji || '';

    li.appendChild(en);
    li.appendChild(romaji);
    li.appendChild(kanji);
    el.phrasesBody.appendChild(li);
  });
}

// ---------------------------------------------------------------------------
// Swipe handling on the step view.
//  - swipe LEFT  -> next()
//  - swipe RIGHT -> intentionally NOT mapped. The OS/browser edge-back gesture
//    (iOS Safari / Android Chrome history-back) wins that event chain, so an
//    in-app prev() mapping was unreliable and could eject the user from the app.
//    Backward navigation is via the explicit Back button / ArrowRight key.
// A full-screen TAP never advances (no click-to-next on the view).
// Swipes that start inside interactive controls are ignored so the gesture layer
// can't fight the buttons.
// ---------------------------------------------------------------------------
const SWIPE_MIN_X = 45; // px horizontal travel to count as a swipe
const SWIPE_MAX_OFF_AXIS = 0.6; // |dy| must be < 0.6 * |dx| (mostly horizontal)

let touch = { active: false, startX: 0, startY: 0, ignore: false };

function isInteractiveTarget(target) {
  if (!(target instanceof Element)) return false;
  return !!target.closest(
    '#tips-drawer, #phrases-drawer, #tips-btn, #back-btn, #steps-btn, #next-zone, .phrases-btn, button, a, input, textarea, select'
  );
}

function onTouchStart(e) {
  if (activeDrawer) { touch.active = false; return; }
  const t = e.touches && e.touches[0];
  if (!t) return;
  touch.active = true;
  touch.startX = t.clientX;
  touch.startY = t.clientY;
  touch.ignore = isInteractiveTarget(e.target);
}

function onTouchEnd(e) {
  if (!touch.active) return;
  touch.active = false;
  if (touch.ignore || activeDrawer) return;

  const t = (e.changedTouches && e.changedTouches[0]);
  if (!t) return;

  const dx = t.clientX - touch.startX;
  const dy = t.clientY - touch.startY;

  if (Math.abs(dx) < SWIPE_MIN_X) return; // a tap or tiny move — never advances
  if (Math.abs(dy) > Math.abs(dx) * SWIPE_MAX_OFF_AXIS) return; // too vertical

  if (dx < 0) next(); // swipe left -> forward (right-swipe deliberately unmapped)
}

// ---------------------------------------------------------------------------
// iOS Add-to-Home-Screen hint (iOS Safari, not already standalone).
// ---------------------------------------------------------------------------
function isIosSafari() {
  try {
    const ua = navigator.userAgent || '';
    const platform = navigator.platform || '';
    const maxTouch = navigator.maxTouchPoints || 0;

    // Classic iOS devices, plus iPadOS 13+ which reports as "MacIntel" + touch.
    const iOSDevice = /iPad|iPhone|iPod/.test(ua) ||
      (platform === 'MacIntel' && maxTouch > 1);
    if (!iOSDevice) return false;

    // Safari (exclude Chrome/Firefox/Edge in-app browsers on iOS).
    const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|Mercury/.test(ua);
    return isSafari;
  } catch (_) {
    return false;
  }
}

function isStandalone() {
  try {
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      return true;
    }
    // Legacy iOS Safari flag.
    return navigator.standalone === true;
  } catch (_) {
    return false;
  }
}

function maybeShowIosHint() {
  if (!el.iosInstallHint) return;
  if (isIosSafari() && !isStandalone()) {
    el.iosInstallHint.hidden = false;
  } else {
    el.iosInstallHint.hidden = true;
  }
}

// ---------------------------------------------------------------------------
// Event wiring
// ---------------------------------------------------------------------------
function wireEvents() {
  // Picker: delegate situation-card taps (tap 1 -> enter overview).
  if (el.pickerCards) {
    el.pickerCards.addEventListener('click', (e) => {
      const card = e.target instanceof Element
        ? e.target.closest('.situation-card[data-situation-id]')
        : null;
      if (!card) return;
      selectSituation(card.getAttribute('data-situation-id'));
    });
  }

  // Overview: back to picker, jump-list rows, and "start from the beginning".
  if (el.backToPickerBtn) {
    el.backToPickerBtn.addEventListener('click', (e) => {
      e.preventDefault();
      backToPicker();
    });
  }
  if (el.overviewSteps) {
    el.overviewSteps.addEventListener('click', (e) => {
      const row = e.target instanceof Element
        ? e.target.closest('.step-jump-row[data-step-index]')
        : null;
      if (!row) return;
      goToStep(Number(row.getAttribute('data-step-index')));
    });
  }
  if (el.startBtn) {
    el.startBtn.addEventListener('click', (e) => {
      e.preventDefault();
      goToStep(0);
    });
  }

  // Step view: Steps (back to overview), Next (the ONLY tap target that
  // advances), Back, and the inline Tips button.
  if (el.stepsBtn) {
    el.stepsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      backToOverview();
    });
  }
  if (el.nextZone) {
    el.nextZone.addEventListener('click', (e) => {
      e.preventDefault();
      next();
    });
  }
  if (el.backBtn) {
    el.backBtn.addEventListener('click', (e) => {
      e.preventDefault();
      prev();
    });
  }
  if (el.tipsBtn) {
    el.tipsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openTips();
    });
  }

  // Phrases buttons (present on every view) — open the rescue-phrases drawer.
  document.querySelectorAll('[data-open-phrases]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openDrawer(el.phrasesDrawer);
    });
  });

  // Drawer close buttons + backdrop taps.
  if (el.tipsClose) {
    el.tipsClose.addEventListener('click', (e) => {
      e.preventDefault();
      closeDrawer();
    });
  }
  if (el.phrasesClose) {
    el.phrasesClose.addEventListener('click', (e) => {
      e.preventDefault();
      closeDrawer();
    });
  }
  [el.tipsDrawer, el.phrasesDrawer].forEach((drawer) => {
    if (!drawer) return;
    // Tapping the dimmed backdrop (the drawer container itself) closes it,
    // but taps inside the panel do not.
    drawer.addEventListener('click', (e) => {
      if (e.target === drawer) closeDrawer();
    });
  });

  // iOS install hint — "Got it" dismisses for the rest of the session.
  if (el.iosInstallDismiss) {
    el.iosInstallDismiss.addEventListener('click', () => {
      if (el.iosInstallHint) el.iosInstallHint.hidden = true;
    });
  }

  // Swipe gestures live on the step view only.
  if (el.stepview) {
    el.stepview.addEventListener('touchstart', onTouchStart, { passive: true });
    el.stepview.addEventListener('touchend', onTouchEnd, { passive: true });
  }

  // Keyboard parity (desktop / accessibility) — arrows + Escape + Tab trap.
  document.addEventListener('keydown', (e) => {
    if (activeDrawer) {
      if (e.key === 'Escape') { closeDrawer(); return; }
      if (e.key === 'Tab') trapTab(e, activeDrawer.drawer);
      return; // never navigate behind an open drawer
    }
    if (!el.stepview || el.stepview.hidden) return; // arrows only in step view
    if (e.key === 'ArrowLeft') next();
    else if (e.key === 'ArrowRight') prev();
  });

  // Re-evaluate the iOS hint if the display mode changes (e.g. just installed).
  try {
    const mq = window.matchMedia && window.matchMedia('(display-mode: standalone)');
    if (mq && typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', maybeShowIosHint);
    }
  } catch (_) { /* non-fatal */ }
}

// ---------------------------------------------------------------------------
// Service worker registration — single owner of registration.
// ---------------------------------------------------------------------------
function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js', { scope: './' })
      .catch((err) => {
        // Offline support is an enhancement; never let a failed registration
        // surface as an uncaught error.
        console.warn('Service worker registration failed:', err);
      });
  });
}

// ---------------------------------------------------------------------------
// Bootstrap (runs on module load; DOM is already parsed for module scripts).
// ---------------------------------------------------------------------------
function bootstrap() {
  try {
    cacheDom();
    renderPicker();
    renderPhrases();
    setView('picker');
    maybeShowIosHint();
    wireEvents();
    registerServiceWorker();
  } catch (err) {
    // Aim for zero uncaught console errors — log and keep the shell usable.
    console.error('Travel Encounters Playbook failed to initialize:', err);
  }
}

bootstrap();
