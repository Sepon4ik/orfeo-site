/** ============================================
 *  SITE CONFIGURATION — All magic numbers & settings
 *  ============================================ */

/** Brand identity — single source of truth.
 *  Меняешь имя бренда здесь — и весь сайт обновляется через [data-brand].
 *  Никогда не хардкодь название бренда в index.html напрямую. */
export const BRAND = {
  name: 'ORFEO',
  tagline: 'AI студия одного оператора',
  founder: 'Павел Дранчук',
  contactEmail: 'paveldranchuk36@gmail.com', // TODO: заменить на hello@<домен> когда выберем
  geo: 'Польша · удалённо',
  langs: ['RU', 'EN'],
  responseTime: 'в течение 24 часов',
};

/** Torus slinky geometry parameters */
export const TORUS = {
  radius: 1.0,              // Main ring radius
  coilRadius: 0.35,         // Coil tube radius (base)
  wireRadius: 0.035,        // Wire thickness
  numCoils: 45,             // Total coils around the torus
  coilSegments: 48,         // Segments per coil loop
  pathSegments: 3072,       // Path segments along torus main ring
  asymmetry: 0.35,          // Non-uniform distribution (stretches bottom)
  coilRadiusMax: 0.48,      // Max coil radius at bottom
  coilRadiusMin: 0.25,      // Min coil radius at top
};

/** Camera initial position and settings */
export const CAMERA = {
  fov: 45,                  // Field of view in degrees
  near: 0.1,                // Near clipping plane
  far: 100,                 // Far clipping plane
  position: {
    x: 0,
    y: 0.6,
    z: 3.5,
  },
};

/** WebGL renderer configuration */
export const RENDERER = {
  antialias: true,          // Enable antialiasing
  pixelRatio: 2,            // Max device pixel ratio
  toneMappingExposure: 0.6, // Exposure for tone mapping
  backgroundColor: 0x08081a, // Dark background color
};

/** MeshPhysicalMaterial rendering properties */
export const MATERIAL = {
  color: 0x141420,          // Dark navy base color
  metalness: 1,             // Fully metallic surface
  roughness: 0.08,          // Very smooth, mirror-like
  clearcoat: 1,             // Full clearcoat for extra gloss
  clearcoatRoughness: 0.02, // Extremely smooth top layer
  reflectivity: 1,          // Full reflectivity
  envMapIntensity: 1.45,    // Environment map strength
  ior: 2.5,                 // Index of refraction (dense glass)
  iridescence: 0.6,         // Rainbow oil-slick effect intensity
  iridescenceIOR: 1.6,      // IOR for iridescent layer
  iridescenceThicknessRange: [200, 600], // Thickness range for iridescence (nanometers)
};

/** Directional and ambient lights */
export const LIGHTS = {
  ambient: {
    color: 0x0a0a18,        // Ambient light color
    intensity: 0.4,         // Ambient brightness
  },
  directional: [
    {
      color: 0xeeeeff,      // Warm white
      intensity: 3.5,
      position: { x: 3, y: 5, z: 4 },
    },
    {
      color: 0xccccee,      // Cool white
      intensity: 1.5,
      position: { x: -4, y: 3, z: -2 },
    },
    {
      color: 0xddddff,      // Cool white
      intensity: 2.5,
      position: { x: -1, y: -2, z: -5 },
    },
    {
      color: 0xddccbb,      // Warm white
      intensity: 0.8,
      position: { x: 3, y: -3, z: 2 },
    },
  ],
  orbiting: [
    {
      color: 0x8833ff,      // Purple
      intensity: 6,
      distance: 8,
      radius: 2.5,
      speed: 0.4,
      offsetY: 0.3,
      phase: 0,
    },
    {
      color: 0x00ccff,      // Cyan
      intensity: 5,
      distance: 8,
      radius: 2.8,
      speed: -0.3,
      offsetY: -0.2,
      phase: Math.PI * 0.66,
    },
    {
      color: 0xff2288,      // Magenta
      intensity: 4,
      distance: 8,
      radius: 2.2,
      speed: 0.5,
      offsetY: 0.1,
      phase: Math.PI * 1.33,
    },
    {
      color: 0x22ffaa,      // Green-teal
      intensity: 3,
      distance: 7,
      radius: 3.0,
      speed: -0.25,
      offsetY: -0.4,
      phase: Math.PI * 0.5,
    },
  ],
};

