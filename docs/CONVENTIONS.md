# Conventions

Rules a linter can't enforce.

## Modules

- Imports flow `ui → sound → engine`. Never the reverse.
- `src/engine` and `src/sound` are pure: no React, no DOM, no Web Audio, no `Math.random()`, no clock reads. They must run under `node --test`.
- Randomness comes from `createRng(seed)` in `engine/rng.js`.

## Parameters

- A new parameter is added to `PARAM_SPEC` first, with `min`, `max`, `def` and `domain`. Then the engine reads it. Nothing else declares parameter names.
- Choose `domain` by how the ear hears it: `log` for pitch and time, `linear` for levels and amounts, `pick` for anything categorical.
- Timbres only list values that differ from the default.

## Lexicon

- A word is a timbre (`t`), a modifier (`m`), or both. Timbre weights 0–1, modifier values about −1.5 to +1.5.
- Prefer adding a word to the lexicon over adding a timbre. A new timbre is justified only when no combination of existing timbre + axes can reach the sound.
- After editing, run `npm test`: it checks every lexicon entry points at a real timbre and axis.

## DSP

- Comment the reason for every non-obvious constant (`// Freeverb tunings at 44.1 kHz`).
- Anything added to the per-sample loop needs a benchmark before and after. Slow-changing values go in the control-rate block.
- Keep FM index under the Carson cap; never remove the cap to make something brighter, raise the oversample factor instead.

## React

- Function components with hooks. Components hold UI state only and call into `sound` and `engine`.
- The AudioContext is created on first user gesture (browsers block audio before that).
- Copy is sentence case, says what happens ("Make sound", "Download WAV"), and the same action keeps the same name everywhere.

## Commits

- Branch per change: `feat/`, `fix/`, `refactor/`, `docs/`.
- Commit messages state the effect: "Cap FM index by Carson bandwidth", not "update render.js".
