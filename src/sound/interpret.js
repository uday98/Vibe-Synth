// Prompt router. Turns free text into timbre weights + modifier axes, cheapest path first:
//
//   1. exact word in lexicon                       ("bell")
//   2. stemmed form                                 ("bells", "darker", "metallic", "shimmering")
//   3. distilled embedding vocabulary              (lexicon.generated.js, built offline)
//   4. typo-tolerant match (edit distance 1–2)     ("ethereeal")
//   5. no known words at all → deterministic hash  (any text still gives a distinct, repeatable sound)
//
// Grammar it understands: negation ("not bright"), intensity ("very dark", "slightly gritty", "less noisy").
// Every token is reported back so the UI can show what was understood and what was not.

import { LEXICON, STOPWORDS, NEGATORS, INTENSIFIERS } from './lexicon.js';
import { GENERATED } from './lexicon.generated.js';
import { TIMBRE_IDS } from './timbres.js';
import { AXIS_IDS, clampMods } from './modifiers.js';
import { hashString, createRng } from '../engine/rng.js';

// curated entries override distilled ones
const DICT = { ...GENERATED, ...LEXICON };
const KEYS = Object.keys(LEXICON);   // typo matching only against curated words
const PHRASES = [
  [/\bhi[\s-]?hat\b/g, 'hihat'], [/\blo[\s-]?fi\b/g, 'lofi'], [/\bsci[\s-]?fi\b/g, 'scifi'],
  [/\be[\s-]piano\b/g, 'epiano'], [/\bmusic\s+box\b/g, 'musicbox'], [/\bsub[\s-]bass\b/g, 'subbass'],
  [/\bbass\s+drum\b/g, 'bassdrum'], [/\b8[\s-]bit\b/g, '8bit'], [/\bbit[\s-]?crush(ed)?\b/g, 'bitcrush'],
];

export function tokenize(text) {
  let s = ` ${text.toLowerCase()} `;
  for (const [re, rep] of PHRASES) s = s.replace(re, rep);
  const out = [];
  for (const raw of s.split(/\s+/)) {
    if (!raw) continue;
    const joined = raw.replace(/[^a-z0-9]/g, '');
    if (raw.includes('-') && DICT[joined]) { out.push(joined); continue; }
    for (const part of raw.split(/[^a-z0-9]+/)) if (part) out.push(part);
  }
  return out;
}

const SUFFIXES = [
  ['iest', 'y'], ['ier', 'y'], ['ies', 'y'], ['ness', ''], ['ical', ''], ['ing', ''], ['est', ''], ['ish', ''],
  ['ly', ''], ['ed', ''], ['er', ''], ['ic', ''], ['es', ''], ['ey', ''], ['y', ''], ['s', ''],
];

export function stemCandidates(w) {
  const out = [];
  for (const [suf, rep] of SUFFIXES) {
    if (w.length - suf.length < 3 || !w.endsWith(suf)) continue;
    const base = w.slice(0, -suf.length) + rep;
    out.push(base, base + 'e');
    // undouble a final consonant: bigger → bigg → big, metallic → metall → metal
    if (base.length > 3 && base[base.length - 1] === base[base.length - 2]) out.push(base.slice(0, -1));
  }
  return out;
}

function editDistance(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (cur[j] < rowMin) rowMin = cur[j];
    }
    if (rowMin > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}

export function lookup(word) {
  if (LEXICON[word]) return { key: word, via: 'exact' };
  const stems = stemCandidates(word);
  for (const c of stems) if (LEXICON[c]) return { key: c, via: 'stem' };
  if (GENERATED[word]) return { key: word, via: 'distilled' };
  for (const c of stems) if (GENERATED[c]) return { key: c, via: 'distilled' };
  if (word.length < 4 || /^\d+$/.test(word)) return null;
  const max = word.length >= 7 ? 2 : 1;
  let best = null, bestD = max + 1;
  for (const k of KEYS) {
    if (k.length < 3) continue;
    const d = editDistance(word, k, max);
    if (d < bestD) { best = k; bestD = d; }
  }
  return best ? { key: best, via: 'typo' } : null;
}

function defaultTimbre(mods) {
  if (mods.length < -0.5 || mods.soft < -0.8) return 'pluck';
  if (mods.noise > 0.8) return 'wind';
  if (mods.register <= -5) return 'bass';
  return 'pad';
}

// Squaring before normalising keeps the strongest timbre dominant. Plain averaging
// drifts every blend toward a characterless middle (mean collapse).
function sharpen(raw) {
  const out = {};
  let total = 0;
  for (const [id, w] of Object.entries(raw)) if (w > 0) { out[id] = w * w; total += w * w; }
  for (const id of Object.keys(out)) out[id] /= total;
  return out;
}

/**
 * @param {string} text
 * @returns {{weights: Record<string, number>, mods: Record<string, number>, tokens: Array<object>, source: 'words'|'modifiers'|'hash'|'empty', seed: number}}
 */
export function interpret(text) {
  const tokens = tokenize(text);
  const raw = {};
  const mods = {};
  const report = [];
  let negate = false;
  let intensity = 1;

  for (const word of tokens) {
    if (NEGATORS.has(word)) { negate = true; report.push({ word, kind: 'grammar' }); continue; }
    if (INTENSIFIERS[word] !== undefined && !DICT[word]) { intensity *= INTENSIFIERS[word]; report.push({ word, kind: 'grammar' }); continue; }
    if (STOPWORDS.has(word)) { report.push({ word, kind: 'stop' }); continue; }

    const hit = lookup(word);
    if (!hit) { report.push({ word, kind: 'unknown' }); continue; }

    const entry = DICT[hit.key];
    const sign = negate ? -1 : 1;
    if (entry.t && !negate && intensity > 0) {
      for (const [id, w] of Object.entries(entry.t)) raw[id] = (raw[id] || 0) + w * Math.min(intensity, 1.5);
    }
    if (entry.m) {
      for (const [axis, v] of Object.entries(entry.m)) mods[axis] = (mods[axis] || 0) + v * intensity * sign;
    }
    report.push({
      word, key: hit.key, via: hit.via, negated: negate, intensity,
      timbre: entry.t ? Object.entries(entry.t).sort((x, y) => y[1] - x[1])[0][0] : null,
      kind: entry.t && entry.m ? 'both' : entry.t ? 'timbre' : 'modifier',
    });
    negate = false;
    intensity = 1;
  }

  const seed = hashString(tokens.join(' ') || 'silence');
  const anyMod = AXIS_IDS.some((k) => Math.abs(mods[k] || 0) > 1e-9);
  let source = 'words';

  if (Object.keys(raw).length === 0) {
    if (anyMod) {
      raw[defaultTimbre(clampMods(mods))] = 1;
      source = 'modifiers';
    } else if (tokens.length === 0) {
      raw.keys = 1;
      source = 'empty';
    } else {
      // Nothing understood. Still give this exact text its own repeatable sound.
      const rng = createRng(seed);
      const a = TIMBRE_IDS[Math.floor(rng() * TIMBRE_IDS.length)];
      const b = TIMBRE_IDS[Math.floor(rng() * TIMBRE_IDS.length)];
      raw[a] = 1;
      raw[b] = (raw[b] || 0) + 0.4;
      for (const k of AXIS_IDS) mods[k] = k === 'register' ? Math.round((rng() * 2 - 1) * 7) : (rng() * 2 - 1) * 0.6;
      source = 'hash';
    }
  }

  return { weights: sharpen(raw), mods: clampMods(mods), tokens: report, source, seed };
}
