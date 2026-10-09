// Timbres are sound *sources*: the FM recipe that makes a bell a bell.
// Adjectives ("dark", "wide", "haunting") are not timbres — they are modifiers
// that move a timbre along an axis (see modifiers.js).
//
// Ratio choices follow FM practice:
//   integer ratios (1, 2, 3)  → harmonic spectra: bass, keys, organ, brass
//   1.4, 1.41 (≈√2), 3.5      → inharmonic spectra: bells, gongs, glass
//
// `label` is a natural-language description kept for a future embedding tier.

export const TIMBRES = {
  sub: {
    label: 'pure deep sub bass sine', color: '#3b3a8f',
    freq: 55, ratio: 1, index: 0.3, indexSustain: 1, indexDecay: 1,
    attack: 0.01, decay: 0.3, sustain: 0.85, hold: 0.7, release: 0.3, width: 0, space: 0.05,
  },
  bass: {
    label: 'punchy FM bass guitar like low end', color: '#4c1d95',
    freq: 55, ratio: 1, index: 3.5, indexSustain: 0.25, indexDecay: 0.15, feedback: 0.1,
    attack: 0.005, decay: 0.45, sustain: 0.45, hold: 0.4, release: 0.15, drive: 0.15, width: 0.1, space: 0.05,
  },
  kick: {
    label: 'electronic kick drum with a pitch drop', color: '#7f1d1d',
    freq: 49, ratio: 1, index: 0.6, indexSustain: 0, indexDecay: 0.03,
    pitchDrop: 36, pitchTime: 0.035, transient: 0.45, drive: 0.25,
    attack: 0.001, decay: 0.35, sustain: 0, hold: 0, release: 0.08, width: 0, space: 0.05,
  },
  snare: {
    label: 'snare drum or clap, noisy crack', color: '#9f1239',
    freq: 185, ratio: 1.48, index: 2, indexSustain: 0, indexDecay: 0.05,
    pitchDrop: 7, pitchTime: 0.02, noise: 0.85, noiseColor: 0.75, transient: 0.6,
    attack: 0.001, decay: 0.18, sustain: 0, hold: 0, release: 0.08, width: 0.2, space: 0.15,
  },
  hat: {
    label: 'hi-hat cymbal tick, bright metallic noise', color: '#a1a1aa',
    freq: 3520, ratio: 1.41, index: 4, indexSustain: 0.3, indexDecay: 0.05,
    noise: 0.8, noiseColor: 1, transient: 0.3,
    attack: 0.001, decay: 0.07, sustain: 0, hold: 0, release: 0.04, width: 0.3, space: 0.1,
  },
  pluck: {
    label: 'plucked string, guitar or harp', color: '#b45309',
    freq: 220, ratio: 1, index: 4, indexSustain: 0.05, indexDecay: 0.08, transient: 0.15,
    attack: 0.002, decay: 0.6, sustain: 0, hold: 0, release: 0.25, width: 0.25, space: 0.2,
  },
  sitar: {
    label: 'sitar with buzzing jawari bridge and sympathetic shimmer', color: '#c2410c',
    freq: 138.6, ratio: 1, index: 3, indexSustain: 0.35, indexDecay: 0.6, feedback: 0.45, transient: 0.2,
    attack: 0.002, decay: 1.6, sustain: 0.1, hold: 0.2, release: 0.8, width: 0.45, space: 0.3,
  },
  drone: {
    label: 'tanpura drone, sustained buzzing hum', color: '#92400e',
    freq: 65.4, ratio: 1, index: 1.6, indexSustain: 1, indexDecay: 1, feedback: 0.2,
    motion: 0.25, motionRate: 0.15,
    attack: 0.4, decay: 0.6, sustain: 0.9, hold: 2.6, release: 1.4, width: 0.55, space: 0.4,
  },
  keys: {
    label: 'electric piano keys, soft bell-like tine', color: '#be185d',
    freq: 261.6, ratio: 1, index: 2.2, indexSustain: 0.15, indexDecay: 0.35, transient: 0.08,
    attack: 0.003, decay: 1.4, sustain: 0.1, hold: 0.2, release: 0.5, width: 0.3, space: 0.2,
  },
  organ: {
    label: 'organ or harmonium, steady reedy tone', color: '#a16207',
    freq: 196, ratio: 2, index: 1.2, indexSustain: 1, indexDecay: 1, feedback: 0.05,
    attack: 0.02, decay: 0.2, sustain: 0.9, hold: 1, release: 0.1, width: 0.3, space: 0.2,
  },
  brass: {
    label: 'brass horn or trumpet that brightens as it swells', color: '#ca8a04',
    // indexSustain > 1: brightness *rises* toward sustain, as Risset measured in trumpet tones
    freq: 233, ratio: 1, index: 2.6, indexSustain: 1.5, indexDecay: 0.12, drive: 0.15,
    attack: 0.06, decay: 0.2, sustain: 0.8, hold: 0.7, release: 0.15, width: 0.2, space: 0.2,
  },
  pad: {
    label: 'warm lush strings pad', color: '#6d28d9',
    freq: 220, ratio: 1, index: 1.2, indexSustain: 1, indexDecay: 1, feedback: 0.25,
    motion: 0.2, motionRate: 0.3,
    attack: 0.6, decay: 0.5, sustain: 0.8, hold: 1.2, release: 1.2, width: 0.7, space: 0.5,
  },
  choir: {
    label: 'ethereal choir voices, airy and angelic', color: '#a5b4fc',
    freq: 330, ratio: 2, index: 0.7, indexSustain: 1, indexDecay: 1, noise: 0.08, noiseColor: 0.7,
    motion: 0.15, motionRate: 5,
    attack: 0.5, decay: 0.4, sustain: 0.85, hold: 1.4, release: 1.2, width: 0.8, space: 0.7,
  },
  lead: {
    label: 'bright synth lead, saw-like with vibrato', color: '#0891b2',
    freq: 440, ratio: 1, index: 2.5, indexSustain: 0.8, indexDecay: 0.3, feedback: 0.4,
    motion: 0.1, motionRate: 5.5,
    attack: 0.01, decay: 0.3, sustain: 0.7, hold: 0.6, release: 0.2, width: 0.3, space: 0.2,
  },
  acid: {
    label: 'squelchy acid bassline, resonant and driven', color: '#65a30d',
    freq: 55, ratio: 1, index: 5, indexSustain: 0.2, indexDecay: 0.12, feedback: 0.5, drive: 0.7,
    attack: 0.003, decay: 0.25, sustain: 0.3, hold: 0.2, release: 0.1, width: 0.1, space: 0.1,
  },
  bell: {
    label: 'struck bell or chime, long ringing inharmonic decay', color: '#eab308',
    // Chowning's bell: fm/fc = 1.4, index decaying with the amplitude
    freq: 880, ratio: 1.4, index: 8, indexSustain: 0, indexDecay: 1.2,
    attack: 0.002, decay: 3, sustain: 0, hold: 0, release: 1, width: 0.3, space: 0.35,
  },
  glass: {
    label: 'glass or crystal, icy high ping', color: '#7dd3fc',
    freq: 1046.5, ratio: 3.5, index: 3, indexSustain: 0, indexDecay: 0.4,
    attack: 0.001, decay: 1.5, sustain: 0, hold: 0, release: 0.6, width: 0.4, space: 0.4,
  },
  metal: {
    label: 'metallic gong or anvil clang', color: '#71717a',
    freq: 110, ratio: 1.41, index: 7, indexSustain: 0.2, indexDecay: 1.5, feedback: 0.2, drive: 0.2, transient: 0.25,
    attack: 0.002, decay: 2.8, sustain: 0, hold: 0, release: 1, width: 0.4, space: 0.35,
  },
  glitch: {
    label: 'digital glitch, stuttering computer error', color: '#ec4899',
    freq: 1046.5, ratio: 2.17, index: 9, indexSustain: 0.5, indexDecay: 0.2, feedback: 0.8,
    motion: 0.9, motionRate: 11, noise: 0.2, noiseColor: 0.9, drive: 0.5,
    attack: 0.001, decay: 0.3, sustain: 0.4, hold: 0.3, release: 0.05, width: 0.5, space: 0.1,
  },
  zap: {
    label: 'laser zap, fast falling pitch blip', color: '#22c55e',
    freq: 440, ratio: 1, index: 2, indexSustain: 0.2, indexDecay: 0.1, feedback: 0.3,
    pitchDrop: 30, pitchTime: 0.07,
    attack: 0.001, decay: 0.25, sustain: 0, hold: 0, release: 0.08, width: 0.2, space: 0.2,
  },
  riser: {
    label: 'rising sweep or siren that builds tension', color: '#f97316',
    freq: 440, ratio: 1, index: 1.5, indexSustain: 2, indexDecay: 1.2, feedback: 0.3, noise: 0.2, noiseColor: 0.8,
    pitchDrop: -19, pitchTime: 0.9,
    attack: 1.2, decay: 0.3, sustain: 1, hold: 0.6, release: 0.3, width: 0.6, space: 0.5,
  },
  wind: {
    label: 'wind or breath, airy filtered noise', color: '#cbd5e1',
    freq: 440, ratio: 1, index: 0, tone: 0, noise: 0.95, noiseColor: 0.6, motion: 0.45, motionRate: 0.3,
    attack: 0.8, decay: 0.5, sustain: 0.9, hold: 1.6, release: 1.2, width: 0.8, space: 0.4,
  },
  ocean: {
    label: 'ocean waves washing in and out, deep rumble', color: '#0c4a6e',
    freq: 41.2, ratio: 1, index: 0, tone: 0.35, noise: 0.95, noiseColor: 0.35, motion: 0.7, motionRate: 0.12,
    attack: 1.2, decay: 0.5, sustain: 0.85, hold: 2.2, release: 1.5, width: 1, space: 0.5,
  },
};

export const TIMBRE_IDS = Object.keys(TIMBRES);
