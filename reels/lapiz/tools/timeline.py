"""Builds src/timeline.json (video-time word + line timings) from plan.json + whisper words."""
import json, os
R = os.path.join(os.path.dirname(__file__), '..')
plan = json.load(open(f'{R}/plan.json'))
ww = json.load(open(f'{R}/audio/whisper-words.json'))
segs = []
for sg in plan['segments']:
    a, b = sg['src']; off = sg['dst'] - a
    words = sg['text'].split()
    inside = [w for w in ww if a - 0.25 <= (w['s'] + w['e']) / 2 <= b + 0.05]
    out = []
    if len(inside) == len(words):
        for i, (txt, w) in enumerate(zip(words, inside)):
            s = max(a, w['s']) if i else a
            e = min(b, w['e']) if i < len(words) - 1 else b
            out.append([txt, s, e])
    else:  # counts differ: spread by character length
        tot = sum(len(w) + 1 for w in words); t = a
        for txt in words:
            d = (b - a) * (len(txt) + 1) / tot; out.append([txt, t, t + d]); t += d
        print('fallback spread for', sg['id'], len(inside), len(words))
    for i in range(len(out) - 1):  # contiguous, monotonic
        out[i][2] = max(out[i][1] + 0.04, min(out[i][2], out[i + 1][1]))
    segs.append({'id': sg['id'], 'line': sg['line'], 'text': sg['text'],
                 'start': round(sg['dst'], 3), 'end': round(b + off, 3),
                 'words': [{'w': t, 's': round(s + off, 3), 'e': round(e + off, 3)} for t, s, e in out]})
lines = {}
for s in segs:
    L = lines.setdefault(s['line'], {'line': s['line'], 'start': s['start'], 'end': s['end'], 'text': [], 'phrases': []})
    L['end'] = s['end']; L['text'].append(s['text']); L['phrases'].append({'id': s['id'], 'text': s['text'], 'start': s['start'], 'end': s['end']})
lines = [dict(v, text=' '.join(v['text'])) for v in lines.values()]
json.dump({'fps': plan['fps'], 'duration': plan['duration'], 'segments': segs}, open(f'{R}/src/timeline.json', 'w'), ensure_ascii=False, indent=1)
json.dump({'video': 'saberium-reel-lapiz.mp4', 'fps': plan['fps'], 'duration': plan['duration'], 'units': 'seconds', 'lines': lines},
          open(f'{R}/out/tiempos.json', 'w'), ensure_ascii=False, indent=1)
for s in segs: print(s['id'], s['start'], s['end'], ' '.join(f"{w['w']}@{w['s']:.2f}" for w in s['words']))
