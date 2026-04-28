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
});
const page = await context.newPage();

await page.goto(url, { waitUntil: "networkidle" });

await page.evaluate(async () => {
  document.body.classList.add("render-mode");
  await document.fonts.ready;
});

const slides = page.locator(".slide");
const count = await slides.count();
console.log(`→ Found ${count} slides`);

for (let i = 0; i < count; i++) {
  const slide = slides.nth(i);
  const filename = `slide-${String(i + 1).padStart(2, "0")}.png`;
  const filepath = path.join(outDir, filename);

  if (i === 0) {
    // Size cover slide to fill 1350px minus header height, so header+cover = exactly 1350px
    const header = page.locator("header");
    const headerBox = await header.boundingBox();
    const coverHeight = IG_HEIGHT - headerBox.height;
    await slide.evaluate((el, h) => {
      el.style.height = `${h}px`;
      el.style.minHeight = `${h}px`;
    }, coverHeight);
    await page.screenshot({
      path: filepath,
      clip: { x: 0, y: 0, width: IG_WIDTH, height: IG_HEIGHT }
    });
  } else {
    await slide.scrollIntoViewIfNeeded();
    await slide.screenshot({ path: filepath });
  }
  console.log(`  ${filename}`);
}

await browser.close();
console.log(`✓ Wrote ${count} PNGs to ${outDir}/`);
