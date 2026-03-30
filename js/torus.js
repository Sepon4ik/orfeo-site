import * as THREE from 'three';
import { TORUS } from './config.js';

// ——— Torus Slinky Geometry Constants ———
const RING = TORUS.coilSegments + 1;
const TOTAL_VERTS = (TORUS.pathSegments + 1) * RING;

// Position and normal arrays for the geometry
export const posArray = new Float32Array(TOTAL_VERTS * 3);
export const normArray = new Float32Array(TOTAL_VERTS * 3);

/**
 * Warps parameter t to create non-uniform distribution:
 * bottom (theta ~ PI) gets stretched, top compressed
 */
function warpT(t) {
  return t + TORUS.asymmetry * Math.sin(t * Math.PI * 2) / (Math.PI * 2);
}

/**
 * Updates the torus slinky geometry with coil animation and breathing effect
 * @param {number} phase - Rotation phase of the coil spiral
 * @param {number} breathe - Breathing factor (0..1), 0 = fully open, 1 = fully folded inward
 */
export function updateTorusSlinky(phase, breathe) {
  // breathe: 0..1 value — 0 = fully open, 1 = fully folded inward
  const breatheScale = 1 - breathe * 0.25; // coil radius shrinks gently ~25% at peak

  let vi = 0, ni = 0;
  for (let i = 0; i <= TORUS.pathSegments; i++) {
    const t = i / TORUS.pathSegments;
    const wt = warpT(t);
    const theta = t * Math.PI * 2;
    const phi = wt * TORUS.numCoils * Math.PI * 2 + phase;
    const cosPhi = Math.cos(phi), sinPhi = Math.sin(phi);
    const cosT = Math.cos(theta), sinT = Math.sin(theta);

    // Breathe wave travels around the ring — creates "flower folding" effect
    const breatheWave = Math.sin(theta - breathe * Math.PI * 2) * 0.5 + 0.5;
    const localBreathe = breatheScale + (1 - breatheScale) * breatheWave * 0.5;

    const bottomFactor = (-sinT * 0.5 + 0.5);
    const localCoilR = (TORUS.coilRadiusMin + (TORUS.coilRadiusMax - TORUS.coilRadiusMin) * bottomFactor
      + 0.04 * Math.sin(theta * 3 + phase * 0.3)) * localBreathe;

    const cx = (TORUS.radius + localCoilR * cosPhi) * cosT;
    const cy = localCoilR * sinPhi;
    const cz = (TORUS.radius + localCoilR * cosPhi) * sinT;

    const t2 = (i + 1) / TORUS.pathSegments;
    const wt2 = warpT(t2);
    const th2 = t2 * Math.PI * 2, ph2 = wt2 * TORUS.numCoils * Math.PI * 2 + phase;
    const sinT2 = Math.sin(th2), cosT2 = Math.cos(th2);
    const bf2 = (-sinT2 * 0.5 + 0.5);
    const breatheWave2 = Math.sin(th2 - breathe * Math.PI * 2) * 0.5 + 0.5;
    const localBreathe2 = breatheScale + (1 - breatheScale) * breatheWave2 * 0.5;
    const localCoilR2 = (TORUS.coilRadiusMin + (TORUS.coilRadiusMax - TORUS.coilRadiusMin) * bf2
      + 0.04 * Math.sin(th2 * 3 + phase * 0.3)) * localBreathe2;
    const nx = (TORUS.radius + localCoilR2 * Math.cos(ph2)) * cosT2;
    const ny = localCoilR2 * Math.sin(ph2);
    const nz = (TORUS.radius + localCoilR2 * Math.cos(ph2)) * sinT2;

    let tx = nx-cx, ty = ny-cy, tz = nz-cz;
    const tL = Math.sqrt(tx*tx+ty*ty+tz*tz)||1;
    tx/=tL; ty/=tL; tz/=tL;

    let rx = cx-TORUS.radius*cosT, ry = cy, rz = cz-TORUS.radius*sinT;
    const rL = Math.sqrt(rx*rx+ry*ry+rz*rz)||1;
    rx/=rL; ry/=rL; rz/=rL;

    let bx=ty*rz-tz*ry, by=tz*rx-tx*rz, bz=tx*ry-ty*rx;
    const bL=Math.sqrt(bx*bx+by*by+bz*bz)||1;
    bx/=bL; by/=bL; bz/=bL;

    let ux=by*tz-bz*ty, uy=bz*tx-bx*tz, uz=bx*ty-by*tx;
    const uL=Math.sqrt(ux*ux+uy*uy+uz*uz)||1;
    ux/=uL; uy/=uL; uz/=uL;

    // Wire slightly thicker at bottom for more volume
    const wireR = TORUS.wireRadius * (1 + bottomFactor * 0.3);

    for (let j = 0; j <= TORUS.coilSegments; j++) {
      const a = (j/TORUS.coilSegments)*Math.PI*2;
      const c=Math.cos(a), s=Math.sin(a);
      posArray[vi++]=cx+wireR*(c*ux+s*bx);
      posArray[vi++]=cy+wireR*(c*uy+s*by);
      posArray[vi++]=cz+wireR*(c*uz+s*bz);
      normArray[ni++]=c*ux+s*bx;
      normArray[ni++]=c*uy+s*by;
      normArray[ni++]=c*uz+s*bz;
    }
  }
}

/**
 * Creates the BufferGeometry for the torus slinky
 * @returns {THREE.BufferGeometry} The torus slinky geometry
 */
export function createGeometry() {
  updateTorusSlinky(0, 0);
  const idx=[];
  for(let i=0;i<TORUS.pathSegments;i++)for(let j=0;j<TORUS.coilSegments;j++){
    const a=i*RING+j, b=a+RING;
    idx.push(a,b,a+1,a+1,b,b+1);
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(posArray,3));
  g.setAttribute('normal',new THREE.BufferAttribute(normArray,3));
  g.setIndex(idx);
  return g;
}
