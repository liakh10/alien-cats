import sharp from "sharp";
import { fileURLToPath } from "url";
import { dirname, join, resolve } from "path";
import { readFileSync } from "fs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// Favicon rule: the icon is ALWAYS just the ticker (text) on the brand colour.
function readTicker() {
  try {
    const src = readFileSync(resolve(root, "app/config.ts"), "utf8");
    const m = src.match(/TICKER\s*=\s*["'`]([^"'`]+)["'`]/);
    return (m ? m[1] : "$TICKER").replace(/^\$/, "");
  } catch { return "TICKER"; }
}

const TICKER = readTicker(); // e.g. "ALCATS"
const AVAIL = 430;
const size = Math.min(200, Math.floor(AVAIL / Math.max(1, TICKER.length * 0.72)));

const ART = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect x="16" y="16" width="480" height="480" rx="104" fill="#0d0b2a" stroke="#39ff88" stroke-width="18"/>
  <text x="256" y="228" text-anchor="middle" font-family="Arial Black, Helvetica, sans-serif" font-weight="900"
        font-size="176" fill="#39ff88">$</text>
  <text x="256" y="392" text-anchor="middle" font-family="Arial Black, Helvetica, sans-serif" font-weight="900"
        font-size="${size}" fill="#eafff2">${TICKER}</text>
</svg>`;

async function main() {
  const buf = Buffer.from(ART);
  await sharp(buf).resize(256, 256).png({ compressionLevel: 9 }).toFile(join(root, "app/icon.png"));
  await sharp(buf).resize(180, 180).png({ compressionLevel: 9 }).toFile(join(root, "app/apple-icon.png"));
  console.log(`favicon generated from ticker: $${TICKER}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