/** Initial scroll animation state (interpolated by GSAP) */
export const SCROLL = {
  initial: {
    rotX: -0.45,            // Rotation X: tilted toward viewer
    rotY: 0.25,             // Rotation Y: slight horizontal turn
    rotZ: -0.12,            // Rotation Z: right side drops down
    scale: 1,               // Scale multiplier
    posX: 0,                // Position X
    posY: 0.15,             // Position Y
    camY: 0.6,              // Camera height
    camZ: 3.5,              // Camera depth
  },
  scrub: 1.5,               // Scrub: lower = tighter follow, higher = elastic lag
  lerp: 0.055,              // Lerp constant for springy cushioning on top of scrub
};

/** Safety bounds — torus must NEVER hide off-screen.
 *  Applied as a clamp in scene.js animate() loop, viewport-aware.
 *  Любой keyframe ниже scaleMin или вне посX/Y bounds clampается на лету. */
export const TORUS_BOUNDS = {
  scaleMin: 0.55,           // Minimum visible scale — below this torus is "lost"
  scaleMax: 2.0,            // Cap to avoid clipping camera frustum / engulfing screen
  // viewportMargin = доля видимой полу-ширины/высоты, в которую разрешено заехать центру
  // 0.55 означает: центр торуса не дальше чем на 55% от центра к краю экрана
  viewportMargin: 0.55,
};

/** Scroll timeline keyframes (5 transitions between 6 sections).
 *
 *  RULES (нарушать = торус исчезает с экрана):
 *  • scale: всегда в [0.55, 2.0]
 *  • posX: в [-0.5, 0.5] — на мобильном с aspect ~0.5 это безопасно
 *  • posY: в [-0.5, 0.5]
 *  • Никаких "fly into portal" / "fly away" эффектов. Торус — всегда в кадре.
 */
export const SCROLL_KEYFRAMES = [
  // Hero → About: tilt, slight zoom, shift LEFT to give text room
  {
    rotX: 0.6,
    rotY: 1.8,
    rotZ: -0.05,
    scale: 1.4,
    posX: -0.35,
    posY: -0.05,
    camY: 0.4,
    camZ: 4.0,
    duration: 2,
  },
  // About → Works: shift to opposite (right) side, smaller — text dominates
  {
    rotX: 0.2,
    rotY: 3.6,
    rotZ: 0.1,
    scale: 0.75,
    posX: 0.42,
    posY: 0.18,
    camY: 0.4,
    camZ: 4.2,
    duration: 2,
  },
  // Works → Overview: return to center, gentle grow
  {
    rotX: -0.1,
    rotY: 5.5,
    rotZ: -0.08,
    scale: 1.15,
    posX: 0,
    posY: 0,
    camY: 0.4,
    camZ: 3.6,
    duration: 2,
  },
  // Overview → Web: small drift left, similar size
  {
    rotX: 0.15,
    rotY: 7.6,
    rotZ: 0.12,
    scale: 1.25,
    posX: -0.18,
    posY: 0,
    camY: 0.4,
    camZ: 3.5,
    duration: 2,
  },
  // Web → Contact: drift right + slight shrink — but never below scaleMin
  {
    rotX: 0.3,
    rotY: 9.4,
    rotZ: -0.18,
    scale: 0.8,
    posX: 0.28,
    posY: -0.1,
    camY: 0.45,
    camZ: 4.4,
    duration: 2,
  },
];

/** Animation speeds and timing */
export const ANIMATION = {
  coilPhaseSpeed: 0.01,     // Coil spiral animation increment per frame
  breatheSpeed: 0.0005,     // Breathing wave animation speed (performance.now() multiplier)
  mouseLerpFactor: 0.03,    // Mouse parallax smoothing
  meshLerpFactor: 0.045,    // Mesh position/rotation smoothing (springy cushion on scrub)
  mouseInfluenceX: 0.15,    // Mouse X influence on rotation
  mouseInfluenceY: 0.15,    // Mouse Y influence on rotation
  mouseRotationInfluence: 0.2, // Multiplier for mouse influence on mesh rotation
};

/** Rotating subtitle configuration */
export const SUBTITLE = {
  rotateInterval: 3000,     // Milliseconds between phrase rotations
  transitionDuration: 900,  // CSS transition duration in milliseconds (0.8s+ cleanup)
  cleanupDelay: 900,        // Delay before removing exit classes (ms)
  modes: ['vertical', 'horizontal'], // Animation modes alternating between phrases
};

/** Film grain overlay settings */
export const GRAIN = {
  frameCount: 4,            // Number of pre-generated noise frames
  intervalMs: 150,          // Milliseconds between frame updates
  opacity: 0.22,            // CSS opacity value from #grain-canvas
};
