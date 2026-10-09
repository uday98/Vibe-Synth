// Main-thread facade over the render worker. Falls back to rendering inline if
// workers are unavailable, so the app still works (just less smoothly).

import { render } from './render.js';

let worker = null;
let workerBroken = false;
let nextId = 1;
const pending = new Map();

function getWorker() {
  if (worker || workerBroken) return worker;
  try {
    worker = new Worker(new URL('./render.worker.js', import.meta.url), { type: 'module' });
    worker.onmessage = (e) => {
      const job = pending.get(e.data.id);
      if (!job) return;
      pending.delete(e.data.id);
      if (e.data.ok) job.resolve(e.data);
      else job.reject(new Error(e.data.error));
    };
    worker.onerror = () => {
      workerBroken = true;
      worker = null;
      for (const [, job] of pending) job.resolve(render(job.params, { sampleRate: job.sampleRate }));
      pending.clear();
    };
  } catch {
    workerBroken = true;
  }
  return worker;
}

/** @returns {Promise<{left: Float32Array, right: Float32Array, sampleRate: number, duration: number}>} */
export function renderAsync(params, sampleRate) {
  const w = getWorker();
  if (!w) return Promise.resolve(render(params, { sampleRate }));
  const id = nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject, params, sampleRate });
    w.postMessage({ id, params, sampleRate });
  });
}
