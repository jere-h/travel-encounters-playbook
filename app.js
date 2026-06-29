// Travel Encounters Playbook — In-the-Moment Social Scripts
// ES-module app logic. No framework. Imports the authoritative content bundle
// and mounts a three-view switch (cityview <-> picker <-> stepview) over the DOM
// in index.html.
//
// Cross-module surface is pinned by the shared contract:
//  - imports { situations, SITUATION_ORDER } from './content.js'
//  - this is the SOLE module entry; it bootstraps on load (no init() call from HTML)
//  - it registers the service worker itself (single owner)
//  - all in-memory state lives here; communication is via the named exports only.

import { situations, SITUATION_ORDER } from './content.js';

// ---------------------------------------------------------------------------
// Cities — a layer ABOVE the existing situations content (content.js is
// untouched). Tokyo is the single active city and owns the bundled situations;
// the others are visible "coming soon" placeholders.
// ---------------------------------------------------------------------------
const CITIES = [
  { id: 'tokyo', label: 'Tokyo', active: true },
  { id: 'kyoto', label: 'Kyoto', active: false },
  { id: 'osaka', label: 'Osaka', active: false },
];

// ---------------------------------------------------------------------------
// In-memory state (never persisted)
// ---------------------------------------------------------------------------
const state = {
  selectedCity: null, // cityId | null
  selectedSituation: null, // situationId | null
  currentStepIndex: 0, // 0-based, clamped to [0, steps.length-1]
  tipsOpen: false,
};

// ---------------------------------------------------------------------------
// DOM references (resolved once on bootstrap)
// ---------------------------------------------------------------------------
let el = {};

// Element that had focus before the Tips dialog opened, so focus can be
// restored to it when the dialog closes (WCAG 2.4.3 focus order).
let tipsLastFocus = null;

function cacheDom() {
  el = {
    cityview: document.getElementById('cityview'),
    citiesList: document.getElementById('cities-list'),
    backToCitiesBtn: document.getElementById('back-to-cities-btn'),
    cityNameDisplay: document.getElementById('city-name-display'),
    homeBtn: document.getElementById('home-btn'),
    picker: document.getElementById('picker'),
    stepview: document.getElementById('stepview'),
    pickerCards: document.getElementById('picker-cards'),
    stepWhat: document.getElementById('step-what'),
    stepRomaji: document.getElementById('step-romaji'),
    stepKanji: document.getElementById('step-kanji'),
    stepResponse: document.getElementById('step-response'),
    stepProgress: document.getElementById('step-progress'),
    nextZone: document.getElementById('next-zone'),
    backBtn: document.getElementById('back-btn'),
    tipsBtn: document.getElementById('tips-btn'),
    tipsDrawer: document.getElementById('tips-drawer'),
    tipsBody: document.getElementById('tips-body'),
    tipsClose: document.getElementById('tips-close'),
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
  // name is one of: 'cityview' | 'picker' | 'stepview'.
  if (el.cityview) el.cityview.hidden = name !== 'cityview';
  if (el.picker) el.picker.hidden = name !== 'picker';
  if (el.stepview) el.stepview.hidden = name !== 'stepview';
}

// ---------------------------------------------------------------------------
// City landing rendering
// ---------------------------------------------------------------------------
function renderCities() {
  if (!el.citiesList) return;
  el.citiesList.textContent = '';

  CITIES.forEach((city) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'city-card';
    card.setAttribute('role', 'listitem');

    const label = document.createElement('span');
    label.className = 'city-label';
    label.textContent = city.label;
    card.appendChild(label);

    if (city.active) {
      // Active city: tappable, carries the data attribute the delegate reads.
      card.setAttribute('data-city-id', city.id);
      card.setAttribute('aria-label', `Open ${city.label}`);
    } else {
      // Coming-soon placeholder: inert (no data-city-id), disabled for AT.
      card.disabled = true;
      card.setAttribute('aria-disabled', 'true');
      card.setAttribute('aria-label', `${city.label} — coming soon`);
      const badge = document.createElement('span');
      badge.className = 'coming-soon-badge';
      badge.textContent = 'Coming soon';
      card.appendChild(badge);
    }

    el.citiesList.appendChild(card);
  });
}

