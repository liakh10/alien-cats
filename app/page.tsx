"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { CA, TICKER, X_URL, PUMP_URL, DEX_URL, isRealCA } from "./config";
import { XIcon, PassIcon, TrophyIcon } from "./art/icons";
import { getSfx } from "./sfx";
import { getMusic } from "./music";
import { getBestDistance, getBestOvertakes } from "./store";
import Enter from "./Enter";

const GameCanvas = dynamic(() => import("./game/GameCanvas"), { ssr: false });
const StarfieldBackdrop = dynamic(() => import("./StarfieldBackdrop"), { ssr: false });

const NAV = [
  { href: "#play", label: "Play" },
  { href: "#how", label: "How" },
  { href: "#roster", label: "Pilots" },
  { href: "/docs", label: "Docs" },
];

const PILOTS = [
  { img: "alien1", name: "GLORP", w: 342, h: 560 },
  { img: "alien2", name: "ZUMI", w: 285, h: 560 },
  { img: "alien3", name: "MEEX", w: 508, h: 560 },
  { img: "alien4", name: "NYBBL", w: 369, h: 560 },
  { img: "alien5", name: "POV", w: 284, h: 420 },
];

const HOW = [
  ["Steer", "Move left and right (mouse, finger, or arrow keys). Your ship follows — weave through the field."],
  ["Ring gates", "Fly through the green ring gates for a speed boost and points. Line them up on a good dodge."],
  ["Dodge & pass", "Hit a rock, mine, or rival and you're wrecked. Slip past rival ships to bank overtakes."],
];

const NOTES = [
  { h: "wtf is this", b: "Green alien cats. Warp ships. One asteroid belt and a very high score. Pilots wanted." },
  { h: "the cats", b: "Nobody knows where they came from. They race. $ALCATS is the fuel — fair launch on Solana." },
  { h: "one crash", b: "One hit ends the run. Distance and overtakes are all that survive the wreck." },
];

function useReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function CABlock() {
  const [copied, setCopied] = useState(false);
  const real = isRealCA();
  const copy = () => navigator.clipboard?.writeText(CA).then(() => { setCopied(true); getSfx().click(); setTimeout(() => setCopied(false), 1400); }).catch(() => {});
  return (
    <div className="ca">
      <span className="ca-label">CA</span>
      <code className="ca-value">{real ? CA : "SOON"}</code>
      {real && <button className="ca-copy" onClick={copy}>{copied ? "copied" : "copy"}</button>}
    </div>
  );
}

function BuyLinks({ small }: { small?: boolean }) {
  const cls = small ? "btn btn-sm" : "btn";
  return (
    <div className="buy">
      <a className={`${cls} btn-neon`} href={isRealCA() ? PUMP_URL + CA : PUMP_URL} target="_blank" rel="noreferrer">Pump Fun</a>
      <a className={`${cls} btn-ghost`} href={isRealCA() ? DEX_URL + CA : DEX_URL} target="_blank" rel="noreferrer">DexScreener</a>
    </div>
  );
}

function HallOfFame() {
  const [dist, setDist] = useState(0);
  const [pass, setPass] = useState(0);
  useEffect(() => {
    const refresh = () => { setDist(getBestDistance()); setPass(getBestOvertakes()); };
    refresh();
    window.addEventListener("alcats:update", refresh);
    window.addEventListener("alcats:awake", refresh);
    window.addEventListener("focus", refresh);
    return () => { window.removeEventListener("alcats:update", refresh); window.removeEventListener("alcats:awake", refresh); window.removeEventListener("focus", refresh); };
  }, []);
  return (
    <>
      <div className="records">
        <div className="record-card reveal"><TrophyIcon size={26} /><b>{dist.toLocaleString()} km</b><span>best distance</span></div>
        <div className="record-card reveal"><PassIcon size={24} /><b>{pass}</b><span>best overtakes</span></div>
      </div>
      <div className="roster reveal">
        {PILOTS.map((p) => (
          <div className="pilot" key={p.img}>
            <div className="pilot-pic"><Image src={`/aliens/${p.img}.png`} alt={p.name} width={p.w} height={p.h} /></div>
            <span className="pilot-name">{p.name}</span>
          </div>
        ))}
      </div>
    </>
  );
}

