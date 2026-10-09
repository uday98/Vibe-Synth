// Offline renderer: parameters in, stereo Float32Arrays out.
// Pure JS with no Web Audio dependency, so it is deterministic, unit-testable in
// Node, and the same samples drive playback, the waveform view and WAV export.
//
// Signal path per sample (2× oversampled):
//
//   modulator (with self-feedback) ──× index(t)──▶ carrier phase      [FM, additive on phase]
//   carrier ─┐
//   noise ───┼─▶ × envelope ─▶ tanh drive ─▶ × tremolo                [multiplicative]
//   click ───┘
//   ─▶ lowpass + decimate ─▶ reverb ─▶ DC block ─▶ normalise

import { createRng } from './rng.js';
import { applyReverb } from './reverb.js';
import { sanitize } from './params.js';

export const MAX_SECONDS = 8;
const TARGET_PEAK = 0.89;          // −1 dBFS ceiling
const TARGET_RMS = 0.2;            // ≈ −14 dBFS loudest window
const TWO_PI = Math.PI * 2;

export function voiceDuration(p) {
  return p.attack + p.decay + p.hold + p.release;
}

export function totalDuration(p) {
  // reverb needs room to ring out after the voice stops
  return Math.min(MAX_SECONDS, voiceDuration(p) + p.space * 2.2 + 0.03);
}

// Exponential segments: physical sounds decay proportionally to their level,
// so linear decays sound mechanical. Each segment covers ~99% of its distance.
export function ampEnvelope(t, p) {
  const { attack: a, decay: d, sustain: s, hold: h, release: r } = p;
  if (t < a) return t / a;
  const t1 = t - a;
  if (t1 < d) return s + (1 - s) * Math.exp((-5 * t1) / d);
  const level = s + (1 - s) * Math.exp(-5);
  const t2 = t1 - d;
  if (t2 < h) return level;
  const t3 = t2 - h;
  if (t3 < r) return level * Math.exp((-5 * t3) / r);
  return 0;
}

// RBJ biquad lowpass, applied in place.
function lowpass(buf, cutoff, fs, q) {
  const w = (TWO_PI * cutoff) / fs;
  const alpha = Math.sin(w) / (2 * q);
  const cw = Math.cos(w);
  const a0 = 1 + alpha;
  const b0 = (1 - cw) / 2 / a0, b1 = (1 - cw) / a0, b2 = b0;
  const a1 = (-2 * cw) / a0, a2 = (1 - alpha) / a0;
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < buf.length; i++) {
    const x = buf[i];
    const y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
    x2 = x1; x1 = x; y2 = y1; y1 = y;
    buf[i] = y;
  }
}

function decimate(buf, factor, outLen, fs) {
  const out = new Float32Array(outLen);
  if (factor > 1) {
    // 4th-order Butterworth just below the output Nyquist removes what would fold back
    const cutoff = (0.45 * fs) / factor;
    lowpass(buf, cutoff, fs, 0.5412);
    lowpass(buf, cutoff, fs, 1.3066);
  }
  const n = Math.min(outLen, Math.floor(buf.length / factor));
  for (let j = 0; j < n; j++) out[j] = buf[j * factor];
  return out;
}

function dcBlock(buf) {
  let x1 = 0, y1 = 0;
  for (let i = 0; i < buf.length; i++) {
    const y = buf[i] - x1 + 0.995 * y1;
    x1 = buf[i]; y1 = y; buf[i] = y;
  }
}

/**
 * @param {object} rawParams see PARAM_SPEC
 * @param {{sampleRate?: number, oversample?: number}} opts
 * @returns {{left: Float32Array, right: Float32Array, sampleRate: number, duration: number, peakBeforeNormalise: number}}
 */
