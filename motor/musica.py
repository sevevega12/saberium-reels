#!/usr/bin/env python3
"""Original soundtrack synthesized in code (no copyrighted music).

    musica.py VIDEO OUT.wav

Reads VIDEO/work/anchors.json, which the renderer writes from the scenes:
  _sections: [{t0,t1,mood}]  mood = tension | pulso | calma | claro | final
  _hits:     [{t,kind,gain}] kind = hit | whoosh | whoosh_rev | click | tick | thud | rise | pluck | knock
So re-timing the voice re-times the music. The bed is normalised later (build.py) to sit
well under the voice.
"""
import json, os, sys, wave
import numpy as np
from scipy.signal import butter, sosfilt

vdir, out = sys.argv[1], sys.argv[2]
A = json.load(open(os.path.join(vdir, 'work', 'anchors.json')))
TM = json.load(open(os.path.join(vdir, 'out', 'timing.json')))
SR = 48000; DUR = TM['duration']; N = int(DUR * SR)
seed = sum(ord(c) for c in os.path.basename(os.path.abspath(vdir)))
rs = np.random.RandomState(seed % 1000)
Lc = np.zeros(N); Rc = np.zeros(N)


def add(sig, t, gain=1.0, pan=0.0):
    i = int(t * SR)
    if i < 0:
        sig = sig[-i:]; i = 0
    n = min(len(sig), N - i)
    if n <= 0:
        return
    Lc[i:i + n] += sig[:n] * gain * (1 - max(pan, 0) * 0.6)
    Rc[i:i + n] += sig[:n] * gain * (1 + min(pan, 0) * 0.6)


def tt(d): return np.arange(max(1, int(d * SR))) / SR


def bp(x, lo, hi, order=2):
    if lo <= 0: sos = butter(order, hi, btype='low', fs=SR, output='sos')
    elif hi >= SR / 2: sos = butter(order, lo, btype='high', fs=SR, output='sos')
    else: sos = butter(order, [lo, hi], btype='band', fs=SR, output='sos')
    return sosfilt(sos, x)


def fade(d, a, r):
    t = tt(d); return np.minimum(t / max(a, 1e-3), 1) * np.clip((d - t) / max(r, 1e-3), 0, 1)


def thud():
    d = 0.6; t = tt(d); f = 78 * np.exp(-t * 7) + 42
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 8.5) + bp(rs.randn(len(t)), 0, 420) * np.exp(-t * 38) * 1.3)


def hit(f0=58, dec=7, noise=0.25):
    d = 0.7; t = tt(d); f = f0 * 1.6 * np.exp(-t * 22) + f0
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * dec) + bp(rs.randn(len(t)), 0, 900) * np.exp(-t * 30) * noise


def whoosh(d=0.6, lo=300, hi=5000, rev=False):
    t = tt(d); n = rs.randn(len(t)); k = t / d; o = np.zeros(len(t)); bands = 8
    for b in range(bands):
        a = int(len(t) * b / bands); e = int(len(t) * (b + 1) / bands) + 2000
        fc = lo * (hi / lo) ** ((b + 0.5) / bands); sg = bp(n[a:e], fc * 0.6, min(fc * 1.6, SR / 2 - 100))
        o[a:a + len(sg)] += (sg * np.hanning(len(sg)))[:len(o) - a]
    o *= np.sin(np.pi * k) ** 1.5
    return o[::-1] if rev else o


def click(f=2400, d=0.03):
    t = tt(d); return np.sin(2 * np.pi * f * t) * np.exp(-t * 160) + bp(rs.randn(len(t)), 2000, 7000) * np.exp(-t * 260) * 0.4


def pluck(f, d=1.1, warm=1.0):
    t = tt(d)
    s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t) * np.exp(-t * 6) + 0.12 * np.sin(6 * np.pi * f * t) * np.exp(-t * 10)
    return s * np.exp(-t * (4.2 / warm)) * np.minimum(t / 0.004, 1)


def knock(f=180):
    t = tt(0.25); return np.sin(2 * np.pi * (f * np.exp(-t * 9)) * t) * np.exp(-t * 22)


def rise(d=1.2):
    t = tt(d); f = 180 * (4 ** (t / d))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * (t / d) ** 2 * 0.6 + bp(rs.randn(len(t)), 800, 6000) * (t / d) ** 3 * 0.5


def pad(freqs, d, cut=900, trem=0.12):
    t = tt(d); s = np.zeros(len(t))
    for f in freqs:
        for det in (-0.25, 0.2):
            ph = rs.rand() * 6.28; w = 2 * np.pi * (f * (1 + det / 100)) * t + ph
            s += np.sin(w) + 0.3 * np.sign(np.sin(w))
    return bp(s, 0, cut) / len(freqs) * (1 - trem + trem * np.sin(2 * np.pi * 0.11 * t))


MINOR = [[110.0, 164.81, 220.0, 261.63], [87.31, 174.61, 220.0, 261.63], [73.42, 146.83, 220.0, 293.66], [82.41, 164.81, 246.94, 329.63]]
MAJOR = [[110.0, 164.81, 277.18, 329.63], [73.42, 146.83, 220.0, 369.99], [82.41, 164.81, 246.94, 329.63], [92.5, 185.0, 277.18, 369.99]]
ARP = [[440.0, 554.37, 659.25, 554.37], [369.99, 440.0, 587.33, 440.0], [493.88, 659.25, 830.61, 659.25], [369.99, 554.37, 739.99, 554.37]]
BEAT = 0.6


