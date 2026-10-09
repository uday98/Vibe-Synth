// Shows what the router made of the prompt, so the vocabulary is learnable by use.
import { TIMBRES } from '../sound/timbres.js';

// Pick dark or light text so every timbre colour stays readable.
function inkFor(hex) {
  const n = parseInt(hex.slice(1), 16);
  const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  const L = 0.2126 * lin(n >> 16) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
  return L > 0.3 ? '#1c2228' : '#ffffff';
}

const EXAMPLES = [
  'dark haunting bass',
  'glass bell in a cathedral',
  'lofi rhodes',
  'very wide sitar drone',
  'punchy techno kick',
  'slow evolving ocean waves',
  'aggressive acid bassline',
  'ethereal choir, not bright',
];

export function Understood({ interp, onExample }) {
  if (!interp) {
    return (
      <div className="understood">
        <p className="hint">Name a source (bell, sitar, kick, pad…) and describe it (dark, wide, short, eerie…). Or start from one of these:</p>
        <div className="chips">
          {EXAMPLES.map((ex) => <button type="button" key={ex} className="chip example" onClick={() => onExample(ex)}>{ex}</button>)}
        </div>
      </div>
    );
  }

  const visible = interp.tokens.filter((t) => t.kind !== 'stop' && t.kind !== 'grammar');
  const timbres = Object.entries(interp.weights).sort((a, b) => b[1] - a[1]);

  return (
    <div className="understood" aria-live="polite">
      <div className="chips">
        {visible.map((t, i) => {
          if (t.kind === 'unknown') {
            return <span key={i} className="chip unknown" title="Not in the vocabulary yet; ignored">{t.word}</span>;
          }
          const color = t.timbre ? TIMBRES[t.timbre].color : undefined;
          const label = t.via === 'typo' ? `${t.word} → ${t.key}` : t.word;
          const prefix = t.negated ? 'not ' : t.intensity > 1 ? 'very ' : t.intensity < 0 ? 'less ' : t.intensity < 1 ? 'slightly ' : '';
          return (
            <span key={i} className={`chip ${t.kind}`} style={color ? { '--chip': color, '--chip-ink': inkFor(color) } : undefined}
              title={t.kind === 'modifier' ? 'Describes the sound' : 'Sound source'}>
              {prefix}{label}
            </span>
          );
        })}
      </div>
      <p className="hint">
        {interp.source === 'hash' && 'None of these words are in the vocabulary yet, so this sound was derived from the text itself. Same text, same sound. '}
        {interp.source === 'modifiers' && 'No sound source named, so a default one was picked. '}
        Source: {timbres.map(([id, w]) => `${id} ${Math.round(w * 100)}%`).join(', ')}
      </p>
    </div>
  );
}
