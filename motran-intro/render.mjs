// index.html'deki animasyonu kare kare yakalayıp 1080x1920 MP4'e çevirir.
//
// Kullanım:
//   node render.mjs                       -> motran-intro.mp4 (30 fps, 8 sn)
//   node render.mjs --fps 60 --out a.mp4
//   node render.mjs --stills 1.5,4.2,6.4  -> sadece o saniyelerin PNG'leri
//
// Gerekenler: playwright (Chromium) ve libx264 destekli ffmpeg
// (PATH'te değilse FFMPEG=/yol/ffmpeg ile verin).
import { createRequire } from "node:module";
import { execFileSync, spawn } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith("--") ? [...acc, [a.slice(2), all[i + 1]]] : acc), []),
);
const fps = Number(args.fps ?? 30);
const out = path.resolve(args.out ?? path.join(here, "motran-intro.mp4"));
const ffmpeg = process.env.FFMPEG ?? "ffmpeg";

function loadPlaywright() {
  const require = createRequire(import.meta.url);
  try { return require("playwright"); } catch {}
  const globalRoot = execFileSync("npm", ["root", "-g"], { encoding: "utf8" }).trim();
  return require(path.join(globalRoot, "playwright"));
}

const { chromium } = loadPlaywright();
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(path.join(here, "index.html")).href + "?render");
await page.evaluate(() => window.ready);
const canvas = page.locator("#c");
const grab = async t => { await page.evaluate(tt => window.draw(tt), t); return canvas.screenshot({ type: "png" }); };

if (args.stills) {
  for (const s of args.stills.split(",")) {
    const file = path.join(path.dirname(out), `still-${s}.png`);
    writeFileSync(file, await grab(Number(s)));
    console.log(file);
  }
} else {
  const duration = await page.evaluate(() => window.DURATION);
  const total = Math.round(duration * fps);
  const dir = mkdtempSync(path.join(tmpdir(), "motran-frames-"));
  for (let i = 0; i < total; i++) {
    writeFileSync(path.join(dir, `f${String(i).padStart(4, "0")}.png`), await grab(i / fps));
    if (i % fps === 0) process.stdout.write(`kare ${i}/${total}\r`);
  }
  await new Promise((resolve, reject) => {
    const p = spawn(ffmpeg, [
      "-y", "-loglevel", "error", "-framerate", String(fps), "-i", path.join(dir, "f%04d.png"),
      "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-pix_fmt", "yuv420p", "-movflags", "+faststart", out,
    ], { stdio: "inherit" });
    p.on("exit", code => (code === 0 ? resolve() : reject(new Error(`ffmpeg ${code}`))));
  });
  rmSync(dir, { recursive: true, force: true });
  console.log(`\n${out} (${total} kare, ${fps} fps)`);
}
await browser.close();
