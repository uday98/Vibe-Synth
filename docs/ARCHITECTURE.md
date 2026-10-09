# Architecture

## Data flow

```
prompt text
   │  sound/interpret.js        tokens → lexicon (exact → stem → distilled → typo) → negation, intensity
   ▼
{ weights over timbres, modifier axes, seed }
   │  sound/blend.js            blend timbres per PARAM_SPEC domain → apply modifiers → snap to a note
   ▼                            → apply user overrides (UI nudges, envelope, root note)
params
   │  engine/render.js          offline FM render in a Web Worker (engine/render.worker.js)
   ▼
stereo Float32Arrays ──▶ AudioBuffer (ui/useAudio.js) ──▶ played at any pitch via playbackRate
                    ──▶ waveform (ui/Scope.jsx)
                    ──▶ WAV file (engine/wav.js)
```

## Why render offline instead of building a live Web Audio graph

The earlier plan was a live node graph (OscillatorNode → GainNode → WaveShaperNode). This branch renders to a buffer in plain JS instead, then plays the buffer. Reasons, in order of weight:

1. **One render, many uses.** The same samples feed playback, the waveform view and WAV export. A live graph would need an `OfflineAudioContext` pass anyway for export and display.
2. **Anti-aliasing.** FM with a high index produces sidebands far above Nyquist. The old presets put 52–99% of their energy into aliased partials (`bell`: 90%, `glitch`: 99%), measured with Bessel-function sideband weights. The renderer runs 2× oversampled, caps the index per Carson's rule (`B ≈ 2(I+1)fm`), and low-passes before decimating. A WaveShaperNode cannot be oversampled the same way inside FM feedback.
3. **Things Web Audio nodes don't do directly**: operator self-feedback (saw-like tones), an index envelope separate from the amplitude envelope, deterministic seeded noise.
4. **Testability.** `render()` runs in Node, so `npm test` checks every timbre for NaNs, clicks and loudness without a browser.

Cost: a 4.7 s stereo bell with reverb renders in roughly 70–220 ms at 48 kHz (measured in Node on a 2-core cloud container; varies with load), off the main thread. Playing notes is free afterwards: the buffer is resampled by `playbackRate`, like a hardware sampler.

What was lost: a note's length scales with pitch (an octave up is half as long). Acceptable for a sampler; re-rendering per note is the fix if it ever matters.

## FM engine (engine/render.js)

Per sample, per unison voice:

```
m = sin(φm + feedback · avg(previous two m))          modulator, self-feedback
c = sin(φc + I(t) · m)                                carrier, phase-modulated
I(t) = index · (indexSustain + (1 − indexSustain) · e^(−t / indexDecay))
```

- **Index envelope.** Brightness decays independently of loudness: brightest at the strike, mellowing as it rings. This is the core idea in Chowning's 1973 paper and the main reason the new bell sounds like a bell. `indexSustain > 1` makes brightness *rise*, which is how brass is modelled.
- **Ratios are timbre choices.** Integer ratios give harmonic spectra (bass, keys, organ). 1.4, 1.41 and 3.5 give inharmonic ones (bell, metal, glass). The old engine used 1.618 for everything, so every preset was inharmonic.
- **Control rate.** Envelopes, LFO and pitch are computed every 32 samples and interpolated. Halved render time with no audible change.
- **Chain after the oscillators:** noise (one-pole coloured) + click transient → amplitude envelope → tanh drive → tremolo → decimate → Freeverb-style reverb → DC block → loudness match.
- **Loudness match.** The loudest 400 ms window is brought to about −14 dBFS RMS, with a −1 dBFS peak ceiling. Sounds no longer jump in level when you switch prompts.
- **Duration** follows the envelope plus reverb tail (max 8 s). The old fixed 2 s buffer truncated any envelope longer than that.

## Words → sound (src/sound)

**Timbres vs modifiers.** The old library mixed nouns and adjectives ("bell" and "dark" were both presets with a pitch), then averaged them, so "dark bell" landed at 467 Hz with a meaningless index. Now:

- *Timbres* (`timbres.js`, 23) are sources: an FM recipe that makes a bell a bell.
- *Modifier axes* (`modifiers.js`, 10) are directions: register, brightness, grit, length, softness, space, width, motion, texture, tension. Adjectives move a timbre along axes instead of replacing it.

**Blending** (`blend.js`) follows each parameter's `domain` in `PARAM_SPEC`:
- `log` for pitch and times: 55 Hz and 880 Hz meet at 220 Hz, not 467 Hz.
- `pick` for FM ratio and feedback: taken from the dominant timbre.
- Weights are squared before normalising, so the strongest timbre stays dominant. This is the guard against mean collapse.

Pitch is snapped to equal temperament so every saved sound is in tune with every other.

**Router** (`interpret.js`), cheapest path first:

| Step | Example | Cost |
|---|---|---|
| exact word | `bell` | hash lookup |
| stem | `bells`, `darker`, `metallic`, `shimmering` | a few lookups |
| distilled vocabulary | words baked offline from an embedding model | hash lookup |
| typo match | `ethereeal` → `ethereal` | edit distance over ~300 words |
| nothing understood | `zorblax` | deterministic hash → timbre + axes |

It also handles negation (`not bright`) and intensity (`very`, `slightly`, `less`). Every token is reported back, and the UI shows it as a chip, so the user learns the vocabulary by using it.

## Why no embedding model in the browser

The planned Direction 1 was Transformers.js running `all-MiniLM-L6-v2` client-side. The smallest ONNX build of that model is about 23 MB (`model_quantized.onnx`), plus the ONNX runtime. For a 16 KB app that is a 1000× increase in download for every first-time visitor, and seconds of loading before the first sound.

The replacement is **distillation**: `scripts/distill-lexicon.mjs` runs the same model once on a dev machine over a word list, and stores per word only what the synth needs (top timbre similarities, projections onto each modifier axis via positive/negative pole phrases). The output is a few KB of JS. The router reads it as one more lookup tier. Same semantic knowledge for the words that matter, zero runtime cost.

What it can't do: understand a word that was never in the list. Those fall through to typo matching, then the hash fallback. If coverage becomes the bottleneck, growing the word list is cheaper than shipping the model.

## Persistence and sharing

A sound is a recipe: `{ prompt, overrides }`. Rendering is deterministic, so:
- the library in `localStorage` stores a few bytes per sound, not audio
- the URL hash `#s=…` holds the current recipe, so any sound is a link
- the hash never reaches a server

## Open questions

- Direction 3 (temporal morphing) maps naturally onto this engine: make the timbre weight vector a function of time inside `render()`. Not started.
- Should a note re-render per pitch to keep its length constant? Only if users notice.
- Unknown-word handling: show a "did you mean" for the nearest lexicon word instead of silently hashing?
