// One chromatic octave above the sound's root, playable by mouse, touch or the
// computer keyboard (A W S E D F T G Y H U J K; Z and X shift octave).
import { useEffect } from 'react';
import { noteName } from '../sound/blend.js';

const KEYMAP = 'awsedftgyhujk';

export function Keyboard({ rootMidi, octave, setOctave, onNote, disabled }) {
  useEffect(() => {
    const onKey = (e) => {
      if (disabled || e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      const k = e.key.toLowerCase();
      if (k === 'z') { setOctave((o) => Math.max(-2, o - 1)); return; }
      if (k === 'x') { setOctave((o) => Math.min(2, o + 1)); return; }
      const i = KEYMAP.indexOf(k);
      if (i >= 0) { e.preventDefault(); onNote(i + octave * 12); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [disabled, octave, onNote, setOctave]);

  const base = rootMidi + octave * 12;
  return (
    <div className="keyboard">
      <div className="keyboard-head">
        <span>Play it</span>
        <span className="octave">
          <button type="button" onClick={() => setOctave((o) => Math.max(-2, o - 1))} disabled={octave <= -2} aria-label="Octave down">−</button>
          <span aria-live="polite">Octave {octave > 0 ? `+${octave}` : octave}</span>
          <button type="button" onClick={() => setOctave((o) => Math.min(2, o + 1))} disabled={octave >= 2} aria-label="Octave up">+</button>
        </span>
      </div>
      <div className="keys" role="group" aria-label="Keyboard">
        {Array.from({ length: 13 }, (_, i) => {
          const midi = base + i;
          const sharp = noteName(midi).includes('#');
          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              className={`key${sharp ? ' sharp' : ''}${i === 0 ? ' root' : ''}`}
              onPointerDown={(e) => { e.preventDefault(); onNote(i + octave * 12); }}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNote(i + octave * 12); } }}
              aria-label={`Play ${noteName(midi)}`}
            >
              <span className="key-note">{noteName(midi)}</span>
              <kbd>{KEYMAP[i].toUpperCase()}</kbd>
            </button>
          );
        })}
      </div>
    </div>
  );
}