def pulse(t0, t1, chord, level=1.0, arp=None, hat=True):
    n = int((t1 - t0) / BEAT) + 1
    for b in range(n):
        tb = t0 + b * BEAT
        if tb >= t1 - 0.05: break
        add(hit(52, 11, 0.08), tb, 0.20 * level)
        if hat: add(bp(rs.randn(int(0.05 * SR)), 5000, 11000) * np.exp(-tt(0.05) * 90), tb + BEAT / 2, 0.022 * level, 0.3 if b % 2 else -0.3)
        if arp: add(pluck(arp[b % len(arp)], 0.9, 1.3), tb + BEAT / 2, 0.035 * level, -0.25 if b % 2 else 0.25)
    d = t1 - t0 + 0.8
    add(pad(chord, d, 1100) * fade(d, 0.6, 0.8), t0, 0.085 * level)


mi = ma = 0
for s in A.get('_sections', []):
    t0, t1, mood = s['t0'], min(s['t1'], DUR), s['mood']
    d = t1 - t0
    if d <= 0.05: continue
    if mood == 'tension':
        dd = d + 0.6; t = tt(dd)
        air = bp(rs.randn(len(t)), 180, 2600) * (0.55 + 0.45 * np.sin(2 * np.pi * 0.23 * t + 1))
        drone = np.sin(2 * np.pi * 55 * t) + 0.6 * np.sin(2 * np.pi * 55.4 * t) + 0.35 * np.sin(2 * np.pi * 82.6 * t)
        tens = (np.sin(2 * np.pi * 659.3 * t) + np.sin(2 * np.pi * 662.1 * t) + 0.6 * np.sin(2 * np.pi * 987.8 * t)) * np.minimum(t / 2.2, 1)
        e = fade(dd, 0.15, 0.9)
        add(air * e, t0, 0.045); add(drone * e, t0, 0.11); add(tens * e, t0, 0.012, 0.3)
    elif mood == 'pulso':
        k = t0
        while k < t1 - 0.3:                     # chord changes every 4 bars
            k2 = min(t1, k + BEAT * 16); pulse(k, k2, MINOR[mi % 4]); mi += 1; k = k2
    elif mood == 'calma':
        dd = d + 0.6; t = tt(dd)
        add(pad([73.42, 110.0, 174.61, 220.0], dd, 700, 0.2) * fade(dd, 0.8, 0.7), t0 - 0.2, 0.10)
        add(bp(rs.randn(len(t)), 120, 900) * fade(dd, 0.8, 0.7), t0 - 0.2, 0.02)
    elif mood == 'claro':
        k = t0
        while k < t1 - 0.3:
            k2 = min(t1, k + BEAT * 8); pulse(k, k2, MAJOR[ma % 4], 1.0, ARP[ma % 4], hat=ma % 2 == 0); ma += 1; k = k2
    elif mood == 'final':
        add(pad([110.0, 220.0, 277.18, 329.63, 440.0], d, 1400, 0.08) * fade(d, 0.25, 1.3), t0, 0.13)
        add(hit(55, 5, 0.1), t0, 0.42); add(pluck(880.0, 1.6, 1.6), t0, 0.06); add(pluck(1108.73, 1.6, 1.6), t0 + 0.12, 0.045, 0.3)

for h in A.get('_hits', []):
    t, k, g = h['t'], h['kind'], h.get('gain', 1)
    pan = rs.rand() * 0.6 - 0.3
    if k == 'hit': add(whoosh(0.6, 250, 4200), t - 0.6, 0.07 * g); add(hit(58, 6, 0.2), t, 0.45 * g)
    elif k == 'whoosh': add(whoosh(0.6, 300, 3600), t - 0.3, 0.075 * g, pan)
    elif k == 'whoosh_rev': add(whoosh(0.5, 3000, 300), t, 0.06 * g, pan)
    elif k == 'click': add(click(1800, 0.04), t, 0.16 * g, pan); add(knock(150), t, 0.18 * g)
    elif k == 'tick': add(pluck(659.25 * (1.12 ** (rs.randint(0, 4))), 1.0, 1.4), t, 0.08 * g, 0.3); add(click(2600, 0.02), t, 0.05 * g, 0.3)
    elif k == 'thud': add(thud(), t, 0.9 * g)
    elif k == 'rise': add(rise(1.2), t - 1.2, 0.05 * g)
    elif k == 'pluck': add(pluck(523.25, 0.6), t, 0.05 * g, pan)
    elif k == 'knock': add(knock(220), t, 0.3 * g, pan); add(pluck(311.13, 0.45), t, 0.05 * g, pan)

fd = np.minimum(1, (DUR - np.arange(N) / SR) / 1.1); Lc *= fd; Rc *= fd
pk = max(np.abs(Lc).max(), np.abs(Rc).max(), 1e-6); g = 0.5 / pk; Lc *= g; Rc *= g
w = wave.open(out, 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((np.stack([Lc, Rc], 1) * 32767).astype('<i2').tobytes()); w.close()
print('música:', out, round(DUR, 2), 's')
