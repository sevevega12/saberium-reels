#!/usr/bin/env python3
"""Builds videos/NN-name/out/timing.json, the ONE timing file that drives a video.

    python3 motor/timing.py videos/NN-name

Reads videos/NN-name/guion.txt (format in motor/README.md) and, if present, the voice
videos/NN-name/voz.mp3.

With a voice: the speech stretches are found by silence detection; every phrase boundary
of the script is snapped to a real silence (monotone dynamic programming over the gaps),
so phrases are never cut inside a word. Phrases are then laid on the video timeline in
order, never stretched or reordered: only moved apart inside silences to give the scenes
air, until the video reaches the target duration. Word times inside a phrase are estimated
by syllables (no transcription tool is installed).

Without a voice: words are timed at about 2.6 words per second so the whole video can be
built and re-timed later when the MP3 arrives.
"""
import json, os, re, subprocess, sys, wave
import numpy as np

CTA_SCREEN = "Comenta WEB y te enseñamos gratis cómo quedaría la tuya"
TAIL = 2.6            # end card hold after the last spoken word
MAX_GAP = 1.5         # most air added between two phrases
MIN_GAP = 0.26        # least air between two placed phrases


def syl(w):
    w = re.sub(r'[^a-záéíóúüñ]', '', w.lower())
    if w == 'web':
        return 1.6
    n = len(re.findall(r'[aeiouáéíóúü]+', w))
    n += len(re.findall(r'[aeo][aeoáéó]|[íú][aeo]|[aeo][íú]', w))
    return max(1, n) + 0.35


def parse_guion(path):
    """Returns (meta, phrases). Each phrase: line id, extra air, markup text."""
    meta, phrases = {}, []
    for raw in open(path, encoding='utf-8'):
        s = raw.strip()
        if not s or s.startswith('#'):
            continue
        m = re.match(r'^([a-zñáéíóú_]+)\s*:\s*(.+)$', s, re.I)
        if m and '|' not in s.split(':', 1)[0]:
            meta[m.group(1).lower()] = m.group(2).strip()
            continue
        m = re.match(r'^(\d+)\s*(?:\+([\d.,]+))?\s*\|\s*(.+)$', s)
        if not m:
            sys.exit(f"guion.txt: no entiendo esta línea: {s!r}")
        phrases.append({"line": int(m.group(1)),
                        "air": float((m.group(2) or '0').replace(',', '.')),
                        "markup": m.group(3).strip()})
    if not phrases:
        sys.exit("guion.txt no tiene frases")
    return meta, phrases


def tokens(markup, screen0):
    """markup -> words with screen/row/style. '|' new caption screen, '/' line break,
    [word] key word in the light-blue pill, *word* nuance word in italic serif."""
    out, screen, row = [], screen0, 0
    for tok in markup.split():
        if tok == '|':
            screen += 1; row = 0; continue
        if tok == '/':
            row += 1; continue
        style, w = 'plain', tok
        m = re.match(r'^\[(.+?)\](.*)$', w)
        if m:
            style, w = 'key', m.group(1) + m.group(2)
        m = re.match(r'^\*(.+?)\*(.*)$', w)
        if m:
            style, w = 'nuance', m.group(1) + m.group(2)
        out.append({"w": w, "screen": screen, "row": row, "style": style})
    return out, screen


def plain(markup):
    s = re.sub(r'(^|\s)[|/](?=\s|$)', ' ', markup)
    return re.sub(r'\s+', ' ', re.sub(r'[\[\]\*]', '', s)).strip()


# ---------------------------------------------------------------- voice analysis
def load_voice(path, sr=16000):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(sr),
                          '-f', 's16le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, '<i2').astype(np.float64) / 32768, sr


def speech_segments(x, sr, min_sil=0.20, min_speech=0.12):
    hop = int(0.01 * sr)
    n = len(x) // hop
    rms = np.sqrt(np.mean(x[:n * hop].reshape(n, hop) ** 2, axis=1) + 1e-12)
    db = 20 * np.log10(rms)
    floor = np.percentile(db, 10); peak = np.percentile(db, 98)
    thr = floor + (peak - floor) * 0.30
    on = db > thr
    segs, i = [], 0
    while i < n:
        if on[i]:
            j = i
            while j < n and on[j]:
                j += 1
            segs.append([i, j]); i = j
        else:
            i += 1
    merged = []
    for a, b in segs:                      # close short silences (inside words)
        if merged and (a - merged[-1][1]) * 0.01 < min_sil:
            merged[-1][1] = b
        else:
            merged.append([a, b])
    merged = [s for s in merged if (s[1] - s[0]) * 0.01 >= min_speech]
    return [(round(a * 0.01, 3), round(b * 0.01, 3)) for a, b in merged]


