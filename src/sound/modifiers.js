// Modifier axes: adjectives move a timbre along perceptual dimensions instead of
// replacing it. "dark haunting bass" = bass timbre, pushed dark and haunting.
//
// Each axis value is roughly −2 … +2 (0 = untouched). `register` is in semitones.

export const AXES = {
  register:   { min: -36, max: 36, label: 'Register' },
  bright:     { min: -2, max: 2, label: 'Brightness' },
  grit:       { min: -2, max: 2, label: 'Grit' },
  length:     { min: -2, max: 2, label: 'Length' },
  soft:       { min: -2, max: 2, label: 'Softness' },
  space:      { min: -2, max: 2, label: 'Space' },
  width:      { min: -2, max: 2, label: 'Width' },
  motion:     { min: -2, max: 2, label: 'Motion' },
  noise:      { min: -2, max: 2, label: 'Texture' },
  tension:    { min: -2, max: 2, label: 'Tension' },
};

export const AXIS_IDS = Object.keys(AXES);

const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
const oct = (x) => Math.pow(2, x);

export function clampMods(mods) {
  const out = {};
  for (const k of AXIS_IDS) out[k] = clamp(mods[k] || 0, AXES[k].min, AXES[k].max);
  return out;
}

export function addMods(a, b) {
  const out = {};
  for (const k of AXIS_IDS) out[k] = (a[k] || 0) + (b[k] || 0);
  return out;
}

/** Returns new params; never mutates. Each axis acts in the domain the ear hears it in. */
export function applyModifiers(params, rawMods) {
  const m = clampMods(rawMods);
  const p = { ...params };

  p.freq *= oct(m.register / 12);

  // brightness = FM index (more sidebands) + noise colour
  p.index *= oct(m.bright * 1.2);
  p.noiseColor += m.bright * 0.25;

  p.drive += m.grit * 0.45;
  p.feedback += m.grit * 0.2;

  p.hold *= oct(m.length * 1.3);
  if (m.length > 0) p.hold += m.length * 0.4;   // so percussive timbres can still be lengthened
  p.decay *= oct(m.length * 0.8);
  p.release *= oct(m.length * 1.1);
  p.indexDecay *= oct(m.length * 0.8);

  p.attack *= oct(m.soft * 3);
  if (m.soft > 0) p.attack += m.soft * 0.05;
  p.transient = Math.max(0, (p.transient || 0) - m.soft * 0.25);

  p.space += m.space * 0.35;
  p.width += m.width * 0.4;
  p.motion += m.motion * 0.35;
  p.noise += m.noise * 0.3;

  // tension: >0 pushes the FM ratio off the harmonic series; <0 pulls it onto it
  if (m.tension > 0) {
    p.ratio *= 1 + m.tension * 0.19;
  } else if (m.tension < 0) {
    const target = Math.max(0.5, Math.round(p.ratio * 2) / 2);
    p.ratio += (target - p.ratio) * Math.min(1, -m.tension);
  }
  return p;
}
