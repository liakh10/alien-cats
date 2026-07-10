"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { getMusic } from "./music";
import { getSfx } from "./sfx";

const BOOT_LINES = ["spooling warp core", "waking the pilots", "charging boosters", "aligning ring gates"];

type Phase = "boot" | "wake" | "gone";

export default function Enter() {
  const [phase, setPhase] = useState<Phase>("boot");
  const [pct, setPct] = useState(0);
  const [lines, setLines] = useState<string[]>([]);
  const [leaving, setLeaving] = useState(false);
  const done = useRef(false);

  useEffect(() => {
    if (phase !== "gone") document.body.style.overflow = "hidden"; else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [phase]);

  useEffect(() => {
    if (phase !== "boot") return;
    let p = 0;
    const id = window.setInterval(() => {
      p = Math.min(100, p + 4 + Math.random() * 7);
      setPct(Math.round(p));
      const have = Math.min(BOOT_LINES.length, Math.ceil((p / 100) * BOOT_LINES.length));
      setLines((prev) => (prev.length < have ? BOOT_LINES.slice(0, have) : prev));
      if (p >= 100) { clearInterval(id); setTimeout(() => setPhase("wake"), 360); }
    }, 130);
    return () => clearInterval(id);
  }, [phase]);

  const wake = () => {
    if (done.current) return;
    done.current = true;
    try { getMusic().play(); } catch { /* */ }
    getSfx().start();
    setLeaving(true);
    window.dispatchEvent(new Event("alcats:awake"));
    setTimeout(() => setPhase("gone"), 620);
  };

  if (phase === "gone") return null;

  return (
    <div className={`enter ${leaving ? "enter-leaving" : ""}`}>
      {phase === "boot" && (
        <div className="boot">
          <p className="boot-title">ALIEN CATS</p>
          <div className="boot-bar"><span className="boot-fill" style={{ width: `${pct}%` }} /></div>
          <p className="boot-pct">{pct}%</p>
          <ul className="boot-log">{lines.map((l, i) => <li key={i}><span className="boot-ok">›</span> {l}…</li>)}</ul>
        </div>
      )}
      {phase === "wake" && (
        <button className="wake" onClick={wake} aria-label="Tap to launch">
          <span className="wake-img"><Image src="/aliens/alien2.png" alt="Alien cat pilot" width={220} height={432} priority /></span>
          <span className="wake-cta">tap to launch</span>
          <span className="wake-sub">sound on · steer to dodge, ring gates to boost</span>
        </button>
      )}
    </div>
  );
}
