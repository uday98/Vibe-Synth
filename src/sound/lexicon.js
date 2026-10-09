// Hand-curated vocabulary: word → timbre weights (t) and/or modifier deltas (m).
// Zero download, zero inference, instant. The router (interpret.js) adds
// stemming and typo tolerance on top, so "darker", "metallic", "shimery" resolve here.
//
// Adding a word: pick the closest timbre(s) and the axes the word implies.
// Keep weights in 0–1 and modifier values in roughly −1.5 … +1.5.

const e = (t, m) => ({ t: t || null, m: m || null });

export const LEXICON = {
  // ── percussion ──────────────────────────────────────────────
  kick: e({ kick: 1 }), kickdrum: e({ kick: 1 }), bassdrum: e({ kick: 1 }), '808': e({ kick: 0.7, sub: 0.5 }, { length: 0.8 }),
  thump: e({ kick: 1 }, { bright: -0.4 }), boom: e({ kick: 0.7, sub: 0.4 }, { space: 0.4 }), drum: e({ kick: 0.6, snare: 0.4 }),
  snare: e({ snare: 1 }), clap: e({ snare: 1 }, { bright: 0.3, space: 0.3 }), rimshot: e({ snare: 0.8 }, { length: -0.8 }),
  snap: e({ snare: 0.7 }, { length: -1, bright: 0.4 }), tom: e({ kick: 0.6, snare: 0.4 }, { register: 12 }),
  hat: e({ hat: 1 }), hihat: e({ hat: 1 }), cymbal: e({ hat: 0.6, metal: 0.5 }, { length: 1 }),
  shaker: e({ hat: 1 }, { soft: 0.4 }), tick: e({ hat: 1 }, { length: -1 }), perc: e({ snare: 0.4, hat: 0.3, kick: 0.3 }),
  percussion: e({ snare: 0.4, hat: 0.3, kick: 0.3 }), percussive: e(null, { soft: -1, length: -0.6 }),

  // ── low end ──────────────────────────────────────────────────
  sub: e({ sub: 1 }), subbass: e({ sub: 1 }), rumble: e({ sub: 0.7, ocean: 0.3 }, { register: -5 }),
  bass: e({ bass: 1 }), bassline: e({ bass: 0.7, acid: 0.3 }), reese: e({ bass: 0.8 }, { width: 1, motion: 0.6, grit: 0.4 }),
  wobble: e({ bass: 0.6 }, { motion: 1.4 }), growl: e({ bass: 0.7 }, { grit: 1, motion: 0.6 }),

  // ── strings, keys, winds ────────────────────────────────────
  pluck: e({ pluck: 1 }), plucked: e({ pluck: 1 }), picked: e({ pluck: 1 }), guitar: e({ pluck: 1 }, { register: -5 }),
  harp: e({ pluck: 1 }, { space: 0.5, soft: 0.2 }), pizzicato: e({ pluck: 1 }, { length: -0.8 }), koto: e({ pluck: 0.8, sitar: 0.3 }),
  kalimba: e({ pluck: 0.5, bell: 0.5 }, { length: -0.4 }), mbira: e({ pluck: 0.5, bell: 0.5 }),
  sitar: e({ sitar: 1 }), veena: e({ sitar: 0.9 }, { register: -5, soft: 0.2 }), sarod: e({ sitar: 0.8, pluck: 0.3 }),
  tanpura: e({ drone: 1 }), tambura: e({ drone: 1 }), drone: e({ drone: 1 }), hum: e({ drone: 0.7, sub: 0.3 }, { bright: -0.6 }),
  bourdon: e({ drone: 1 }, { register: -7 }), harmonium: e({ organ: 0.7, drone: 0.3 }), shruti: e({ drone: 0.8, organ: 0.2 }),
  keys: e({ keys: 1 }), piano: e({ keys: 1 }, { bright: 0.2 }), epiano: e({ keys: 1 }), rhodes: e({ keys: 1 }, { soft: 0.2, motion: 0.3 }),
  wurlitzer: e({ keys: 1 }, { grit: 0.4 }), keyboard: e({ keys: 1 }), clav: e({ keys: 0.6, pluck: 0.4 }, { bright: 0.6, length: -0.6 }),
  organ: e({ organ: 1 }), accordion: e({ organ: 0.8 }, { motion: 0.4 }), reed: e({ organ: 0.7, brass: 0.3 }),
  brass: e({ brass: 1 }), horn: e({ brass: 1 }, { soft: 0.3 }), trumpet: e({ brass: 1 }, { register: 5, bright: 0.4 }),
  trombone: e({ brass: 1 }, { register: -7 }), tuba: e({ brass: 1 }, { register: -19 }), sax: e({ brass: 0.6, lead: 0.4 }, { grit: 0.3 }),
  fanfare: e({ brass: 1 }, { bright: 0.5, width: 0.5 }), flute: e({ lead: 0.6, wind: 0.3 }, { tension: -1, bright: -0.5, soft: 0.4 }),
  whistle: e({ lead: 0.8 }, { tension: -1, bright: -0.8, register: 12 }), bansuri: e({ lead: 0.6, wind: 0.3 }, { tension: -1, bright: -0.6, soft: 0.5, motion: 0.3 }),
  pad: e({ pad: 1 }), strings: e({ pad: 1 }), string: e({ pad: 0.8, pluck: 0.2 }), violin: e({ pad: 0.9 }, { register: 7, motion: 0.3 }),
  cello: e({ pad: 0.9 }, { register: -12, motion: 0.3 }), orchestra: e({ pad: 0.7, brass: 0.3 }, { space: 0.8, width: 0.6 }),
  orchestral: e({ pad: 0.7, brass: 0.3 }, { space: 0.8, width: 0.6 }), bowed: e({ pad: 0.8 }, { soft: 0.6 }),
  choir: e({ choir: 1 }), voice: e({ choir: 1 }), vocal: e({ choir: 1 }), voices: e({ choir: 1 }, { width: 0.5 }),
  angelic: e({ choir: 0.8 }, { bright: 0.3, space: 0.6 }), aah: e({ choir: 1 }), ooh: e({ choir: 1 }, { bright: -0.6 }),
  lead: e({ lead: 1 }), synth: e({ lead: 0.6, pad: 0.4 }), saw: e({ lead: 1 }, { bright: 0.4 }), sawtooth: e({ lead: 1 }, { bright: 0.4 }),
  square: e({ lead: 0.8 }, { tension: -1 }), chiptune: e({ lead: 0.8, glitch: 0.2 }, { tension: -1, length: -0.4 }),
  acid: e({ acid: 1 }), '303': e({ acid: 1 }), squelch: e({ acid: 1 }, { bright: 0.4 }), resonant: e({ acid: 0.6 }, { bright: 0.5 }),

  // ── struck, metallic, glassy ────────────────────────────────
  bell: e({ bell: 1 }), chime: e({ bell: 0.8, glass: 0.2 }), carillon: e({ bell: 1 }, { register: -12, space: 0.6 }),
  glockenspiel: e({ bell: 0.6, glass: 0.4 }, { register: 12, length: -0.4 }), celesta: e({ bell: 0.6, keys: 0.4 }, { register: 12 }),
  musicbox: e({ bell: 0.6, glass: 0.4 }, { register: 12, length: -0.4 }), tubular: e({ bell: 1 }, { register: -5, length: 0.6 }),
  gong: e({ metal: 1 }, { register: -12, length: 1, space: 0.5 }), singing: e({ bell: 0.6, drone: 0.4 }, { length: 1.2, motion: 0.4 }),
  glass: e({ glass: 1 }), crystal: e({ glass: 1 }, { bright: 0.4 }), ice: e({ glass: 1 }, { bright: 0.5 }), icy: e({ glass: 0.5 }, { bright: 0.8, tension: 0.2 }),
  metal: e({ metal: 1 }), steel: e({ metal: 1 }, { bright: 0.3 }), iron: e({ metal: 1 }, { bright: -0.2, grit: 0.3 }),
  anvil: e({ metal: 1 }, { length: -0.6, register: 12 }), clang: e({ metal: 1 }, { length: -0.3 }), industrial: e({ metal: 0.6 }, { grit: 1, tension: 0.5 }),
  machine: e({ metal: 0.5, glitch: 0.5 }, { grit: 0.4 }),

  // ── digital, fx ─────────────────────────────────────────────
  glitch: e({ glitch: 1 }), digital: e({ glitch: 0.5, lead: 0.5 }, { bright: 0.4 }), bitcrush: e({ glitch: 0.6 }, { grit: 1, noise: 0.5 }),
  stutter: e({ glitch: 0.8 }, { motion: 1 }), error: e({ glitch: 1 }), computer: e({ glitch: 0.6, lead: 0.4 }), robot: e({ glitch: 0.6, lead: 0.4 }, { tension: 0.4 }),
  '8bit': e({ lead: 0.8, glitch: 0.2 }, { tension: -1, grit: 0.4 }), zap: e({ zap: 1 }), laser: e({ zap: 1 }, { bright: 0.4 }), pew: e({ zap: 1 }, { length: -0.5 }),
  blip: e({ zap: 0.6, lead: 0.4 }, { length: -1 }), bleep: e({ lead: 0.8, zap: 0.2 }, { length: -1, register: 12 }), beep: e({ lead: 1 }, { length: -1, tension: -1 }),
  riser: e({ riser: 1 }), rise: e({ riser: 1 }), sweep: e({ riser: 0.8, wind: 0.2 }), build: e({ riser: 1 }, { length: 0.6 }),
  uplifter: e({ riser: 1 }, { bright: 0.4 }), siren: e({ riser: 0.6, lead: 0.4 }, { motion: 1.2 }), alarm: e({ lead: 0.7, riser: 0.3 }, { motion: 1.2, bright: 0.6 }),

  // ── nature, noise beds ──────────────────────────────────────
  wind: e({ wind: 1 }), breath: e({ wind: 1 }, { soft: 0.4 }), whisper: e({ wind: 1 }, { bright: 0.4, length: -0.3 }),
  storm: e({ wind: 0.6, ocean: 0.4 }, { grit: 0.6, register: -7, motion: 0.6 }), hiss: e({ wind: 0.8 }, { bright: 0.8 }),
  ocean: e({ ocean: 1 }), waves: e({ ocean: 1 }), wave: e({ ocean: 0.8 }), sea: e({ ocean: 1 }), surf: e({ ocean: 1 }, { bright: 0.3 }),
  tide: e({ ocean: 1 }, { motion: 0.4 }), water: e({ ocean: 0.8, wind: 0.2 }), rain: e({ wind: 0.7, ocean: 0.3 }, { bright: 0.6, noise: 0.6 }),
  underwater: e(null, { bright: -1.4, motion: 0.5, space: 0.3 }),

  // ── register ────────────────────────────────────────────────
  low: e(null, { register: -12 }), deep: e(null, { register: -12, bright: -0.3 }), high: e(null, { register: 12 }),
  tiny: e(null, { register: 12, length: -0.5, space: -0.5 }), small: e(null, { register: 7, space: -0.3 }),
  huge: e(null, { register: -12, space: 0.8, width: 0.8 }), big: e(null, { register: -5, width: 0.6, space: 0.4 }), giant: e(null, { register: -12, space: 0.6 }),
  massive: e(null, { register: -7, width: 1, grit: 0.4, space: 0.5 }), soprano: e(null, { register: 12 }), baritone: e(null, { register: -7 }),

  // ── brightness, tone colour ─────────────────────────────────
  bright: e(null, { bright: 1 }), brilliant: e(null, { bright: 1.2 }), crisp: e(null, { bright: 0.7, soft: -0.5 }),
  sharp: e(null, { bright: 0.7, soft: -0.6 }), shiny: e(null, { bright: 0.8, motion: 0.2 }), sparkle: e(null, { bright: 0.9, motion: 0.4, register: 12 }),
  shimmer: e(null, { bright: 0.6, motion: 0.7, space: 0.4 }), harsh: e(null, { bright: 1, grit: 0.6 }), piercing: e(null, { bright: 1.4, register: 12 }),
  dark: e(null, { bright: -1, register: -5 }), dull: e(null, { bright: -0.9 }), muffled: e(null, { bright: -1.3, space: -0.2 }),
  warm: e(null, { bright: -0.5, grit: 0.2, tension: -0.4 }), mellow: e(null, { bright: -0.8, soft: 0.4 }), soft: e(null, { bright: -0.4, soft: 0.8, grit: -0.4 }),
  smooth: e(null, { bright: -0.3, grit: -0.8, soft: 0.3 }), round: e(null, { bright: -0.5 }), velvet: e(null, { bright: -0.6, grit: -0.5, soft: 0.4 }),
  hollow: e(null, { bright: -0.4, tension: -0.5, space: 0.3 }), nasal: e(null, { bright: 0.6, tension: 0.3 }), murky: e(null, { bright: -1.2, noise: 0.4 }),
  pure: e(null, { tension: -1.2, grit: -1, noise: -1 }), clean: e(null, { grit: -1, noise: -0.8 }), sweet: e(null, { tension: -1, bright: 0.2, soft: 0.3 }),

  // ── grit, texture ───────────────────────────────────────────
  distorted: e(null, { grit: 1.2 }), distortion: e(null, { grit: 1.2 }), dirty: e(null, { grit: 0.9, noise: 0.3 }), gritty: e(null, { grit: 0.9, noise: 0.3 }),
  crunchy: e(null, { grit: 1, bright: 0.3 }), fuzz: e(null, { grit: 1.4 }), fuzzy: e(null, { grit: 1, noise: 0.3 }), overdriven: e(null, { grit: 1.2 }),
  saturated: e(null, { grit: 0.7 }), aggressive: e(null, { grit: 1, bright: 0.6, soft: -0.7 }), angry: e(null, { grit: 1.1, bright: 0.5, soft: -0.6 }),
  heavy: e(null, { grit: 0.8, register: -5, width: 0.3 }), raw: e(null, { grit: 0.6, space: -0.4 }), nasty: e(null, { grit: 1.2, tension: 0.6 }),
  broken: e(null, { grit: 0.7, tension: 0.7, noise: 0.4 }), electric: e({ lead: 0.3 }, { grit: 0.7, bright: 0.4 }),
  lofi: e(null, { noise: 0.7, bright: -0.6, grit: 0.3 }), vintage: e(null, { noise: 0.3, bright: -0.4, grit: 0.2, motion: 0.2 }),
  retro: e(null, { noise: 0.2, bright: -0.2, grit: 0.2 }), tape: e(null, { noise: 0.4, bright: -0.4, motion: 0.3 }),
  vinyl: e(null, { noise: 0.6, bright: -0.4 }), crackle: e(null, { noise: 1, grit: 0.6 }), dusty: e(null, { noise: 0.6, bright: -0.5 }),
  noisy: e(null, { noise: 1.2 }), grainy: e(null, { noise: 0.6, grit: 0.3 }), static: e(null, { noise: 0.9, motion: -0.6 }),
  air: e({ wind: 0.4 }, { noise: 0.6, bright: 0.5 }), airy: e(null, { noise: 0.6, bright: 0.5, space: 0.3 }),

  // ── length, attack ──────────────────────────────────────────
  short: e(null, { length: -1 }), staccato: e(null, { length: -1.3, soft: -0.5 }), tight: e(null, { length: -0.8, space: -0.4 }),
  quick: e(null, { length: -0.7 }), brief: e(null, { length: -0.9 }), snappy: e(null, { length: -1, soft: -0.9 }),
  long: e(null, { length: 1 }), sustained: e(null, { length: 1.1 }), endless: e(null, { length: 1.6 }), infinite: e(null, { length: 1.7, space: 0.6 }),
  lingering: e(null, { length: 0.8, space: 0.4 }), held: e(null, { length: 0.8 }),
  slow: e(null, { soft: 1, length: 0.6 }), swell: e(null, { soft: 1.3, length: 0.4 }), gentle: e(null, { soft: 0.7, bright: -0.3 }),
  punchy: e(null, { soft: -1.2, grit: 0.2 }), hard: e(null, { soft: -0.9, grit: 0.3 }), attack: e(null, { soft: -0.8 }), fade: e(null, { soft: 1, length: 0.5 }),

  // ── space, width ────────────────────────────────────────────
  spacious: e(null, { space: 1, width: 0.6 }), reverb: e(null, { space: 1.2 }), echo: e(null, { space: 1 }), hall: e(null, { space: 1.1 }),
  cathedral: e(null, { space: 1.6, length: 0.5 }), cave: e(null, { space: 1.3, bright: -0.3 }), cavernous: e(null, { space: 1.5, bright: -0.4 }),
  distant: e(null, { space: 1.1, bright: -0.5 }), far: e(null, { space: 1, bright: -0.4 }), vast: e(null, { space: 1.3, width: 0.9 }),
  dry: e(null, { space: -1 }), close: e(null, { space: -0.8 }), intimate: e(null, { space: -0.7, soft: 0.3 }),
  wide: e(null, { width: 1.2 }), stereo: e(null, { width: 1 }), narrow: e(null, { width: -1 }), mono: e(null, { width: -2 }),

  // ── motion ──────────────────────────────────────────────────
  wobbly: e(null, { motion: 1.3 }), pulsing: e(null, { motion: 1.1 }), pulse: e(null, { motion: 1 }), throbbing: e(null, { motion: 1.2, register: -5 }),
  evolving: e(null, { motion: 0.8, length: 0.7 }), moving: e(null, { motion: 0.8 }), tremolo: e(null, { motion: 1 }), vibrato: e(null, { motion: 0.7 }),
  wavy: e(null, { motion: 0.9 }), warbly: e(null, { motion: 1, tension: 0.3 }), unstable: e(null, { motion: 0.8, tension: 0.4 }),
  still: e(null, { motion: -1 }), frozen: e(null, { motion: -1, length: 0.6 }), steady: e(null, { motion: -0.8 }),

  // ── tension ─────────────────────────────────────────────────
  dissonant: e(null, { tension: 1.2 }), inharmonic: e(null, { tension: 1.2 }), weird: e(null, { tension: 0.9, motion: 0.4 }),
  strange: e(null, { tension: 0.8, motion: 0.3 }), alien: e(null, { tension: 1, motion: 0.6, space: 0.3 }), tense: e(null, { tension: 0.8 }),
  unsettling: e(null, { tension: 1, motion: 0.3 }), harmonic: e(null, { tension: -1 }), consonant: e(null, { tension: -1 }), musical: e(null, { tension: -0.6 }),

  // ── mood (bundles of axes) ──────────────────────────────────
  haunting: e(null, { bright: -0.4, space: 0.9, tension: 0.6, motion: 0.4, length: 0.5 }),
  eerie: e(null, { tension: 0.9, space: 0.6, bright: -0.3 }), creepy: e(null, { tension: 1.1, bright: -0.4, motion: 0.3 }),
  spooky: e(null, { tension: 1, motion: 0.5, space: 0.5 }), ominous: e(null, { bright: -0.8, register: -7, space: 0.5, length: 0.4 }),
  sinister: e(null, { bright: -0.6, tension: 0.8, register: -5 }), menacing: e(null, { grit: 0.7, register: -5, bright: -0.3 }),
  evil: e(null, { tension: 1.1, grit: 0.6, register: -5 }), scary: e(null, { tension: 1, register: -5, space: 0.4 }),
  sad: e(null, { bright: -0.5, soft: 0.5, length: 0.4 }), melancholic: e(null, { bright: -0.5, soft: 0.5, length: 0.6, space: 0.4 }),
  happy: e(null, { bright: 0.5, tension: -0.8, length: -0.3 }), cheerful: e(null, { bright: 0.6, tension: -0.8 }), playful: e(null, { bright: 0.4, length: -0.6, motion: 0.3 }),
  dreamy: e(null, { space: 0.9, soft: 0.6, motion: 0.4, bright: -0.2 }), ambient: e(null, { space: 1.1, soft: 0.9, length: 1 }),
  chill: e(null, { soft: 0.4, bright: -0.3, space: 0.4 }), calm: e(null, { soft: 0.6, motion: -0.3, bright: -0.3 }),
  peaceful: e(null, { soft: 0.7, tension: -0.6, space: 0.5 }), meditative: e(null, { length: 1.1, soft: 0.6, motion: 0.2, space: 0.4 }),
  mystical: e(null, { space: 0.8, tension: 0.4, motion: 0.4 }), magical: e({ bell: 0.3 }, { bright: 0.5, space: 0.7, motion: 0.4 }),
  ethereal: e({ choir: 0.4, pad: 0.3 }, { space: 1, bright: 0.2, soft: 0.6 }), heavenly: e({ choir: 0.5 }, { space: 1, bright: 0.4, soft: 0.5 }),
  cinematic: e({ pad: 0.3 }, { space: 0.9, width: 0.7, register: -5, length: 0.5 }), epic: e({ brass: 0.3, pad: 0.3 }, { space: 0.9, width: 0.9, register: -7, grit: 0.2 }),
  space: e({ pad: 0.4 }, { space: 1, motion: 0.4 }), cosmic: e({ pad: 0.4 }, { space: 1.2, motion: 0.5, tension: 0.3 }),
  futuristic: e({ lead: 0.3, glitch: 0.2 }, { bright: 0.5, tension: 0.3, width: 0.5 }), scifi: e({ zap: 0.3 }, { tension: 0.6, motion: 0.6 }),
  cyberpunk: e({ lead: 0.4, bass: 0.2 }, { grit: 0.6, bright: 0.3, width: 0.4 }), techno: e({ kick: 0.4, bass: 0.2 }, { grit: 0.3, soft: -0.6 }),
  trance: e({ lead: 0.5, pad: 0.3 }, { width: 0.8, space: 0.5 }), dubstep: e({ bass: 0.8 }, { motion: 1.4, grit: 1 }),
  jazzy: e({ keys: 0.6 }, { bright: -0.3, soft: 0.3 }), funky: e({ pluck: 0.5, keys: 0.3 }, { length: -0.6, bright: 0.4 }),
  indian: e({ sitar: 0.5, drone: 0.4 }), classical: e({ pad: 0.5, keys: 0.3 }, { tension: -0.4, space: 0.5 }),
};

// Words that carry no sound meaning. Recognised so they are not shown as "unknown".
export const STOPWORDS = new Set([
  'a', 'an', 'the', 'of', 'and', 'or', 'with', 'in', 'on', 'at', 'for', 'to', 'from', 'into', 'by', 'that', 'this', 'is', 'it', 'its',
  'sound', 'sounds', 'sounding', 'like', 'vibe', 'vibes', 'kind', 'sort', 'some', 'something', 'tone', 'note', 'notes', 'sample',
  'loop', 'type', 'style', 'feel', 'feeling', 'texture', 'kinda', 'sorta', 'quite', 'make', 'me', 'my', 'please', 'but', 'as', 'yet',
]);

export const NEGATORS = new Set(['not', 'no', 'non', 'without', 'never', 'un', 'anti']);

export const INTENSIFIERS = {
  very: 1.6, super: 1.7, really: 1.4, extremely: 2, ultra: 1.9, so: 1.3, too: 1.5, more: 1.3, totally: 1.6, insanely: 2,
  slightly: 0.5, somewhat: 0.6, bit: 0.5, touch: 0.4, hint: 0.4, barely: 0.3, mildly: 0.5, little: 0.5, less: -0.6,
};
