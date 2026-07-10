// Background-removal for the user's green alien cat photos (border flood-fill,
// same technique as chonk-roll's prep-cats.mjs). These cats have light/white
// bellies on white/grey backgrounds, so only edge-connected background is
// cleared — interior light fur stays.
import sharp from "sharp";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { mkdirSync } from "fs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const DL = "/Users/artem/Downloads";

const JOBS = [
  { src: `${DL}/44b94d4df5060c90d5ec216489a30f56.jpg`, out: "alien1.png", tol: 28 },   // standing green loaf (front)
  { src: `${DL}/Без названия (2).png`, out: "alien2.png", tol: 26 },                    // tall standing kitten, big black eyes
  { src: `${DL}/63939b59c0e2d2ecc1deed6904777b68.jpg`, out: "alien3.png", tol: 34, bg: [255, 255, 255] }, // alien selfie face (corner sampled green — force white)
  { src: `${DL}/58eda19c202bfb258594f438dd8b5a1c.jpg`, out: "alien4.png", tol: 30 },    // sitting green kitten
  { src: `${DL}/04aef3c47e3d9dd12a1aeb22f36df97c.jpg`, out: "alien5.png", tol: 30 },    // small standing kitten
];

function keyOut(data, W, H, ch, bg, tol) {
  const clear = new Uint8Array(W * H);
  const stack = [];
  const idx = (x, y) => y * W + x;
  const isBg = (x, y) => {
    const p = idx(x, y) * ch;
    return Math.max(Math.abs(data[p] - bg[0]), Math.abs(data[p + 1] - bg[1]), Math.abs(data[p + 2] - bg[2])) < tol;
  };
  for (let x = 0; x < W; x++) { stack.push([x, 0]); stack.push([x, H - 1]); }
  for (let y = 0; y < H; y++) { stack.push([0, y]); stack.push([W - 1, y]); }
  while (stack.length) {
    const [x, y] = stack.pop();
    if (x < 0 || y < 0 || x >= W || y >= H) continue;
    const i = idx(x, y);
    if (clear[i] || !isBg(x, y)) continue;
    clear[i] = 1;
    stack.push([x + 1, y]); stack.push([x - 1, y]); stack.push([x, y + 1]); stack.push([x, y - 1]);
  }
  return clear;
}

async function processOne(job) {
  const { data, info } = await sharp(job.src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: ch } = info;
  let bg = job.bg;
  if (!bg) {
    const corners = [[2, 2], [W - 3, 2], [2, H - 3], [W - 3, H - 3]];
    let r = 0, g = 0, b = 0;
    for (const [cx, cy] of corners) { const p = (cy * W + cx) * ch; r += data[p]; g += data[p + 1]; b += data[p + 2]; }
    bg = [r / 4, g / 4, b / 4];
  }
  const clear = keyOut(data, W, H, ch, bg, job.tol);
  const out = Buffer.from(data);
  for (let i = 0; i < W * H; i++) if (clear[i]) out[i * ch + 3] = 0;
  await sharp(out, { raw: { width: W, height: H, channels: ch } })
    .png().trim({ threshold: 1 }).resize({ height: 560, withoutEnlargement: true })
    .png({ compressionLevel: 9 }).toFile(join(root, "public/aliens", job.out));
  const m = await sharp(join(root, "public/aliens", job.out)).metadata();
  console.log(job.out, "→", m.width + "x" + m.height, `(bg ${bg.map(Math.round).join(",")})`);
}

async function main() {
  mkdirSync(join(root, "public/aliens"), { recursive: true });
  for (const j of JOBS) await processOne(j);
  console.log("done");
}
main().catch((e) => { console.error(e); process.exit(1); });
