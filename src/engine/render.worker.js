// Runs the renderer off the main thread so sliders and the keyboard never stutter.
import { render } from './render.js';

self.onmessage = (e) => {
  const { id, params, sampleRate } = e.data;
  try {
    const r = render(params, { sampleRate });
    self.postMessage({ id, ok: true, left: r.left, right: r.right, sampleRate: r.sampleRate, duration: r.duration },
      [r.left.buffer, r.right.buffer]);
  } catch (err) {
    self.postMessage({ id, ok: false, error: String(err) });
  }
};
