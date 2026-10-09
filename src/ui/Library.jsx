// Saved sounds. Only the recipe (prompt + adjustments) is stored, a few bytes each:
// rendering is deterministic, so the audio is rebuilt identically on demand.
import { Icon } from './icons.jsx';

export function Library({ items, onPlay, onOpen, onDownload, onDelete }) {
  return (
    <section className="library" aria-labelledby="library-title">
      <div className="section-head"><h2 id="library-title">Saved sounds</h2></div>
      {items.length === 0 ? (
        <p className="hint">Sounds you save stay in this browser. Save one with the heart above.</p>
      ) : (
        <ul>
          {items.map((it) => (
            <li key={it.id}>
              <button type="button" className="icon-button" onClick={() => onPlay(it)} aria-label={`Play ${it.name}`}><Icon name="play" size={16} /></button>
              <button type="button" className="library-name" onClick={() => onOpen(it)} title="Open in the editor">{it.name}</button>
              <button type="button" className="icon-button quiet" onClick={() => onDownload(it)} aria-label={`Download ${it.name}`}><Icon name="download" size={16} /></button>
              <button type="button" className="icon-button quiet" onClick={() => onDelete(it.id)} aria-label={`Delete ${it.name}`}><Icon name="trash" size={16} /></button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
