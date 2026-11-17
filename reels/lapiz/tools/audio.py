"""Voice edit (cuts only inside silences) + original synthesized soundtrack + mix. Output: out/audio-mix.wav"""
import json, os, subprocess, sys
import numpy as np
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SR = 48000
plan = json.load(open(f'{R}/plan.json')); DUR = plan['duration']; N = int(DUR * SR)
tt = np.arange(N) / SR
rng = np.random.default_rng(12)

# ---------------- voice ----------------
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f'{R}/audio/voz-original.mp3', '-ar', str(SR), '-ac', '1', '-f', 'f32le', '-'], capture_output=True).stdout
v = np.frombuffer(raw, dtype=np.float32).astype(np.float64)
voice = np.zeros(N)
PAD, FADE = 0.07, 0.025
segs = plan['segments']
for i, sg in enumerate(segs):
    a, b = sg['src']
    # pad into the surrounding silence, never past the midpoint to the neighbouring phrase
    pa = min(PAD, (a - segs[i - 1]['src'][1]) / 2) if i else min(PAD, a)
    pb = min(PAD, (segs[i + 1]['src'][0] - b) / 2) if i < len(segs) - 1 else min(PAD, len(v) / SR - b)
    s0, s1 = int((a - pa) * SR), int((b + pb) * SR)
    clip = v[s0:s1].copy(); f = int(FADE * SR)
    clip[:f] *= np.linspace(0, 1, f); clip[-f:] *= np.linspace(1, 0, f)
    d0 = int((sg['dst'] - pa) * SR)
    voice[d0:d0 + len(clip)] += clip

def lufs(x):
    p = subprocess.run(['ffmpeg', '-hide_banner', '-f', 'f64le', '-ar', str(SR), '-ac', '1', '-i', '-', '-af', 'ebur128', '-f', 'null', '-'], input=x.astype(np.float64).tobytes(), capture_output=True)
    for line in p.stderr.decode().splitlines()[::-1]:
        if line.strip().startswith('I:'): return float(line.split()[1])
g = 10 ** ((-16.0 - lufs(voice)) / 20)
voice *= g
voice = np.tanh(voice / 0.89) * 0.89          # gentle peak control
voice *= 10 ** ((-16.0 - lufs(voice)) / 20)
print('voice gain dB', round(20 * np.log10(g), 2), 'LUFS', lufs(voice), 'peak', round(float(np.abs(voice).max()), 3))

# ---------------- synth helpers ----------------
def env(t0, a, d, n=N):
    """attack a, exponential decay d, starting at t0"""
    x = tt - t0; e = np.where(x < 0, 0, np.where(x < a, x / max(a, 1e-6), np.exp(-(x - a) / d))); return e
def ramp(t0, t1): return np.clip((tt - t0) / (t1 - t0), 0, 1)
def gate(t0, t1, f=0.05): return np.clip((tt - t0) / f, 0, 1) * np.clip((t1 - tt) / f, 0, 1)
def lp(x, fc):
    fc = np.broadcast_to(np.asarray(fc, dtype=float), x.shape); a = 1 - np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x); s = 0.0
    for i in range(len(x)): s += a[i] * (x[i] - s); y[i] = s
    return y
def lp_fast(x, fc):  # constant cutoff one-pole via lfilter-free cumulative trick
    a = 1 - np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); s = 0.0
    xb = x.tolist(); out = []
    for val in xb: s += a * (val - s); out.append(s)
    return np.array(out)
def hp_fast(x, fc): return x - lp_fast(x, fc)
def note(m): return 440 * 2 ** ((m - 69) / 12)
def sine(f, ph=0): return np.sin(2 * np.pi * f * tt + ph)
def place(buf, t0, sig):
    i = int(t0 * SR)
    if i >= N: return
    n = min(len(sig), N - i); buf[i:i + n] += sig[:n]
def local(d): return np.arange(int(d * SR)) / SR
noise = rng.standard_normal(N)

