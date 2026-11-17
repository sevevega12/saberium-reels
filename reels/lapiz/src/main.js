import * as THREE from 'three';
import { createWorld } from './scene.js';
import { createScreen } from './screen.js';
import { createOverlay } from './overlay.js';
import { direct } from './director.js';

const TL = await (await fetch('src/timeline.json')).json();
await Promise.all(['800 40px "Plus Jakarta Sans"', '700 40px "Plus Jakarta Sans"', '500 40px "Plus Jakarta Sans"', 'italic 400 40px "Instrument Serif"', '500 20px "JetBrains Mono"', '700 20px "JetBrains Mono"'].map((f) => document.fonts.load(f)));
const screen = await createScreen();
const world = createWorld(document.getElementById('gl'), screen.canvas);
const overlay = createOverlay(document.getElementById('ui'), TL);
window.DURATION = TL.duration; window.FPS = TL.fps;
window.renderFrame = (t) => { direct(t, { world, screen, overlay, TL, THREE }); return true; };
window.READY = true;
const q = new URLSearchParams(location.search);
if (q.has('t')) window.renderFrame(parseFloat(q.get('t')));
if (q.has('play')) { const t0 = performance.now() - (parseFloat(q.get('play')) || 0) * 1000; const loop = () => { window.renderFrame(((performance.now() - t0) / 1000) % TL.duration); requestAnimationFrame(loop); }; loop(); }
