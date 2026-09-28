// Headless Chrome screenshot + console capture over CDP.
// usage: node scripts/shot.mjs <url> <out.png|out.webp> [width=1280] [height=800] [waitMs=2500] [mouseX,mouseY]
// Prints console errors / exceptions (or "(no console errors)"). Exit code 2 if any.
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const [url, out, w = "1280", h = "800", wait = "2500", mouse] = process.argv.slice(2);
if (!url || !out) {
  console.error("usage: node scripts/shot.mjs <url> <out> [w] [h] [waitMs] [x,y]");
  process.exit(1);
}

const candidates = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/usr/bin/google-chrome",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].filter(Boolean);
const bin = candidates.find((p) => existsSync(p));
const profile = mkdtempSync(path.join(tmpdir(), "shot-"));
const chrome = spawn(bin, [
  "--headless=new",
  // Port 0: Chrome picks a free port and writes it to DevToolsActivePort, so parallel runs never collide.
  "--remote-debugging-port=0",
  `--user-data-dir=${profile}`,
  `--window-size=${w},${h}`,
  "--hide-scrollbars",
  "--enable-unsafe-swiftshader",
  "about:blank",
]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const done = (code) => {
  chrome.kill();
  setTimeout(() => {
    try {
      rmSync(profile, { recursive: true, force: true });
    } catch {}
    process.exit(code);
  }, 300);
};

let targets;
let port;
for (let i = 0; i < 60 && !targets; i++) {
  try {
    port ??= readFileSync(path.join(profile, "DevToolsActivePort"), "utf8").split(/\r?\n/)[0].trim();
    targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
  } catch {
    await sleep(250);
  }
}
const page = targets?.find((t) => t.type === "page");
if (!page) {
  console.error("could not start chrome");
  done(1);
}
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0;
const pending = new Map();
const errors = [];
ws.onmessage = (m) => {
  const d = JSON.parse(m.data);
  if (d.id && pending.has(d.id)) {
    pending.get(d.id)(d.result ?? d.error);
    pending.delete(d.id);
  }
  if (d.method === "Runtime.consoleAPICalled" && (d.params.type === "error" || d.params.type === "assert"))
    errors.push(`console.error: ${d.params.args.map((a) => a.value ?? a.description).join(" ")}`);
  if (d.method === "Runtime.exceptionThrown")
    errors.push(`exception: ${d.params.exceptionDetails.exception?.description ?? d.params.exceptionDetails.text}`);
};
const send = (method, params = {}) =>
  new Promise((r) => {
    const i = ++id;
    pending.set(i, r);
    ws.send(JSON.stringify({ id: i, method, params }));
  });

await send("Runtime.enable");
await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", { width: +w, height: +h, deviceScaleFactor: 1, mobile: +w < 600 });
// SCHEME=light|dark emulates the OS color scheme (the site theme follows it by default).
if (process.env.SCHEME)
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: process.env.SCHEME }] });
await send("Page.navigate", { url });
await sleep(+wait);
if (mouse) {
  const [x, y] = mouse.split(",").map(Number);
  for (let k = 0; k <= 12; k++) {
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: x - 60 + k * 10, y: y - 20 + k * 3 });
    await sleep(25);
  }
  await sleep(500);
}
// RESIZE=w,h resizes the viewport after load, to test live window resizing.
if (process.env.RESIZE) {
  const [rw, rh] = process.env.RESIZE.split(",").map(Number);
  await send("Emulation.setDeviceMetricsOverride", { width: rw, height: rh, deviceScaleFactor: 1, mobile: rw < 600 });
  await sleep(1500);
}
// CLICK=x,y clicks once before the screenshot (e.g. to open a popover).
if (process.env.CLICK) {
  const [x, y] = process.env.CLICK.split(",").map(Number);
  await send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
  await sleep(900);
}
const format = out.endsWith(".webp") ? "webp" : "png";
const shot = await send("Page.captureScreenshot", { format, quality: format === "webp" ? 80 : undefined });
writeFileSync(out, Buffer.from(shot.data, "base64"));
console.log(errors.length ? errors.join("\n") : "(no console errors)");
ws.close();
done(errors.length ? 2 : 0);
