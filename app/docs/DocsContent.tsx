"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CA, TICKER, PUMP_URL, DEX_URL, isRealCA } from "../config";

const SECTIONS = [
  { id: "overview", label: "What is Alien Cats?" },
  { id: "controls", label: "Gameplay & Controls" },
  { id: "objects", label: "Gates, Rocks & Rivals" },
  { id: "scoring", label: "Distance & Overtakes" },
  { id: "token", label: `${TICKER} Token` },
  { id: "local", label: "Local & Free" },
  { id: "roadmap", label: "Roadmap" },
  { id: "faq", label: "FAQ" },
];

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="docs-row">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

export default function DocsContent() {
  const [active, setActive] = useState("overview");
  const refs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => { for (const e of entries) if (e.isIntersecting) setActive(e.target.id); },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    );
    for (const s of SECTIONS) { const el = refs.current[s.id]; if (el) io.observe(el); }
    return () => io.disconnect();
  }, []);

  const real = isRealCA();

  return (
    <>
      <header className="nav">
        <Link href="/#top" className="brand"><Image src="/aliens/alien4.png" alt="" width={30} height={45} className="brand-mascot" /> <b>Alien Cats</b> <span className="brand-ticker">{TICKER}</span></Link>
        <nav className="nav-links">
          <Link href="/#play">Play</Link>
          <Link href="/#how">How</Link>
          <Link href="/#roster">Pilots</Link>
          <span className="docs-nav-crumb">Docs</span>
        </nav>
        <div className="nav-actions">
          <Link href="/#play" className="btn btn-neon btn-sm">Play</Link>
        </div>
      </header>

      <div className="docs-shell">
        <aside className="docs-side">
          <span className="docs-kicker">Field Manual</span>
          {SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`} className={`docs-nav-link ${active === s.id ? "active" : ""}`}>{s.label}</a>
          ))}
        </aside>

        <main className="docs-main">
          <div className="docs-hero">
            <h1>Alien Cats Docs</h1>
            <p>Everything about the pseudo-3D race, scoring, the pilots, and {TICKER} — in one page.</p>
          </div>

          <section id="overview" ref={(el) => { refs.current.overview = el; }} className="docs-section">
            <h2>What is Alien Cats?</h2>
            <p>
              Alien Cats is a pseudo-3D &quot;into the screen&quot; space racer, playable instantly in the
              browser — no download, no signup. Objects spawn far ahead and rush toward the camera; steer
              your ship left and right to dodge hazards and fly through ring gates.
            </p>
            <div className="docs-table">
              <Row label="Ticker">{TICKER} (Solana, fair launch)</Row>
              <Row label="Format">Single-player pseudo-3D racer, one-axis steering</Row>
              <Row label="Cost to play">Free, unlimited, no wallet required</Row>
            </div>
          </section>

          <section id="controls" ref={(el) => { refs.current.controls = el; }} className="docs-section">
            <h2>Gameplay & Controls</h2>
            <p>One axis of movement, timed against everything rushing at you.</p>
            <div className="docs-table">
              <Row label="Steer">Move the pointer/finger left-right across the stage, or use the arrow keys</Row>
              <Row label="Ship response">Your ship eases toward wherever you&apos;re steering — not instant, needs a lead</Row>
              <Row label="Speed">Rises automatically the longer a run lasts</Row>
              <Row label="Game over">One collision with an asteroid, mine, or rival ship ends the run</Row>
            </div>
          </section>

          <section id="objects" ref={(el) => { refs.current.objects = el; }} className="docs-section">
            <h2>Gates, Rocks & Rivals</h2>
            <p>Four things spawn ahead of you — one to chase, three to dodge.</p>
            <div className="docs-table">
              <Row label="Ring gate">Fly through it for a speed boost and a point — the most common spawn</Row>
              <Row label="Asteroid / mine">Solid hazards — touching either ends the run</Row>
              <Row label="Rival ship">Slip past it cleanly to bank an overtake; clip it and it&apos;s a crash like anything else</Row>
              <Row label="Boost">Stacks from ring gates, decays over time, temporarily raises your top speed</Row>
            </div>
          </section>

          <section id="scoring" ref={(el) => { refs.current.scoring = el; }} className="docs-section">
            <h2>Distance & Overtakes</h2>
            <p>Two numbers survive every crash: how far you flew, and how many rivals you slipped past.</p>
            <div className="docs-table">
              <Row label="Distance">Measured in km, counts up automatically with your speed</Row>
              <Row label="Overtakes">+1 for every rival ship you pass without clipping it</Row>
              <Row label="Best distance / best overtakes">Both saved locally — only new records overwrite them</Row>
            </div>
          </section>

          <section id="token" ref={(el) => { refs.current.token = el; }} className="docs-section">
            <h2>{TICKER} Token</h2>
            <p>The game has no in-game currency or shop — {TICKER} is a separate community token that doesn&apos;t affect gameplay, spawn rates, or scoring in any way.</p>
            <div className="docs-table">
              <Row label="Contract">{real ? <code className="mono">{CA}</code> : "SOON — not launched yet"}</Row>
              <Row label="Launch style">Fair launch on Pump Fun, no presale, no team allocation</Row>
              <Row label="Buy links">
                <a href={real ? PUMP_URL + CA : PUMP_URL} target="_blank" rel="noreferrer">Pump Fun</a>
                {" · "}
                <a href={real ? DEX_URL + CA : DEX_URL} target="_blank" rel="noreferrer">DexScreener</a>
              </Row>
            </div>
          </section>

          <section id="local" ref={(el) => { refs.current.local = el; }} className="docs-section">
            <h2>Local & Free</h2>
            <p>No backend, no account, no wallet gate on the game itself. Your records live only in this browser.</p>
            <div className="docs-table">
              <Row label="Storage">Best distance and best overtakes saved to this browser&apos;s localStorage</Row>
              <Row label="Device-local">Clearing site data or switching browsers/devices resets your records</Row>
              <Row label="No leaderboard">Scores aren&apos;t submitted anywhere — the Hall of Fame is a personal record only</Row>
            </div>
            <p className="docs-note">Cross-device syncing, shared leaderboards, and any real-money mechanic are not built — see Roadmap below.</p>
          </section>

          <section id="roadmap" ref={(el) => { refs.current.roadmap = el; }} className="docs-section">
            <h2>Roadmap</h2>
            <div className="docs-table">
              <Row label="Live">Pseudo-3D racer, ring/asteroid/mine/rival spawns, local best distance & overtakes</Row>
              <Row label="Planned">New hazard types, alternate belts/backdrops</Row>
              <Row label="Token">{TICKER} fair launch — CA appears here and on the buy links the moment it&apos;s live</Row>
            </div>
          </section>

          <section id="faq" ref={(el) => { refs.current.faq = el; }} className="docs-section">
            <h2>FAQ</h2>
            <dl className="docs-faq">
              <dt>Do I need a wallet to play?</dt>
              <dd>No. Alien Cats is fully playable free, with no connection of any kind.</dd>
              <dt>Is this a real 3D engine?</dt>
              <dd>No — it&apos;s a projected 2D scene (canvas math simulating depth), not a 3D renderer.</dd>
              <dt>Is {TICKER} live yet?</dt>
              <dd>Not yet. The contract address on this page reads &quot;SOON&quot; until it launches.</dd>
              <dt>Does missing a ring gate cost anything?</dt>
              <dd>No penalty — you just don&apos;t get the boost or the point for that gate.</dd>
            </dl>
          </section>
        </main>
      </div>
    </>
  );
}
