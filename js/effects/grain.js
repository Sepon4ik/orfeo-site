import { GRAIN } from '../config.js';

export function init() {
  const gc = document.getElementById('grain-canvas');
  const ctx = gc.getContext('2d');
  const W = window.innerWidth;
  const H = window.innerHeight;
  gc.width = W;
  gc.height = H;

  // Pre-generate random noise frames and cycle through them with random offset
  const frames = [];
  const fCount = GRAIN.frameCount;
  for (let f = 0; f < fCount; f++) {
    const imgData = ctx.createImageData(W, H);
    const buf32 = new Uint32Array(imgData.data.buffer);
    for (let i = 0, len = buf32.length; i < len; i++) {
      const r = Math.random();
      const v = r < 0.5 ? 0 : (r < 0.93 ? (Math.random() * 30)|0 : (60 + Math.random() * 160)|0);
      buf32[i] = 0xFF000000 | (v << 16) | (v << 8) | v;
    }
    frames.push(imgData);
  }

  let fi = 0;
  function noise() {
    // Cycle through pre-generated frames — each is fully random, no sequential artifacts
    ctx.putImageData(frames[fi], 0, 0);
    fi = (fi + 1) % fCount;
  }

  setInterval(noise, GRAIN.intervalMs);
  noise();
}
