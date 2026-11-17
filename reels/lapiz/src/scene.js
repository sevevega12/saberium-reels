// 3D world: desk, pencil, scissors, paper/phone slab, light, dust. Units: millimetres.
import * as THREE from 'three';
import { clamp, lerp, mulberry, hash } from './util.js';

const V3 = THREE.Vector3;
export const PENCIL = { len: 175, apothem: 3.45, corner: 3.9, k: 0.165, lead: 1.05, tipLen: 30 };
export const SCREEN = { w: 390, h: 844, scale: 2.5 };          // logical px of the phone screen canvas
export const PAPER = { w: 105, h: 148 };
export const PHONE = { w: 71, h: 150.6, t: 8, r: 11, bezel: 2.3 };

function canvasTex(w, h, draw, srgb = true) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

// ---------- environment (art-directed softboxes -> PMREM) ----------
function buildEnv(renderer) {
  const s = new THREE.Scene();
  s.background = new THREE.Color(0x020308);
  const box = (w, h, col, int, pos, look = [0, 0, 0]) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(int), side: THREE.DoubleSide }));
    m.position.set(...pos); m.lookAt(...look); s.add(m);
  };
  box(7, 4, 0xffffff, 7, [-5, 7, 3]);            // key softbox, upper left front
  box(1.2, 9, 0xbfd6ff, 5, [8, 2.5, 1]);         // tall strip right
  box(9, 1.0, 0x2a45ff, 6, [2, 1.2, -8]);        // electric blue strip behind
  box(5, 2.5, 0x9cc8ff, 1.6, [0, 9, -2]);        // soft top
  box(3, 3, 0xffe2c0, 2.2, [-8, 1.5, -3]);       // warm kicker
  box(30, 30, 0x0a0f2e, 0.35, [0, -6, 0]);       // desk bounce (night blue)
  box(6, 5, 0xdfe9ff, 3.2, [-5, -6.5, -1]);      // light-table bounce: what the blades' faces mirror
  box(2, 5, 0x4a66ff, 1.3, [-8, -3, 4]);
  const pm = new THREE.PMREMGenerator(renderer);
  const rt = pm.fromScene(s, 0.03);
  pm.dispose();
  return rt.texture;
}

// ---------- pencil ----------
function hexR(theta) {
  const a = ((theta % (Math.PI / 3)) + Math.PI / 3) % (Math.PI / 3) - Math.PI / 6;
  return Math.min(PENCIL.apothem / Math.cos(a), PENCIL.corner);
}
const coneR = (y) => Math.max(0.1 + y * 0.02, Math.min(y * PENCIL.k, 99) * (y < 0.6 ? 0.55 + 0.75 * y : 1));