export function render(rawParams, { sampleRate = 44100, oversample = 2 } = {}) {
  const p = sanitize(rawParams);
  const R = sampleRate * oversample;
  const duration = totalDuration(p);
  const nOut = Math.ceil(duration * sampleRate);
  const nOs = Math.ceil(Math.min(voiceDuration(p), duration) * R);
  const rng = createRng(p.seed);

  const unison = p.width > 0.05 ? 2 : 1;
  const voices = [];
  for (let v = 0; v < unison; v++) {
    const side = unison === 1 ? 0 : v === 0 ? -1 : 1;
    voices.push({
      detune: Math.pow(2, (side * p.width * 12) / 1200),   // up to ±12 cents
      panR: 0.5 + side * 0.4 * p.width,
      phC: rng() * TWO_PI,
      phM: rng() * TWO_PI,
      m1: 0,
      m2: 0,
    });
  }
  const voiceGain = (0.7 * p.tone) / unison;

  const bufL = new Float32Array(nOs);
  const bufR = new Float32Array(nOs);

  const fb = p.feedback * 1.6;
  const noiseCut = 150 * Math.pow(2, p.noiseColor * 7.3);   // 150 Hz … ~23 kHz
  const noiseCoef = 1 - Math.exp((-TWO_PI * noiseCut) / R);
  let noiseState = 0;
  const drive = p.drive > 0.01 ? 1 + p.drive * 9 : 0;
  const driveNorm = drive ? Math.tanh(drive) : 1;

  // Envelopes, LFO and pitch change slowly, so compute them once per block of
  // CONTROL samples and interpolate linearly. Cuts exp/pow/sin calls ~32×.
  const CONTROL = 32;
  const ctrl = (t) => {
    const lfo = p.motion > 0 ? Math.sin(TWO_PI * p.motionRate * t) : 0;
    const pitch = p.pitchDrop !== 0 ? Math.pow(2, (p.pitchDrop * Math.exp(-t / p.pitchTime)) / 12) : 1;
    // Brightness follows its own envelope — the core of FM realism (Chowning 1973):
    // a struck bell or plucked string is brightest at the attack and mellows as it rings.
    const idxEnv = p.indexSustain + (1 - p.indexSustain) * Math.exp(-t / p.indexDecay);
    return {
      env: ampEnvelope(t, p),
      inc: (TWO_PI * p.freq * pitch * (1 + p.motion * 0.004 * lfo)) / R,   // slight vibrato with motion
      index: Math.max(0, p.index * idxEnv * (1 + p.motion * 0.7 * lfo)),
      trem: 1 - p.motion * 0.25 * (0.5 + 0.5 * lfo),
      click: p.transient * 0.6 * Math.exp(-t / 0.005),
    };
  };

  const nv = voices.length;
  let a = ctrl(0);
  for (let i0 = 0; i0 < nOs; i0 += CONTROL) {
    const b = ctrl((i0 + CONTROL) / R);
    const n = Math.min(CONTROL, nOs - i0);
    for (let j = 0; j < n; j++) {
      const x = j / CONTROL;
      const env = a.env + (b.env - a.env) * x;
      const inc = a.inc + (b.inc - a.inc) * x;
      const I = a.index + (b.index - a.index) * x;
      const trem = a.trem + (b.trem - a.trem) * x;
      const clickAmt = a.click + (b.click - a.click) * x;

      const white = rng() * 2 - 1;
      noiseState += noiseCoef * (white - noiseState);
      const mono = noiseState * p.noise * 1.4;
      // the click bypasses the attack ramp: it *is* the attack of a pick, stick or hammer
      const click = white * clickAmt;

      let l = mono * 0.5, r = mono * 0.5;
      for (let k = 0; k < nv; k++) {
        const v = voices[k];
        const incC = inc * v.detune;
        const incM = incC * p.ratio;
        // Carson's rule: bandwidth ≈ 2(I+1)fm. Cap the index so sidebands stay below Nyquist.
        // In phase-increment terms fm = incM·R/2π, so the cap is 0.225·2π/incM − 1.
        const Imax = (0.225 * TWO_PI) / incM - 1;
        const Iv = I < Imax ? I : Imax > 0 ? Imax : 0;
        const m = Math.sin(v.phM + fb * 0.5 * (v.m1 + v.m2));
        v.m2 = v.m1; v.m1 = m;
        const c = Math.sin(v.phC + Iv * m) * voiceGain;
        v.phC += incC;
        v.phM += incM;
        if (v.phC > TWO_PI) v.phC -= TWO_PI;
        if (v.phM > TWO_PI) v.phM -= TWO_PI;
        l += c * (1 - v.panR);
        r += c * v.panR;
      }

      l = l * env + click; r = r * env + click;
      if (drive) {
        // distortion after the envelope, as a pedal after a guitar: loud attack breaks up more
        l = Math.tanh(drive * l) / driveNorm;
        r = Math.tanh(drive * r) / driveNorm;
      }
      bufL[i0 + j] = l * trem;
      bufR[i0 + j] = r * trem;
    }
    a = b;
  }

  const left = decimate(bufL, oversample, nOut, R);
  const right = decimate(bufR, oversample, nOut, R);

  applyReverb(left, right, sampleRate, p.space);
  dcBlock(left);
  dcBlock(right);

  // short fade at the very end so a truncated tail never clicks
  const fadeN = Math.min(nOut, Math.round(0.01 * sampleRate));
  for (let k = 0; k < fadeN; k++) {
    const g = k / fadeN;
    left[nOut - 1 - k] *= g;
    right[nOut - 1 - k] *= g;
  }

  // Loudness match: bring the loudest 400 ms window to a common level so a pad and a
  // kick feel equally loud, but never let a peak go above −1 dBFS.
  let peak = 0;
  for (let i = 0; i < nOut; i++) {
    const a = Math.abs(left[i]), b = Math.abs(right[i]);
    if (a > peak) peak = a;
    if (b > peak) peak = b;
  }
  if (peak > 1e-6) {
    const win = Math.min(nOut, Math.round(0.4 * sampleRate));
    const hop = Math.max(1, Math.round(0.05 * sampleRate));
    let maxMs = 0;
    for (let s = 0; s + win <= nOut; s += hop) {
      let acc = 0;
      for (let i = s; i < s + win; i++) acc += left[i] * left[i] + right[i] * right[i];
      if (acc > maxMs) maxMs = acc;
    }
    const rms = Math.sqrt(maxMs / (2 * win));
    const g = Math.min(TARGET_RMS / Math.max(rms, 1e-9), TARGET_PEAK / peak);
    for (let i = 0; i < nOut; i++) { left[i] *= g; right[i] *= g; }
  }

  return { left, right, sampleRate, duration, peakBeforeNormalise: peak };
}
