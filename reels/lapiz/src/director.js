// Choreography: camera, pencil, scissors, slab and light for every instant t.
import * as THREE from 'three';
import { clamp, lerp, prog, eio, eo, eo5, ei, move, smooth, noise1 } from './util.js';
import { T, DOT } from './timing.js';
import { WIRE, WEBPATH } from './screen.js';
import { PENCIL, SCREEN } from './scene.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const T0 = V(0, 62, 8);                       // tip position in the hook
const PD = V(0, 0.36, (DOT.y - SCREEN.h / 2) / (SCREEN.h / 146)); // where it touches the sheet
const A0 = V(0.45, 0.6, -0.66).normalize();   // pencil axis in the hook
const A1 = V(0.44, 0.76, -0.36).normalize();  // touching the paper
const AD = V(0.52, 0.70, 0.50).normalize();   // drawing / writing, seen from above
const CUT = 12.0, LPIV = 40, RC = CUT * PENCIL.k;
export const distAt = (t) => 0.2 + 13.8 * Math.pow(1 - clamp(t / T.freeze), 1.3);

// camera keys: [t, pos, target, aperture, fov]
const add = (a, b) => a.clone().add(b);
const KEYS = [
  [0.0, add(T0, V(34, 12, 196)), add(T0, V(15, -8, 0)), 12, 28],
  [T.freeze, add(T0, V(6, 4, 60)), add(T0, V(0.5, -3.0, 0)), 46, 28],
  [T.unfreeze, add(T0, V(6, 4, 60)), add(T0, V(0.5, -3.0, 0)), 46, 28],
  [T.withdraw, add(T0, V(15, 8, 78)), add(T0, V(1.5, -3.6, 0)), 40, 28],
  [T.lower + 0.2, add(T0, V(34, 22, 150)), add(T0, V(0, -14, 0)), 26, 28],
  [T.touch, add(PD, V(58, 42, 130)), add(PD, V(2, 13, 0)), 20, 28],
  [T.rise + 0.2, add(PD, V(52, 48, 124)), add(PD, V(2, 13, 0)), 20, 28],
  [T.rise + 1.15, V(30, 300, 190), V(0, 0, 14), 14, 28],
  [T.morph0, V(0, 572, 66), V(0, 0, 14), 7, 28],
  [T.wake, V(0, 580, 58), V(0, 0, 13), 6, 28],
  [T.foot0, V(4, 578, 60), V(0, 0, 13), 6, 28],
  [T.foot1 + 0.2, V(0, 500, 74), V(0, 0, 26), 6, 28],
  [T.sum0, V(0, 500, 74), V(0, 0, 26), 6, 28],
  [T.sum0 + 0.7, V(0, 580, 58), V(0, 0, 13), 6, 28],
  [T.tap2 + 0.3, V(0, 580, 58), V(0, 0, 13), 6, 28],
  [T.blank0 - 0.2, V(-6, 470, 40), V(0, 0, -10), 7, 28],
  [T.draw0, V(-10, 560, 80), V(0, 0, 12), 7, 28],
  [T.draw1, V(-6, 552, 74), V(0, 0, 12), 7, 28],
  [T.real0 + 0.9, V(0, 425, 50), V(0, 0, 3), 6, 28],
  [T.out0, V(4, 410, 46), V(0, 0, 3), 6, 28],
  [T.paper1 + 0.1, V(0, 540, 96), V(0, 0, 38), 7, 28],
  [T.end0, V(-4, 528, 92), V(0, 0, 38), 7, 28],
  [T.end, V(-6, 560, 96), V(0, 0, 38), 7, 28],
];
function camAt(t) {
  let i = 0; while (i < KEYS.length - 2 && t >= KEYS[i + 1][0]) i++;
  const a = KEYS[i], b = KEYS[i + 1];
  let f = prog(t, a[0], b[0]);
  f = i === 0 ? Math.pow(f, 0.92) : eio(f);     // the hook push never eases to a stop early
  return { pos: a[1].clone().lerp(b[1], f), tgt: a[2].clone().lerp(b[2], f), aper: lerp(a[3], b[3], f), fov: lerp(a[4], b[4], f) };
}
const slerpDir = (a, b, f) => { const q = new THREE.Quaternion().setFromUnitVectors(a, b); return a.clone().applyQuaternion(new THREE.Quaternion().slerp(q, f)); };

