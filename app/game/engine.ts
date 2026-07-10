// Alien Cats — pseudo-3D "into the screen" space racer. Objects spawn far
// (depth d=1) and rush toward the camera (d→0); the player steers left/right to
// dodge asteroids/rivals and fly through ring gates. We own the projection math
// (shared with GameCanvas) and all game state; no 3D engine.
import { saveBestDistance, saveBestOvertakes, getBestDistance, getBestOvertakes } from "../store";

export type Kind = "ring" | "asteroid" | "mine" | "rival";
type Phase = "idle" | "playing" | "over";

export interface Obj { kind: Kind; x: number; d: number; resolved: boolean; cat: number; hull: number; spin: number; }
export interface Hud { phase: Phase; distance: number; rings: number; overtakes: number; boost: number; best: number; bestOvertakes: number; playerX: number; speed: number; }

const D_SPAWN = 1;
const HIT_D = 0.07;          // depth at which an object reaches the player plane
const HIT_W = 0.17;          // half-width for a crash
const RING_CATCH = 0.3;      // half-width to collect a ring
const BASE_SPEED = 0.5;      // depth units / sec
const MAX_SPEED = 1.15;
const KM_PER_UNIT = 340;

// Shared projection: lane x∈[-1,1], depth d (1 far → 0 near) → screen.
export function project(x: number, d: number, W: number, H: number) {
  const horizonY = H * 0.4;
  const t = 1 - Math.max(0, Math.min(1, d));   // 0 far → 1 near
  const f = 0.06 + Math.pow(t, 1.7) * 1.9;     // scale factor
  const sx = W / 2 + x * (W * 0.6) * f;
  const sy = horizonY + (H * 0.74) * Math.pow(t, 1.5);
  return { sx, sy, f };
}

export class Game {
  w = 800; h = 500;
  phase: Phase = "idle";
  playerX = 0; private targetX = 0;
  objs: Obj[] = [];
  distance = 0; rings = 0; overtakes = 0; boost = 0; boostT = 0;
  best = 0; bestOvertakes = 0;
  shake = 0;
  private elapsed = 0; private spawnCd = 0.7; private speed = BASE_SPEED;
  onChange?: () => void; emit?: (k: string) => void;

  constructor() {
    if (typeof window !== "undefined") { this.best = getBestDistance(); this.bestOvertakes = getBestOvertakes(); }
    if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") (window as unknown as { __game?: Game }).__game = this;
  }

  resize(w: number, h: number) { this.w = w; this.h = h; }
  speedNow() { return this.speed * (this.boostT > 0 ? 1.6 : 1); }
  hud(): Hud {
    return { phase: this.phase, distance: Math.floor(this.distance), rings: this.rings, overtakes: this.overtakes, boost: this.boost, best: this.best, bestOvertakes: this.bestOvertakes, playerX: this.playerX, speed: this.speedNow() };
  }

  start() {
    this.phase = "playing"; this.playerX = 0; this.targetX = 0; this.objs = [];
    this.distance = 0; this.rings = 0; this.overtakes = 0; this.boost = 0; this.boostT = 0;
    this.elapsed = 0; this.spawnCd = 0.5; this.speed = BASE_SPEED; this.shake = 0;
    this.onChange?.();
  }

  // input: normalized target lane [-1,1] (pointer), or nudge from keys
  setTargetX(x: number) { this.targetX = Math.max(-1, Math.min(1, x)); }
  nudge(dir: number) { this.targetX = Math.max(-1, Math.min(1, this.targetX + dir * 0.5)); }

  private spawn() {
    const r = Math.random();
    let kind: Kind;
    if (r < 0.42) kind = "ring";
    else if (r < 0.62) kind = "asteroid";
    else if (r < 0.74) kind = Math.random() < 0.5 ? "mine" : "asteroid";
    else kind = "rival";
    const x = -0.85 + Math.random() * 1.7;
    this.objs.push({ kind, x, d: D_SPAWN, resolved: false, cat: (Math.random() * 5) | 0, hull: (Math.random() * 4) | 0, spin: Math.random() * Math.PI * 2 });
  }

  private crash() {
    this.phase = "over"; this.shake = 1;
    if (saveBestDistance(this.distance)) this.best = Math.floor(this.distance);
    if (saveBestOvertakes(this.overtakes)) this.bestOvertakes = this.overtakes;
    this.emit?.("crash"); this.onChange?.();
  }

  private resolve(o: Obj) {
    o.resolved = true;
    const dx = Math.abs(o.x - this.playerX);
    if (o.kind === "ring") {
      if (dx < RING_CATCH) { this.rings += 1; this.boostT = 1.1; this.boost = Math.min(1, this.boost + 0.34); this.emit?.("ring"); this.emit?.("boost"); }
    } else if (o.kind === "rival") {
      if (dx < HIT_W) this.crash(); else { this.overtakes += 1; this.emit?.("pass"); }
    } else { // asteroid / mine
      if (dx < HIT_W) this.crash();
    }
  }

  update(dt: number) {
    dt = Math.min(0.032, dt);
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 2.2);
    if (this.phase !== "playing") { this.onChange?.(); return; }

    this.elapsed += dt;
    this.speed = Math.min(MAX_SPEED, BASE_SPEED + this.elapsed * 0.007);
    if (this.boostT > 0) this.boostT -= dt;
    this.boost = Math.max(0, this.boost - dt * 0.12);

    // steer toward target
    this.playerX += (this.targetX - this.playerX) * Math.min(1, dt * 10);

    // advance objects
    const v = this.speedNow();
    for (let i = this.objs.length - 1; i >= 0; i--) {
      const o = this.objs[i];
      o.d -= v * dt; o.spin += dt * (o.kind === "mine" ? 2 : 0.6);
      if (!o.resolved && o.d <= HIT_D) this.resolve(o);
      if (o.d <= -0.12) this.objs.splice(i, 1);
    }
    if (this.phase !== "playing") return; // a crash happened

    // spawn
    this.spawnCd -= dt;
    if (this.spawnCd <= 0) { this.spawn(); this.spawnCd = Math.max(0.34, 0.8 - this.elapsed / 90); }

    this.distance += v * dt * KM_PER_UNIT;
    this.onChange?.();
  }

  // ── dev helpers ──
  debugSpawn(kind: Kind, x = 0, d = D_SPAWN) { const o: Obj = { kind, x, d, resolved: false, cat: 0, hull: 0, spin: 0 }; this.objs.push(o); return o; }
  debugAdvance(ms = 16, n = 1) { for (let i = 0; i < n; i++) this.update(ms / 1000); }
  debugState() { return { phase: this.phase, distance: Math.floor(this.distance), rings: this.rings, overtakes: this.overtakes, playerX: this.playerX, objs: this.objs.length }; }

  dispose() { this.objs = []; }
}