function latheGrid(ys, nTheta, v0, v1) {
  const pos = [], uv = [], idx = [];
  for (let j = 0; j < ys.length; j++) {
    const y = ys[j];
    for (let i = 0; i <= nTheta; i++) {
      const th = (i / nTheta) * Math.PI * 2;
      const r = Math.min(hexR(th), coneR(y));
      pos.push(Math.cos(th) * r, y, Math.sin(th) * r);
      uv.push(i / nTheta, (y - v0) / (v1 - v0));
    }
  }
  const W = nTheta + 1;
  for (let j = 0; j < ys.length - 1; j++) for (let i = 0; i < nTheta; i++) {
    const a = j * W + i, b = a + 1, c = a + W, d = c + 1;
    idx.push(a, c, b, b, c, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
}

function tipTextures() {
  const W = 2048, H = 1024, TL = PENCIL.tipLen;
  const col = document.createElement('canvas'), orm = document.createElement('canvas'), cc = document.createElement('canvas');
  for (const c of [col, orm, cc]) { c.width = W; c.height = H; }
  const cx = col.getContext('2d'), ox = orm.getContext('2d'), kx = cc.getContext('2d');
  const ci = cx.createImageData(W, H), oi = ox.createImageData(W, H), ki = kx.createImageData(W, H);
  const rnd = mulberry(7);
  const fib = new Float32Array(W); for (let i = 0; i < W; i++) fib[i] = rnd();
  const fib2 = new Float32Array(256); for (let i = 0; i < 256; i++) fib2[i] = rnd();
  const sm = (arr, x) => { const n = arr.length, i = Math.floor(x), f = x - i; return lerp(arr[((i % n) + n) % n], arr[(((i + 1) % n) + n) % n], f * f * (3 - 2 * f)); };
  for (let py = 0; py < H; py++) {
    const y = (1 - py / H) * TL; // canvas top = v=1 (flipY)
    const cr = y * PENCIL.k;
    for (let px = 0; px < W; px++) {
      const th = (px / W) * Math.PI * 2;
      const hr = hexR(th);
      const n1 = sm(fib, px * 0.9 + y * 2.2) - 0.5, n2 = sm(fib2, px * 0.045 + Math.sin(y * 0.35) * 2.0) - 0.5;
      const leadEdge = PENCIL.lead + n2 * 0.05;
      let r, g, b, rough, metal, coat;
      if (cr < leadEdge) { // graphite
        const ring = 0.5 + 0.5 * Math.sin(y * 46 + n2 * 9);
        const v = 46 + n1 * 16 + ring * 9;
        r = v; g = v + 1; b = v + 5; rough = 0.34 + ring * 0.08 + n1 * 0.08; metal = 0.82; coat = 0;
        if (cr > leadEdge - 0.06) { r *= 0.6; g *= 0.6; b *= 0.6; }
      } else if (cr < hr - 0.03) { // wood (cedar)
        const grain = sm(fib, px * 0.33 + 31) * 0.55 + sm(fib2, px * 0.11 + y * 0.4) * 0.45;
        const fine = sm(fib, px * 2.1 + y * 5.0 + 500);
        const cut = 0.5 + 0.5 * Math.sin(y * 21 + n2 * 4); // sharpener marks
        const dark = grain * 0.32 + fine * 0.1 + cut * 0.035;
        r = 226 - dark * 120; g = 178 - dark * 122; b = 128 - dark * 105;
        const edge = clamp((cr - (hr - 0.22)) / 0.19); // paint edge shadow
        r *= 1 - edge * 0.25; g *= 1 - edge * 0.28; b *= 1 - edge * 0.3;
        rough = 0.72 + fine * 0.2; metal = 0; coat = 0;
      } else { // lacquer
        r = 10; g = 34; b = 241; rough = 0.3; metal = 0; coat = 255;
        if (cr < hr + 0.05) { r = 150; g = 170; b = 255; } // thin bright chipped paint edge
      }
      const o = (py * W + px) * 4;
      ci.data[o] = r; ci.data[o + 1] = g; ci.data[o + 2] = b; ci.data[o + 3] = 255;
      oi.data[o] = 255; oi.data[o + 1] = clamp(rough) * 255; oi.data[o + 2] = metal * 255; oi.data[o + 3] = 255;
      ki.data[o] = coat; ki.data[o + 1] = coat; ki.data[o + 2] = coat; ki.data[o + 3] = 255;
    }
  }
  cx.putImageData(ci, 0, 0); ox.putImageData(oi, 0, 0); kx.putImageData(ki, 0, 0);
  const map = new THREE.CanvasTexture(col); map.colorSpace = THREE.SRGBColorSpace;
  const ormT = new THREE.CanvasTexture(orm), ccT = new THREE.CanvasTexture(cc);
  for (const t of [map, ormT, ccT]) { t.anisotropy = 8; t.wrapS = THREE.RepeatWrapping; }
  return { map, orm: ormT, cc: ccT };
}

function bodyTextures() {
  const W = 2048, H = 2048; // u = theta, v = y from tipLen..len
  const draw = (kind) => (c, w, h) => {
    c.fillStyle = kind === 'col' ? '#0A22F1' : kind === 'orm' ? 'rgb(255,77,0)' : '#fff';
    c.fillRect(0, 0, w, h);
    // dipped end cap band (light blue) at the far end
    const bandH = (7 / (PENCIL.len - PENCIL.tipLen)) * h;
    if (kind === 'col') { c.fillStyle = '#9CC8FF'; c.fillRect(0, 0, w, bandH); c.fillStyle = '#e9c46a'; c.fillRect(0, bandH, w, 5); }
    if (kind === 'orm') { c.fillStyle = 'rgb(255,60,255)'; c.fillRect(0, bandH, w, 5); }
    // gold foil stamp on one facet: facet centre at theta=90deg -> u=.25
    c.save();
    c.translate(w * 0.25, h * 0.70); c.rotate(-Math.PI / 2); c.scale(1, -1);
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = '800 150px "Plus Jakarta Sans"';
    try { c.letterSpacing = '26px'; } catch (e) {}
    if (kind === 'col') {
      const g = c.createLinearGradient(0, -70, 0, 70); g.addColorStop(0, '#f6dc8a'); g.addColorStop(0.5, '#d9ad45'); g.addColorStop(1, '#f1d27a');
      c.fillStyle = g;
    } else if (kind === 'orm') c.fillStyle = 'rgb(255,56,255)'; else c.fillStyle = '#000';
    c.fillText('SABERIUM', 0, 6);
    c.font = '700 54px "JetBrains Mono"'; try { c.letterSpacing = '14px'; } catch (e) {}
    c.fillText('ESTUDIO WEB · HB', 880, 8);
    c.restore();
  };
  const map = canvasTex(W, H, draw('col')), orm = canvasTex(W, H, draw('orm'), false), cc = canvasTex(W, H, draw('cc'), false);
  return { map, orm, cc };
}

function buildPencil(env) {
  const g = new THREE.Group();
  const TL = PENCIL.tipLen;
  const ys = []; for (let y = 0; y <= TL + 1e-6; y += (y < 2 ? 0.1 : 0.3)) ys.push(Math.min(y, TL)); ys[ys.length - 1] = TL;
  const tt = tipTextures();
  const tipMat = new THREE.MeshPhysicalMaterial({ map: tt.map, roughnessMap: tt.orm, metalnessMap: tt.orm, roughness: 1, metalness: 1, clearcoat: 1, clearcoatMap: tt.cc, clearcoatRoughness: 0.12, envMap: env, envMapIntensity: 1.0 });
  const tip = new THREE.Mesh(latheGrid(ys, 144, 0, TL), tipMat);
  const bt = bodyTextures();
  const bodyMat = new THREE.MeshPhysicalMaterial({ map: bt.map, roughnessMap: bt.orm, metalnessMap: bt.orm, roughness: 1, metalness: 1, clearcoat: 1, clearcoatMap: bt.cc, clearcoatRoughness: 0.12, envMap: env, envMapIntensity: 1.0 });
  const bys = []; for (let i = 0; i <= 24; i++) bys.push(TL + (PENCIL.len - TL) * (i / 24));
  const body = new THREE.Mesh(latheGrid(bys, 144, TL, PENCIL.len), bodyMat);
  // end cap
  const capShape = new THREE.Shape(); for (let i = 0; i <= 72; i++) { const th = (i / 72) * Math.PI * 2, r = hexR(th); i ? capShape.lineTo(Math.cos(th) * r, Math.sin(th) * r) : capShape.moveTo(Math.cos(th) * r, Math.sin(th) * r); }
  const cap = new THREE.Mesh(new THREE.ShapeGeometry(capShape), new THREE.MeshPhysicalMaterial({ color: 0x9cc8ff, roughness: 0.35, clearcoat: 1, envMap: env }));
  cap.rotation.x = -Math.PI / 2; cap.position.y = PENCIL.len;
  for (const m of [tip, body, cap]) { m.castShadow = true; m.receiveShadow = true; g.add(m); }
  return g;
}

// ---------- scissors ----------
function bladeGeometry(len, back) {
  const t = 1.4, bw = 2.6;
  const st = []; // stations along x
  const N = 60;
  for (let i = 0; i <= N; i++) {
    const x = -back + (len + back) * (i / N);
    const u = clamp(x / len);
    let w = lerp(11.5, 2.6, Math.pow(u, 0.9));
    if (x < 0) w = lerp(11.5, 9, clamp(-x / back));
    if (u > 0.93) w *= Math.sqrt(clamp(1 - Math.pow((u - 0.93) / 0.07, 2))) * 0.85 + 0.15; // rounded tip
    st.push({ x, w });
  }
  const pos = [], uv = [], groups = [[], []];
  const quad = (a, b, c, d, grp, ua, ub, uc, ud) => { groups[grp].push([a, b, c, ua, ub, uc], [a, c, d, ua, uc, ud]); };
  for (let i = 0; i < st.length - 1; i++) {
    const A = st[i], B = st[i + 1];
    const cs = (s) => { const b = Math.min(bw, s.w * 0.6); return [[s.x, 0, 0.1], [s.x, s.w, 0], [s.x, s.w, t], [s.x, b, t], [s.x, 0, 0.22]]; };
    const p = cs(A), q = cs(B);
    const ua = A.x / len, ub = B.x / len;
    // inner face (z=0): P0..P1  (normal -z)
    quad(p[0], q[0], q[1], p[1], 0, [ua, 0], [ub, 0], [ub, 1], [ua, 1]);
    // spine
    quad(p[1], q[1], q[2], p[2], 0, [ua, 0.9], [ub, 0.9], [ub, 1], [ua, 1]);
    // outer flat
    quad(p[2], q[2], q[3], p[3], 0, [ua, 1], [ub, 1], [ub, 0.25], [ua, 0.25]);
    // bevel (ground edge)
    quad(p[3], q[3], q[4], p[4], 1, [ua, 0.25], [ub, 0.25], [ub, 0], [ua, 0]);
    // tiny edge land
    quad(p[4], q[4], q[0], p[0], 1, [ua, 0], [ub, 0], [ub, 0], [ua, 0]);
  }
  const g = new THREE.BufferGeometry();
  let n = 0;
  groups.forEach((tris, gi) => {
    const start = n;
    for (const [a, b, c, ua, ub, uc] of tris) { pos.push(...a, ...b, ...c); uv.push(...ua, ...ub, ...uc); n += 3; }
    g.addGroup(start, n - start, gi);
  });
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  return g;
}

function buildScissors(env) {
  const root = new THREE.Group();
  const brushed = canvasTex(1024, 256, (c, w, h) => {
    c.fillStyle = 'rgb(255,70,255)'; c.fillRect(0, 0, w, h);
    const r = mulberry(11);
    for (let i = 0; i < 2600; i++) {
      const y = r() * h, x = r() * w, l = 60 + r() * 500, v = 40 + r() * 80;
      c.strokeStyle = `rgba(255,${v | 0},255,${0.10 + r() * 0.25})`; c.lineWidth = 0.6 + r() * 1.2;
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + l, y + (r() - 0.5) * 2); c.stroke();
    }
  }, false);
  brushed.wrapS = brushed.wrapT = THREE.RepeatWrapping;
  const steel = new THREE.MeshStandardMaterial({ color: 0xc9d1dc, metalness: 1, roughness: 1, roughnessMap: brushed, envMap: env, envMapIntensity: 1.25, side: THREE.DoubleSide });
  const bevel = new THREE.MeshStandardMaterial({ color: 0xeef3fa, metalness: 1, roughness: 0.13, envMap: env, envMapIntensity: 1.7, side: THREE.DoubleSide });
  const plastic = new THREE.MeshPhysicalMaterial({ color: 0x070a20, roughness: 0.45, clearcoat: 0.6, envMap: env });
  const geo = bladeGeometry(88, 34);
  const mk = (flip) => {
    const piv = new THREE.Group();
    const m = new THREE.Mesh(geo, [steel, bevel]); m.castShadow = true; m.receiveShadow = true;
    const holder = new THREE.Group(); holder.add(m);
    // handle loop
    const loop = new THREE.Mesh(new THREE.TorusGeometry(15, 3.6, 16, 48), plastic);
    loop.scale.set(1.45, 1, 0.75); loop.position.set(-62, -9, 0.9); loop.castShadow = true;
    const neck = new THREE.Mesh(new THREE.CapsuleGeometry(3.4, 22, 6, 12), plastic);
    neck.rotation.z = Math.PI / 2 + 0.25; neck.position.set(-36, 2, 0.9); neck.scale.z = 0.7; neck.castShadow = true;
    holder.add(loop, neck);
    if (flip) holder.scale.set(1, -1, -1);
    piv.add(holder);
    return piv;
  };
  const A = mk(false), B = mk(true);
  const screw = new THREE.Mesh(new THREE.CylinderGeometry(3.1, 3.1, 4.4, 32), bevel); screw.rotation.x = Math.PI / 2;
  const slot = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.7, 0.4), new THREE.MeshStandardMaterial({ color: 0x111319, metalness: 1, roughness: 0.4 })); slot.position.z = 2.25; slot.rotation.z = 0.5;
  root.add(A, B, screw, slot);
  root.userData = { A, B };
  return root;
}