export function direct(t, { world, screen, overlay }) {
  const { camera, slab, pencil, scissors, glint } = world;
  // ----- world time (the freeze really stops the dust) -----
  const wt = t < T.freeze ? t : t < T.unfreeze ? T.freeze : T.freeze + (t - T.unfreeze);
  const c0 = camAt(t);
  // ----- slab -----
  const m = smooth(t, T.morph0, T.morph1) * (1 - smooth(t, T.out0 + 0.25, T.paper1));
  const lit = eo(prog(t, T.wake, T.wake + 0.45)) * (1 - smooth(t, T.out0, T.out0 + 0.8));
  slab.userData.set(m, t < T.wake ? 0 : Math.max(lit, t < T.out0 + 0.8 ? 0.001 : 0));
  slab.updateMatrixWorld(true);
  screen.draw(t, slab.userData.size);
  world.screenTex.needsUpdate = true; slab.userData.sheenTex.offset.set(c0.pos.x * 0.004 + t * 0.006, 0);
  world.screenLight.intensity = lit * 1.3 * m;
  world.key.intensity = lerp(5.2, 3.4, m);

  // ----- pencil -----
  let tip = T0.clone(), axis = A0.clone(), roll = 0, pencilOn = true;
  if (t < T.lower) { /* hook pose, a breath of life after the freeze */
    const b = t > T.unfreeze ? (t - T.unfreeze) : 0; tip.y += Math.sin(b * 1.3) * 0.12 * Math.min(1, b);
  } else if (t < T.touch + 0.7) {
    const f = eio(prog(t, T.lower, T.touch));
    tip = T0.clone().lerp(PD, f); tip.y += Math.sin(f * Math.PI) * 6;
    axis = slerpDir(A0, A1, f);
    if (t > T.touch) tip.y -= 0.12 * Math.sin(prog(t, T.touch, T.touch + 0.3) * Math.PI); // presses
  } else if (t < T.morph0) {
    const f = ei(prog(t, T.touch + 0.7, T.rise + 1.5)), g = eio(prog(t, T.touch + 0.7, T.rise + 1.7));
    tip = PD.clone().lerp(V(250, 150, -40), g); tip.y = lerp(PD.y, 150, eo(prog(t, T.touch + 0.7, T.rise + 1.2)));
    axis = slerpDir(A1, V(0.8, 0.5, 0.2).normalize(), f);
  } else if (t > T.draw0 - 0.75 && t < T.real0 + 0.9) {
    const p = prog(t, T.draw0, T.draw1), q = WIRE.tip(p);
    const on = slab.userData.toWorld(q.x, q.y, 0.25 + q.lift * 5);
    const fin = eo5(prog(t, T.draw0 - 0.75, T.draw0)), fout = ei(prog(t, T.draw1 + 0.1, T.real0 + 0.9));
    const far = V(260, 120, 150);
    tip = far.clone().lerp(on, fin).lerp(V(280, 160, 120), fout);
    tip.y += Math.sin(fin * Math.PI) * 30 * (1 - fin);
    axis = AD.clone(); axis.x += Math.sin(t * 11) * 0.012 * (q.down ? 1 : 0); axis.normalize();
  } else if (t > T.write0 - 0.8) {
    const p = prog(t, T.write0, T.write1), q = WEBPATH.tip(p);
    const on = V(q.x, 0.36 + q.lift * 4, q.y);
    const fin = eo5(prog(t, T.write0 - 0.8, T.write0)), fout = eio(prog(t, T.write1 + 0.1, T.write1 + 1.1));
    tip = V(260, 120, 150).lerp(on, fin).lerp(V(300, 150, 60), fout);
    axis = AD.clone(); axis.x += Math.sin(t * 13) * 0.014 * (q.down ? 1 : 0); axis.normalize();
  } else pencilOn = false;
  pencil.visible = pencilOn; world.setPencil(tip, axis, c0.pos.clone().sub(tip), roll);

  // ----- scissors -----
  const sOn = t < T.lower + 0.5; scissors.visible = sOn;
  if (sOn) {
    const d = distAt(t);
    const w = ei(prog(t, T.withdraw, T.lower + 0.4));                 // withdraw
    const alpha = Math.asin((d + RC) / LPIV) + w * 0.42;
    const P = T0.clone().addScaledVector(A0, CUT);
    const u = V(-1, 0.16, -0.1);
    const fr = world.setScissors(P, A0, u, LPIV, alpha);
    scissors.position.addScaledVector(fr.x, -w * 330).addScaledVector(V(0, 1, 0), w * 30);
    // glint travelling along the near blade's ground edge
    const g1 = prog(t, 0.9, 2.6), g2 = prog(t, T.freeze - 0.25, T.freeze + 0.9);
    const blade = scissors.userData.A.children[0];
    const gx = t < 3 ? lerp(10, 52, eio(g1)) : 38.5;
    const gp = blade.localToWorld(V(gx, 1.3, 1.2));
    glint.position.copy(gp);
    const ga = Math.sin(g1 * Math.PI) * 0.9 + Math.sin(g2 * Math.PI) ** 0.6 * 1.0 * (g2 > 0 && g2 < 1 ? 1 : 0);
    glint.material.opacity = clamp(ga) * (1 - w); const gs = (4 + ga * 5) * glint.position.distanceTo(c0.pos) / 100; glint.scale.set(gs, gs, 1);
  } else glint.material.opacity = 0;

  // ----- camera -----
  const c = camAt(t);
  const live = t < T.freeze ? 1 : t < T.unfreeze ? 0 : Math.min(1, (t - T.unfreeze) * 0.6);
  const sw = (c.pos.y > 300 ? 3.5 : 0.5) * live;
  c.pos.x += noise1(wt * 0.33 + 3) * sw; c.pos.z += noise1(wt * 0.27 + 9) * sw; c.pos.y += noise1(wt * 0.21 + 5) * sw * 0.6;
  camera.position.copy(c.pos); camera.fov = c.fov; camera.up.set(0, 1, 0);
  // near top-down: keep "up" pointing to the top of the phone
  const topness = smooth(t, T.rise + 0.4, T.morph0); camera.up.set(0, 1 - topness, -topness).normalize();
  camera.lookAt(c.tgt); camera.updateProjectionMatrix(); camera.updateMatrixWorld(true);
  // focus: pencil tip while it is the subject, otherwise the slab surface
  const fwd = new THREE.Vector3(); camera.getWorldDirection(fwd);
  const fTip = tip.clone().sub(c.pos).dot(fwd), fSlab = V(0, slab.userData.size.t, 10).sub(c.pos).dot(fwd);
  const fk = smooth(t, T.rise, T.morph0 - 0.4);
  const focus = lerp(fTip, fSlab, fk);
  const endBlur = smooth(t, T.end0, T.end0 + 0.9);

  const flash = t >= T.freeze ? Math.max(0, 1 - (t - T.freeze) / 0.22) * 0.09 : 0;
  const frz = t >= T.freeze && t < T.unfreeze ? 1 : t >= T.unfreeze ? 1 - prog(t, T.unfreeze, T.unfreeze + 0.6) : 0;
  world.render({ dustTime: wt, focus, aperture: c.aper + endBlur * 60, seed: (Math.floor(t * 30) % 97) / 97, sat: 1 - frz * 0.35, expo: (1 - frz * 0.18) * (1 - endBlur * 0.8), flash, vig: 1, dustGain: lerp(1.5, 0.22, Math.max(m, smooth(t, T.rise + 0.4, T.morph0) * 0.6)) });

  // ----- overlay -----
  const proj = (p) => { const q = p.clone().project(camera); return { x: (q.x * 0.5 + 0.5) * 1080, y: (-q.y * 0.5 + 0.5) * 1920 }; };
  overlay.update(t, { big: smooth(t, T.real0, T.real0 + 0.9) * (1 - smooth(t, T.out0, T.out0 + 0.6)), dist: distAt(t), cut: proj(T0.clone().addScaledVector(A0, CUT)), tip: proj(tip), dot: proj(PD), m, lit,
    phone: { tl: proj(slab.userData.toWorld(0, 0)), br: proj(slab.userData.toWorld(SCREEN.w, SCREEN.h)) },
    row0: proj(slab.userData.toWorld(330, 408)) });
}
