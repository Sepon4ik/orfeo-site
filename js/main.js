/**
 * main.js — Entry point
 * Initializes all modules in the correct order.
 *
 * Module load order matters:
 * 1. Scene (Three.js) — creates 3D canvas, returns scrollState
 * 2. Scroll animations (GSAP) — binds scroll to scrollState
 * 3. Components — UI interactions (subtitle, button)
 * 4. Effects — visual extras (grain)
 */

import { init as initScene, animate as startRenderLoop, getScrollState } from './scene.js';
import { init as initScrollAnim } from './scroll-anim.js';
import { init as initSubtitleRotator } from './components/subtitle-rotator.js';
import { init as initMagneticButton } from './components/magnetic-button.js';
import { init as initGrain } from './effects/grain.js';
import { init as initFullpage } from './fullpage.js';

// --- Boot sequence ---

// 1. Initialize Three.js scene
const sceneContext = initScene();

// 2. Set up GSAP scroll-driven animations
const scrollState = getScrollState();
initScrollAnim(scrollState);

// 3. Initialize interactive components
initSubtitleRotator();
initMagneticButton();

// 4. Initialize visual effects
initGrain();

// 5. Initialize fullpage scroll (1 scroll = 1 section)
initFullpage();

// 6. Start the render loop (must be last — everything is ready)
startRenderLoop();

console.log('[AI Agency] All modules initialized.');
