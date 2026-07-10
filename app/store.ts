// Local persistence: best distance + best overtakes + audio pref. Device-local.
const DIST_KEY = "alcats_best_distance";
const PASS_KEY = "alcats_best_overtakes";
const MUTED_KEY = "alcats_muted";

export function getBestDistance(): number { try { return Number(localStorage.getItem(DIST_KEY) || "0") || 0; } catch { return 0; } }
export function saveBestDistance(v: number): boolean {
  if (v <= getBestDistance()) return false;
  try { localStorage.setItem(DIST_KEY, String(Math.round(v))); return true; } catch { return false; }
}

export function getBestOvertakes(): number { try { return Number(localStorage.getItem(PASS_KEY) || "0") || 0; } catch { return 0; } }
export function saveBestOvertakes(v: number): boolean {
  if (v <= getBestOvertakes()) return false;
  try { localStorage.setItem(PASS_KEY, String(v)); return true; } catch { return false; }
}

export function getMuted(): boolean { try { return localStorage.getItem(MUTED_KEY) === "1"; } catch { return false; } }
export function setMuted(v: boolean) { try { localStorage.setItem(MUTED_KEY, v ? "1" : "0"); } catch { /* */ } }
