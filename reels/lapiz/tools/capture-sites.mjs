// Captura real, a ancho de móvil, de las webs que Saberium puede enseñar.
// Uso: node tools/capture-sites.mjs [nombre ...]
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const OUT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../captures');
const SITES = [
  { name: 'amperiza', url: 'https://amperizaserviciosinmobiliarios.com/es' },
  { name: 'atlantis', url: 'https://www.atlantischarter.com/' },
  { name: 'barber',   url: 'https://www.thebarberkingdom.com/' },
  { name: 'saberium', url: 'https://saberium.com/' },
];
const VW = 390, VH = 844, DSF = 3, MAXH = VH * 7;
const UA = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36';
const HIDE = `
  [id*="cookie" i],[class*="cookie" i],[id*="consent" i],[class*="consent" i],
  [id*="gdpr" i],[class*="gdpr" i],[class*="cky-" i],#CybotCookiebotDialog,
  [class*="whatsapp-float" i],[class*="wa-float" i],[id*="chat-widget" i],[class*="chat-widget" i],
  iframe[src*="tawk"],iframe[src*="crisp"],iframe[title*="chat" i],
  [aria-label*="cookie" i][role="dialog"] { display:none !important; visibility:hidden !important; }
  html { scroll-behavior:auto !important; }
`;
const want = process.argv.slice(2);
const browser = await chromium.launch();
const meta = fs.existsSync(path.join(OUT, 'captures.json')) ? JSON.parse(fs.readFileSync(path.join(OUT, 'captures.json'))) : [];
for (const s of SITES) {
  if (want.length && !want.includes(s.name)) continue;
  const ctx = await browser.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: DSF, isMobile: true, hasTouch: true, locale: 'es-ES', userAgent: UA });
  const page = await ctx.newPage();
  const blocked = new Set();
  page.on('requestfailed', r => { try { blocked.add(new URL(r.url()).host + ' ' + (r.failure()?.errorText || '')); } catch {} });
  try {
    await page.goto(s.url, { waitUntil: 'load', timeout: 60000 });
    await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
    // aceptar cookies si hay botón, y ocultar el resto de capas
    for (const t of ['Aceptar todas', 'Aceptar todo', 'Aceptar', 'Acepto', 'Accept all', 'Accept', 'Entendido', 'De acuerdo']) {
      const b = page.getByRole('button', { name: t, exact: false }).first();
      if (await b.isVisible().catch(() => false)) { await b.click({ timeout: 2000 }).catch(() => {}); break; }
    }
    await page.addStyleTag({ content: HIDE });
    const full = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < Math.min(full, 844 * 9); y += 300) { await page.evaluate(v => window.scrollTo(0, v), y); await page.waitForTimeout(220); }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(800);
    // cabeceras fijas: que no se repitan ni floten en la captura completa
    const fixed = await page.evaluate(() => {
      const out = [];
      for (const el of document.querySelectorAll('body *')) {
        const cs = getComputedStyle(el);
        if (cs.position === 'fixed' || cs.position === 'sticky') {
          const r = el.getBoundingClientRect();
          out.push(`${el.tagName}.${String(el.className).slice(0, 40)} ${cs.position} ${Math.round(r.top)},${Math.round(r.width)}x${Math.round(r.height)}`);
          if (cs.position === 'fixed') {
            if (r.top <= 4 && r.height < 200 && r.width > 200) el.style.setProperty('position', 'absolute', 'important');
            else el.style.setProperty('display', 'none', 'important');
          } else el.style.setProperty('position', 'relative', 'important');
        }
      }
      return out;
    });
    await page.waitForTimeout(400);
    const h = Math.min(await page.evaluate(() => document.documentElement.scrollHeight), MAXH);
    const file = path.join(OUT, s.name + '.png');
    await page.screenshot({ path: file, fullPage: true, clip: { x: 0, y: 0, width: VW, height: h }, animations: 'disabled' });
    const rec = { name: s.name, url: page.url(), width: VW * DSF, height: h * DSF, capturedAt: new Date().toISOString() };
    const i = meta.findIndex(m => m.name === s.name); if (i >= 0) meta[i] = rec; else meta.push(rec);
    console.log('OK', JSON.stringify(rec)); console.log('  fixed:', fixed.join(' | ')); console.log('  failed:', [...blocked].join(' | '));
  } catch (e) { console.log('FAIL', s.name, e.message.split('\n')[0], [...blocked].join(' | ')); }
  await ctx.close();
}
fs.writeFileSync(path.join(OUT, 'captures.json'), JSON.stringify(meta, null, 2));
await browser.close();
