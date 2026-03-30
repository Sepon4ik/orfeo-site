/**
 * fullpage.js — One scroll = one section
 *
 * How it works:
 * - Intercepts wheel / touch / keyboard events
 * - Each gesture scrolls exactly 1 viewport-height (100vh)
 * - Tall sections (e.g. works 400vh) get multiple stops
 * - During animation, all input is ignored (no cooldown timer needed)
 * - Real scrollY changes → GSAP ScrollTrigger keeps working
 *
 * Trackpad handling:
 * - Trackpads fire many small wheel events per gesture
 * - We accumulate deltaY and only fire once per gesture
 * - A gesture ends when events stop arriving for 80ms
 */

/** Configuration */
const DURATION = 0.9;              // scroll animation duration (seconds)
const TRACKPAD_DEBOUNCE = 80;      // ms — gap that signals "gesture ended"
const TOUCH_THRESHOLD = 40;        // min swipe distance (px)

/** State */
let stops = [];
let currentStop = 0;
let isAnimating = false;

// Trackpad debounce state
let wheelAccum = 0;
let wheelTimer = null;

// Touch state
let touchStartY = 0;

/**
 * Build snap-stop positions.
 * Each 100vh slice of every section = 1 stop.
 */
function buildStops() {
  const sections = document.querySelectorAll('.scroll-container > section');
  const vh = window.innerHeight;
  stops = [];

  sections.forEach(sec => {
    const top = sec.offsetTop;
    const height = sec.offsetHeight;
    const count = Math.max(1, Math.round(height / vh));

    for (let i = 0; i < count; i++) {
      stops.push(top + i * vh);
    }
  });

  console.log(`[Fullpage] ${stops.length} stops`);
}

/**
 * Closest stop to current scroll position
 */
function getClosestStop() {
  const y = window.scrollY;
  let best = 0, bestDist = Infinity;
  stops.forEach((pos, i) => {
    const d = Math.abs(pos - y);
    if (d < bestDist) { bestDist = d; best = i; }
  });
  return best;
}

/**
 * Which section contains the current stop?
 */
function getCurrentSection() {
  const y = stops[currentStop] ?? 0;
  const sections = document.querySelectorAll('.scroll-container > section');
  for (const sec of sections) {
    if (y >= sec.offsetTop && y < sec.offsetTop + sec.offsetHeight) return sec;
  }
  return null;
}

/**
 * Can the current section scroll internally? (e.g. contact form)
 */
function canScrollInside(dir) {
  const sec = getCurrentSection();
  if (!sec) return false;
  const ov = getComputedStyle(sec).overflowY;
  if (ov !== 'auto' && ov !== 'scroll') return false;
  if (sec.scrollHeight <= sec.clientHeight + 2) return false;

  return dir > 0
    ? sec.scrollTop + sec.clientHeight < sec.scrollHeight - 2
    : sec.scrollTop > 2;
}

/**
 * Animate to a stop index
 */
function goTo(index, dur = DURATION) {
  if (index < 0 || index >= stops.length || isAnimating) return;

  isAnimating = true;
  currentStop = index;

  gsap.to(window, {
    scrollTo: { y: stops[index], autoKill: false },
    duration: dur,
    ease: 'power2.inOut',
    onComplete() { isAnimating = false; },
  });
}

/**
 * Navigate one step in given direction
 */
function step(dir) {
  if (isAnimating) return;
  if (canScrollInside(dir)) return;

  const next = currentStop + dir;
  if (next >= 0 && next < stops.length) goTo(next);
}

// ─── Wheel (mouse + trackpad) ───────────────────────────────────
function onWheel(e) {
  const dir = e.deltaY > 0 ? 1 : -1;

  // Let scrollable sections handle their own scroll
  if (canScrollInside(dir)) return;

  e.preventDefault();
  if (isAnimating) return;

  // Accumulate delta (handles both mouse wheel and trackpad inertia)
  wheelAccum += e.deltaY;

  // Reset debounce timer — fires when gesture "settles"
  clearTimeout(wheelTimer);
  wheelTimer = setTimeout(() => {
    if (Math.abs(wheelAccum) > 5) {
      step(wheelAccum > 0 ? 1 : -1);
    }
    wheelAccum = 0;
  }, TRACKPAD_DEBOUNCE);
}

// ─── Touch ──────────────────────────────────────────────────────
function onTouchStart(e) {
  touchStartY = e.touches[0].clientY;
}

function onTouchEnd(e) {
  const diff = touchStartY - e.changedTouches[0].clientY;
  if (Math.abs(diff) < TOUCH_THRESHOLD) return;
  const dir = diff > 0 ? 1 : -1;
  if (!canScrollInside(dir)) step(dir);
}

// ─── Keyboard ───────────────────────────────────────────────────
function onKeyDown(e) {
  switch (e.key) {
    case 'ArrowDown': case 'PageDown': case ' ':
      e.preventDefault(); step(1); break;
    case 'ArrowUp': case 'PageUp':
      e.preventDefault(); step(-1); break;
    case 'Home':
      e.preventDefault(); goTo(0); break;
    case 'End':
      e.preventDefault(); goTo(stops.length - 1); break;
  }
}

// ─── Init ───────────────────────────────────────────────────────
export function init() {
  buildStops();
  if (!stops.length) return;

  gsap.registerPlugin(ScrollToPlugin);
  currentStop = getClosestStop();

  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchend', onTouchEnd, { passive: false });
  window.addEventListener('keydown', onKeyDown);

  let rTimer;
  window.addEventListener('resize', () => {
    clearTimeout(rTimer);
    rTimer = setTimeout(() => {
      buildStops();
      currentStop = getClosestStop();
      goTo(currentStop, 0.25);
    }, 200);
  });
}
