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
import sharp from "sharp";

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
  await page.waitForTimeout(500);
  const headerH = await page.evaluate(() => document.querySelector(".site-header").getBoundingClientRect().height);
  await page.click("text=Explore the websites");
  await settle(page);
  const afterCta = await page.evaluate(() => ({
    top: document.getElementById("work").getBoundingClientRect().top,
    hash: location.hash,
    focus: document.activeElement?.id,
  }));
  ok("hero CTA glides to the work, just below the header", Math.abs(afterCta.top - (headerH + 12)) <= 4, `#work top at ${Math.round(afterCta.top)}px (header ${Math.round(headerH)}px)`);
  ok("in-page link updates the URL and moves focus", afterCta.hash === "#work" && afterCta.focus === "work", `hash ${afterCta.hash}, focus #${afterCta.focus}`);

  // Project index jump lands the project just below the header too (no double offset).
  await page.click(".index >> text=Kimberly Nails");
  await settle(page);
  const kimTop = await page.evaluate(() => document.getElementById("work-kimberly-nails").getBoundingClientRect().top);
  ok("project index jump lands just below the header", Math.abs(kimTop - (headerH + 12)) <= 4, `piece top at ${Math.round(kimTop)}px`);

  // Lenis: the wheel is smoothed (several intermediate positions), and it ends where it should.
  await page.goto(URL, { waitUntil: "load" });
  await page.waitForTimeout(500);
  const lenisOn = await page.evaluate(() => document.documentElement.classList.contains("lenis"));
  await page.mouse.move(700, 450);
  const y0 = await page.evaluate(() => scrollY);
  await page.mouse.wheel(0, 800);
  const samples = [];
  for (let i = 0; i < 14; i++) {
    samples.push(await page.evaluate(() => Math.round(scrollY)));
    await page.waitForTimeout(40);
  }
  const yEnd = await settle(page);
  const distinct = new Set(samples).size;
  ok("Lenis smooths wheel scrolling", lenisOn && distinct >= 5 && Math.abs(yEnd - y0 - 800) <= 2, `lenis=${lenisOn}, ${distinct} distinct positions while gliding, moved ${Math.round(yEnd - y0)}px for an 800px wheel`);

  // Skip link: keyboard user lands in the work section with focus there.
  await page.goto(URL, { waitUntil: "load" });
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await settle(page);
  const skip = await page.evaluate(() => ({ focus: document.activeElement?.id, top: document.getElementById("work").getBoundingClientRect().top }));
  ok("skip link moves focus and view to the work", skip.focus === "work" && Math.abs(skip.top - (headerH + 12)) <= 4, `focus #${skip.focus}, #work top ${Math.round(skip.top)}px`);

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

// --------------------------------------------------- hero logo keeps looping --
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(URL, { waitUntil: "load" });
  const states = [];
  for (let i = 0; i < 30; i++) {
    const buf = await (await page.$(".hero__lamp img")).screenshot();
    const { data, info } = await sharp(buf).raw().toBuffer({ resolveWithObject: true });
    // the laptop screen area of the artwork: warm when lit, canvas-coloured when off
    const x = Math.round(info.width * 0.55), y = Math.round(info.height * 0.6), k = (y * info.width + x) * info.channels;
    states.push(data[k + 2] < 200 ? "lit" : "off"); // lit pixels have little blue
    await page.waitForTimeout(300);
  }
  const s = states.join("");
  ok("hero logo animation keeps looping", /lit(off)+lit/.test(s), `observed ${states.filter((v, i) => v !== states[i - 1]).join(" > ")}`);
  await page.close();
}

