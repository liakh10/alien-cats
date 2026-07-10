"use client";

import { useEffect, useRef, useState } from "react";
import { Game, project, type Hud } from "./engine";
import { loadShips, DOME, type ShipSprites } from "../art/ships";
import { SpeedIcon, RingIcon, PassIcon, TrophyIcon } from "../art/icons";
import { getMusic } from "../music";
import { getSfx } from "../sfx";

const IDLE: Hud = { phase: "idle", distance: 0, rings: 0, overtakes: 0, boost: 0, best: 0, bestOvertakes: 0, playerX: 0, speed: 0 };

interface Star { x: number; y: number; px: number; py: number; a: number; r: number; }

export default function GameCanvas() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const artRef = useRef<ShipSprites | null>(null);
  const [hud, setHud] = useState<Hud>(IDLE);

  useEffect(() => {
    const canvas = canvasRef.current, wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const game = new Game(); gameRef.current = game;
    const art = loadShips(5); artRef.current = art;
    let pilot = 0;
    game.emit = (k) => { const s = getSfx(); if (k === "ring") s.ring(); else if (k === "boost") s.boost(); else if (k === "pass") s.pass(); else if (k === "crash") { s.crash(); window.dispatchEvent(new Event("alcats:update")); } };
    setHud(game.hud());

    let dpr = 1, W = 0, H = 0;
    const measure = () => {
      const r = wrap.getBoundingClientRect();
      if (!r.width || !r.height || (r.width === W && r.height === H)) return;
      W = r.width; H = r.height; dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      canvas.style.width = W + "px"; canvas.style.height = H + "px";
      game.resize(W, H);
      stars.length = 0;
      for (let i = 0; i < 130; i++) stars.push(mkStar());
    };
    const mkStar = (): Star => { const x = Math.random() * W, y = Math.random() * H; return { x, y, px: x, py: y, a: Math.random(), r: 0.6 + Math.random() * 1.4 }; };
    const stars: Star[] = [];
    measure();

    let last = "";
    const syncHud = () => { const h = game.hud(); const key = `${h.phase}|${h.distance}|${h.rings}|${h.overtakes}|${(h.boost * 10) | 0}|${h.best}`; if (key !== last) { last = key; setHud(h); } };

    // cat-in-cockpit ship
    const drawShip = (hull: HTMLImageElement, cat: HTMLImageElement, cx: number, cy: number, size: number, flame = 0, boost = false) => {
      const h = size * (150 / 140);
      // engine flame
      if (flame > 0) {
        ctx.save(); ctx.globalAlpha = 0.6 + Math.random() * 0.4;
        const fy = cy + h * 0.42, fl = size * (0.18 + flame * 0.5 + Math.random() * 0.15);
        for (const ox of [-0.22, 0.22]) {
          const grd = ctx.createLinearGradient(0, fy, 0, fy + fl);
          grd.addColorStop(0, boost ? "#fff" : "#7CFF6B"); grd.addColorStop(0.5, boost ? "#3ce0ff" : "#39ff88"); grd.addColorStop(1, "rgba(57,255,136,0)");
          ctx.fillStyle = grd; ctx.beginPath(); ctx.moveTo(cx + ox * size - size * 0.09, fy); ctx.lineTo(cx + ox * size + size * 0.09, fy); ctx.lineTo(cx + ox * size, fy + fl); ctx.closePath(); ctx.fill();
        }
        ctx.restore();
      }
      if (hull.complete && hull.naturalWidth) ctx.drawImage(hull, cx - size / 2, cy - h / 2, size, h);
      // cat in dome
      const dcx = cx - size / 2 + DOME.cx * size, dcy = cy - h / 2 + DOME.cy * h, dr = DOME.r * size;
      if (cat.complete && cat.naturalWidth) {
        ctx.save(); ctx.beginPath(); ctx.arc(dcx, dcy, dr * 0.92, 0, 7); ctx.clip();
        const cw = dr * 2.5, chh = cw * (cat.naturalHeight / cat.naturalWidth);
        ctx.drawImage(cat, dcx - cw / 2, dcy - dr * 1.05, cw, chh);
        ctx.restore();
      }
      // glass highlight
      ctx.save(); ctx.globalAlpha = 0.25; ctx.strokeStyle = "#eaffff"; ctx.lineWidth = Math.max(1, dr * 0.14);
      ctx.beginPath(); ctx.arc(dcx, dcy, dr * 0.7, Math.PI * 1.1, Math.PI * 1.7); ctx.stroke(); ctx.restore();
    };

    const drawRing = (sx: number, sy: number, f: number) => {
      const rx = 70 * f, ry = rx * 0.62;
      ctx.save(); ctx.shadowColor = "#39ff88"; ctx.shadowBlur = 16 * f;
      ctx.strokeStyle = "#39ff88"; ctx.lineWidth = Math.max(1.5, 7 * f);
      ctx.beginPath(); ctx.ellipse(sx, sy, rx, ry, 0, 0, 7); ctx.stroke();
      ctx.strokeStyle = "#3ce0ff"; ctx.lineWidth = Math.max(1, 3 * f); ctx.shadowBlur = 8 * f;
      ctx.beginPath(); ctx.ellipse(sx, sy, rx * 0.62, ry * 0.62, 0, 0, 7); ctx.stroke();
      ctx.restore();
    };

    const draw = () => {
      // deep space
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#0b0a22"); g.addColorStop(0.5, "#0a0a1e"); g.addColorStop(1, "#070714");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      // nebula glow
      const neb = ctx.createRadialGradient(W * 0.5, H * 0.34, 0, W * 0.5, H * 0.34, W * 0.6);
      neb.addColorStop(0, "rgba(60,224,255,0.12)"); neb.addColorStop(0.5, "rgba(176,108,255,0.08)"); neb.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = neb; ctx.fillRect(0, 0, W, H);

      // starfield warp (from centre outward, speed ∝ velocity)
      const cxc = W / 2, cyc = H * 0.4;
      const warp = 6 + game.speedNow() * 60 + (game.boostT > 0 ? 40 : 0);
      ctx.strokeStyle = "rgba(230,240,255,0.9)"; ctx.lineWidth = 1.2;
      for (const s of stars) {
        s.px = s.x; s.py = s.y;
        const dx = s.x - cxc, dy = s.y - cyc; const dist = Math.hypot(dx, dy) || 1;
        s.x += (dx / dist) * warp * (0.4 + s.a) * 0.06 * (dist / 60 + 0.4);
        s.y += (dy / dist) * warp * (0.4 + s.a) * 0.06 * (dist / 60 + 0.4);
        if (s.x < -20 || s.x > W + 20 || s.y < -20 || s.y > H + 20) { const a = Math.random() * 6.28, rr = Math.random() * 40; s.x = cxc + Math.cos(a) * rr; s.y = cyc + Math.sin(a) * rr; s.px = s.x; s.py = s.y; s.a = Math.random(); }
        ctx.globalAlpha = 0.4 + s.a * 0.6;
        ctx.beginPath(); ctx.moveTo(s.px, s.py); ctx.lineTo(s.x, s.y); ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // horizon grid line
      ctx.strokeStyle = "rgba(57,255,136,0.18)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, H * 0.4); ctx.lineTo(W, H * 0.4); ctx.stroke();

      const a = artRef.current;
      if (a) {
        const sorted = [...game.objs].sort((p, q) => q.d - p.d);
        for (const o of sorted) {
          const { sx, sy, f } = project(o.x, o.d, W, H);
          if (f < 0.02) continue;
          if (o.kind === "ring") drawRing(sx, sy, f);
          else if (o.kind === "asteroid") drawSprite(a.asteroid, sx, sy, 120 * f, o.spin);
          else if (o.kind === "mine") drawSprite(a.mine, sx, sy, 110 * f, o.spin);
          else if (o.kind === "rival") drawShip(a.rivals[o.hull], a.cats[o.cat], sx, sy, 130 * f);
        }
        // player ship (fixed near bottom, steers x)
        const pp = project(game.playerX, 0.02, W, H);
        const psize = Math.min(W * 0.34, 150);
        drawShip(a.player, a.cats[pilot], pp.sx, H * 0.82, psize, 0.5, game.boostT > 0);
      }
    };
    const drawSprite = (img: HTMLImageElement, sx: number, sy: number, size: number, rot: number) => {
      if (!img.complete || !img.naturalWidth) return;
      ctx.save(); ctx.translate(sx, sy); ctx.rotate(rot); ctx.drawImage(img, -size / 2, -size / 2, size, size); ctx.restore();
    };

    let raf = 0, prev = performance.now();
    const loop = (now: number) => {
      const dt = (now - prev) / 1000; prev = now;
      measure();
      game.update(dt);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.save();
      if (game.shake > 0) { const s = game.shake * 10; ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s); }
      draw();
      ctx.restore();
      syncHud();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // input
    const toLane = (clientX: number) => { const r = canvas.getBoundingClientRect(); return Math.max(-1, Math.min(1, ((clientX - r.left) / r.width) * 2 - 1)); };
    const onMove = (e: PointerEvent) => game.setTargetX(toLane(e.clientX));
    const onDown = (e: PointerEvent) => { e.preventDefault(); game.setTargetX(toLane(e.clientX)); };
    let keyDir = 0;
    const onKeyDown = (e: KeyboardEvent) => { if (e.code === "ArrowLeft" || e.code === "KeyA") keyDir = -1; else if (e.code === "ArrowRight" || e.code === "KeyD") keyDir = 1; else return; e.preventDefault(); };
    const onKeyUp = (e: KeyboardEvent) => { if ((e.code === "ArrowLeft" || e.code === "KeyA") && keyDir < 0) keyDir = 0; if ((e.code === "ArrowRight" || e.code === "KeyD") && keyDir > 0) keyDir = 0; };
    const keyTick = window.setInterval(() => { if (keyDir) game.nudge(keyDir * 0.14); }, 16);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    const startFn = () => { pilot = (Math.random() * 5) | 0; };
    (canvas as unknown as { __pickPilot?: () => void }).__pickPilot = startFn;

    return () => {
      cancelAnimationFrame(raf); clearInterval(keyTick);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      game.dispose();
    };
  }, []);

  const start = () => {
    getSfx().start(); try { getMusic().play(); } catch { /* */ }
    (canvasRef.current as unknown as { __pickPilot?: () => void })?.__pickPilot?.();
    gameRef.current?.start(); setHud(gameRef.current?.hud() ?? IDLE);
  };

  return (
    <div className="game">
      <div className="game-hud">
        <div className="hud-dist"><SpeedIcon size={17} /> {hud.distance.toLocaleString()} km</div>
        <div className="hud-rings"><RingIcon size={16} /> {hud.rings}</div>
        <div className="hud-pass"><PassIcon size={16} /> {hud.overtakes}</div>
        <div className="hud-best"><TrophyIcon size={14} /> {hud.best.toLocaleString()}</div>
      </div>

      <div className="game-stage" ref={wrapRef}>
        <canvas ref={canvasRef} className="game-canvas" />
        {hud.phase === "idle" && (
          <div className="game-overlay">
            <h3>Launch the warp run</h3>
            <p>Steer left/right. Fly through the green ring gates for boost, dodge the rocks, overtake rival pilots.</p>
            <button className="btn btn-neon btn-lg" onClick={start}>Launch</button>
          </div>
        )}
        {hud.phase === "over" && (
          <div className="game-overlay">
            <h3>Wrecked!</h3>
            <div className="over-row"><span><SpeedIcon size={16} /> {hud.distance.toLocaleString()} km</span><span><PassIcon size={15} /> {hud.overtakes} passed</span></div>
            <p className="over-best">{hud.distance >= hud.best && hud.distance > 0 ? "new record!" : `best ${hud.best.toLocaleString()} km`}</p>
            <button className="btn btn-neon btn-lg" onClick={start}>Fly again</button>
          </div>
        )}
      </div>
    </div>
  );
}