// ---------- desk ----------
function buildDesk(env) {
  const g = new THREE.Group();
  const matTex = canvasTex(2048, 2048, (c, w, h) => {
    c.fillStyle = '#0c1340'; c.fillRect(0, 0, w, h);
    const r = mulberry(3);
    for (let i = 0; i < 9000; i++) { c.fillStyle = `rgba(${150 + r() * 60},${180 + r() * 40},255,${r() * 0.035})`; c.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2); }
    const mm = w / 400; // texture covers 400mm
    for (let i = 0; i <= 400; i += 5) {
      const major = i % 50 === 0, mid = i % 10 === 0;
      c.strokeStyle = major ? 'rgba(156,200,255,0.55)' : mid ? 'rgba(156,200,255,0.24)' : 'rgba(156,200,255,0.09)';
      c.lineWidth = major ? 3 : 1.6;
      c.beginPath(); c.moveTo(i * mm, 0); c.lineTo(i * mm, h); c.stroke();
      c.beginPath(); c.moveTo(0, i * mm); c.lineTo(w, i * mm); c.stroke();
    }
    c.fillStyle = 'rgba(156,200,255,0.5)'; c.font = '600 26px "JetBrains Mono"';
    for (let i = 0; i < 400; i += 50) for (let j = 0; j < 400; j += 50) { c.fillText(String(i / 10), i * mm + 8, j * mm + 30); }
    // diagonal guides
    c.strokeStyle = 'rgba(156,200,255,0.10)'; c.lineWidth = 2;
    for (let k = -1; k < 3; k++) { c.beginPath(); c.moveTo(k * w / 2, 0); c.lineTo(k * w / 2 + w, h); c.stroke(); }
    // knife scratches
    for (let i = 0; i < 70; i++) { const x = r() * w, y = r() * h, a = r() * 6.28, l = 40 + r() * 260; c.strokeStyle = `rgba(200,220,255,${0.03 + r() * 0.07})`; c.lineWidth = 0.8 + r(); c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke(); }
  });
  matTex.wrapS = matTex.wrapT = THREE.RepeatWrapping; matTex.repeat.set(2, 2);
  const mat = new THREE.Mesh(new THREE.BoxGeometry(800, 3, 800), new THREE.MeshStandardMaterial({ map: matTex, roughness: 0.62, metalness: 0.0, envMap: env, envMapIntensity: 0.55 }));
  mat.position.y = -1.5 - 0.02; mat.receiveShadow = true; g.add(mat);
  const table = new THREE.Mesh(new THREE.PlaneGeometry(6000, 6000), new THREE.MeshStandardMaterial({ color: 0x03040c, roughness: 0.5, envMap: env, envMapIntensity: 0.3 }));
  table.rotation.x = -Math.PI / 2; table.position.y = -3.1; table.receiveShadow = true; g.add(table);
  // steel ruler
  const rulerTex = canvasTex(2048, 200, (c, w, h) => {
    const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#aeb6c2'); gr.addColorStop(1, '#8e97a5'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
    c.fillStyle = '#10131c'; c.strokeStyle = '#10131c';
    const mm = w / 300;
    for (let i = 0; i <= 300; i++) { const L = i % 10 === 0 ? 70 : i % 5 === 0 ? 48 : 30; c.fillRect(i * mm - 1, 0, 2, L); }
    c.font = '700 44px "JetBrains Mono"'; c.textAlign = 'center';
    for (let i = 10; i < 300; i += 10) c.fillText(String(i / 10), i * mm, 124);
    c.font = '700 26px "JetBrains Mono"'; c.textAlign = 'left'; c.fillText('ACERO INOX · 300 mm', 30, 180);
  });
  const ruler = new THREE.Mesh(new THREE.BoxGeometry(300, 1, 30), [0, 0, 0, 0, 0, 0].map((_, i) => new THREE.MeshStandardMaterial({ color: i === 2 ? 0xffffff : 0x9aa3b0, map: i === 2 ? rulerTex : null, metalness: 0.95, roughness: 0.32, envMap: env, envMapIntensity: 1.0 })));
  ruler.position.set(-60, 0.5, -122); ruler.rotation.y = 0.2; ruler.castShadow = true; ruler.receiveShadow = true; g.add(ruler);
  // a second sheet, further back
  const sheet2 = new THREE.Mesh(new THREE.BoxGeometry(148, 0.3, 210), new THREE.MeshStandardMaterial({ color: 0xe9e7e0, roughness: 0.95 }));
  sheet2.position.set(150, 0.15, -150); sheet2.rotation.y = -0.35; sheet2.receiveShadow = true; g.add(sheet2);
  g.userData = { ruler, sheet2 };
  return g;
}