// ------------------------------------------------------------- email links --
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.grantPermissions(["clipboard-read", "clipboard-write"], { origin: URL });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "load" });
  await page.waitForTimeout(600);
  const btn = page.locator(".contact__actions a", { hasText: "Email me" });
  await btn.scrollIntoViewIfNeeded();
  await settle(page);
  await btn.click();
  await page.waitForTimeout(250);
  const menu = await page.evaluate(() => {
    const panel = document.querySelector(".contact__actions .email-link__panel");
    if (!panel) return null;
    const screen = document.querySelector(".contact__screen").getBoundingClientRect();
    const r = panel.getBoundingClientRect();
    return {
      expanded: document.querySelector(".contact__actions [aria-expanded]")?.getAttribute("aria-expanded"),
      items: [...panel.querySelectorAll("a,button")].map((e) => `${e.textContent.trim()}=${e.getAttribute("href") || "button"}`),
      focusInside: panel.contains(document.activeElement),
      insideScreen: r.top >= screen.top && r.bottom <= screen.bottom && r.left >= screen.left && r.right <= screen.right,
    };
  });
  ok(
    "computer: 'Email me' opens email options",
    menu && menu.expanded === "true" && menu.focusInside && menu.items.length === 4,
    menu ? menu.items.join(" | ") : "no menu",
  );
  ok(
    "email options point at the studio address",
    menu &&
      menu.items[0].includes("mailto:harsh@thelumendesk.com") &&
      menu.items[1].includes("mail.google.com") && menu.items[1].includes("harsh%40thelumendesk.com") &&
      menu.items[2].includes("outlook.live.com") && menu.items[2].includes("harsh%40thelumendesk.com"),
  );
  ok("email options are fully visible (not clipped by the screen)", menu?.insideScreen === true);
  await page.click(".contact__actions .email-link__panel >> text=Copy address");
  await page.waitForTimeout(200);
  const clip = await page.evaluate(() => navigator.clipboard.readText());
  ok("'Copy address' copies the email", clip === "harsh@thelumendesk.com", JSON.stringify(clip));
  await page.keyboard.press("Escape");
  await page.waitForTimeout(150);
  const closed = await page.evaluate(() => ({
    gone: !document.querySelector(".contact__actions .email-link__panel"),
    focusBack: document.activeElement?.textContent?.trim() === "Email me",
  }));
  ok("Escape closes the options and returns focus", closed.gone && closed.focusBack);

  const footer = page.locator(".site-footer .email-link > a");
  await footer.scrollIntoViewIfNeeded();
  await settle(page);
  await footer.click();
  await page.waitForTimeout(250);
  const fr = await page.evaluate(() => {
    const p = document.querySelector(".site-footer .email-link__panel");
    if (!p) return null;
    const r = p.getBoundingClientRect();
    return { visible: r.top >= 0 && r.bottom <= innerHeight && r.right <= innerWidth };
  });
  ok("footer email link opens options on screen", fr?.visible === true);
  await ctx.close();

  // Phone: a plain mailto tap (no menu, default action not cancelled).
  const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const pp = await phone.newPage();
  await pp.goto(URL, { waitUntil: "load" });
  await pp.waitForTimeout(600);
  await pp.evaluate(() => {
    window.__prevented = null;
    document.addEventListener("click", (e) => {
      if (e.target.closest(".email-link")) setTimeout(() => { window.__prevented = e.defaultPrevented; }, 0);
    }, true);
  });
  const pbtn = pp.locator(".contact__actions a", { hasText: "Email me" });
  await pbtn.scrollIntoViewIfNeeded();
  const attrs = await pbtn.evaluate((a) => ({ href: a.getAttribute("href"), expanded: a.getAttribute("aria-expanded") }));
  await pbtn.tap({ noWaitAfter: true }).catch(() => {});
  await pp.waitForTimeout(300);
  const phoneState = await pp.evaluate(() => ({ prevented: window.__prevented, panel: Boolean(document.querySelector(".email-link__panel")) }));
  ok(
    "phone: 'Email me' stays a one-tap mailto link",
    attrs.href.startsWith("mailto:harsh@thelumendesk.com") && attrs.expanded === null && phoneState.prevented === false && !phoneState.panel,
    `href ${attrs.href}, defaultPrevented ${phoneState.prevented}, menu shown ${phoneState.panel}`,
  );
  await phone.close();
}

// ---------------------------------------------------------- reduced motion --
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  await page.goto(URL, { waitUntil: "load" });
  await page.waitForTimeout(600);
  const lenis = await page.evaluate(() => document.documentElement.classList.contains("lenis"));
  await page.click("text=Explore the websites");
  await settle(page);
  const top = await page.evaluate(() => document.getElementById("work").getBoundingClientRect().top);
  ok("reduced motion: no smooth scrolling, anchors still land", !lenis && top > 0 && top < 120, `lenis=${lenis}, #work top ${Math.round(top)}px`);
  await page.close();
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