// ---------------------------------------------------------------------------
// Picker rendering
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
    card.setAttribute('aria-label', `Open ${sit.label} script`);

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
// Step rendering
// ---------------------------------------------------------------------------
function showStep() {
  const steps = getSteps();
  if (steps.length === 0) return;

  state.currentStepIndex = clampIndex(state.currentStepIndex, steps);
  const step = steps[state.currentStepIndex] || {};

  if (el.stepWhat) el.stepWhat.textContent = step.whatHappens || '';
  if (el.stepRomaji) el.stepRomaji.textContent = step.staffPhraseRomaji || '';
  if (el.stepKanji) el.stepKanji.textContent = step.staffPhraseKanji || '';
  if (el.stepResponse) el.stepResponse.textContent = step.visitorResponse || '';
  if (el.stepProgress) {
    el.stepProgress.textContent = `Step ${state.currentStepIndex + 1} of ${steps.length}`;
  }

  // Keep an open Tips drawer in sync with the current step.
  if (state.tipsOpen) renderTips();

  // Reflect whether a tip exists for this step on the Tips control.
  if (el.tipsBtn) {
    const hasTip = !!(step.tip && String(step.tip).trim());
    el.tipsBtn.setAttribute('data-has-tip', hasTip ? 'true' : 'false');
  }
}

// ---------------------------------------------------------------------------
// Navigation — forward advance is swipe-LEFT or the explicit Next zone ONLY.
// ---------------------------------------------------------------------------
function selectSituation(id) {
  if (!situations[id]) return;
  state.selectedSituation = id;
  state.currentStepIndex = 0;
  closeTips(); // ensure a fresh entry without a stale drawer
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
  if (steps.length === 0) {
    backToPicker();
    return;
  }
  if (state.currentStepIndex === 0) {
    // Back from the first step returns to the picker.
    backToPicker();
    return;
  }
  state.currentStepIndex = clampIndex(state.currentStepIndex - 1, steps);
  showStep();
}

function backToPicker() {
  // Back to the SITUATION view (the picker) for the current city.
  closeTips();
  state.selectedSituation = null;
  state.currentStepIndex = 0;
  setView('picker');
}

// ---------------------------------------------------------------------------
// City navigation (the three-level IA: cities -> situations -> steps)
// ---------------------------------------------------------------------------
function selectCity(id) {
  const city = CITIES.find((c) => c.id === id && c.active);
  if (!city) return; // inert/unknown city — ignore
  state.selectedCity = id;
  if (el.cityNameDisplay) el.cityNameDisplay.textContent = city.label;
  renderPicker();
  setView('picker');
}

function backToCities() {
  // Return to the CITY landing (home), resetting situation/step state.
  closeTips();
  state.selectedSituation = null;
  state.currentStepIndex = 0;
  state.selectedCity = null;
  setView('cityview');
}

// Step-view "Home" control — same destination as back-to-cities.
function backToHome() {
  backToCities();
}

// ---------------------------------------------------------------------------
// Tips drawer — opens/closes WITHOUT mutating the step index.
// ---------------------------------------------------------------------------
function renderTips() {
  if (!el.tipsBody) return;
  const steps = getSteps();
  const step = steps[state.currentStepIndex] || {};
  const tip = step.tip && String(step.tip).trim();
  if (tip) {
    el.tipsBody.textContent = tip;
    el.tipsBody.classList.remove('tips-empty');
  } else {
    el.tipsBody.textContent = 'No extra tips for this step — you’re good to go.';
    el.tipsBody.classList.add('tips-empty');
  }
}

function openTips() {
  if (!el.tipsDrawer) return;
  // Remember where focus was so we can return it on close.
  tipsLastFocus = document.activeElement;
  state.tipsOpen = true;
  renderTips();
  el.tipsDrawer.classList.add('open');
  el.tipsDrawer.setAttribute('aria-hidden', 'false');
  // Make the background uninteractive to keyboard/AT while the modal is open.
  if (el.stepview) el.stepview.inert = true;
  // Move focus into the dialog.
  if (el.tipsClose) el.tipsClose.focus();
}

function closeTips() {
  if (!el.tipsDrawer) return;
  // Only restore focus if the drawer was actually open — closeTips() is also
  // called during bootstrap and on situation entry while it's already closed,
  // and we must not steal focus in those cases.
  const wasOpen = state.tipsOpen;
  state.tipsOpen = false;
  el.tipsDrawer.classList.remove('open');
  el.tipsDrawer.setAttribute('aria-hidden', 'true');
  // Re-enable the background.
  if (el.stepview) el.stepview.inert = false;
  if (wasOpen) {
    if (tipsLastFocus && typeof tipsLastFocus.focus === 'function') tipsLastFocus.focus();
    else if (el.tipsBtn) el.tipsBtn.focus();
  }
  tipsLastFocus = null;
}

