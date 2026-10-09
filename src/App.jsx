import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { interpret } from './sound/interpret.js';
import { buildParams, noteName } from './sound/blend.js';
import { renderAsync } from './engine/renderClient.js';
import { encodeWav } from './engine/wav.js';
import { useAudio } from './ui/useAudio.js';
import { Scope } from './ui/Scope.jsx';
import { Understood } from './ui/Understood.jsx';
import { Keyboard } from './ui/Keyboard.jsx';
import { ShapePanel } from './ui/ShapePanel.jsx';
import { Library } from './ui/Library.jsx';
import { Icon } from './ui/icons.jsx';
import { loadLibrary, saveLibrary, encodeRecipe, decodeRecipe, sameRecipe, slug } from './ui/storage.js';

const RENDER_DEBOUNCE_MS = 60;

function recipeFromHash() {
  const m = window.location.hash.match(/#s=([\w-]+)/);
  return m ? decodeRecipe(m[1]) : null;
}

function downloadWav(rendered, name) {
  const blob = new Blob([encodeWav(rendered.left, rendered.right, rendered.sampleRate)], { type: 'audio/wav' });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: `${name}.wav` });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function App() {
  const initial = useMemo(recipeFromHash, []);
  const [text, setText] = useState(initial?.prompt ?? '');
  const [recipe, setRecipe] = useState(initial);
  const [rendered, setRendered] = useState(null);
  const [octave, setOctave] = useState(0);
  const [library, setLibrary] = useState(loadLibrary);
  const [notice, setNotice] = useState('');
  const audio = useAudio();

  const interp = useMemo(() => (recipe ? interpret(recipe.prompt) : null), [recipe?.prompt]);
  const built = useMemo(() => (interp ? buildParams(interp, recipe.overrides) : null), [interp, recipe?.overrides]);
  const color = built?.color ?? '#5b6bd6';

  // Render whenever the recipe changes. Versions drop stale results when the
  // user drags a slider faster than renders finish.
  const wanted = useRef(0);
  const ready = useRef(0);
  const playWhenReady = useRef(false);
  useEffect(() => {
    if (!built) return undefined;
    const v = ++wanted.current;
    const timer = setTimeout(async () => {
      const out = await renderAsync(built.params, audio.sampleRate());
      if (v !== wanted.current) return;
      audio.load(out);
      setRendered(out);
      ready.current = v;
      if (playWhenReady.current) { playWhenReady.current = false; audio.play(0); }
    }, RENDER_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [built]);   // eslint-disable-line react-hooks/exhaustive-deps

  // Keep the URL in step with the sound so any sound is shareable as a link.
  useEffect(() => {
    if (recipe) history.replaceState(null, '', `#s=${encodeRecipe(recipe)}`);
  }, [recipe]);

  useEffect(() => saveLibrary(library), [library]);

  useEffect(() => {
    if (!notice) return undefined;
    const t = setTimeout(() => setNotice(''), 2200);
    return () => clearTimeout(t);
  }, [notice]);

  const audition = useCallback(() => {
    if (ready.current === wanted.current && rendered) audio.play(0);
    else playWhenReady.current = true;
  }, [audio, rendered]);

  const make = (prompt) => {
    const next = { prompt: prompt.trim(), overrides: {} };
    if (!next.prompt) return;
    setText(next.prompt);
    if (sameRecipe(next, recipe)) { audition(); return; }
    playWhenReady.current = true;
    setRecipe(next);
  };

  const setOverrides = (overrides) => setRecipe((r) => ({ ...r, overrides }));
  const isSaved = library.some((it) => sameRecipe({ prompt: it.prompt, overrides: it.overrides }, recipe));

  const toggleSave = () => {
    if (!recipe) return;
    if (isSaved) {
      setLibrary((l) => l.filter((it) => !sameRecipe({ prompt: it.prompt, overrides: it.overrides }, recipe)));
      setNotice('Removed from saved sounds');
    } else {
      setLibrary((l) => [{ id: Date.now(), name: recipe.prompt, ...recipe }, ...l]);
      setNotice('Saved');
    }
  };

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setNotice('Link copied'); }
    catch { setNotice('Copy the address bar to share this sound'); }
  };

  const openSaved = (it, play) => {
    setText(it.prompt);
    playWhenReady.current = play;
    setRecipe({ prompt: it.prompt, overrides: it.overrides || {} });
  };

  const downloadSaved = async (it) => {
    const b = buildParams(interpret(it.prompt), it.overrides || {});
    const out = await renderAsync(b.params, audio.sampleRate());
    downloadWav(out, `${slug(it.prompt)}-${noteName(b.midi)}`);
  };

  return (
    <main className="app" style={{ '--accent': color }}>
      <header className="masthead">
        <h1>VibeSynth</h1>
        <p>Describe a sound. Hear it, shape it, play it.</p>
      </header>

      <form className="prompt" onSubmit={(e) => { e.preventDefault(); make(text); }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="dark haunting bass"
          aria-label="Describe a sound"
          maxLength={200}
          autoComplete="off"
          spellCheck="false"
        />
        <button type="submit" className="primary" disabled={!text.trim()}>Make sound</button>
      </form>

      <Understood interp={interp} onExample={make} />

      <section className={`scope${rendered ? '' : ' empty'}`} aria-label="Current sound">
        <Scope audio={rendered} color={color} playhead={audio.playhead} now={audio.now} />
        {!rendered && <p className="scope-empty">Your sound appears here</p>}
        <div className="transport">
          <span className="readout">
            {built && rendered ? `${noteName(built.midi)}, ${rendered.duration.toFixed(1)} s` : ''}
          </span>
          <div className="transport-buttons">
            {audio.playhead
              ? <button type="button" className="icon-button" onClick={audio.stop} aria-label="Stop"><Icon name="stop" /></button>
              : <button type="button" className="icon-button" onClick={audition} disabled={!rendered} aria-label="Play"><Icon name="play" /></button>}
            <button type="button" className={`icon-button${isSaved ? ' on' : ''}`} onClick={toggleSave} disabled={!rendered}
              aria-pressed={isSaved} aria-label={isSaved ? 'Remove from saved sounds' : 'Save sound'}><Icon name="save" /></button>
            <button type="button" className="icon-button" onClick={() => downloadWav(rendered, `${slug(recipe.prompt)}-${noteName(built.midi)}`)}
              disabled={!rendered} aria-label="Download WAV"><Icon name="download" /></button>
            <button type="button" className="icon-button" onClick={copyLink} disabled={!rendered} aria-label="Copy link to this sound"><Icon name="link" /></button>
          </div>
        </div>
      </section>

      <Keyboard rootMidi={built?.midi ?? 60} octave={octave} setOctave={setOctave} onNote={audio.play} disabled={!rendered} />

      {built && (
        <ShapePanel
          params={built.params}
          midi={built.midi}
          overrides={recipe.overrides}
          onChange={setOverrides}
          onCommit={audition}
          onReset={() => { setOverrides({}); playWhenReady.current = true; }}
        />
      )}

      <Library items={library} onPlay={(it) => openSaved(it, true)} onOpen={(it) => openSaved(it, false)}
        onDownload={downloadSaved} onDelete={(id) => setLibrary((l) => l.filter((it) => it.id !== id))} />

      <footer>Every sound is synthesised in your browser. Nothing is uploaded.</footer>
      <div className="notice" role="status" aria-live="polite">{notice}</div>
    </main>
  );
}
