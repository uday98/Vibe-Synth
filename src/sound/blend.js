// Interpretation → concrete synth parameters.
//   timbre weights ──blend──▶ base params ──modifiers──▶ ──snap pitch──▶ ──user overrides──▶ params

import { PARAM_SPEC, PARAM_KEYS, sanitize } from '../engine/params.js';
import { TIMBRES } from './timbres.js';
import { applyModifiers, addMods } from './modifiers.js';

const valueOf = (id, k) => (TIMBRES[id][k] !== undefined ? TIMBRES[id][k] : PARAM_SPEC[k].def);

export function dominantTimbre(weights) {
  let best = null, bw = -1;
  for (const [id, w] of Object.entries(weights)) if (w > bw) { best = id; bw = w; }
  return best;
}

export function blendTimbres(weights) {
  const ids = Object.keys(weights).filter((id) => TIMBRES[id] && weights[id] > 0);
  const dom = dominantTimbre(Object.fromEntries(ids.map((id) => [id, weights[id]])));
  const total = ids.reduce((s, id) => s + weights[id], 0);
  const p = {};
  for (const k of PARAM_KEYS) {
    const { domain } = PARAM_SPEC[k];
    if (domain === 'pick') { p[k] = valueOf(dom, k); continue; }
    let acc = 0;
    for (const id of ids) {
      const w = weights[id] / total;
      acc += domain === 'log' ? w * Math.log(valueOf(id, k)) : w * valueOf(id, k);
    }
    p[k] = domain === 'log' ? Math.exp(acc) : acc;
  }
  return p;
}

export function blendColor(weights) {
  let r = 0, g = 0, b = 0, total = 0;
  for (const [id, w] of Object.entries(weights)) {
    const hex = TIMBRES[id]?.color;
    if (!hex) continue;
    const n = parseInt(hex.slice(1), 16);
    r += w * (n >> 16); g += w * ((n >> 8) & 255); b += w * (n & 255); total += w;
  }
  if (!total) return '#6366f1';
  const h = (x) => Math.round(x / total).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}

// ── pitch helpers ──────────────────────────────────────────────
export const MIDI_MIN = 21;    // A0
export const MIDI_MAX = 108;   // C8
const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const midiToFreq = (m) => 440 * Math.pow(2, (m - 69) / 12);
export const freqToMidi = (f) => Math.round(69 + 12 * Math.log2(f / 440));
export const noteName = (m) => `${NAMES[((m % 12) + 12) % 12]}${Math.floor(m / 12) - 1}`;
const clampMidi = (m) => Math.min(MIDI_MAX, Math.max(MIDI_MIN, m));

export const ENVELOPE_KEYS = ['attack', 'decay', 'sustain', 'hold', 'release'];

/**
 * @param {{weights, mods, seed}} interp output of interpret()
 * @param {{mods?: object, midi?: number, env?: object}} overrides user adjustments from the UI
 */
export function buildParams(interp, overrides = {}) {
  let p = blendTimbres(interp.weights);
  p = applyModifiers(p, addMods(interp.mods, overrides.mods || {}));
  // Snap to equal temperament so every sample is in tune with everything else.
  const midi = clampMidi(overrides.midi ?? freqToMidi(p.freq));
  p.freq = midiToFreq(midi);
  for (const k of ENVELOPE_KEYS) if (overrides.env && Number.isFinite(overrides.env[k])) p[k] = overrides.env[k];
  p.seed = interp.seed;
  return { params: sanitize(p), midi, color: blendColor(interp.weights) };
}
