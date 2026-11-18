#!/usr/bin/env python3
"""Builds a whole reel from its folder.

    python3 motor/build.py videos/NN-name borrador   low-res draft (540x960, 15 fps), fast
    python3 motor/build.py videos/NN-name final      1080x1920, 30 fps, the file to publish
    python3 motor/build.py videos/NN-name audio      only redo the sound on the last picture

Steps: timing.json from guion.txt and voz.mp3 -> frames -> music -> voice laid on the
timeline (cut only inside silences, never stretched) -> mix (voice about -16 LUFS, music
ducks under it) -> MP4 -> automatic checks (motor/check.py) -> contact sheet.
Output: VIDEO/out/reel.mp4 (final) or VIDEO/out/borrador.mp4, plus out/hoja.jpg.
"""
import json, os, subprocess, sys, wave
import numpy as np

MOTOR = os.path.dirname(os.path.abspath(__file__))
PY = sys.executable


def run(*a, **k):
    print('·', ' '.join(str(x) for x in a)[:160], flush=True)
    subprocess.run([str(x) for x in a], check=True, **k)


def lufs(path):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', path, '-af', 'loudnorm=I=-24:TP=-3:print_format=json',
                        '-f', 'null', '-'], capture_output=True, text=True).stderr
    return float(json.loads(r[r.rindex('{'):])['input_i'])


def lay_voice(vdir, tm, out):
    v = tm['voice']; SR = 48000
    src = os.path.join(vdir, 'work', 'voz_src.wav')
    run('ffmpeg', '-v', 'error', '-y', '-i', os.path.join(vdir, v['file']), '-ac', '1', '-ar', SR, src)
    w = wave.open(src); x = np.frombuffer(w.readframes(w.getnframes()), '<i2').astype(np.float64) / 32768
    o = np.zeros(int(tm['duration'] * SR)); ph = v['phrases']
    for i, p in enumerate(ph):
        prev_end = ph[i - 1]['src_end'] if i else 0.0
        next_start = ph[i + 1]['src_start'] if i + 1 < len(ph) else len(x) / SR
        pre = max(0.0, min(0.09, (p['src_start'] - prev_end) / 2))
        post = max(0.0, min(0.14, (next_start - p['src_end']) / 2))
        a = int((p['src_start'] - pre) * SR); b = int((p['src_end'] + post) * SR); s = x[a:b].copy()
        f = min(int(0.025 * SR), len(s) // 4)
        if f > 0:
            s[:f] *= np.linspace(0, 1, f); s[-f:] *= np.linspace(1, 0, f)
        st = int((p['start'] - pre) * SR); n = min(len(s), len(o) - st)
        if n > 0:
            o[st:st + n] += s[:n]
    ww = wave.open(out, 'wb'); ww.setnchannels(1); ww.setsampwidth(2); ww.setframerate(SR)
    ww.writeframes((np.clip(o, -1, 1) * 32767).astype('<i2').tobytes()); ww.close()


def sound(vdir, tm, video_in, out_mp4):
    wk = os.path.join(vdir, 'work')
    run(PY, os.path.join(MOTOR, 'musica.py'), vdir, f'{wk}/music_raw.wav')
    gm = round(-24 - lufs(f'{wk}/music_raw.wav'), 2)
    run('ffmpeg', '-v', 'error', '-y', '-i', f'{wk}/music_raw.wav', '-af',
        f'volume={gm}dB,alimiter=limit=0.7:attack=2:release=60:level=disabled', '-ar', '48000', f'{wk}/music.wav')
    if 'voice' in tm:
        lay_voice(vdir, tm, f'{wk}/voice_raw.wav')
        gv = round(-15.2 - lufs(f'{wk}/voice_raw.wav'), 2)
        run('ffmpeg', '-v', 'error', '-y', '-i', f'{wk}/music.wav', '-i', f'{wk}/voice_raw.wav', '-filter_complex',
            f'[1:a]volume={gv}dB,highpass=f=70,alimiter=limit=0.89:attack=2:release=50:level=disabled,'
            'aformat=channel_layouts=stereo,asplit=2[v][key];[0:a][key]sidechaincompress=threshold=0.02:ratio=8:'
            'attack=15:release=420:makeup=1[m];[m][v]amix=inputs=2:normalize=0,alimiter=limit=0.94:attack=2:'
            'release=50:level=disabled[a]', '-map', '[a]', '-ar', '48000', f'{wk}/mix.wav')
        print(f'voz {gv} dB, música {gm} dB')
    else:
        run('cp', f'{wk}/music.wav', f'{wk}/mix.wav'); print('sin voz: solo música')
    run('ffmpeg', '-v', 'error', '-y', '-i', video_in, '-i', f'{wk}/mix.wav', '-map', '0:v', '-map', '1:a',
        '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out_mp4)


def main(vdir, mode):
    wk = os.path.join(vdir, 'work'); od = os.path.join(vdir, 'out')
    os.makedirs(wk, exist_ok=True); os.makedirs(od, exist_ok=True)
    if mode != 'audio':
        run(PY, os.path.join(MOTOR, 'timing.py'), vdir)
    tm = json.load(open(os.path.join(od, 'timing.json')))
    D = tm['duration']
    name = 'reel.mp4' if mode in ('final', 'audio') else 'borrador.mp4'
    pic = f'{wk}/video_{"final" if mode != "borrador" else "borrador"}.mp4'
    if mode in ('final', 'borrador'):
        scale, fps = (1.0, 30) if mode == 'final' else (0.5, 15)
        H = round(D / 2 * fps) / fps
        r = os.path.join(MOTOR, 'render.py')
        p1 = subprocess.Popen([PY, r, vdir, 'video', f'{wk}/v1.mp4', '0', str(H), str(scale), str(fps)])
        p2 = subprocess.Popen([PY, r, vdir, 'video', f'{wk}/v2.mp4', str(H), '0', str(scale), str(fps)])
        if p1.wait() or p2.wait():
            sys.exit('falló el render')
        open(f'{wk}/list.txt', 'w').write("file v1.mp4\nfile v2.mp4\n")
        run('ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-i', f'{wk}/list.txt', '-c', 'copy', pic)
    sound(vdir, tm, pic, os.path.join(od, name))
    rc = subprocess.run([PY, os.path.join(MOTOR, 'check.py'), vdir, os.path.join(od, name)]).returncode
    sys.exit(rc)


if __name__ == '__main__':
    if len(sys.argv) < 3 or sys.argv[2] not in ('borrador', 'final', 'audio'):
        sys.exit(__doc__)
    main(os.path.abspath(sys.argv[1]), sys.argv[2])
