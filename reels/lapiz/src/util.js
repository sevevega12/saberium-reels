export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const prog = (t, a, b) => clamp((t - a) / (b - a));
export const eio = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const eo = (x) => 1 - Math.pow(1 - x, 3);
export const eo5 = (x) => 1 - Math.pow(1 - x, 5);
export const ei = (x) => x * x * x;
export const sstep = (x) => x * x * (3 - 2 * x);
// fast out, slow in
export const move = (t, a, b) => eo5(prog(t, a, b));
export const smooth = (t, a, b) => eio(prog(t, a, b));
export const pulse = (t, a, b, f = 0.25) => Math.min(prog(t, a, a + f), 1 - prog(t, b - f, b));
export function hash(n) { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
export function noise1(x) { const i = Math.floor(x), f = x - i; const u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u) * 2 - 1; }
export function mulberry(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
export const fmt = (v, d = 1) => v.toFixed(d).replace('.', ',');