// ---------- paper <-> phone slab ----------
function rrShape(w, h, r) {
  const s = new THREE.Shape(); const x = -w / 2, y = -h / 2; r = Math.min(r, w / 2, h / 2);
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0); s.lineTo(x + w, y + h - r); s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2);
  s.lineTo(x + r, y + h); s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI); s.lineTo(x, y + r); s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5);
  return s;
}
function buildSlab(env, screenTex) {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshPhysicalMaterial({ color: 0xf2f0ea, roughness: 0.9, metalness: 0, envMap: env, envMapIntensity: 0.6, clearcoat: 0 });
  const body = new THREE.Mesh(new THREE.BufferGeometry(), bodyMat); body.castShadow = true; body.receiveShadow = true;
  // lit paper face (receives the pencil's shadow) + emissive screen face, cross-faded
  const paperMat = new THREE.MeshStandardMaterial({ map: screenTex, roughness: 0.92, envMap: env, envMapIntensity: 0.25, transparent: true });
  const paper = new THREE.Mesh(new THREE.BufferGeometry(), paperMat); paper.receiveShadow = true;
  const screenMat = new THREE.MeshBasicMaterial({ map: screenTex, transparent: true, opacity: 0 }); screenMat.color.setScalar(1.22);
  const screen = new THREE.Mesh(new THREE.BufferGeometry(), screenMat);
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x000000, roughness: 0.04, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.03, envMap: env, envMapIntensity: 1.5, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 });
  const sheenTex = canvasTex(512, 512, (c, w, h) => { const gr = c.createLinearGradient(0, 0, w, h * 0.75); gr.addColorStop(0.0, 'rgba(255,255,255,0)'); gr.addColorStop(0.30, 'rgba(255,255,255,0)'); gr.addColorStop(0.42, 'rgba(210,228,255,.20)'); gr.addColorStop(0.5, 'rgba(210,228,255,.07)'); gr.addColorStop(0.58, 'rgba(210,228,255,.16)'); gr.addColorStop(0.66, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  sheenTex.wrapS = sheenTex.wrapT = THREE.RepeatWrapping;
  const sheen = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({ map: sheenTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 }));
  const glass = new THREE.Mesh(new THREE.BufferGeometry(), glassMat);
  // soft glow the screen throws on the desk
  const glowTex = canvasTex(256, 256, (c, w, h) => { const gr = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.45, 'rgba(255,255,255,0.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0, color: 0x9cc8ff }));
  glow.rotation.x = -Math.PI / 2; glow.position.y = 0.12; glow.scale.set(210, 300, 1);
  g.add(glow, body, paper, screen, glass, sheen); g.userData.sheenTex = sheenTex;
  let key = '';
  const faceGeo = (w, h, r) => {
    const geo = new THREE.ShapeGeometry(rrShape(w, h, r), 10);
    const p = geo.attributes.position, uv = geo.attributes.uv;
    for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / w + 0.5, p.getY(i) / h + 0.5);
    geo.rotateX(-Math.PI / 2); // x stays, y -> -z : top of screen at -z
    return geo;
  };
  g.userData.set = (m, lit, glowCol) => { // m: 0 paper, 1 phone ; lit: screen emissive 0..1
    const w = lerp(PAPER.w, PHONE.w, m), h = lerp(PAPER.h, PHONE.h, m), t = lerp(0.3, PHONE.t, m), r = lerp(0.6, PHONE.r, m), bz = lerp(0, PHONE.bezel, m);
    const k = [w, h, t, r].map((v) => v.toFixed(2)).join();
    if (k !== key) {
      key = k;
      body.geometry.dispose();
      const bev = Math.min(t * 0.35, 1.6);
      const geo = new THREE.ExtrudeGeometry(rrShape(w, h, r), { depth: Math.max(0.05, t - 2 * bev), bevelEnabled: true, bevelThickness: bev, bevelSize: bev * 0.8, bevelOffset: -bev * 0.8, bevelSegments: 4, curveSegments: 10 });
      geo.rotateX(-Math.PI / 2); geo.translate(0, bev, 0);
      body.geometry = geo;
      for (const f of [paper, screen, glass]) f.geometry.dispose();
      const fg = faceGeo(w - 2 * bz, h - 2 * bz, Math.max(0.4, r - bz));
      paper.geometry = fg; screen.geometry = fg.clone(); glass.geometry = fg.clone(); sheen.geometry.dispose(); sheen.geometry = fg.clone(); sheen.position.y = t + 0.07;
      paper.position.y = t + 0.02; screen.position.y = t + 0.03; glass.position.y = t + 0.05;
    }
    bodyMat.color.setRGB(lerp(0.9, 0.012, m), lerp(0.88, 0.016, m), lerp(0.83, 0.04, m));
    bodyMat.roughness = lerp(0.9, 0.32, m); bodyMat.metalness = lerp(0, 0.85, m); bodyMat.clearcoat = m * 0.5;
    paperMat.opacity = 1; paper.visible = lit < 0.999;
    screenMat.opacity = lit; screen.visible = lit > 0.001;
    glassMat.opacity = m; glass.visible = m > 0.01; sheen.material.opacity = m * lit; sheen.visible = m * lit > 0.01;
    glow.material.opacity = lit * 0.16 * m; if (glowCol) glow.material.color.set(glowCol);
    g.userData.size = { w, h, t, sw: w - 2 * bz, sh: h - 2 * bz };
  };
  g.userData.set(0, 0);
  // screen px -> world position (on the screen surface)
  g.userData.toWorld = (px, py, lift = 0) => {
    const s = g.userData.size;
    return new V3((px / SCREEN.w - 0.5) * s.sw, s.t + 0.05 + lift, (py / SCREEN.h - 0.5) * s.sh).applyMatrix4(g.matrixWorld);
  };
  return g;
}

// ---------- dust + light beam ----------
function buildDust() {
  const N = 420, r = mulberry(5);
  const pos = new Float32Array(N * 3), seed = new Float32Array(N * 4);
  for (let i = 0; i < N; i++) { seed[i * 4] = r(); seed[i * 4 + 1] = r(); seed[i * 4 + 2] = r(); seed[i * 4 + 3] = r(); }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 4));
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uPx: { value: 1 }, uFocus: { value: 100 }, uAper: { value: 0 }, uGain: { value: 1 } },
    vertexShader: `
      attribute vec4 aSeed; uniform float uTime, uPx, uFocus, uAper; varying float vA; varying float vBlur;
      void main(){
        vec3 p = vec3((aSeed.x-.5)*260., aSeed.y*190.+4., (aSeed.z-.5)*300.);
        float tt = uTime*(.35+aSeed.w*.5);
        p += vec3(sin(tt*.7+aSeed.y*30.)*7. + tt*1.6, sin(tt*.5+aSeed.x*40.)*5. - tt*.9, cos(tt*.6+aSeed.z*20.)*6.);
        p.y = mod(p.y-4., 190.)+4.; p.x = mod(p.x+130., 260.)-130.;
        // light beam: slanted slab from upper-left
        float d = abs((p.x + p.y*.45 + 10.) *.9 + p.z*.25);
        float beam = smoothstep(75., 8., d);
        vec4 mv = modelViewMatrix*vec4(p,1.);
        float z = -mv.z;
        float coc = uAper*abs(z-uFocus)/max(z,1.);
        float size = (0.5 + aSeed.w*0.6)*uPx*(520./z) + coc*uPx*1.6;
        vBlur = clamp(coc/6.,0.,1.);
        vA = (0.10+beam*0.9)*(0.4+aSeed.x*.6) / (1.+coc*coc*.45) * smoothstep(8., 30., z);
        gl_PointSize = clamp(size, 1., 160.*uPx);
        gl_Position = projectionMatrix*mv;
      }`,
    fragmentShader: `
      varying float vA; varying float vBlur; uniform float uGain;
      void main(){
        float r = length(gl_PointCoord-.5)*2.;
        float soft = smoothstep(1., .0, r);
        float disc = smoothstep(1., .82, r)*(0.75+0.25*smoothstep(.5,1.,r));
        float a = mix(soft*soft, disc, vBlur);
        gl_FragColor = vec4(vec3(1.,.95,.86)*a*vA*uGain*5., 1.);
      }`,
  });
  const pts = new THREE.Points(geo, mat); pts.frustumCulled = false;
  return pts;
}

