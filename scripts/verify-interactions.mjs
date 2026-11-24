#!/usr/bin/env node
/**
 * Functional checks on the built site:
 *   node scripts/verify-interactions.mjs [--url http://localhost:4600]
 *
 * - keyboard: first tab stops are visible, in order, with a visible focus outline
 * - mobile menu: opens, closes on Escape, closes after choosing a link, link scrolls to its section
 * - "Explore the websites" lands on the Work section
 * - every external link opens in a new tab with rel="noopener noreferrer"
 * - every project link on the page matches src/data/projects.ts exactly
 * - FAQ items open and close
 * - POST /api/enquiry answers honestly (503 when no delivery service is configured)
 * - load performance on a throttled phone (Slow-4G-like network, 4x CPU)
 */
import fs from "node:fs";
import { chromium } from "playwright-core";

const argv = process.argv.slice(2);
const URL = argv.includes("--url") ? argv[argv.indexOf("--url") + 1] : "http://localhost:4600";
const CHROME = process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const results = [];
const ok = (name, pass, detail = "") => {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? "  " + detail : ""}`);
};

const dataSrc = fs.readFileSync("src/data/projects.ts", "utf8");
const dataUrls = [...dataSrc.matchAll(/url:\s*"([^"]+)"/g)].map((m) => m[1]);

const settle = (page) =>
  page.evaluate(
    () =>
      new Promise((res) => {
        let last = -1, same = 0;
        const t = setInterval(() => {
          if (scrollY === last) { if (++same >= 4) { clearInterval(t); res(scrollY); } }
          else { same = 0; last = scrollY; }
        }, 100);
      }),
  );

const browser = await chromium.launch({ executablePath: CHROME, headless: true });

// ---------------------------------------------------------------- desktop --
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(URL, { waitUntil: "load" });
  await page.waitForTimeout(800);

  const stops = [];
  for (let i = 0; i < 14; i++) {
    await page.keyboard.press("Tab");
    await settle(page);
    stops.push(
      await page.evaluate(() => {
        const el = document.activeElement;
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        return {
          label: (el.textContent || el.getAttribute("aria-label") || "").trim().replace(/\s+/g, " ").slice(0, 40),
          inView: r.bottom > 0 && r.top < innerHeight && r.width > 0,
          outline: cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) >= 2,
          opacity: cs.opacity,
        };
      }),
    );
  }
  const hiddenStops = stops.filter((s) => !s.inView || s.opacity === "0");
  ok(
    "keyboard: first 14 tab stops visible",
    hiddenStops.length === 0,
    stops.map((s) => s.label).join(" | ") + (hiddenStops.length ? `  NOT VISIBLE: ${hiddenStops.map((s) => s.label).join(", ")}` : ""),
  );
  ok("keyboard: focus outline drawn", stops.every((s) => s.outline));

  await page.goto(URL, { waitUntil: "load" });
  await page.click("text=Explore the websites");
  await settle(page);
  const workTop = await page.evaluate(() => document.getElementById("work").getBoundingClientRect().top);
  ok("hero CTA jumps to the work", Math.abs(workTop) < 120, `#work top at ${Math.round(workTop)}px`);

  const links = await page.$$eval("a[href^='http']", (as) =>
    as.map((a) => ({ href: a.getAttribute("href"), target: a.target, rel: a.rel })),
  );
  const bad = links.filter((l) => l.target !== "_blank" || !/noopener/.test(l.rel) || !/noreferrer/.test(l.rel));
  ok("external links open safely in a new tab", bad.length === 0, `${links.length} external links${bad.length ? "; bad: " + bad.map((b) => b.href).join(", ") : ""}`);

  const projectHrefs = [...new Set(links.map((l) => l.href).filter((h) => !/instagram\.com/.test(h)))];
  const unknown = projectHrefs.filter((h) => !dataUrls.includes(h));
  ok("project links match the data module exactly", unknown.length === 0, `${projectHrefs.length} unique project URLs${unknown.length ? "; unknown: " + unknown.join(", ") : ""}`);
  ok("hidden/unavailable project not linked", !projectHrefs.includes("https://kapitibarbers.vercel.app/"));

  const ig = links.filter((l) => /instagram\.com\/the\.lumen\.desk\/$/.test(l.href)).length;
  const mail = await page.$$eval("a[href^='mailto:harsh@thelumendesk.com']", (a) => a.length);
  ok("Instagram and email contact links present", ig >= 3 && mail >= 2, `instagram=${ig} mailto=${mail}`);

  const faqOpen = await page.evaluate(() => {
    const d = document.querySelector(".faq details");
    d.querySelector("summary").click();
    const opened = d.open;
    d.querySelector("summary").click();
    return opened && !d.open;
  });
  ok("FAQ items open and close", faqOpen);

  const api = await page.evaluate(async () => {
    const r = await fetch("/api/enquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test", business: "Test", reply: "test@example.com", message: "Just checking the route." }),
    });
    return { status: r.status, body: await r.json() };
  });
  const formRendered = await page.$("form[action='/api/enquiry']");
  ok(
    "enquiry route is honest when not configured",
    formRendered ? api.status !== 503 : api.status === 503 && api.body.ok === false,
    `status ${api.status} ${JSON.stringify(api.body)}; form rendered: ${Boolean(formRendered)}`,
  );
  await page.close();
}