L = np.zeros(N); Rr = np.zeros(N)
def add(sig, pan=0.0, g=1.0):
    global L, Rr
    L += sig * g * np.sqrt(0.5 * (1 - pan)) * 1.414; Rr += sig * g * np.sqrt(0.5 * (1 + pan)) * 1.414

T = dict(freeze=4.2, unfreeze=6.0, withdraw=8.3, lower=10.3, touch=12.3, morph0=15.75, morph1=17.3, wake=17.4, results=19.8, tap1=20.75, load0=20.95, loadEnd=23.4,
         grid0=23.75, grid1=25.2, foot0=25.75, foot1=26.35, yearEnd=27.7, sum0=28.4, back0=30.7, tap2=33.3, blank0=36.7, draw0=37.3, draw1=39.3, real0=39.45,
         site2=41.5, site3=43.25, out0=44.5, write0=45.4, write1=47.3, end0=48.75)

# ---------- 1. hook: low tense bed that rises and stops dead ----------
h = ramp(0, T['freeze']); hg = (tt < T['freeze'])
saw = sum(((tt * note(26) * d) % 1.0 - 0.5) for d in (1.0, 1.006, 0.5, 2.003)) / 4
bed = lp(saw[:int(T['freeze'] * SR)], 90 + 1500 * h[:int(T['freeze'] * SR)] ** 2.2)
bed = np.pad(bed, (0, N - len(bed)))
add(bed * (0.25 + 0.75 * h ** 1.5) * hg, 0, 0.55)
add(sine(note(26)) * (0.3 + 0.7 * h) * hg, 0, 0.30)                                   # sub
clus = (sine(note(74)) + sine(note(75) * 1.003) + sine(note(81) * 0.998)) / 3 * (1 + 0.3 * sine(5.5 + 3 * h))
add(clus * h ** 2.5 * hg, -0.2, 0.10); add(clus * h ** 2.5 * hg, 0.2, 0.10)             # dissonant strings
nz = hp_fast(noise[:int(T['freeze'] * SR)], 2500); nz = np.pad(nz, (0, N - len(nz)))
add(nz * h ** 3 * hg, 0, 0.05)                                                        # air riser
# accelerating pulse (heartbeat of the blades closing)
tp = 0.25
while tp < T['freeze'] - 0.05:
    x = local(0.22); k = tp / T['freeze']
    thump = np.sin(2 * np.pi * (58 + 40 * np.exp(-x / 0.02)) * x) * np.exp(-x / 0.07)
    place(L, tp, thump * (0.25 + 0.4 * k)); place(Rr, tp, thump * (0.25 + 0.4 * k))
    tp += 0.62 - 0.44 * k
# the stop: steel "tink" and nothing else
x = local(0.9)
tink = sum(np.sin(2 * np.pi * f * x) * np.exp(-x / d) * a for f, d, a in ((2093, .22, 1), (3322, .16, .6), (5274, .1, .45), (7458, .06, .3)))
place(L, T['freeze'], tink * 0.16); place(Rr, T['freeze'] + 0.004, tink * 0.14)
x = local(0.5); drop = np.sin(2 * np.pi * (40 + 60 * np.exp(-x / 0.05)) * x) * np.exp(-x / 0.12)
place(L, T['freeze'], drop * 0.5); place(Rr, T['freeze'], drop * 0.5)

# ---------- 2. body: soft modern pulse ----------
BPM = 96; beat = 60 / BPM; T0 = T['unfreeze']
sections = [  # (start, chord midi notes, brightness, pulse level)
    (6.0, [38, 45, 53, 60, 64], 0.35, 0.0), (10.25, [38, 45, 53, 60, 64], 0.5, 0.7), (17.4, [34, 46, 53, 57, 62], 0.5, 0.8),
    (20.95, [31, 43, 50, 58, 62], 0.3, 0.9), (25.75, [33, 45, 52, 55, 60], 0.3, 0.9), (28.4, [38, 45, 50, 57], 0.18, 0.25),
    (33.3, [34, 41, 50, 53], 0.15, 0.2), (37.3, [41, 48, 57, 60, 67], 0.55, 0.7), (39.45, [41, 53, 57, 60, 65, 72], 0.9, 1.0),
    (42.4, [36, 48, 55, 60, 64, 72], 0.9, 1.0), (45.4, [38, 50, 57, 62, 65, 69], 0.8, 0.8), (48.75, [41, 53, 57, 60, 67, 72], 0.7, 0.0), (DUR + 1, [], 0, 0)]
