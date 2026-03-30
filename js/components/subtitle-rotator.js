import { SUBTITLE } from '../config.js';

export function init() {
  const phrases = document.querySelectorAll('#rotatingSubtitle .phrase');
  if (!phrases.length) return;

  const modes = ['vertical', 'horizontal'];
  let current = 0;

  // Set first phrase active immediately with vertical entry
  phrases[0].classList.add('enter-vertical');
  // Force reflow so the enter state applies before we add active
  phrases[0].offsetHeight;
  phrases[0].classList.add('active');
  phrases[0].classList.remove('enter-vertical');

  function next() {
    const modeIndex = current % 2;       // alternates 0,1,0,1…
    const exitMode = modes[modeIndex];    // current exits in same mode it entered
    const enterMode = modes[(modeIndex + 1) % 2]; // next enters in opposite mode

    const old = phrases[current];
    const nextIdx = (current + 1) % phrases.length;
    const fresh = phrases[nextIdx];

    // Exit current phrase
    old.classList.remove('active');
    old.classList.add('exit-' + exitMode);

    // Prepare next phrase at its entry position
    fresh.classList.add('enter-' + enterMode);
    fresh.offsetHeight; // reflow

    // Activate — CSS transition kicks in
    fresh.classList.add('active');
    fresh.classList.remove('enter-' + enterMode);

    // Clean up old phrase after transition ends
    setTimeout(() => {
      old.classList.remove('exit-' + exitMode);
    }, SUBTITLE.cleanupDelay);

    current = nextIdx;
  }

  setInterval(next, SUBTITLE.rotateInterval);
}
