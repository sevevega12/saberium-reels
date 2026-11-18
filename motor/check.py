#!/usr/bin/env python3
"""Automatic checks on a built reel. Exit code 1 if anything blocks publishing.

    python3 motor/check.py videos/NN-name videos/NN-name/out/reel.mp4

  - duration between 28 and 35 seconds
  - final file: 1080x1920, 30 fps, H.264 yuv420p, under 50 MB
  - no text box in the top fifth or the bottom fifth at any moment (Instagram covers them)
  - no flat or white screen anywhere (one frame every 0.5 s)
  - call to action on screen word for word, and the end card has time to be seen
  - voice present (warning if the video was built without one)
Writes VIDEO/out/control.json and the contact sheet VIDEO/out/hoja.jpg.
"""
import json, os, subprocess, sys
import numpy as np

MOTOR = os.path.dirname(os.path.abspath(__file__))
TOP, BOTTOM = 384, 1536
DMIN, DMAX = 28.0, 35.0
CTA_SCREEN = "Comenta WEB y te enseñamos gratis cómo quedaría la tuya"


def probe(mp4):
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries',
                        'format=duration,size:stream=codec_type,codec_name,width,height,r_frame_rate,pix_fmt',
                        '-of', 'json', mp4], capture_output=True, text=True, check=True)
    return json.loads(r.stdout)


def main(vdir, mp4):
    errors, warns = [], []
    tm = json.load(open(os.path.join(vdir, 'out', 'timing.json')))
    an = json.load(open(os.path.join(vdir, 'work', 'anchors.json')))
    info = probe(mp4)
    dur = float(info['format']['duration']); size = int(info['format']['size'])
    v = next(s for s in info['streams'] if s['codec_type'] == 'video')
    final = os.path.basename(mp4) == 'reel.mp4'
    if not DMIN <= dur <= DMAX:
        errors.append(f"dura {dur:.1f} s; tiene que estar entre {DMIN:.0f} y {DMAX:.0f}")
    if final:
        if (v['width'], v['height']) != (1080, 1920): errors.append(f"resolución {v['width']}x{v['height']}, no 1080x1920")
        if v['r_frame_rate'] not in ('30/1',): errors.append(f"fps {v['r_frame_rate']}, no 30")
        if v['codec_name'] != 'h264' or v['pix_fmt'] != 'yuv420p': errors.append("no es H.264 yuv420p")
        if size > 50e6: errors.append(f"pesa {size/1e6:.0f} MB, más de 50")
    if not any(s['codec_type'] == 'audio' for s in info['streams']): errors.append("no tiene audio")
    if 'voice' not in tm: warns.append("hecho sin voz (tiempos sintéticos): falta voz.mp3")

    # ---- safe zones
    lay = os.path.join(vdir, 'work', 'layout.json')
    subprocess.run([sys.executable, os.path.join(MOTOR, 'render.py'), vdir, 'layout', lay, '0.25'], check=True)
    bad = {}
    for fr in json.load(open(lay)):
        for b in fr['boxes']:
            if b['top'] < TOP - 2 or b['bottom'] > BOTTOM + 2:
                k = b['txt']; bad.setdefault(k, []).append(fr['t'])
            if b['left'] < 20 or b['right'] > 1060:
                warns.append(f"texto pegado al borde o cortado: «{b['txt']}»")
    for k, ts in bad.items():
        errors.append(f"texto en zona tapada por Instagram ({ts[0]}–{ts[-1]} s): «{k}»")
    last = json.load(open(lay))[-1]['boxes']
    shown = ' '.join(b['txt'] for b in last if b['txt'] and b['txt'] != 'saberium.com · @saberium.studio')
    norm = lambda s: ' '.join(s.replace('\xa0', ' ').split())
    if CTA_SCREEN not in norm(shown):
        errors.append(f"la frase de cierre no está literal al final; se ve: «{norm(shown)[:90]}»")
    if tm['duration'] - an.get('end0', tm['duration']) < 1.6:
        errors.append("la tarjeta final dura menos de 1,6 s")

    # ---- blank or flat screens
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', mp4, '-vf', 'fps=2,scale=108:192,format=gray',
                        '-f', 'rawvideo', '-'], capture_output=True, check=True).stdout
    fr = np.frombuffer(r, np.uint8).reshape(-1, 192, 108)
    for i, f in enumerate(fr):
        t = i / 2
        if f.std() < 6: errors.append(f"pantalla plana o vacía en {t:.1f} s")
        elif (f > 235).mean() > 0.45: errors.append(f"pantalla casi blanca en {t:.1f} s")
    # something must change every 4 s
    diffs = [np.abs(fr[i + 1].astype(int) - fr[i]).mean() for i in range(len(fr) - 1)]
    still = 0
    for i, d in enumerate(diffs):
        still = still + 1 if d < 0.6 else 0
        if still >= 8: warns.append(f"casi nada se mueve durante 4 s hasta {i/2+0.5:.1f} s"); still = 0

    # ---- contact sheet
    sheet = os.path.join(vdir, 'out', 'hoja.jpg')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', mp4, '-vf',
                    f"fps=1/{max(dur/36,0.5):.3f},scale=300:-1,tile=9x4:padding=6:margin=6:color=0x04051C",
                    '-frames:v', '1', '-q:v', '3', sheet], check=True)
    rep = {"archivo": mp4, "duracion": round(dur, 2), "errores": errors, "avisos": sorted(set(warns))}
    json.dump(rep, open(os.path.join(vdir, 'out', 'control.json'), 'w'), ensure_ascii=False, indent=1)
    print(f"\nCONTROL · {os.path.basename(mp4)} · {dur:.1f} s · {size/1e6:.1f} MB")
    for e in errors: print("  ERROR:", e)
    for w in sorted(set(warns)): print("  aviso:", w)
    print("  OK" if not errors else f"  {len(errors)} error(es)")
    print("  hoja de fotogramas:", sheet)
    sys.exit(1 if errors else 0)


if __name__ == '__main__':
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    main(os.path.abspath(sys.argv[1]), sys.argv[2])
