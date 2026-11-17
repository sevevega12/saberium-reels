// Deterministic frame-by-frame capture. usage: node tools/render.mjs --scale 0.5 --from 0 --to 51 --out frames [--times 1,2,3] [--step N]
import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)('playwright');
import http from 'http'; import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const scale = parseFloat(arg('scale', '1')), out = arg('out', 'frames'), fps = 30;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.woff2': 'font/woff2', '.jpg': 'image/jpeg' };
const srv = http.createServer((req, res) => { const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0])); fs.readFile(p, (e, d) => { if (e) { res.writeHead(404); res.end(); } else { res.writeHead(200, { 'content-type': MIME[path.extname(p)] || 'application/octet-stream' }); res.end(d); } }); });
await new Promise((r) => srv.listen(0, r)); const port = srv.address().port;
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--disable-gpu-vsync'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: scale });
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log('[page]', m.text().slice(0, 400)); });
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
await page.goto(`http://localhost:${port}/reels/lapiz/index.html`);
await page.waitForFunction('window.READY === true', null, { timeout: 120000 });
fs.mkdirSync(out, { recursive: true });
let frames;
if (arg('times')) frames = arg('times').split(',').map((s) => Math.round(parseFloat(s) * fps));
else { const a = Math.round(parseFloat(arg('from', '0')) * fps), b = Math.round(parseFloat(arg('to', '51')) * fps), st = parseInt(arg('step', '1')); frames = []; for (let f = a; f < b; f += st) frames.push(f); }
const t0 = Date.now();
for (const f of frames) {
  await page.evaluate((t) => window.renderFrame(t), f / fps);
  await page.screenshot({ path: path.join(out, `f${String(f).padStart(5, '0')}.${arg('fmt', 'png')}`), type: arg('fmt', 'png') === 'jpg' ? 'jpeg' : 'png', ...(arg('fmt', 'png') === 'jpg' ? { quality: 92 } : {}) });
}
console.log(`${frames.length} frames in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
await browser.close(); srv.close();