def snap_boundaries(phr_syl, segs):
    """Assigns every phrase boundary to a distinct silence gap (in order), as close as
    possible to where the syllable count says it should fall. Boundaries that cannot get a
    gap are left inside speech (those phrases stay glued together)."""
    gaps = [((segs[k][1] + segs[k + 1][0]) / 2, k) for k in range(len(segs) - 1)]
    speech = sum(b - a for a, b in segs)
    # time position of a syllable fraction, walking through speech only
    def at(frac):
        left = frac * speech
        for a, b in segs:
            if left <= b - a:
                return a + left
            left -= b - a
        return segs[-1][1]
    tot = sum(phr_syl); acc = 0; targets = []
    for s in phr_syl[:-1]:
        acc += s; targets.append(at(acc / tot))
    B, G = len(targets), len(gaps)
    if B == 0:
        return []
    INF = 1e18
    # dp[i][j]: best cost placing first i boundaries using gaps[:j]
    dp = np.full((B + 1, G + 1), INF); dp[0, :] = 0
    choice = {}
    skip_cost = 4.0                      # a boundary left inside speech
    for i in range(1, B + 1):
        dp[i][0] = dp[i - 1][0] + skip_cost
        for j in range(1, G + 1):
            use = dp[i - 1][j - 1] + abs(gaps[j - 1][0] - targets[i - 1])
            keep = dp[i][j - 1]
            skip = dp[i - 1][j] + skip_cost
            best = min(use, keep, skip)
            dp[i][j] = best
            choice[(i, j)] = 'use' if best == use else ('keep' if best == keep else 'skip')
    res = [None] * B; i, j = B, G
    while i > 0:
        if j == 0:
            i -= 1; continue
        c = choice[(i, j)]
        if c == 'use':
            res[i - 1] = gaps[j - 1][1]; i -= 1; j -= 1
        elif c == 'keep':
            j -= 1
        else:
            i -= 1
    return res   # gap index (between segs[k] and segs[k+1]) or None


