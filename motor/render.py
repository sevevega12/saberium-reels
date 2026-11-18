#!/usr/bin/env python3
"""Deterministic frame-by-frame renderer for one video folder.

  render.py VIDEO stills OUTPREFIX t1,t2,...     still frames (JPEG) at those seconds
  render.py VIDEO video OUT.mp4 START END [scale] [fps]
  render.py VIDEO layout OUT.json STEP            text boxes every STEP seconds (safe-zone check)

The page is assembled from motor/core (engine, pieces, base styles) plus the video's own
escenas.css and escenas.js. Timing comes ONLY from VIDEO/out/timing.json.
"""
import json, os, subprocess, sys, time
from playwright.sync_api import sync_playwright

MOTOR = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(MOTOR)
CHROME = os.environ.get('CHROME', '/usr/bin/google-chrome')


def page_html(vdir):
    core = os.path.join(MOTOR, 'core')
    v_css = os.path.join(vdir, 'escenas.css')
    parts = ['<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">',
             f'<link rel="stylesheet" href="file://{core}/base.css">']
    if os.path.exists(v_css):
        parts.append(f'<link rel="stylesheet" href="file://{os.path.abspath(v_css)}">')
    parts.append('</head><body><div id="stage"><div id="capScrim"></div><div id="caps"></div>'
                 '<div id="ctaScrim"></div><div id="cta"></div><div id="endcard"></div>'
                 '<div id="brand"></div><div id="grain"></div><div id="vig"></div></div>')
    for f in (f'{core}/engine.js', f'{core}/piezas.js', os.path.abspath(os.path.join(vdir, 'escenas.js'))):
        parts.append(f'<script src="file://{f}"></script>')
    parts.append('<script>start();</script></body></html>')
    os.makedirs(os.path.join(vdir, 'work'), exist_ok=True)
    p = os.path.join(vdir, 'work', 'page.html')
    open(p, 'w').write('\n'.join(parts))
    return p


def open_page(p, vdir, scale=1.0):
    tm = json.load(open(os.path.join(vdir, 'out', 'timing.json')))
    b = p.chromium.launch(executable_path=CHROME, args=["--no-sandbox", "--font-render-hinting=none",
                          "--force-color-profile=srgb", "--disable-lcd-text", "--allow-file-access-from-files"])
    ctx = b.new_context(viewport={"width": 1080, "height": 1920}, device_scale_factor=scale)
    pg = ctx.new_page()
    errs = []
    pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.add_init_script("window.TIMING=" + json.dumps(tm) + ";window.ASSETS=" + json.dumps("file://" + os.path.join(REPO, 'assets')) + ";")
    pg.goto("file://" + page_html(vdir))
    pg.evaluate("document.fonts.ready"); pg.wait_for_timeout(500)
    pg.evaluate("Promise.all([...document.images].map(i=>i.complete?1:new Promise(r=>{i.onload=i.onerror=r})))")
    if errs:
        print("ERRORES EN LA PÁGINA:", errs[:8]); b.close(); sys.exit(1)
    an = pg.evaluate("window.__anchors")
    json.dump(an, open(os.path.join(vdir, 'work', 'anchors.json'), 'w'), indent=1)
    return b, pg, tm, errs


def main():
    vdir, mode = os.path.abspath(sys.argv[1]), sys.argv[2]
    with sync_playwright() as p:
        if mode == 'stills':
            scale = float(sys.argv[5]) if len(sys.argv) > 5 else 1.0
            b, pg, tm, errs = open_page(p, vdir, scale)
            for s in [float(x) for x in sys.argv[4].split(',')]:
                pg.evaluate("ms=>window.__seek(ms)", s * 1000)
                pg.screenshot(path=f"{sys.argv[3]}_{s:06.2f}.jpg", type="jpeg", quality=88)
        elif mode == 'layout':
            b, pg, tm, errs = open_page(p, vdir, 0.25)
            step = float(sys.argv[4]); t = 0.0; rep = []
            while t < tm['duration']:
                rep.append({"t": round(t, 2), "boxes": pg.evaluate("ms=>window.__layout(ms)", t * 1000)})
                t += step
            json.dump(rep, open(sys.argv[3], 'w'), ensure_ascii=False)
        else:
            out, t0, t1 = sys.argv[3], float(sys.argv[4]), float(sys.argv[5])
            scale = float(sys.argv[6]) if len(sys.argv) > 6 else 1.0
            b, pg, tm, errs = open_page(p, vdir, scale)
            fps = int(sys.argv[7]) if len(sys.argv) > 7 else tm.get('fps', 30)
            if t1 <= 0:
                t1 = tm['duration']
            f0, f1 = round(t0 * fps), round(t1 * fps)
            tmp = out.replace(".mp4", ".tmp.mp4")
            vf = [] if scale == 1.0 else ["-vf", f"scale={int(1080*scale)//2*2}:{int(1920*scale)//2*2}"]
            ff = subprocess.Popen(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-f", "image2pipe",
                                   "-framerate", str(fps), "-c:v", "mjpeg", "-i", "-", *vf, "-c:v", "libx264",
                                   "-crf", "17" if scale == 1.0 else "23", "-preset", "veryfast",
                                   "-pix_fmt", "yuv420p", "-color_primaries", "bt709", "-color_trc", "bt709",
                                   "-colorspace", "bt709", "-movflags", "+faststart", tmp], stdin=subprocess.PIPE)
            st = time.time()
            for f in range(f0, f1):
                pg.evaluate("ms=>window.__seek(ms)", f * 1000 / fps)
                ff.stdin.write(pg.screenshot(type="jpeg", quality=93 if scale == 1.0 else 85))
            ff.stdin.close(); rc = ff.wait()
            if rc == 0:
                os.replace(tmp, out)
            print("renderizado", out, f1 - f0, "fotogramas en", round(time.time() - st, 1), "s")
        if errs:
            print("ERRORES EN LA PÁGINA:", errs[:8])
        b.close()


if __name__ == '__main__':
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    main()
