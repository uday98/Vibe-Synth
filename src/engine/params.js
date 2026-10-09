// Single source of truth for synthesis parameters.
// `blend` reads `domain` to decide how to average; `sanitize` reads min/max.
//
// domain:
//   linear  — average arithmetically
//   log     — average geometrically (pitch and time are perceived as ratios:
//             55 Hz and 880 Hz should meet at 220 Hz, not 467 Hz)
//   pick    — categorical: take the dominant timbre's value, never average
//             (averaging FM ratios 1 and 3.5 gives 2.25, an unrelated inharmonic tone)

export const PARAM_SPEC = {
  freq:        { min: 20,    max: 8000, def: 220,  domain: 'log',    unit: 'Hz' },
  ratio:       { min: 0.25,  max: 16,   def: 1,    domain: 'pick' },
  index:       { min: 0,     max: 30,   def: 1,    domain: 'linear' },
  indexSustain:{ min: 0,     max: 2,    def: 0.5,  domain: 'linear' },
  indexDecay:  { min: 0.01,  max: 10,   def: 0.5,  domain: 'log',    unit: 's' },
  feedback:    { min: 0,     max: 1,    def: 0,    domain: 'pick' },
  tone:        { min: 0,     max: 1,    def: 1,    domain: 'linear' },   // carrier level; 0 = noise only
  noise:       { min: 0,     max: 1,    def: 0,    domain: 'linear' },
  noiseColor:  { min: 0,     max: 1,    def: 0.5,  domain: 'linear' },
  transient:   { min: 0,     max: 1,    def: 0,    domain: 'linear' },
  drive:       { min: 0,     max: 1,    def: 0,    domain: 'linear' },
  width:       { min: 0,     max: 1,    def: 0.2,  domain: 'linear' },
  space:       { min: 0,     max: 1,    def: 0.15, domain: 'linear' },
  motion:      { min: 0,     max: 1,    def: 0,    domain: 'linear' },
  motionRate:  { min: 0.05,  max: 20,   def: 4,    domain: 'log',    unit: 'Hz' },
  pitchDrop:   { min: -48,   max: 48,   def: 0,    domain: 'linear', unit: 'st' },
  pitchTime:   { min: 0.005, max: 4,    def: 0.05, domain: 'log',    unit: 's' },
  attack:      { min: 0.001, max: 4,    def: 0.01, domain: 'log',    unit: 's' },
  decay:       { min: 0.01,  max: 6,    def: 0.4,  domain: 'log',    unit: 's' },
  sustain:     { min: 0,     max: 1,    def: 0.6,  domain: 'linear' },
  hold:        { min: 0,     max: 6,    def: 0.5,  domain: 'linear', unit: 's' },
  release:     { min: 0.01,  max: 6,    def: 0.4,  domain: 'log',    unit: 's' },
};

export const PARAM_KEYS = Object.keys(PARAM_SPEC);

export function defaults() {
  const p = {};
  for (const k of PARAM_KEYS) p[k] = PARAM_SPEC[k].def;
  return p;
}

const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));

/** Fill missing fields with defaults and clamp everything into a range the engine is safe with. */
export function sanitize(p) {
  const out = { seed: p.seed ?? 1 };
  for (const k of PARAM_KEYS) {
    const s = PARAM_SPEC[k];
    const v = Number.isFinite(p[k]) ? p[k] : s.def;
    out[k] = clamp(v, s.min, s.max);
  }
  return out;
}