pad = np.zeros(N); padR = np.zeros(N)
for (s0, ch, br, pl), (s1, *_rest) in zip(sections[:-1], sections[1:]):
    e = gate(s0 - 0.25, min(s1, DUR) + 0.35, 0.6)
    for j, m in enumerate(ch):
        f = note(m)
        w = sum(np.sin(2 * np.pi * f * k * tt + j) / k ** (2.4 - br * 0.9) for k in (1, 2, 3, 4))
        trem = 1 + 0.12 * np.sin(2 * np.pi * (0.13 + 0.03 * j) * tt + j)
        pad += w * e * trem * (0.6 if m < 44 else 0.35) * (0.5 + 0.5 * ((j % 2) == 0)); padR += w * e * trem * (0.6 if m < 44 else 0.35) * (0.5 + 0.5 * ((j % 2) == 1))
L += pad * 0.045; Rr += padR * 0.045
# pulse: 8th-note pluck on chord tones, soft kick on beats
def sect(t):
    for (s0, ch, br, pl), (s1, *_r) in zip(sections[:-1], sections[1:]):
        if s0 <= t < s1: return ch, br, pl
    return [], 0, 0
k = 0; tq = 10.25
while tq < 48.7:
    ch, br, pl = sect(tq)
    if pl > 0 and ch:
        x = local(0.5)
        order = [1, 2, 3, 2, 4 % len(ch), 2, 3, 1]
        m = ch[order[k % 8] % len(ch)] + (12 if br > 0.6 and k % 2 else 0)
        f = note(m + 12)
        pl_s = (np.sin(2 * np.pi * f * x) + 0.4 * np.sin(2 * np.pi * 2 * f * x) * np.exp(-x / 0.05) * (0.5 + br)) * np.exp(-x / (0.10 + 0.12 * br)) * np.minimum(1, x / 0.004)
        pan = 0.35 * (1 if k % 2 else -1)
        place(L, tq, pl_s * 0.07 * pl * np.sqrt(1 - pan)); place(Rr, tq, pl_s * 0.07 * pl * np.sqrt(1 + pan))
        if k % 2 == 0:
            kick = np.sin(2 * np.pi * (46 + 50 * np.exp(-x / 0.025)) * x) * np.exp(-x / 0.13)
            place(L, tq, kick * 0.20 * pl); place(Rr, tq, kick * 0.20 * pl)
        if k % 4 == 2 and br > 0.6:
            hat = rng.standard_normal(len(x)) * np.exp(-x / 0.03); hat = hat - np.concatenate([[0], hat[:-1]])
            place(L, tq, hat * 0.012); place(Rr, tq, hat * 0.014)
    tq += beat / 2; k += 1

# ---------- 3. hits on the transitions ----------
def whoosh(t0, d, f0, f1, g=0.1, pan0=-0.6, pan1=0.6):
    x = local(d); n = rng.standard_normal(len(x)); u = x / d
    fc = f0 * (f1 / f0) ** u
    # state-variable-ish bandpass by difference of one-poles
    y = lp(n, fc * 1.6) - lp(n, fc * 0.6)
    e = np.sin(np.pi * u) ** 1.5
    p = pan0 + (pan1 - pan0) * u
    place(L, t0, y * e * g * np.sqrt(0.5 * (1 - p)) * 1.4); place(Rr, t0, y * e * g * np.sqrt(0.5 * (1 + p)) * 1.4)