// ============================================================
export function createWorld(canvas, screenCanvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
  const dpr = window.devicePixelRatio || 1;
  renderer.setPixelRatio(dpr); renderer.setSize(1080, 1920, false);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.NoToneMapping;
  const W = Math.round(1080 * dpr), H = Math.round(1920 * dpr);

  const env = buildEnv(renderer);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x02030a);
  scene.fog = new THREE.Fog(0x02030a, 500, 2600);
  const camera = new THREE.PerspectiveCamera(28, 1080 / 1920, 5, 4000);

  const key = new THREE.SpotLight(0xfff4e6, 8, 0, 0.5, 0.75, 0);
  key.position.set(-210, 420, 190); key.target.position.set(0, 0, 0);
  key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.camera.near = 150; key.shadow.camera.far = 900; key.shadow.bias = -0.0006; key.shadow.normalBias = 0.25; key.shadow.radius = 5;
  const rim = new THREE.DirectionalLight(0x3355ff, 2.4); rim.position.set(260, 120, -260);
  const fill = new THREE.DirectionalLight(0x9cc8ff, 1.1); fill.position.set(120, 200, 300);
  const screenLight = new THREE.PointLight(0x9cc8ff, 0, 0, 0); screenLight.position.set(0, 40, 0);
  scene.add(key, key.target, rim, fill, screenLight);

  const desk = buildDesk(env); scene.add(desk);
  const pencil = buildPencil(env); scene.add(pencil);
  const scissors = buildScissors(env); scene.add(scissors);
  const screenTex = new THREE.CanvasTexture(screenCanvas); screenTex.colorSpace = THREE.SRGBColorSpace; screenTex.anisotropy = 8; screenTex.generateMipmaps = true;
  const slab = buildSlab(env, screenTex); scene.add(slab);
  const dust = buildDust(); scene.add(dust);
  const beamTex = canvasTex(512, 512, (c, w, h) => {
    c.translate(w / 2, h / 2); c.rotate(-0.55); const g = c.createLinearGradient(-w / 2, 0, w / 2, 0);
    g.addColorStop(0.18, 'rgba(255,240,215,0)'); g.addColorStop(0.42, 'rgba(255,240,215,.55)'); g.addColorStop(0.5, 'rgba(255,244,225,.8)'); g.addColorStop(0.62, 'rgba(255,240,215,.4)'); g.addColorStop(0.85, 'rgba(255,240,215,0)');
    c.fillStyle = g; c.fillRect(-w, -h, 2 * w, 2 * h);
    c.globalCompositeOperation = 'destination-in'; c.rotate(0.55); const r = c.createRadialGradient(0, 0, 0, 0, 0, w / 2); r.addColorStop(0, '#fff'); r.addColorStop(0.6, 'rgba(255,255,255,.7)'); r.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = r; c.fillRect(-w / 2, -h / 2, w, h);
  });
  const beam = new THREE.Sprite(new THREE.SpriteMaterial({ map: beamTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.07, color: 0xcfe0ff }));
  beam.position.set(-30, 120, -70); beam.scale.set(520, 520, 1); scene.add(beam);
  // glint sprite
  const glintTex = canvasTex(256, 256, (c, w, h) => {
    const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.12, 'rgba(220,235,255,.55)'); g.addColorStop(0.5, 'rgba(156,200,255,.08)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.globalCompositeOperation = 'lighter';
    for (const a of [0, Math.PI / 2]) { c.save(); c.translate(w / 2, h / 2); c.rotate(a + 0.35); const s = c.createLinearGradient(-w / 2, 0, w / 2, 0); s.addColorStop(0, 'rgba(255,255,255,0)'); s.addColorStop(0.5, 'rgba(255,255,255,.9)'); s.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = s; c.fillRect(-w / 2, -1.6, w, 3.2); c.restore(); }
  });
  const glint = new THREE.Sprite(new THREE.SpriteMaterial({ map: glintTex, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, transparent: true, opacity: 0 }));
  scene.add(glint);

  // ---- post: depth of field + grade ----
  const rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 });
  rt.depthTexture = new THREE.DepthTexture(W, H); rt.depthTexture.type = THREE.UnsignedIntType;
  const post = new THREE.ShaderMaterial({
    defines: { TAPS: 40 },
    uniforms: { tColor: { value: rt.texture }, tDepth: { value: rt.depthTexture }, uNear: { value: camera.near }, uFar: { value: camera.far }, uFocus: { value: 100 }, uAper: { value: 0 }, uMax: { value: 30 * dpr }, uRes: { value: new THREE.Vector2(W, H) }, uSeed: { value: 0 }, uExpo: { value: 1 }, uSat: { value: 1 }, uVig: { value: 1 }, uFlash: { value: 0 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy,0.,1.); }`,
    fragmentShader: `
      #include <common>
      #include <packing>
      varying vec2 vUv; uniform sampler2D tColor, tDepth; uniform float uNear,uFar,uFocus,uAper,uMax,uSeed,uExpo,uSat,uVig,uFlash; uniform vec2 uRes;
      float zAt(vec2 uv){ return -perspectiveDepthToViewZ(texture2D(tDepth,uv).x,uNear,uFar); }
      float cocAt(float z){ return min(uAper*abs(z-uFocus)/z * uRes.y/1920. , uMax); }
      vec3 neutral(vec3 c){ // Khronos PBR neutral
        float sc=0.8-0.04; float d=0.15; float x=min(c.r,min(c.g,c.b)); float off = x<0.08? x-6.25*x*x : 0.04; c-=off;
        float peak=max(c.r,max(c.g,c.b)); if(peak<sc) return c;
        float dd=1.-sc; float np=1.-dd*dd/(peak+dd-sc); c*=np/peak; float g=1.-1./(d*(peak-np)+1.); return mix(c,vec3(np),g);
      }
      void main(){
        float zc = zAt(vUv); float cc = cocAt(zc);
        vec3 acc = texture2D(tColor,vUv).rgb; float wsum = 1.;
        if(uAper>0.001){
          float rnd = rand(vUv+uSeed)*6.2831;
          const int N = TAPS;
          for(int i=0;i<N;i++){
            float fi = (float(i)+.5)/float(N);
            float rad = sqrt(fi)*uMax; float a = float(i)*2.39996+rnd;
            vec2 o = vec2(cos(a),sin(a))*rad/uRes;
            vec2 uv2 = vUv+o;
            float zs = zAt(uv2); float cs = cocAt(zs);
            if(zs>zc) cs = min(cs, cc*1.5+0.5);
            float wgt = smoothstep(rad-1.5, rad+1.5, cs)*smoothstep(0.6, 1.2, cs);
            acc += texture2D(tColor,uv2).rgb*wgt; wsum += wgt;
          }
        }
        vec3 col = acc/wsum*uExpo;
        float l = dot(col,vec3(.2126,.7152,.0722)); col = mix(vec3(l),col,uSat);
        vec2 q = vUv-.5; float v = 1.-dot(q,q)*1.15*uVig; col *= clamp(v,0.,1.);
        col = neutral(col);
        col += uFlash*vec3(.61,.78,1.);
        col = pow(clamp(col,0.,1.), vec3(1./2.2));
        col += (rand(vUv*1.7+uSeed)-.5)*0.022;
        gl_FragColor = vec4(col,1.);
      }`,
    depthTest: false, depthWrite: false,
  });
  const postLite = new THREE.ShaderMaterial({ defines: { TAPS: 14 }, uniforms: Object.fromEntries(Object.entries(post.uniforms).map(([k, u]) => [k, { value: u.value }])), vertexShader: post.vertexShader, fragmentShader: post.fragmentShader, depthTest: false, depthWrite: false }); postLite.uniforms.tColor.value = rt.texture; postLite.uniforms.tDepth.value = rt.depthTexture; postLite.uniforms.uMax.value = 9 * dpr; postLite.uniforms.uRes.value = post.uniforms.uRes.value;
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), post); quad.frustumCulled = false;
  const postScene = new THREE.Scene(); postScene.add(quad);
  const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const world = { beam, renderer, scene, camera, pencil, scissors, slab, desk, dust, glint, key, rim, fill, screenLight, screenTex, post, env,
    render(o) {
      camera.updateMatrixWorld();
      dust.material.uniforms.uTime.value = o.dustTime; dust.material.uniforms.uPx.value = dpr; dust.material.uniforms.uFocus.value = o.focus; dust.material.uniforms.uAper.value = o.aperture; dust.material.uniforms.uGain.value = o.dustGain ?? 1;
      const pm = o.aperture < 12 ? postLite : post; quad.material = pm;
      const U = pm.uniforms; U.uFocus.value = o.focus; U.uAper.value = o.aperture; U.uSeed.value = o.seed; U.uExpo.value = o.expo ?? 1; U.uSat.value = o.sat ?? 1; U.uVig.value = o.vig ?? 1; U.uFlash.value = o.flash ?? 0;
      U.uNear.value = camera.near; U.uFar.value = camera.far;
      renderer.setRenderTarget(rt); renderer.render(scene, camera);
      renderer.setRenderTarget(null); renderer.render(postScene, postCam);
    },
    // place pencil: tip position + axis direction (tip->end) + roll
    setPencil(tip, axis, face, extra = 0) {
      const ax = axis.clone().normalize();
      const q = new THREE.Quaternion().setFromUnitVectors(new V3(0, 1, 0), ax);
      const z0 = new V3(0, 0, 1).applyQuaternion(q);
      const d = face.clone().addScaledVector(ax, -face.dot(ax)).normalize();
      const roll = Math.atan2(new V3().crossVectors(z0, d).dot(ax), z0.dot(d)) + extra;
      const qr = new THREE.Quaternion().setFromAxisAngle(new V3(0, 1, 0), roll);
      pencil.quaternion.copy(q).multiply(qr); pencil.position.copy(tip);
    },
    // scissors in the plane perpendicular to `axis`, through point P; u = direction pivot->pencil; alpha = half opening
    setScissors(P, axis, u, L, alpha) {
      const z = axis.clone().normalize();
      const x = u.clone().addScaledVector(z, -u.dot(z)).normalize();
      const y = new V3().crossVectors(z, x);
      const m = new THREE.Matrix4().makeBasis(x, y, z);
      scissors.quaternion.setFromRotationMatrix(m);
      scissors.position.copy(P).addScaledVector(x, -L);
      scissors.userData.A.rotation.z = alpha; scissors.userData.B.rotation.z = -alpha;
      return { x, y, z };
    },
  };
  return world;
}
