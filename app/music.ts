// Procedural synthwave — a driving space-racer loop: a pulsing saw bass, a
// bright arp, and an off-beat kick, built live with WebAudio (no mp3). Started
// by a user gesture (the launch splash).

export class MusicEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private timer: number | null = null;
  playing = false;
  muted = false;
  private step = 0;

  private readonly arp = [440, 554.37, 659.25, 880, 659.25, 554.37, 493.88, 659.25];
  private readonly bass = [110, 110, 82.41, 98];

  private ensure(): boolean {
    if (this.ctx) return true;
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.0001;
      this.master.connect(this.ctx.destination);
      return true;
    } catch { return false; }
  }

  private note(f: number, t: number, type: OscillatorType, vol: number, dur: number, filt?: number) {
    if (!this.ctx || !this.master) return;
    const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
    o.type = type; o.frequency.value = f;
    let node: AudioNode = o;
    if (filt) { const bf = this.ctx.createBiquadFilter(); bf.type = "lowpass"; bf.frequency.value = filt; o.connect(bf); node = bf; }
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    node.connect(g); g.connect(this.master); o.start(t); o.stop(t + dur + 0.02);
  }

  private kick(t: number) {
    if (!this.ctx || !this.master) return;
    const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
    o.type = "sine"; o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(48, t + 0.12);
    g.gain.setValueAtTime(0.1, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    o.connect(g); g.connect(this.master); o.start(t); o.stop(t + 0.18);
  }

  private tick = () => {
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime;
    this.note(this.arp[this.step % this.arp.length], t, "square", 0.04, 0.18, 2600);       // arp
    if (this.step % 2 === 0) this.note(this.bass[(this.step / 2) % this.bass.length], t, "sawtooth", 0.06, 0.34, 700); // bass
    if (this.step % 4 === 0) this.kick(t);                                                  // kick
    this.step++;
  };

  play() {
    if (!this.ensure() || !this.ctx || !this.master) return;
    if (this.ctx.state === "suspended") this.ctx.resume();
    if (this.playing) return;
    this.playing = true;
    this.master.gain.cancelScheduledValues(this.ctx.currentTime);
    this.master.gain.setValueAtTime(Math.max(0.0001, this.master.gain.value), this.ctx.currentTime);
    this.master.gain.exponentialRampToValueAtTime(this.muted ? 0.0001 : 0.85, this.ctx.currentTime + 1.4);
    this.tick();
    this.timer = window.setInterval(this.tick, 200);
  }

  pause() {
    this.playing = false;
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
    if (this.ctx && this.master) { this.master.gain.cancelScheduledValues(this.ctx.currentTime); this.master.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.4); }
  }

  toggle() { if (this.playing) this.pause(); else this.play(); }
  setMuted(m: boolean) {
    this.muted = m;
    if (this.ctx && this.master) { this.master.gain.cancelScheduledValues(this.ctx.currentTime); this.master.gain.exponentialRampToValueAtTime(m ? 0.0001 : 0.85, this.ctx.currentTime + 0.3); }
  }
  dispose() { this.pause(); try { this.ctx?.close(); } catch { /* */ } this.ctx = null; }
}

let _music: MusicEngine | null = null;
export function getMusic(): MusicEngine {
  if (!_music) {
    _music = new MusicEngine();
    if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") (window as unknown as { __music?: MusicEngine }).__music = _music;
  }
  return _music;
}
