// Authored neon ship hulls + obstacles (SVG → <img> for canvas). Rings are drawn
// procedurally in the engine (they scale a lot). A cockpit dome position is
// exported so GameCanvas can composite a cat photo into the glass.

// Rear/top view of a ship flying "into the screen": glowing engines near us,
// dart hull, a glass dome in the middle where the pilot cat sits.
function hull(main: string, glow: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="140" height="150" viewBox="0 0 140 150">
    <defs><radialGradient id="e" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffffff"/><stop offset="0.4" stop-color="${glow}"/><stop offset="1" stop-color="${glow}" stop-opacity="0"/></radialGradient></defs>
    <!-- engine glows (near) -->
    <ellipse cx="40" cy="136" rx="20" ry="12" fill="url(#e)"/>
    <ellipse cx="100" cy="136" rx="20" ry="12" fill="url(#e)"/>
    <!-- wings -->
    <path d="M70 40 L18 118 L44 116 L70 74 L96 116 L122 118 Z" fill="${main}" stroke="${glow}" stroke-width="3" stroke-linejoin="round"/>
    <!-- hull body -->
    <path d="M70 14 C88 30 96 74 92 110 C88 126 52 126 48 110 C44 74 52 30 70 14 Z" fill="#12122a" stroke="${glow}" stroke-width="3.5" stroke-linejoin="round"/>
    <!-- engine nozzles -->
    <rect x="30" y="112" width="20" height="22" rx="5" fill="#0c0c1e" stroke="${glow}" stroke-width="2.5"/>
    <rect x="90" y="112" width="20" height="22" rx="5" fill="#0c0c1e" stroke="${glow}" stroke-width="2.5"/>
    <!-- dome ring (the glass itself is drawn on canvas over the cat) -->
    <circle cx="70" cy="60" r="30" fill="#0a1024" stroke="${glow}" stroke-width="4"/>
    <!-- nose light -->
    <circle cx="70" cy="20" r="4" fill="#ffffff"/>
  </svg>`;
}

const ASTEROID = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
  <path d="M60 8 L92 20 L112 52 L104 88 L74 112 L38 108 L12 82 L8 44 L30 16 Z" fill="#2a2740" stroke="#4a4870" stroke-width="4" stroke-linejoin="round"/>
  <path d="M44 40 q14 -8 26 2 M30 66 q16 10 34 2 M74 74 q10 -10 22 -4" stroke="#1a1830" stroke-width="4" fill="none" stroke-linecap="round"/>
  <circle cx="46" cy="54" r="6" fill="#1a1830"/><circle cx="78" cy="46" r="4" fill="#1a1830"/>
</svg>`;

const MINE = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
  <g stroke="#ff3caa" stroke-width="5" stroke-linecap="round">
    <path d="M60 6v20M60 114V94M6 60h20M114 60H94M22 22l14 14M98 98L84 84M98 22L84 36M22 98l14-14"/>
  </g>
  <circle cx="60" cy="60" r="30" fill="#2a0e22" stroke="#ff3caa" stroke-width="5"/>
  <circle cx="60" cy="60" r="12" fill="#ff3caa"/>
  <circle cx="60" cy="60" r="6" fill="#fff"/>
</svg>`;

export interface Dome { cx: number; cy: number; r: number; scale: number; }
// dome in hull viewBox (140×150): centre (70,60), radius 30
export const DOME: Dome = { cx: 70 / 140, cy: 60 / 150, r: 30 / 140, scale: 1 };

export interface ShipSprites {
  player: HTMLImageElement;
  rivals: HTMLImageElement[];
  asteroid: HTMLImageElement;
  mine: HTMLImageElement;
  cats: HTMLImageElement[];
  ready: Promise<void>;
}

const RIVAL_COLORS: [string, string][] = [
  ["#3a2a5a", "#ff3caa"], ["#22384a", "#3ce0ff"], ["#4a3a20", "#ffb03c"], ["#2a1a4a", "#b06cff"],
];

export function loadShips(catCount = 5): ShipSprites {
  const proms: Promise<void>[] = [];
  const mk = (svg: string) => { const i = new Image(); proms.push(new Promise<void>((r) => { i.onload = () => r(); i.onerror = () => r(); })); i.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg); return i; };
  const mkFile = (src: string) => { const i = new Image(); proms.push(new Promise<void>((r) => { i.onload = () => r(); i.onerror = () => r(); })); i.src = src; return i; };

  const player = mk(hull("#173a2a", "#39ff88"));
  const rivals = RIVAL_COLORS.map(([m, g]) => mk(hull(m, g)));
  const asteroid = mk(ASTEROID);
  const mine = mk(MINE);
  const cats = Array.from({ length: catCount }, (_, i) => mkFile(`/aliens/alien${i + 1}.png`));

  return { player, rivals, asteroid, mine, cats, ready: Promise.all(proms).then(() => undefined) };
}
