// Fine-tuning after the words have done the coarse work.
// Character controls are nudges relative to what the prompt asked for (0 = as described).
// Envelope controls show and set the actual values.
import { PARAM_SPEC } from '../engine/params.js';
import { MIDI_MIN, MIDI_MAX, noteName } from '../sound/blend.js';

const NUDGES = [
  ['bright', 'Brightness', 'Darker', 'Brighter'],
  ['grit', 'Grit', 'Cleaner', 'Dirtier'],
  ['space', 'Space', 'Drier', 'Roomier'],
  ['motion', 'Motion', 'Steadier', 'More movement'],
];

const ENV = [
  ['attack', 'Attack', 'log'],
  ['decay', 'Decay', 'log'],
  ['sustain', 'Sustain', 'lin'],
  ['hold', 'Hold', 'lin'],
  ['release', 'Release', 'log'],
];

const STEPS = 1000;
const toSlider = (v, { min, max }, kind) =>
  kind === 'log' ? Math.round((STEPS * Math.log(v / min)) / Math.log(max / min)) : Math.round((STEPS * (v - min)) / (max - min));
const fromSlider = (x, { min, max }, kind) =>
  kind === 'log' ? min * Math.pow(max / min, x / STEPS) : min + ((max - min) * x) / STEPS;

const fmt = (k, v) => {
  if (k === 'sustain') return `${Math.round(v * 100)}%`;
  return v < 0.1 ? `${Math.round(v * 1000)} ms` : `${v.toFixed(2)} s`;
};

export function ShapePanel({ params, midi, overrides, onChange, onCommit, onReset }) {
  const mods = overrides.mods || {};
  const setMod = (k, v) => onChange({ ...overrides, mods: { ...mods, [k]: v } });
  const setEnv = (k, v) => onChange({ ...overrides, env: { ...(overrides.env || {}), [k]: v } });
  const commit = { onPointerUp: onCommit, onKeyUp: onCommit };
  const touched = Object.values(mods).some(Boolean) || overrides.env || overrides.midi !== undefined;

  return (
    <section className="shape" aria-labelledby="shape-title">
      <div className="section-head">
        <h2 id="shape-title">Shape</h2>
        {touched && <button type="button" className="text-button" onClick={onReset}>Back to the prompt</button>}
      </div>

      <label className="row">
        <span className="row-label">Root note</span>
        <select value={midi} onChange={(e) => { onChange({ ...overrides, midi: Number(e.target.value) }); }} onBlur={onCommit}>
          {Array.from({ length: MIDI_MAX - MIDI_MIN + 1 }, (_, i) => MIDI_MIN + i).map((m) => (
            <option key={m} value={m}>{noteName(m)}</option>
          ))}
        </select>
      </label>

      <div className="grid">
        <div>
          <h3>Character</h3>
          {NUDGES.map(([k, label, lo, hi]) => (
            <label key={k} className="row">
              <span className="row-label">{label}</span>
              <input type="range" min={-1.5} max={1.5} step={0.05} value={mods[k] || 0}
                aria-valuetext={(mods[k] || 0) === 0 ? 'As described' : (mods[k] < 0 ? lo : hi)}
                onChange={(e) => setMod(k, Number(e.target.value))}
                onDoubleClick={() => { setMod(k, 0); onCommit(); }} {...commit} />
              <span className="row-value">{(mods[k] || 0) === 0 ? '—' : (mods[k] > 0 ? '+' : '') + mods[k].toFixed(1)}</span>
            </label>
          ))}
        </div>
        <div>
          <h3>Envelope</h3>
          {ENV.map(([k, label, kind]) => (
            <label key={k} className="row">
              <span className="row-label">{label}</span>
              <input type="range" min={0} max={STEPS} step={1} value={toSlider(params[k], PARAM_SPEC[k], kind)}
                aria-valuetext={fmt(k, params[k])}
                onChange={(e) => setEnv(k, fromSlider(Number(e.target.value), PARAM_SPEC[k], kind))} {...commit} />
              <span className="row-value">{fmt(k, params[k])}</span>
            </label>
          ))}
        </div>
      </div>
    </section>
  );
}
