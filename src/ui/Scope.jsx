// Waveform of the current sound, drawn in the sound's own colour, with a playhead.
import { useEffect, useRef } from 'react';

export function Scope({ audio, color, playhead, now }) {
  const canvasRef = useRef(null);
  const peaksRef = useRef(null);

  // Precompute min/max per pixel column once per sound.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth * dpr;
    const h = canvas.clientHeight * dpr;
    canvas.width = w;
    canvas.height = h;
    if (!audio) { peaksRef.current = null; draw(canvas, null, color, null); return; }
    const { left, right } = audio;
    const cols = Math.max(1, Math.floor(w));
    const per = left.length / cols;
    const min = new Float32Array(cols), max = new Float32Array(cols);
    for (let c = 0; c < cols; c++) {
      let lo = 1, hi = -1;
      const s = Math.floor(c * per), e = Math.min(left.length, Math.floor((c + 1) * per));
      for (let i = s; i < e; i++) {
        const v = (left[i] + right[i]) * 0.5;
        if (v < lo) lo = v;
        if (v > hi) hi = v;
      }
      min[c] = lo; max[c] = hi;
    }
    peaksRef.current = { min, max };
    draw(canvas, peaksRef.current, color, null);
  }, [audio, color]);

  // Animate the playhead only while something is playing.
  useEffect(() => {
    if (!playhead) { draw(canvasRef.current, peaksRef.current, color, null); return undefined; }
    let raf;
    const tick = () => {
      const x = ((now() - playhead.startedAt) * playhead.rate) / playhead.duration;
      draw(canvasRef.current, peaksRef.current, color, x);
      if (x < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playhead, color, now]);

  return <canvas ref={canvasRef} className="scope-canvas" aria-label="Waveform of the current sound" role="img" />;
}

function draw(canvas, peaks, color, progress) {
  if (!canvas) return;
  const g = canvas.getContext('2d');
  const { width: w, height: h } = canvas;
  g.clearRect(0, 0, w, h);
  if (!peaks) return;
  const mid = h / 2;
  g.globalAlpha = 0.25;
  g.fillStyle = color;
  g.fillRect(0, mid - 0.5, w, 1);
  const cols = peaks.min.length;
  const head = progress == null ? -1 : Math.floor(progress * cols);
  for (let c = 0; c < cols; c++) {
    g.globalAlpha = head < 0 || c <= head ? 1 : 0.4;
    const top = mid - peaks.max[c] * mid * 0.95;
    const bot = mid - peaks.min[c] * mid * 0.95;
    g.fillRect(c, top, 1, Math.max(1, bot - top));
  }
  g.globalAlpha = 1;
}
