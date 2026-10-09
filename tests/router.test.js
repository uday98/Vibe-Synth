import { test } from 'node:test';
import assert from 'node:assert/strict';
import { interpret, lookup, tokenize } from '../src/sound/interpret.js';
import { blendTimbres, buildParams, dominantTimbre, noteName } from '../src/sound/blend.js';
import { LEXICON } from '../src/sound/lexicon.js';
import { TIMBRES } from '../src/sound/timbres.js';
import { AXES } from '../src/sound/modifiers.js';

test('lexicon only references real timbres and axes', () => {
  for (const [w, e] of Object.entries(LEXICON)) {
    for (const id of Object.keys(e.t || {})) assert.ok(TIMBRES[id], `${w} → unknown timbre ${id}`);
    for (const ax of Object.keys(e.m || {})) assert.ok(AXES[ax], `${w} → unknown axis ${ax}`);
  }
});

test('"dark haunting bass" = bass timbre pushed dark and spacious', () => {
  const r = interpret('dark haunting bass');
  assert.equal(dominantTimbre(r.weights), 'bass');
  assert.ok(r.mods.bright < 0 && r.mods.space > 0 && r.mods.tension > 0);
  assert.equal(r.source, 'words');
});

test('stems and typos resolve', () => {
  assert.equal(lookup('darker').key, 'dark');
  assert.equal(lookup('metallic').key, 'metal');
  assert.equal(lookup('bells').key, 'bell');
  assert.equal(lookup('shimmering').key, 'shimmer');
  assert.equal(lookup('glassy').key, 'glass');
  assert.equal(lookup('ethereeal').key, 'ethereal');
  assert.equal(lookup('qzxv'), null);
});

test('negation and intensity', () => {
  assert.ok(interpret('not bright pad').mods.bright < 0);
  assert.ok(interpret('very dark pad').mods.bright < interpret('dark pad').mods.bright);
  assert.ok(interpret('slightly dark pad').mods.bright > interpret('dark pad').mods.bright);
  assert.ok(interpret('less noisy pad').mods.noise < 0);
  assert.ok(!interpret('not bell pad').weights.bell);
});

test('compound words', () => {
  assert.deepEqual(tokenize('Lo-Fi hi-hat, sci-fi'), ['lofi', 'hihat', 'scifi']);
});

test('unknown text still maps to a repeatable sound', () => {
  const a = interpret('zorblax quintessence');
  const b = interpret('zorblax quintessence');
  assert.equal(a.source, 'hash');
  assert.deepEqual(a, b);
  assert.notDeepEqual(a.weights, interpret('flimflam').weights);
});

test('modifier-only prompts pick a sensible source', () => {
  assert.equal(interpret('short').source, 'modifiers');
  assert.equal(dominantTimbre(interpret('short').weights), 'pluck');
  assert.equal(dominantTimbre(interpret('deep').weights), 'bass');
});

test('pitch blends geometrically; FM ratio is never averaged', () => {
  const p = blendTimbres({ sub: 0.5, bell: 0.5 });       // 55 Hz and 880 Hz
  assert.ok(Math.abs(p.freq - 220) < 1e-6);
  const q = blendTimbres({ bell: 0.6, pad: 0.4 });
  assert.equal(q.ratio, TIMBRES.bell.ratio);
});

test('dominant timbre stays dominant (no mean collapse)', () => {
  const r = interpret('bell with a little pad');
  assert.ok(r.weights.bell > 0.7);
});

test('buildParams snaps to an equal-tempered note and applies overrides', () => {
  const { params, midi } = buildParams(interpret('dark haunting bass'));
  assert.ok(Math.abs(440 * 2 ** ((midi - 69) / 12) - params.freq) < 1e-6);
  const o = buildParams(interpret('bass'), { midi: 45, env: { release: 2 } });
  assert.equal(noteName(o.midi), 'A2');
  assert.ok(Math.abs(o.params.freq - 110) < 1e-9);
  assert.equal(o.params.release, 2);
});
