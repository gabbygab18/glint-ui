// Records a short looping MP4 of every preview for the animated cards.
// usage: node scripts/videos.mjs [baseUrl=http://localhost:3000] [slug...]
// Writes public/thumbs/<slug>.mp4. Needs a running server (next start is fastest).
import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import ffmpeg from "ffmpeg-static";

const root = path.resolve(import.meta.dirname, "..");
const [base = "http://localhost:3000", ...only] = process.argv.slice(2);
const slugs = only.length ? only : readdirSync(path.join(root, "src/registry/items"));
const outDir = path.join(root, "public/thumbs");
mkdirSync(outDir, { recursive: true });

const W = 560, H = 350, SECONDS = 3.5, FPS = 12, WORKERS = 3;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const profile = mkdtempSync(path.join(tmpdir(), "videos-"));
const chrome = spawn("C:/Program Files/Google/Chrome/Application/chrome.exe", [
  "--headless=new", "--remote-debugging-port=0", `--user-data-dir=${profile}`,
  "--hide-scrollbars", "--enable-unsafe-swiftshader", "--autoplay-policy=no-user-gesture-required", "about:blank",
]);
let port;
for (let i = 0; i < 80 && !port; i++) {
  try { port = readFileSync(path.join(profile, "DevToolsActivePort"), "utf8").split(/\r?\n/)[0]; } catch { await sleep(250); }
}

async function openTab() {
  const t = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" })).json();
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 0;
  const pending = new Map();
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data);
    if (d.id && pending.has(d.id)) { pending.get(d.id)(d.result ?? d.error); pending.delete(d.id); }
  };
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 1, mobile: false });
  return send;
}

async function record(send, slug) {
  await send("Page.navigate", { url: `${base}/preview/${slug}` });
  await sleep(2500);
  const frames = [];
  const total = Math.round(SECONDS * FPS);
  const t0 = Date.now();
  for (let i = 0; i < total; i++) {
    // Slow figure-eight so cursor-reactive effects have something to follow.
    const a = (i / total) * Math.PI * 2;
    await send("Input.dispatchMouseEvent", {
      type: "mouseMoved",
      x: W / 2 + Math.sin(a) * W * 0.28,
      y: H / 2 + Math.sin(a * 2) * H * 0.2,
    });
    const shot = await send("Page.captureScreenshot", { format: "jpeg", quality: 85 });
    frames.push(Buffer.from(shot.data, "base64"));
    const wait = t0 + ((i + 1) * 1000) / FPS - Date.now();
    if (wait > 0) await sleep(wait);
  }
  // Real frame rate, so slow WebGL captures still play at true speed.
  const fps = Math.max(4, Math.min(FPS, frames.length / ((Date.now() - t0) / 1000)));
  await new Promise((resolve, reject) => {
    const ff = spawn(ffmpeg, [
      "-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", fps.toFixed(2), "-i", "-",
      "-c:v", "libx264", "-preset", "slow", "-crf", "30", "-pix_fmt", "yuv420p",
      "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2", "-movflags", "+faststart", "-an",
      path.join(outDir, `${slug}.mp4`),
    ]);
    ff.on("error", reject);
    ff.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`))));
    for (const f of frames) ff.stdin.write(f);
    ff.stdin.end();
  });
}

const queue = [...slugs];
let done = 0, failed = 0;
await Promise.all(Array.from({ length: WORKERS }, async () => {
  const send = await openTab();
  while (queue.length) {
    const slug = queue.shift();
    try {
      await record(send, slug);
      done++;
    } catch (e) {
      failed++;
      console.log(`FAIL ${slug}: ${e.message}`);
    }
    if ((done + failed) % 25 === 0) console.log(`${done + failed}/${slugs.length}`);
  }
}));
console.log(`${done}/${slugs.length} videos, ${failed} failed`);
chrome.kill();
setTimeout(() => {
  try { rmSync(profile, { recursive: true, force: true }); } catch {}
  process.exit(failed ? 1 : 0);
}, 300);
