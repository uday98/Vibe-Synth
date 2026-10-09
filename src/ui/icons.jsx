// Six inline icons instead of an icon library: no dependency, ~1 KB.
const P = {
  play: 'M7 5v14l11-7z',
  stop: 'M6 6h12v12H6z',
  download: 'M12 4v11m0 0l-4-4m4 4l4-4M5 19h14',
  save: 'M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z',
  trash: 'M5 7h14M10 7V5h4v2m-6 0l1 12h6l1-12',
  link: 'M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1',
};
const FILLED = new Set(['play', 'stop']);

export function Icon({ name, size = 18 }) {
  const filled = FILLED.has(name);
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"
      fill={filled ? 'currentColor' : 'none'} stroke={filled ? 'none' : 'currentColor'}
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={P[name]} />
    </svg>
  );
}
