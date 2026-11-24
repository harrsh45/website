#!/usr/bin/env node
/**
 * Capture real screenshots of every portfolio project.
 *
 *   npm run capture                 capture every project in src/data/projects.ts
 *   npm run capture -- sarah-ollivierre-beauty kimberly-nails   capture only these slugs
 *
 * Output (per project, in public/projects/):
 *   <slug>-desktop.webp       1440x900 viewport at 2x, top of the homepage
 *   <slug>-desktop-mid.webp   1440x900 viewport at 2x, one screen further down
 *   <slug>-mobile.webp        390x844 viewport at 2x (iPhone-like), top of the homepage
 *
 * It also writes scrollcraft/builds/thelumendesk/capture-report.json with the HTTP
 * status, final URL, page title and console errors for each project, so the
 * verification report can say exactly what was reachable on capture day.
 *
 * Requires an installed Chrome (or set CHROME_PATH). Screenshots are never edited:
 * they are resized/encoded only.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "projects");
const REPORT = path.join(ROOT, "scrollcraft", "builds", "thelumendesk", "capture-report.json");

// Read the project list straight from the typed data module so there is one source of truth.
const dataSrc = fs.readFileSync(path.join(ROOT, "src", "data", "projects.ts"), "utf8");
const projects = [...dataSrc.matchAll(/slug:\s*"([^"]+)"[\s\S]*?url:\s*"([^"]+)"/g)].map((m) => ({
  slug: m[1],
  url: m[2],
}));
const only = process.argv.slice(2);
const todo = only.length ? projects.filter((p) => only.includes(p.slug)) : projects;

const CHROME =
  process.env.CHROME_PATH ||
  [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ].find((p) => fs.existsSync(p));
if (!CHROME) {
  console.error("No Chrome found. Set CHROME_PATH.");
  process.exit(1);
}

fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(path.dirname(REPORT), { recursive: true });

const IPHONE_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";

async function settle(page) {
  // Fonts, then walk the page so lazy images and reveal-on-scroll content load,
  // then return to the top and give entrance animations time to finish.
  await page.evaluate(async () => {
    await document.fonts?.ready;
    const step = Math.max(400, Math.floor(innerHeight * 0.8));
    const max = Math.min(document.documentElement.scrollHeight, 9000);
    for (let y = 0; y < max; y += step) {
      scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    scrollTo(0, 0);
  });
  await page.waitForTimeout(2600);
}

async function shoot(context, project, kind) {
  const page = await context.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 200)));
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
  let status = null;
  let finalUrl = project.url;
  let title = "";
  const files = [];
  try {
    const res = await page.goto(project.url, { waitUntil: "load", timeout: 45000 });
    status = res ? res.status() : null;
    finalUrl = page.url();
    title = await page.title();
    if (status && status >= 400) throw new Error(`HTTP ${status}`);
    await page.waitForLoadState("networkidle", { timeout: 12000 }).catch(() => {});
    await settle(page);

    const top = await page.screenshot({ type: "png" });
    const name = `${project.slug}-${kind}.webp`;
    await sharp(top).webp({ quality: 84, effort: 5 }).toFile(path.join(OUT, name));
    files.push(name);

    if (kind === "desktop") {
      await page.evaluate(() => scrollTo(0, Math.round(innerHeight * 1.05)));
      await page.waitForTimeout(1600);
      const mid = await page.screenshot({ type: "png" });
      const midName = `${project.slug}-desktop-mid.webp`;
      await sharp(mid).webp({ quality: 84, effort: 5 }).toFile(path.join(OUT, midName));
      files.push(midName);
    }
  } catch (e) {
    errors.push(`CAPTURE FAILED: ${e.message}`);
  } finally {
    await page.close();
  }
  return { status, finalUrl, title, files, errors };
}

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const desktop = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  reducedMotion: "no-preference",
});
const mobile = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  userAgent: IPHONE_UA,
});

const previous = fs.existsSync(REPORT) ? JSON.parse(fs.readFileSync(REPORT, "utf8")) : {};
const report = { ...previous, capturedAt: new Date().toISOString(), projects: { ...(previous.projects || {}) } };

for (const p of todo) {
  process.stdout.write(`${p.slug} ... `);
  const d = await shoot(desktop, p, "desktop");
  const m = await shoot(mobile, p, "mobile");
  report.projects[p.slug] = { url: p.url, desktop: d, mobile: m };
  console.log(`${d.status ?? "ERR"} / ${m.status ?? "ERR"}  ${d.title}`);
}

await browser.close();
fs.writeFileSync(REPORT, JSON.stringify(report, null, 2));
console.log(`\nreport: ${path.relative(ROOT, REPORT)}`);
