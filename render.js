// render.js
// Turns a CLI-izdat post page into a series of Instagram-ready PNGs.
// Usage: node render.js <post-url-path>
// Example: node render.js /cli-izdat/archive/0001/CityNowhen/

import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

// ── Config ─────────────────────────────────────────────
const DEV_SERVER = "http://localhost:8080";
const IG_WIDTH = 1080;
const IG_HEIGHT = 1350;
const OUTPUT_ROOT = "slides";

// ── Parse argv ──────────────────────────────────────────
const postPath = process.argv[2];
if (!postPath) {
  console.error("Usage: node render.js <post-url-path>");
  console.error("Example: node render.js /cli-izdat/archive/0001/CityNowhen/");
  process.exit(1);
}

const url = DEV_SERVER + postPath;
const slug = postPath.replace(/\/$/, "").split("/").slice(-2).join("-");
const outDir = path.join(OUTPUT_ROOT, slug);

// ── Main ────────────────────────────────────────────────
await mkdir(outDir, { recursive: true });

console.log(`→ Opening ${url}`);
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: IG_WIDTH, height: IG_HEIGHT },
  deviceScaleFactor: 2,
});
const page = await context.newPage();

await page.goto(url, { waitUntil: "networkidle" });

const slides = page.locator(".slide");
const count = await slides.count();
console.log(`→ Found ${count} slides`);

for (let i = 0; i < count; i++) {
  const slide = slides.nth(i);
  const filename = `slide-${String(i + 1).padStart(2, "0")}.png`;
  const filepath = path.join(outDir, filename);

  await slide.screenshot({ path: filepath });
  console.log(`  ${filename}`);
}

await browser.close();
console.log(`✓ Wrote ${count} PNGs to ${outDir}/`);
