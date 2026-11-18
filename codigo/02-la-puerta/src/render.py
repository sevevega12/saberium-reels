#!/usr/bin/env python3
"""Deterministic frame-by-frame renderer.
  stills : render.py stills OUTPREFIX t1,t2,...  [scale]
  video  : render.py video OUT.mp4 START END [scale]     (seconds; END<=0 -> full duration)
Timing comes ONLY from out/timing.json (override with env TIMING=path)."""
import sys, subprocess, os, time, json
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__))
TIMING=os.environ.get('TIMING',os.path.join(HERE,'..','out','timing.json'))
tm=json.load(open(TIMING)); FPS=tm.get('fps',30)
mode=sys.argv[1]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox","--font-render-hinting=none","--force-color-profile=srgb","--disable-lcd-text"])
    scale=float(sys.argv[5]) if (mode=='video' and len(sys.argv)>5) else (float(sys.argv[4]) if (mode=='stills' and len(sys.argv)>4) else 1.0)
    ctx=b.new_context(viewport={"width":1080,"height":1920},device_scale_factor=scale)
    pg=ctx.new_page()
    errs=[]; pg.on("console",lambda m: errs.append(m.text) if m.type=="error" else None); pg.on("pageerror",lambda e: errs.append(str(e)))
    pg.add_init_script("window.TIMING="+json.dumps(tm)+";")
    pg.goto("file://"+os.path.join(HERE,"reel.html")); pg.evaluate("document.fonts.ready"); pg.wait_for_timeout(400)
    json.dump(pg.evaluate("window.__anchors"),open(os.path.join(HERE,'..','work','anchors.json'),'w'),indent=1)
    if mode=='stills':
        for s in [float(x) for x in sys.argv[3].split(',')]:
            pg.evaluate("ms=>window.__seek(ms)", s*1000)
            pg.screenshot(path=f"{sys.argv[2]}_{s:06.2f}.jpg",type="jpeg",quality=88)
    else:
        out=sys.argv[2]; t0=float(sys.argv[3]); t1=float(sys.argv[4]); 
        if t1<=0: t1=tm['duration']
        f0=round(t0*FPS); f1=round(t1*FPS)
        tmp=out.replace(".mp4",".tmp.mp4")
        ff=subprocess.Popen(["ffmpeg","-hide_banner","-loglevel","error","-y","-f","image2pipe","-framerate",str(FPS),"-c:v","mjpeg","-i","-","-c:v","libx264","-crf","17","-preset","medium","-pix_fmt","yuv420p","-color_primaries","bt709","-color_trc","bt709","-colorspace","bt709","-movflags","+faststart",tmp],stdin=subprocess.PIPE)
        st=time.time()
        for f in range(f0,f1):
            pg.evaluate("ms=>window.__seek(ms)", f*1000/FPS)
            ff.stdin.write(pg.screenshot(type="jpeg",quality=93))
        ff.stdin.close(); rc=ff.wait()
        if rc==0: os.replace(tmp,out)
        print("rendered",out,f1-f0,"frames rc",rc,round(time.time()-st,1),"s")
    if errs: print("PAGE ERRORS:",errs[:8])
    b.close()
