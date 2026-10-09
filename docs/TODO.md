# TODO

Check items off in the PR that completes them. A blocked item states what unblocks it.

## Now

- [ ] Run `npm install && npm run build` locally and fix anything Vite flags (this branch was verified with a Bun bundle and Chromium, not with Vite itself)
- [ ] Listen through all 23 timbres on real speakers or headphones and retune any that feel off
- [ ] `npm run distill`, review `lexicon.generated.js`, commit it

## Next

- [ ] Grow `scripts/wordlist.txt` from words people type that show as unknown
- [ ] "Did you mean" for unknown words (nearest lexicon key by edit distance is already computed)
- [ ] Direction 3: let `render()` take a weight trajectory, interpolate blended params per control block

## Backlog

- [ ] Sample pack export (several notes, zipped)
- [ ] Velocity: keyboard row position or pointer pressure → index and level
- [ ] Hold-to-sustain on the keyboard (needs per-note re-render or loop points)

## Blocked

- [ ] Distillation in CI: blocked on deciding whether the model download belongs in CI or stays a manual step.
