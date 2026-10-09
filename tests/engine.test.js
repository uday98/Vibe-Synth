import { test } from 'node:test';
import assert from 'node:assert/strict';
import { render, ampEnvelope, totalDuration } from '../src/engine/render.js';
import { sanitize } from '../src/engine/params.js';
import { encodeWav } from '../src/engine/wav.js';
import { TIMBRES } from '../src/sound/timbres.js';

const SR = 22050;   // lower rate keeps the suite fast; the DSP is rate-independent

test('render is deterministic for the same seed and differs for another', () => {
  const p = { ...TIMBRES.snare, seed: 7 };
  const a = render(p, { sampleRate: SR });
  const b = render(p, { sampleRate: SR });
  const c = render({ ...p, seed: 8 }, { sampleRate: SR });
  assert.deepEqual(a.left, b.left);
  assert.notDeepEqual(a.left, c.left);
});

test('every timbre renders finite, loudness-matched audio under −1 dBFS with a silent tail', () => {
  for (const [id, t] of Object.entries(TIMBRES)) {
    const r = render(t, { sampleRate: SR });
    let peak = 0;
    for (const ch of [r.left, r.right]) for (const x of ch) {
      assert.ok(Number.isFinite(x), `${id} produced a non-finite sample`);
      peak = Math.max(peak, Math.abs(x));
    }
    assert.ok(peak <= 0.8901 && peak > 0.2, `${id} peak ${peak}`);
    assert.ok(Math.abs(r.left.at(-1)) < 1e-3 && Math.abs(r.right.at(-1)) < 1e-3, `${id} ends with a click`);
    assert.equal(r.left.length, Math.ceil(r.duration * SR));
  }
});

test('extreme FM index cannot blow up (index is capped by Carson bandwidth)', () => {
  const r = render({ freq: 4000, ratio: 7, index: 30, feedback: 1, drive: 1 }, { sampleRate: SR });
  assert.ok(r.left.every(Number.isFinite));
});

test('envelope is continuous across segment boundaries', () => {
  const p = sanitize({ attack: 0.1, decay: 0.2, sustain: 0.5, hold: 0.3, release: 0.4 });
  const eps = 1e-6;
  for (const edge of [0.1, 0.3, 0.6]) {
    const jump = Math.abs(ampEnvelope(edge - eps, p) - ampEnvelope(edge + eps, p));
    assert.ok(jump < 0.01, `jump of ${jump} at ${edge}s`);
  }
  assert.equal(ampEnvelope(10, p), 0);
});

test('duration follows the envelope instead of a fixed 2 s buffer', () => {
  const long = sanitize({ attack: 1.5, decay: 1.5, sustain: 1, hold: 0.5, release: 1.5, space: 0 });
  assert.ok(totalDuration(long) > 4.9);
});

test('WAV header describes 16-bit stereo', () => {
  const buf = encodeWav(new Float32Array(10), new Float32Array(10), 48000);
  const v = new DataView(buf);
  assert.equal(buf.byteLength, 44 + 10 * 4);
  assert.equal(v.getUint16(22, true), 2);
  assert.equal(v.getUint32(24, true), 48000);
  assert.equal(v.getUint16(34, true), 16);
});
