// Small Freeverb-style reverb (Schroeder: parallel combs → series allpasses).
// Algorithmic rather than convolution: no impulse-response file to download,
// a few multiply-adds per sample, and fully deterministic.

const COMBS = [1116, 1188, 1277, 1356];   // Freeverb tunings at 44.1 kHz
const ALLPASSES = [556, 441];
const STEREO_SPREAD = 23;

function makeComb(len) {
  return { buf: new Float32Array(len), idx: 0, store: 0 };
}

function makeAllpass(len) {
  return { buf: new Float32Array(len), idx: 0 };
}

function channel(sampleRate, spread) {
  const k = sampleRate / 44100;
  return {
    combs: COMBS.map((d) => makeComb(Math.max(1, Math.round((d + spread) * k)))),
    allpasses: ALLPASSES.map((d) => makeAllpass(Math.max(1, Math.round((d + spread) * k)))),
  };
}

function processChannel(ch, input, feedback, damp) {
  let out = 0;
  for (const c of ch.combs) {
    const y = c.buf[c.idx];
    c.store = y * (1 - damp) + c.store * damp;   // one-pole lowpass in the loop: highs die first, like a real room
    c.buf[c.idx] = input + c.store * feedback;
    if (++c.idx >= c.buf.length) c.idx = 0;
    out += y;
  }
  for (const a of ch.allpasses) {
    const b = a.buf[a.idx];
    a.buf[a.idx] = out + b * 0.5;
    out = b - out;
    if (++a.idx >= a.buf.length) a.idx = 0;
  }
  return out;
}

/**
 * Adds reverb in place.
 * @param {Float32Array} left
 * @param {Float32Array} right
 * @param {number} sampleRate
 * @param {number} space 0–1, wet amount and room size together
 */
export function applyReverb(left, right, sampleRate, space) {
  if (space <= 0.001) return;
  const feedback = 0.72 + 0.26 * space;
  const damp = 0.3;
  const wet = 0.9 * space;
  const dry = 1 - 0.35 * space;
  const inGain = 0.05;
  const L = channel(sampleRate, 0);
  const R = channel(sampleRate, STEREO_SPREAD);
  for (let i = 0; i < left.length; i++) {
    const input = (left[i] + right[i]) * inGain;
    const wl = processChannel(L, input, feedback, damp);
    const wr = processChannel(R, input, feedback, damp);
    left[i] = left[i] * dry + wl * wet;
    right[i] = right[i] * dry + wr * wet;
  }
}
