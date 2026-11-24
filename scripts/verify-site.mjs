#!/usr/bin/env node
/**
 * Walk the built site at several viewports and record evidence.
 *
 *   node scripts/verify-site.mjs [--url http://localhost:4600] [--out scrollcraft/builds/thelumendesk/lab/verify]
 *
 * For each profile (desktop 1440, phone 390, compact phone 360x640, and reduced-motion
 * desktop and phone) it scrolls the page in ~0.7-viewport steps, saves every frame plus
 * a contact sheet, and reports:
 *   - console errors, page errors, failed or 4xx/5xx requests
 *   - horizontal overflow (page wider than the viewport)
 *   - visible links/buttons smaller than 44px on touch profiles
 *   - images with no alt attribute
 *   - whether every [data-lamp] project ended fully lit after the walk
 *   - whether the Scrollcraft engine mounted (html.sc-ready)
 * Complements the Scrollcraft harness (shoot.mjs), which samples within pinned acts.
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";
import sharp from "sharp";

const argv = process.argv.slice(2);
const arg = (n, d) => (argv.includes(n) ? argv[argv.indexOf(n) + 1] : d);
const URL = arg("--url", "http://localhost:4600");
const OUT = path.resolve(arg("--out", "scrollcraft/builds/thelumendesk/lab/verify"));
const ONLY = arg("--only", "");

const CHROME =
  process.env.CHROME_PATH ||
  ["C:/Program Files/Google/Chrome/Application/chrome.exe", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome"].find((p) =>
    fs.existsSync(p),
  );

const IPHONE_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 350.0.0.0";

const PROFILES = [
  { name: "desktop", viewport: { width: 1440, height: 900 }, dpr: 1 },
  { name: "phone", viewport: { width: 390, height: 844 }, dpr: 2, mobile: true },
  { name: "compact", viewport: { width: 360, height: 640 }, dpr: 2, mobile: true },
  { name: "desktop-reduced", viewport: { width: 1440, height: 900 }, dpr: 1, reduced: true },
  { name: "phone-reduced", viewport: { width: 390, height: 844 }, dpr: 2, mobile: true, reduced: true },
].filter((p) => !ONLY || ONLY.split(",").includes(p.name));

async function sheet(files, outFile, cols) {
  const w = 300;
  const metas = await Promise.all(files.map((f) => sharp(f).metadata()));
  const h = Math.round((metas[0].height / metas[0].width) * w);
  const rows = Math.ceil(files.length / cols);
  const tiles = await Promise.all(files.map((f) => sharp(f).resize(w, h, { fit: "cover", position: "top" }).png().toBuffer()));
  await sharp({ create: { width: cols * (w + 6), height: rows * (h + 6), channels: 3, background: "#777" } })
    .composite(tiles.map((input, i) => ({ input, left: (i % cols) * (w + 6), top: Math.floor(i / cols) * (h + 6) })))
    .png()
    .toFile(outFile);
}

fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const report = { url: URL, at: new Date().toISOString(), profiles: {} };

for (const prof of PROFILES) {
  const dir = path.join(OUT, prof.name);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const ctx = await browser.newContext({
    viewport: prof.viewport,
    deviceScaleFactor: prof.dpr,
    isMobile: !!prof.mobile,
    hasTouch: !!prof.mobile,
    userAgent: prof.mobile ? IPHONE_UA : undefined,
    reducedMotion: prof.reduced ? "reduce" : "no-preference",
  });
  const page = await ctx.newPage();
  const errors = [];
  const failed = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 300)));
  page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 300)));
  page.on("requestfailed", (r) => failed.push(`${r.failure()?.errorText} ${r.url()}`));
  page.on("response", (r) => r.status() >= 400 && failed.push(`${r.status()} ${r.url()}`));

  await page.goto(URL, { waitUntil: "load" });
  await page.waitForTimeout(2600); // the lamp animation finishes at ~1.7 s
  const files = [];
  let i = 0;
  const shot = async () => {
    const f = path.join(dir, String(i++).padStart(2, "0") + ".png");
    await page.screenshot({ path: f });
    files.push(f);
  };
  await shot();

  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  const step = Math.round(prof.viewport.height * 0.7);
  for (let y = step; y < total; y += step) {
    await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: "instant" }), y);
    await page.waitForTimeout(750);
    await shot();
    if (y + prof.viewport.height >= total) break;
  }

  const checks = await page.evaluate((isMobile) => {
    const vw = window.innerWidth;
    const html = document.documentElement;
    const wide = [...document.querySelectorAll("body *")]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        if (cs.position === "fixed" || r.width === 0) return false;
        // ignore content inside a horizontal scroller (the mobile project index)
        if (el.closest(".index ol")) return false;
        return r.right > vw + 1 || r.left < -1;
      })
      .slice(0, 10)
      .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 40)}`);
    const small = isMobile
      ? [...document.querySelectorAll("a[href], button, summary, input, textarea")]
          .filter((el) => {
            const r = el.getBoundingClientRect();
            if (!r.width || getComputedStyle(el).visibility === "hidden") return false;
            if (el.closest(".hp") || el.getAttribute("tabindex") === "-1") return false;
            // inline links inside running text are exempt from the 44px target guideline
            if (el.tagName === "A" && getComputedStyle(el).display === "inline") return false;
            return r.height < 44 || r.width < 44;
          })
          .map((el) => `${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 40)}" ${Math.round(el.getBoundingClientRect().width)}x${Math.round(el.getBoundingClientRect().height)}`)
      : [];
    const lamps = [...document.querySelectorAll("[data-lamp]")].map((el) => getComputedStyle(el).getPropertyValue("--lit").trim());
    return {
      scrollWidth: html.scrollWidth,
      innerWidth: vw,
      horizontalOverflow: html.scrollWidth > vw,
      overflowing: wide,
      smallTargets: small,
      imagesWithoutAlt: [...document.images].filter((im) => !im.hasAttribute("alt")).map((im) => im.src),
      lampsLit: lamps,
      allLit: lamps.every((v) => parseFloat(v) >= 0.999),
      engineMounted: html.classList.contains("sc-ready"),
      classes: html.className,
      pageHeight: html.scrollHeight,
    };
  }, !!prof.mobile);

  await sheet(files, path.join(dir, "sheet.png"), prof.mobile ? 6 : 4);
  report.profiles[prof.name] = { frames: files.length, errors, failed, ...checks };
  console.log(
    `${prof.name.padEnd(16)} frames=${files.length} h=${checks.pageHeight} overflow=${checks.horizontalOverflow} errors=${errors.length} failed=${failed.length} smallTargets=${checks.smallTargets.length} allLit=${checks.allLit} engine=${checks.engineMounted}`,
  );
  await ctx.close();
}

await browser.close();
fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify(report, null, 2));
console.log(`\nreport: ${path.join(OUT, "report.json")}`);