// ----------------------------------------------------------------- mobile --
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "load" });
  await page.waitForTimeout(600);
  const navVisible = () => page.evaluate(() => getComputedStyle(document.getElementById("site-nav")).display !== "none");
  ok("mobile menu starts closed", !(await navVisible()));
  await page.tap(".menu-toggle");
  ok("mobile menu opens", await navVisible());
  const expanded = await page.getAttribute(".menu-toggle", "aria-expanded");
  ok("menu toggle reports aria-expanded", expanded === "true");
  await page.keyboard.press("Escape");
  ok("Escape closes the menu", !(await navVisible()));
  await page.tap(".menu-toggle");
  await page.tap("#site-nav >> text=About");
  // Smooth scrolling over a long page takes a while: wait until it settles.
  await settle(page);
  const aboutTop = await page.evaluate(() => document.getElementById("about").getBoundingClientRect().top);
  ok("menu link closes menu and reaches its section", !(await navVisible()) && Math.abs(aboutTop) < 120, `#about top at ${Math.round(aboutTop)}px`);
  await ctx.close();
}

// ------------------------------------------------------ throttled phone --
// Gate: Slow-4G-like network (150 ms RTT, 1.6 Mbps). Info only: the same plus 4x CPU
// throttling, which varies too much run to run on a desktop machine to gate on.
for (const cpu of [1, 4]) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
  if (cpu > 1) await cdp.send("Emulation.setCPUThrottlingRate", { rate: cpu });
  let bytes = 0, js = 0, reqs = 0;
  cdp.on("Network.loadingFinished", (e) => { bytes += e.encodedDataLength; reqs++; });
  cdp.on("Network.responseReceived", (e) => { if (e.type === "Script") js += e.response.encodedDataLength || 0; });
  await page.addInitScript(() => {
    window.__lcp = 0;
    new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lcp = e.startTime; }).observe({ type: "largest-contentful-paint", buffered: true });
  });
  const t0 = Date.now();
  await page.goto(URL, { waitUntil: "load", timeout: 90000 });
  const loadMs = Date.now() - t0;
  await page.waitForTimeout(1500);
  const m = await page.evaluate(() => ({
    fcp: performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? 0,
    lcp: window.__lcp,
    heroVisible: getComputedStyle(document.querySelector("#hero-title")).opacity,
    lcpEl: "",
  }));
  const jsBytes = await page.evaluate(() =>
    performance.getEntriesByType("resource").filter((r) => r.initiatorType === "script").reduce((a, r) => a + (r.transferSize || 0), 0),
  );
  const detail = `FCP ${Math.round(m.fcp)}ms, LCP ${Math.round(m.lcp)}ms, load event ${loadMs}ms, ${reqs} requests, ${Math.round(bytes / 1024)} KB transferred by load, scripts ~${Math.round((jsBytes || js) / 1024)} KB`;
  if (cpu === 1) ok("slow-4G phone: hero paints fast (FCP < 2.5 s, LCP < 3 s)", m.fcp < 2500 && m.lcp < 3000 && m.heroVisible === "1", detail);
  else console.log(`INFO  slow-4G phone + 4x CPU: ${detail}`);
  await ctx.close();
}

await browser.close();
fs.writeFileSync("scrollcraft/builds/thelumendesk/lab/interactions.json", JSON.stringify(results, null, 2));
const failed = results.filter((r) => !r.pass).length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed ? 1 : 0);