export default function Home() {
  useReveal();
  const [muted, setMutedState] = useState(false);
  useEffect(() => {
    const onAwake = () => setMutedState(getMusic().muted);
    window.addEventListener("alcats:awake", onAwake);
    return () => window.removeEventListener("alcats:awake", onAwake);
  }, []);
  const toggleMute = () => { const m = !muted; setMutedState(m); getMusic().setMuted(m); getSfx().setEnabled(!m); if (!m) getMusic().play(); };

  return (
    <>
      <Enter />
      <main>
        <header className="nav">
          <a href="#top" className="brand"><Image src="/aliens/alien4.png" alt="" width={30} height={45} className="brand-mascot" /> <b>Alien Cats</b> <span className="brand-ticker">{TICKER}</span></a>
          <nav className="nav-links">{NAV.map((n) => <a key={n.href} href={n.href}>{n.label}</a>)}</nav>
          <div className="nav-actions">
            <button className="icon-btn" onClick={toggleMute} title="sound">{muted ? "off" : "on"}</button>
            <a href={X_URL} target="_blank" rel="noreferrer" className="icon-btn" aria-label="X"><XIcon size={15} /></a>
            <a href="#play" className="btn btn-neon btn-sm">Play</a>
          </div>
        </header>

        <section id="top" className="hero">
          <StarfieldBackdrop />
          <span className="pill reveal">green cats · warp ships · on Solana</span>
          <h1 className="hero-title reveal">ALIEN CATS</h1>
          <p className="hero-sub reveal">Pilot the belt. Boost the gates. Don&apos;t become debris.</p>
          <div id="play" className="reveal"><GameCanvas /></div>
          <div className="hero-token reveal"><CABlock /><BuyLinks small /></div>
        </section>

        <section id="how" className="section">
          <div className="section-head reveal"><span className="pill">How to Fly</span><h2 className="section-title">Weave. Boost. Overtake.</h2></div>
          <div className="how">
            {HOW.map(([h, b], i) => (
              <div className="how-item reveal" key={h}><span className="how-n">{i + 1}</span><h3>{h}</h3><p>{b}</p></div>
            ))}
          </div>
        </section>

        <section id="roster" className="section section-roster">
          <div className="section-head reveal"><span className="pill">Hall of Fame</span><h2 className="section-title">Your run · the pilots</h2><p className="section-lead">Records saved on your device. The squad below flies the belt.</p></div>
          <HallOfFame />
        </section>

        <section id="notes" className="section">
          <div className="section-head reveal"><span className="pill">Notes</span><h2 className="section-title">Transmission log</h2></div>
          <div className="notes-wall">
            {NOTES.map((n, i) => <article className={`note note-${i % 3} reveal`} key={n.h}><h3>{n.h}</h3><p>{n.b}</p></article>)}
          </div>
        </section>

        <footer className="footer">
          <div className="footer-top reveal">
            <a href="#top" className="brand"><Image src="/aliens/alien4.png" alt="" width={26} height={39} className="brand-mascot" /> <b>Alien Cats</b></a>
            <div className="footer-links"><a href="#play">Play</a><a href="#how">How</a><a href="#roster">Pilots</a><a href="/docs">Docs</a><a href={X_URL} target="_blank" rel="noreferrer" className="footer-x" aria-label="X"><XIcon size={14} /></a></div>
          </div>
          <div className="footer-buy reveal"><CABlock /><BuyLinks small /></div>
          <p className="footer-bottom">© {new Date().getFullYear()} {TICKER} · fly responsibly</p>
        </footer>
      </main>
    </>
  );
}
