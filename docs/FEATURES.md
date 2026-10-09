# Features

Move an item to Shipped in the same PR that builds it. Move abandoned approaches to Rejected with the reason.

## Shipped

| Feature | Where |
|---|---|
| Oversampled FM engine with index envelope, operator feedback, unison, reverb, loudness matching | `src/engine/render.js` |
| 23 timbres with musically chosen FM ratios | `src/sound/timbres.js` |
| 10 modifier axes (register, brightness, grit, length, softness, space, width, motion, texture, tension) | `src/sound/modifiers.js` |
| ~300-word lexicon with stemming, typo tolerance, negation, intensifiers | `src/sound/lexicon.js`, `interpret.js` |
| Deterministic fallback for prompts with no known words | `interpret.js` |
| Rendering in a Web Worker | `src/engine/render.worker.js` |
| "Understood" chips showing how each word was read | `src/ui/Understood.jsx` |
| Waveform with playhead, coloured by timbre | `src/ui/Scope.jsx` |
| Playable 13-key keyboard (mouse, touch, computer keys, octave shift) | `src/ui/Keyboard.jsx` |
| Shape panel: root note, 4 character nudges, 5 envelope controls | `src/ui/ShapePanel.jsx` |
| Library saved in the browser as recipes | `src/ui/Library.jsx`, `storage.js` |
| Share link (recipe in URL hash) | `src/ui/storage.js` |
| WAV download, named by prompt and note | `src/engine/wav.js` |
| Light and dark themes, phone layout | `src/styles.css` |
| Offline embedding distillation script | `scripts/distill-lexicon.mjs` |

## Planned

- [ ] Run the distillation script and commit `lexicon.generated.js` (needs npm and Hugging Face access)
- [ ] Direction 3: time-varying timbre weights inside `render()`
- [ ] "Did you mean" suggestions for unknown words
- [ ] Export a set of notes (e.g. C2–C5) as a sample pack zip
- [ ] Drawing or image input (from the README's original aim)

## Rejected

| Approach | Reason |
|---|---|
| Transformers.js embeddings in the browser | ~23 MB smallest model build for a ~16 KB app; seconds of first-load delay. Distilled offline instead. |
| Tailwind Play CDN | Tailwind's docs say it isn't for production; compiles CSS in the browser at runtime. Replaced with 6 KB of CSS. |
| `lucide-react` + unpkg lucide script | Two copies of an icon library for six icons. Replaced with inline SVG. |
| Fixed 2 s buffer | Truncated envelopes longer than 2 s. Duration now follows the envelope. |
| Single 1.618 FM ratio for all sounds | Every sound inharmonic. Ratio is now per timbre and never averaged. |
| Averaging every parameter across matched words | Mean collapse, and pitch averaged in Hz instead of octaves. |
| Artificial 450 ms "processing" delay | Added latency for show. Removed. |
| Live Web Audio node graph for synthesis | No oversampling inside FM, no operator feedback, separate pass needed for export and display. See ARCHITECTURE.md. |
| PCA / MFCC clustering for text → params | Not enough presets to give the structure meaning; MFCC needs audio before parameters exist. |