function toggleTips() {
  if (state.tipsOpen) closeTips();
  else openTips();
}

// ---------------------------------------------------------------------------
// Swipe handling on the step view.
//  - swipe LEFT  -> next()
//  - swipe RIGHT -> intentionally NOT mapped. The OS/browser edge-back gesture
//    (iOS Safari / Android Chrome history-back) wins that event chain, so an
//    in-app prev() mapping was unreliable and could eject the user from the app.
//    Backward navigation is via the explicit Back button / ArrowRight key.
// A full-screen TAP never advances (no click-to-next on the view).
// Swipes that start inside interactive controls (Tips/Back/Next/drawer) are
// ignored so the gesture layer can't fight the buttons.
// ---------------------------------------------------------------------------
const SWIPE_MIN_X = 45; // px horizontal travel to count as a swipe
const SWIPE_MAX_OFF_AXIS = 0.6; // |dy| must be < 0.6 * |dx| (mostly horizontal)

let touch = { active: false, startX: 0, startY: 0, ignore: false };

function isInteractiveTarget(target) {
  if (!(target instanceof Element)) return false;
  return !!target.closest(
    '#tips-drawer, #tips-btn, #back-btn, #home-btn, #next-zone, button, a, input, textarea, select'
  );
}

function onTouchStart(e) {
  if (state.tipsOpen) { touch.active = false; return; }
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
  if (touch.ignore || state.tipsOpen) return;

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
  // City landing: delegate city-button taps (active cities carry data-city-id;
  // coming-soon cards have none and are inert).
  if (el.citiesList) {
    el.citiesList.addEventListener('click', (e) => {
      const card = e.target instanceof Element
        ? e.target.closest('.city-card[data-city-id]')
        : null;
      if (!card) return;
      selectCity(card.getAttribute('data-city-id'));
    });
  }

  // Back-to-cities (from the situation view) and Home (from the step view).
  if (el.backToCitiesBtn) {
    el.backToCitiesBtn.addEventListener('click', (e) => {
      e.preventDefault();
      backToCities();
    });
  }
  if (el.homeBtn) {
    el.homeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      backToHome();
    });
  }

  // Picker: delegate card taps (tap 1 -> enter step view).
  if (el.pickerCards) {
    el.pickerCards.addEventListener('click', (e) => {
      const card = e.target instanceof Element
        ? e.target.closest('.situation-card[data-situation-id]')
        : null;
      if (!card) return;
      const id = card.getAttribute('data-situation-id');
      selectSituation(id);
    });
  }

  // Explicit forward control — the ONLY tap target that advances.
  if (el.nextZone) {
    el.nextZone.addEventListener('click', (e) => {
      e.preventDefault();
      next();
    });
  }

  // Explicit back control.
  if (el.backBtn) {
    el.backBtn.addEventListener('click', (e) => {
      e.preventDefault();
      prev();
    });
  }

  // Tips drawer controls (never mutate the step index).
  if (el.tipsBtn) {
    el.tipsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleTips();
    });
  }
  if (el.tipsClose) {
    el.tipsClose.addEventListener('click', (e) => {
      e.preventDefault();
      closeTips();
    });
  }
  if (el.tipsDrawer) {
    // Tapping the dimmed backdrop (the drawer container itself) closes it,
    // but taps inside the drawer panel do not.
    el.tipsDrawer.addEventListener('click', (e) => {
      if (e.target === el.tipsDrawer) closeTips();
    });
  }

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

  // Keyboard parity (desktop / accessibility) — arrows + Escape.
  document.addEventListener('keydown', (e) => {
    if (el.stepview && el.stepview.hidden) return; // only in step view
    if (e.key === 'Escape' && state.tipsOpen) {
      closeTips();
      return;
    }
    // Focus trap: while the dialog is open, keep Tab focus inside the drawer.
    if (state.tipsOpen && e.key === 'Tab' && el.tipsDrawer) {
      const focusable = el.tipsDrawer.querySelectorAll(
        'button, a[href], input, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length > 0) {
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
    }
    if (state.tipsOpen) return; // don't navigate behind an open drawer
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
    renderCities();
    setView('cityview');
    closeTips();
    maybeShowIosHint();
    wireEvents();
    registerServiceWorker();
  } catch (err) {
    // Aim for zero uncaught console errors — log and keep the shell usable.
    console.error('Travel Encounters Playbook failed to initialize:', err);
  }
}

bootstrap();