def boom(t0, g=0.5, f=42):
    x = local(1.2); y = np.sin(2 * np.pi * (f + 55 * np.exp(-x / 0.04)) * x) * np.exp(-x / 0.3)
    place(L, t0, y * g); place(Rr, t0, y * g)
def click(t0, g=0.1, f=1800, d=0.012, pan=0.0):
    x = local(0.08); y = np.sin(2 * np.pi * f * x) * np.exp(-x / d)
    place(L, t0, y * g * (1 - pan * 0.5)); place(Rr, t0, y * g * (1 + pan * 0.5))
def bell(t0, m, g=0.08, d=0.5):
    x = local(1.6); f = note(m)
    y = (np.sin(2 * np.pi * f * x) + 0.35 * np.sin(2 * np.pi * f * 2.76 * x) * np.exp(-x / 0.15) + 0.2 * np.sin(2 * np.pi * f * 2 * x)) * np.exp(-x / d) * np.minimum(1, x / 0.003)
    place(L, t0, y * g); place(Rr, t0 + 0.006, y * g)
def scratch(t0, t1, g=0.05, seed=1):
    r = np.random.default_rng(seed); x = local(t1 - t0); n = r.standard_normal(len(x))
    y = lp_fast(hp_fast(n, 1800), 5200)
    am = np.clip(lp_fast(np.repeat(r.random(int((t1 - t0) * 9) + 2), SR // 9)[:len(x)], 30) * 1.8 - 0.35, 0, 1)
    place(L, t0, y * am * g * 1.1); place(Rr, t0, y * am * g * 0.8)

whoosh(T['withdraw'] + 0.4, 1.8, 5000, 600, 0.10, 0.0, 0.8)           # scissors leave
x = local(1.0); shing = sum(np.sin(2 * np.pi * f * x * (1 + 0.02 * x)) for f in (3100, 4650, 6230)) * np.exp(-x / 0.35) * np.minimum(1, x / 0.05)
place(L, T['withdraw'] + 0.5, shing * 0.012); place(Rr, T['withdraw'] + 0.5, shing * 0.02)
click(T['touch'], 0.22, 900, 0.01); boom(T['touch'], 0.32, 60)       # graphite on paper
whoosh(T['morph0'] - 0.1, 1.6, 300, 2600, 0.07, -0.3, 0.3)            # sheet -> phone
bell(T['wake'], 81, 0.07, 0.6); bell(T['wake'] + 0.09, 88, 0.05, 0.7); boom(T['wake'], 0.3, 48)
for i in range(19): click(18.85 + i * (0.9 / 19), 0.035, 2600 + 300 * rng.random(), 0.004, rng.uniform(-.5, .5))   # typing
click(T['results'] + 0.1, 0.06, 1200, 0.02)
click(T['tap1'], 0.14, 1500, 0.008); click(T['tap1'] + 0.03, 0.08, 700, 0.02)
whoosh(T['load0'] - 0.05, 0.4, 800, 2400, 0.06, 0.5, -0.5)
tk = T['load0'] + 0.15                                                 # load counter: ticks slowing down as it stalls
while tk < T['loadEnd'] - 0.05:
    u = (tk - T['load0']) / (T['loadEnd'] - T['load0']); click(tk, 0.045, 2100 - 500 * u, 0.006, 0.4); tk += 0.045 + 0.16 * u ** 1.6
boom(T['loadEnd'], 0.34, 52)
tk = T['grid0']                                                        # templates multiplying
while tk < T['grid1']:
    u = (tk - T['grid0']) / (T['grid1'] - T['grid0']); click(tk, 0.03 + 0.03 * u, 1500 + 1800 * rng.random(), 0.005, rng.uniform(-.8, .8)); tk += 0.11 - 0.09 * np.sin(np.pi * u)
whoosh(T['grid0'], 1.4, 2400, 500, 0.06, 0.0, 0.0); boom(T['grid1'], 0.36, 48)
whoosh(T['foot0'], 0.6, 600, 2200, 0.06, -0.4, 0.4)
for i in range(10):                                                    # year rolling back: ratchet
    u = i / 9; click(T['foot1'] + 0.12 + (T['yearEnd'] - T['foot1'] - 0.2) * (1 - (1 - u) ** 2.2), 0.08, 1100 - 40 * i, 0.012, -0.3)
boom(T['yearEnd'], 0.3, 50)
for i in range(3): boom(T['sum0'] + 0.1 + i * 0.07, 0.3, 46 - i * 3); click(T['sum0'] + 0.1 + i * 0.07, 0.07, 500, 0.03)
whoosh(T['back0'] - 0.05, 0.45, 2400, 800, 0.06, -0.5, 0.5)
click(T['tap2'], 0.14, 1500, 0.008); click(T['tap2'] + 0.03, 0.08, 700, 0.02)
x = local(1.6); fall = np.sin(2 * np.pi * np.cumsum(note(62) * 2 ** (-(3 / 12) * np.clip(x / 0.5, 0, 1))) / SR) * np.exp(-x / 0.5) * np.minimum(1, x / 0.02)
place(L, T['tap2'] + 0.25, fall * 0.06); place(Rr, T['tap2'] + 0.25, fall * 0.06)                                   # he's gone
whoosh(T['blank0'] - 0.1, 0.8, 500, 3000, 0.06, 0.0, 0.0)
scratch(T['draw0'], T['draw1'], 0.06, 3)
boom(T['real0'], 0.5, 44); [bell(T['real0'] + i * 0.05, m, 0.06, 0.9) for i, m in enumerate((65, 72, 77, 81))]        # payoff
whoosh(T['real0'] - 0.5, 0.6, 400, 4000, 0.08, -0.6, 0.6)
whoosh(T['site2'] - 0.05, 0.5, 2600, 900, 0.06, 0.6, -0.6); whoosh(T['site3'] - 0.05, 0.5, 2600, 900, 0.06, 0.6, -0.6)
for tc, m in ((T['real0'] + 1.15, 81), (T['site2'] + 0.55, 84), (T['site3'] + 0.5, 89)): bell(tc, m, 0.09, 0.45); click(tc, 0.06, 2400, 0.004)
whoosh(T['out0'], 0.8, 2400, 400, 0.07, 0.0, 0.0)
scratch(T['write0'], T['write1'], 0.075, 5)
boom(T['end0'], 0.45, 44); [bell(T['end0'] + i * 0.06, m, 0.05, 1.2) for i, m in enumerate((65, 72, 76, 81))]

# ---------- 4. duck under the voice, master ----------
ve = np.abs(voice); w = int(0.03 * SR); ve = np.convolve(ve, np.ones(w) / w, 'same')
att, rel = np.exp(-1 / (0.02 * SR)), np.exp(-1 / (0.35 * SR)); e = np.empty(N); s = 0.0
for i, x_ in enumerate(ve.tolist()): s = max(x_, s * rel) if x_ < s else att * s + (1 - att) * x_; e[i] = s
duck = 1 - 0.6 * np.clip(e / 0.06, 0, 1)                                  # about -8 dB while she speaks
body = 0.85                                                                # overall music level
mg = np.where(tt < T['freeze'] + 0.9, 1.0, body)
L *= duck * mg; Rr *= duck * mg
fade = np.clip((DUR - tt) / 1.3, 0, 1) ** 1.5 * np.clip(tt / 0.03, 0, 1); L *= fade; Rr *= fade
music = np.stack([L, Rr], 1)
print('music LUFS (mono sum)', lufs((L + Rr) / 2), 'peak', round(float(np.abs(music).max()), 3))
mix = music + voice[:, None]
mix = np.tanh(mix / 0.95) * 0.95
os.makedirs(f'{R}/out', exist_ok=True)
for name, arr in (('audio-mix', mix), ('voz-editada', np.stack([voice, voice], 1))):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', f'{R}/out/{name}.wav'], input=arr.astype(np.float32).tobytes(), check=True)
print('mix LUFS', lufs(mix.mean(1)), 'peak', round(float(np.abs(mix).max()), 3))