def main(vdir):
    meta, phrases = parse_guion(os.path.join(vdir, 'guion.txt'))
    target = float(meta.get('duracion', '32').replace(',', '.'))
    voice = os.path.join(vdir, meta.get('voz', 'voz.mp3'))
    has_voice = os.path.exists(voice)

    # words per phrase, with caption screens numbered per line
    screens = {}
    for p in phrases:
        s0 = screens.get(p['line'], -1) + 1
        p['words'], last = tokens(p['markup'], s0)
        screens[p['line']] = last
        p['syl'] = sum(syl(w['w']) for w in p['words'])

    if has_voice:
        x, sr = load_voice(voice)
        segs = speech_segments(x, sr)
        bnd = snap_boundaries([p['syl'] for p in phrases], segs)
        # source span of each phrase
        spans, start = [], segs[0][0]
        for i, p in enumerate(phrases):
            if i < len(bnd) and bnd[i] is not None:
                k = bnd[i]; end = segs[k][1]; nxt = segs[k + 1][0]
            elif i < len(bnd):            # glued to the next phrase: split by syllables later
                end = nxt = None
            else:
                end = segs[-1][1]; nxt = None
            spans.append([start, end]);
            if nxt is not None:
                start = nxt
        # glued phrases: share their speech stretch by syllables
        i = 0
        while i < len(spans):
            if spans[i][1] is None:
                j = i
                while spans[j][1] is None:
                    j += 1
                a, b = spans[i][0], spans[j][1]
                tot = sum(phrases[k]['syl'] for k in range(i, j + 1)); t = a
                for k in range(i, j + 1):
                    d = (b - a) * phrases[k]['syl'] / tot
                    spans[k] = [t, t + d]; phrases[k]['glued'] = k < j; t += d
                i = j + 1
            else:
                i += 1
        src_len = len(x) / sr
        # natural gaps in the recording
        nat = [spans[i + 1][0] - spans[i][1] for i in range(len(spans) - 1)]
        speech_total = spans[-1][1] - spans[0][0]
        lead = 0.15
        extra = target - (lead + speech_total + TAIL) - sum(p['air'] for p in phrases)
        # distribute extra air over the gaps that are real silences (not inside the CTA)
        cta_line = phrases[-1]['line']
        slots = [i for i in range(len(nat)) if not phrases[i].get('glued')]
        add = [0.0] * len(nat)
        if extra > 0 and slots:
            # line changes get twice the share of a pause inside a line
            w = [2.0 if phrases[i + 1]['line'] != phrases[i]['line'] else 1.0 for i in slots]
            for _ in range(6):
                room = [MAX_GAP - add[i] for i in slots]
                tw = sum(wi for wi, r in zip(w, room) if r > 1e-6)
                if tw <= 0 or extra <= 1e-6:
                    break
                give = extra / tw; spent = 0
                for wi, i in zip(w, slots):
                    g = min(give * wi, MAX_GAP - add[i]); add[i] += g; spent += g
                extra -= spent
        t = lead + phrases[0]['air']
        vph = []
        for i, p in enumerate(phrases):
            s0, s1 = spans[i]
            p['start'] = round(t, 3)
            d = s1 - s0
            ws = p['words']; tot = p['syl']; tt = t
            for w in ws:
                dd = d * syl(w['w']) / tot
                w['start'] = round(tt, 3); w['end'] = round(tt + dd, 3); tt += dd
            p['end'] = round(t + d, 3)
            vph.append({"line": p['line'], "src_start": round(s0, 3), "src_end": round(s1, 3),
                        "start": p['start'], "end": p['end'], "text": plain(p['markup'])})
            if i < len(nat):
                gap = nat[i] if p.get('glued') else max(MIN_GAP, nat[i]) + add[i]
                t = p['end'] + gap + phrases[i + 1]['air']
        voice_info = {"file": os.path.relpath(voice, vdir), "length": round(src_len, 3),
                      "segments_found": len(segs), "phrases": vph}
    else:
        PACE = 2.6
        t = 0.15 + phrases[0]['air']
        for i, p in enumerate(phrases):
            p['start'] = round(t, 3)
            for w in p['words']:
                d = 1 / PACE
                w['start'] = round(t, 3); w['end'] = round(t + d, 3); t += d
            p['end'] = round(t, 3)
            if i + 1 < len(phrases):
                t += (0.75 if phrases[i + 1]['line'] != p['line'] else 0.35) + phrases[i + 1]['air']
        voice_info = None

    lines = {}
    for p in phrases:
        L = lines.setdefault(p['line'], {"id": p['line'], "words": [], "txt": []})
        L['words'] += p['words']; L['txt'].append(plain(p['markup']))
    out = {"fps": 30,
           "note": "Generado por motor/timing.py. No editar a mano: cambiar guion.txt y volver a generar.",
           "cta_line": phrases[-1]['line'], "cta_screen": CTA_SCREEN, "lines": []}
    if voice_info:
        out["voice"] = voice_info
    for n in sorted(lines):
        L = lines[n]
        out["lines"].append({"id": n, "text": ' '.join(L['txt']), "start": L['words'][0]['start'],
                             "end": L['words'][-1]['end'], "words": L['words']})
    out["duration"] = round(out["lines"][-1]["end"] + TAIL, 2)
    os.makedirs(os.path.join(vdir, 'out'), exist_ok=True)
    json.dump(out, open(os.path.join(vdir, 'out', 'timing.json'), 'w'), ensure_ascii=False, indent=1)
    if voice_info:
        print(f"voz: {voice_info['length']} s, {voice_info['segments_found']} tramos de habla, {len(phrases)} frases")
    else:
        print("sin voz: tiempos sintéticos a 2,6 palabras por segundo")
    for l in out["lines"]:
        print(f"  {l['id']:>2}  {l['start']:6.2f} – {l['end']:6.2f}  {l['text']}")
    print("duración", out["duration"], "s (objetivo", target, ")")
    return out


if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    main(os.path.abspath(sys.argv[1]))
