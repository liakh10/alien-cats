"use client";

import { useEffect, useRef } from "react";

// Living, video-like hero backdrop: a warp starfield + drifting nebula, rendered
// live on canvas (no video file). Behind the hero content. Re-measures each frame.
export default function StarfieldBackdrop() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current, wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    let W = 1, H = 1, dpr = 1;
    interface St { x: number; y: number; px: number; py: number; a: number; }
    const stars: St[] = [];
    const seed = () => { stars.length = 0; for (let i = 0; i < 150; i++) { const x = Math.random() * W, y = Math.random() * H; stars.push({ x, y, px: x, py: y, a: Math.random() }); } };
    const measure = () => {
      const r = wrap.getBoundingClientRect();
      if (!r.width || !r.height || (r.width === W && r.height === H)) return;
      W = r.width; H = r.height; dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      canvas.style.width = W + "px"; canvas.style.height = H + "px";
      seed();
    };
    measure();
    const ro = new ResizeObserver(measure); ro.observe(wrap);
    window.addEventListener("resize", measure);

    let raf = 0, t = 0, prev = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - prev) / 1000); prev = now; t += dt;
      measure();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#0c0b26"); g.addColorStop(1, "#070714");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      // drifting nebulae
      for (const [nx, ny, col, ph] of [[0.3, 0.4, "rgba(60,224,255,0.10)", 0], [0.72, 0.32, "rgba(176,108,255,0.10)", 2], [0.5, 0.7, "rgba(57,255,136,0.07)", 4]] as const) {
        const cx = W * nx + Math.sin(t * 0.15 + ph) * 30, cy = H * ny + Math.cos(t * 0.12 + ph) * 20;
        const rad = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.34);
        rad.addColorStop(0, col); rad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = rad; ctx.fillRect(0, 0, W, H);
      }
      // warp stars from centre
      const cxc = W / 2, cyc = H * 0.44;
      ctx.strokeStyle = "rgba(225,238,255,0.85)"; ctx.lineWidth = 1.1;
      for (const s of stars) {
        s.px = s.x; s.py = s.y;
        const dx = s.x - cxc, dy = s.y - cyc, dist = Math.hypot(dx, dy) || 1;
        s.x += (dx / dist) * (0.5 + s.a) * (dist / 70 + 0.5) * 1.6;
        s.y += (dy / dist) * (0.5 + s.a) * (dist / 70 + 0.5) * 1.6;
        if (s.x < -10 || s.x > W + 10 || s.y < -10 || s.y > H + 10) { const a = Math.random() * 6.28, rr = Math.random() * 30; s.x = cxc + Math.cos(a) * rr; s.y = cyc + Math.sin(a) * rr; s.px = s.x; s.py = s.y; s.a = Math.random(); }
        ctx.globalAlpha = 0.3 + s.a * 0.6;
        ctx.beginPath(); ctx.moveTo(s.px, s.py); ctx.lineTo(s.x, s.y); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      if (!reduce) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); window.removeEventListener("resize", measure); };
  }, []);

  return <div className="starfield" ref={wrapRef} aria-hidden><canvas ref={canvasRef} /></div>;
}
