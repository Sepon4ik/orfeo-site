import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { CAMERA, RENDERER, MATERIAL, LIGHTS, SCROLL, ANIMATION, TORUS_BOUNDS } from './config.js';
import { createGeometry, updateTorusSlinky } from './torus.js';

let scene, camera, renderer, mesh, geo, orbitLights, scrollState;
let coilPhase = 0;
let mx = 0, my = 0;
let smoothMx = 0, smoothMy = 0;

/**
 * Initialize the Three.js scene, camera, renderer, and objects
 * @returns {object} { scene, camera, renderer, mesh, geo, orbitLights, scrollState }
 */
export function init() {
  // ——— Renderer ———
  const canvas = document.getElementById('three-canvas');
  if (!canvas) {
    throw new Error('Canvas element with id "three-canvas" not found');
  }

  renderer = new THREE.WebGLRenderer({ canvas, antialias: RENDERER.antialias });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, RENDERER.pixelRatio));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = RENDERER.toneMappingExposure;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(RENDERER.backgroundColor, 1);

  // ——— Scene ———
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x08081a);

  // ——— Camera ———
  camera = new THREE.PerspectiveCamera(
    CAMERA.fov,
    window.innerWidth / window.innerHeight,
    CAMERA.near,
    CAMERA.far
  );
  camera.position.set(
    CAMERA.position.x,
    CAMERA.position.y,
    CAMERA.position.z
  );
  camera.lookAt(0, 0, 0);

  // ——— RoomEnvironment (studio reflections) ———
  const pmrem = new THREE.PMREMGenerator(renderer);
  const roomEnv = new RoomEnvironment(renderer);
  scene.environment = pmrem.fromScene(roomEnv).texture;
  roomEnv.dispose();

  // ——— Directional Lights ———
  for (const lightConfig of LIGHTS.directional) {
    const light = new THREE.DirectionalLight(lightConfig.color, lightConfig.intensity);
    light.position.set(lightConfig.position.x, lightConfig.position.y, lightConfig.position.z);
    scene.add(light);
  }

  // ——— Ambient Light ———
  scene.add(new THREE.AmbientLight(LIGHTS.ambient.color, LIGHTS.ambient.intensity));

  // ——— Orbiting Colored Lights ———
  orbitLights = [];
  for (const lightConfig of LIGHTS.orbiting) {
    const light = new THREE.PointLight(lightConfig.color, lightConfig.intensity, lightConfig.distance);
    scene.add(light);
    orbitLights.push({
      light: light,
      radius: lightConfig.radius,
      speed: lightConfig.speed,
      offsetY: lightConfig.offsetY,
      phase: lightConfig.phase,
    });
  }

  // ——— Material ———
  const mat = new THREE.MeshPhysicalMaterial({
    color: MATERIAL.color,
    metalness: MATERIAL.metalness,
    roughness: MATERIAL.roughness,
    clearcoat: MATERIAL.clearcoat,
    clearcoatRoughness: MATERIAL.clearcoatRoughness,
    reflectivity: MATERIAL.reflectivity,
    envMapIntensity: MATERIAL.envMapIntensity,
    ior: MATERIAL.ior,
    iridescence: MATERIAL.iridescence,
    iridescenceIOR: MATERIAL.iridescenceIOR,
    iridescenceThicknessRange: MATERIAL.iridescenceThicknessRange,
  });

  // ——— Torus Geometry and Mesh ———
  geo = createGeometry();
  mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);

  // ——— Scroll Animation State ———
  scrollState = {
    rotX: SCROLL.initial.rotX,
    rotY: SCROLL.initial.rotY,
    rotZ: SCROLL.initial.rotZ,
    scale: SCROLL.initial.scale,
    posX: SCROLL.initial.posX,
    posY: SCROLL.initial.posY,
    camY: SCROLL.initial.camY,
    camZ: SCROLL.initial.camZ,
  };

  // ——— Mouse Parallax Event Listener ———
  document.addEventListener('mousemove', (e) => {
    mx = (e.clientX / window.innerWidth - 0.5) * ANIMATION.mouseInfluenceX;
    my = (e.clientY / window.innerHeight - 0.5) * ANIMATION.mouseInfluenceY;
  });

  // ——— Resize Event Listener ———
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return { scene, camera, renderer, mesh, geo, orbitLights, scrollState };
}

