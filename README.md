# Vibe-Synth

Describe a sound in words and play it. FM synthesis in the browser, no backend, nothing uploaded.

Type `dark haunting bass`, `glass bell in a cathedral` or `very wide sitar drone`. The app reads each word as either a sound source (bell, sitar, kick) or a direction (dark, wide, short, eerie), builds an FM patch, and renders it. Then you can nudge it, play it on the keyboard, save it, share it as a link, or download a WAV.

```bash
npm install
npm run dev
npm test
```

See [CLAUDE.md](CLAUDE.md) and [docs/](docs/) for how it works.
