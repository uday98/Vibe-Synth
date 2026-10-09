# Vibe-Synth

Browser FM synthesizer: type a description ("dark haunting bass"), hear a matching sound, shape it, play it on a keyboard, save or download it. Fully client-side. No backend, no model download at runtime.

Stack: React 18, Vite, plain CSS, Web Audio API (playback only). Tests use `node:test`, no extra dependency.

## Commands

```bash
npm run dev       # dev server
npm run build     # production build
npm test          # node --test tests/*.test.js  (pure JS, no browser)
npm run distill   # offline: grow the vocabulary with an embedding model (dev machine only)
```

## Layout

```
src/engine/   Pure DSP. Params in, Float32Arrays out. No React, no Web Audio, no Math.random.
src/sound/    Words → params: timbres, modifier axes, lexicon, router, blending.
src/ui/       React components and the playback hook. No synthesis logic.
scripts/      Offline tools (embedding distillation).
tests/        Engine and router tests.
docs/         Reference documents, read when the task touches them.
```

## Reference documents

- @docs/ARCHITECTURE.md — data flow, module boundaries, why each design choice was made
- @docs/FEATURES.md — what ships, what is planned, what was rejected and why
- @docs/TODO.md — active task queue
- @docs/CONVENTIONS.md — code rules a linter can't enforce

## Always

- Branch before code changes. Never commit to `main`.
- Explain the approach before writing code; name the module being touched.
- Run `npm test` before committing.
- Update docs/TODO.md and docs/FEATURES.md in the same PR as the code.

## Never

- Add a backend, or ship an ML model to the browser. Use `scripts/distill-lexicon.mjs` to bake model knowledge into the lexicon offline.
- Call `Math.random()` in `src/engine` or `src/sound`. Determinism is what makes saved recipes, share links and tests work.
- Average a parameter whose `domain` is `pick` (FM ratio, feedback). Averaging ratios produces unrelated inharmonic tones.
- Put synthesis or interpretation logic in a React component.
- Add a runtime dependency without stating its gzipped size.

## Invariants

1. `render(params)` is a pure function of its input. Same params + seed → identical samples.
2. A saved sound is a recipe `{ prompt, overrides }`, never audio.
3. Import direction: `ui → sound → engine`. Never the reverse.
4. Every parameter is declared once, in `src/engine/params.js` (`PARAM_SPEC`).