/**
 * Get the scroll state object for external manipulation (e.g., GSAP ScrollTrigger)
 * @returns {object} scrollState object
 */
export function getScrollState() {
  return scrollState;
}

/**
 * Main animation loop — calls itself via requestAnimationFrame
 */
export function animate() {
  requestAnimationFrame(animate);

  // Coil spiral animation + flower breathing
  coilPhase += ANIMATION.coilPhaseSpeed;
  const breathe = (Math.sin(performance.now() * ANIMATION.breatheSpeed) * 0.5 + 0.5);
  updateTorusSlinky(coilPhase, breathe);
  geo.attributes.position.needsUpdate = true;
  geo.computeVertexNormals();
  geo.attributes.normal.needsUpdate = true;

  // Animate orbiting colored lights
  const t = performance.now() * 0.001;
  for (const ol of orbitLights) {
    const angle = t * ol.speed + ol.phase;
    ol.light.position.set(
      Math.cos(angle) * ol.radius,
      ol.offsetY + Math.sin(angle * 0.7) * 0.5,
      Math.sin(angle) * ol.radius
    );
  }

  // Mouse parallax — gentle lerp
  smoothMx += (mx - smoothMx) * ANIMATION.mouseLerpFactor;
  smoothMy += (my - smoothMy) * ANIMATION.mouseLerpFactor;

  // Soft lerp on top of GSAP scrub for buttery elastic motion
  const L = ANIMATION.meshLerpFactor;

  mesh.rotation.x += (scrollState.rotX + smoothMy * ANIMATION.mouseRotationInfluence - mesh.rotation.x) * L;
  mesh.rotation.y += (scrollState.rotY + smoothMx * ANIMATION.mouseRotationInfluence - mesh.rotation.y) * L;
  mesh.rotation.z += (scrollState.rotZ - mesh.rotation.z) * L;

  // ——— Safety clamps: torus must NEVER hide off-screen ———
  // Scale: never below scaleMin (would make torus invisible) or above scaleMax (clips frustum)
  const safeScale = Math.min(
    TORUS_BOUNDS.scaleMax,
    Math.max(TORUS_BOUNDS.scaleMin, scrollState.scale)
  );

  // Position: viewport-aware clamp. Compute visible half-width/height at the
  // current camera Z, then keep mesh center within `viewportMargin` of bounds.
  // На мобильном с узким aspect это автоматически прижимает торус к центру.
  const fovRad = (camera.fov * Math.PI) / 180;
  const targetCamZ = scrollState.camZ; // use target, not current, for stability
  const halfH = Math.tan(fovRad * 0.5) * targetCamZ;
  const halfW = halfH * camera.aspect;
  const maxX = halfW * TORUS_BOUNDS.viewportMargin;
  const maxY = halfH * TORUS_BOUNDS.viewportMargin;
  const safeX = Math.max(-maxX, Math.min(maxX, scrollState.posX));
  const safeY = Math.max(-maxY, Math.min(maxY, scrollState.posY));

  mesh.scale.x += (safeScale - mesh.scale.x) * L;
  mesh.scale.y += (safeScale - mesh.scale.y) * L;
  mesh.scale.z += (safeScale - mesh.scale.z) * L;

  mesh.position.x += (safeX - mesh.position.x) * L;
  mesh.position.y += (safeY - mesh.position.y) * L;

  camera.position.y += (scrollState.camY - camera.position.y) * L;
  camera.position.z += (scrollState.camZ - camera.position.z) * L;
  camera.lookAt(mesh.position);

  renderer.render(scene, camera);
}
