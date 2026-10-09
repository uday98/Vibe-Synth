// A "recipe" is everything needed to rebuild a sound: { prompt, overrides }.
// Because rendering is deterministic, recipes are all we ever store or share.

const KEY = 'vibesynth.library.v1';

export function loadLibrary() {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function saveLibrary(list) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* storage full or blocked: library stays in memory */ }
}

// URL-safe base64 of the recipe JSON, kept in the hash so it never reaches a server.
export function encodeRecipe(recipe) {
  const bytes = new TextEncoder().encode(JSON.stringify(recipe));
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeRecipe(str) {
  try {
    const bin = atob(str.replace(/-/g, '+').replace(/_/g, '/'));
    const json = new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
    const r = JSON.parse(json);
    return typeof r?.prompt === 'string' ? { prompt: r.prompt.slice(0, 200), overrides: r.overrides || {} } : null;
  } catch {
    return null;
  }
}

export const sameRecipe = (a, b) => !!a && !!b && JSON.stringify(a) === JSON.stringify(b);

export function slug(text) {
  return (text || 'sound').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'sound';
}
