// Playback only. Rendering happens in the engine; this hook turns rendered
// Float32Arrays into an AudioBuffer and plays it, sampler-style, at any pitch.
import { useCallback, useRef, useState } from 'react';

export function useAudio() {
  const ctxRef = useRef(null);
  const bufferRef = useRef(null);
  const sourcesRef = useRef(new Set());
  const [playhead, setPlayhead] = useState(null);   // { startedAt, rate, duration } of the latest note

  // Browsers block audio until a user gesture, so the context is created lazily.
  const ensureCtx = useCallback(() => {
    if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  const load = useCallback((rendered) => {
    const ctx = ensureCtx();
    const buf = ctx.createBuffer(2, rendered.left.length, rendered.sampleRate);
    buf.copyToChannel(rendered.left, 0);
    buf.copyToChannel(rendered.right, 1);
    bufferRef.current = buf;
  }, [ensureCtx]);

  const stop = useCallback(() => {
    for (const s of sourcesRef.current) { try { s.stop(); } catch { /* already stopped */ } }
    sourcesRef.current.clear();
    setPlayhead(null);
  }, []);

  /** @param {number} semitones offset from the rendered root note */
  const play = useCallback((semitones = 0) => {
    const ctx = ensureCtx();
    const buf = bufferRef.current;
    if (!buf) return;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    // Resampling, as a hardware sampler does: pitch and length scale together.
    src.playbackRate.value = Math.pow(2, semitones / 12);
    src.connect(ctx.destination);
    src.onended = () => {
      sourcesRef.current.delete(src);
      src.disconnect();
      if (sourcesRef.current.size === 0) setPlayhead(null);
    };
    sourcesRef.current.add(src);
    src.start();
    setPlayhead({ startedAt: ctx.currentTime, rate: src.playbackRate.value, duration: buf.duration });
  }, [ensureCtx]);

  const now = useCallback(() => ctxRef.current?.currentTime ?? 0, []);
  const sampleRate = useCallback(() => ensureCtx().sampleRate, [ensureCtx]);

  return { load, play, stop, playhead, now, sampleRate };
}
