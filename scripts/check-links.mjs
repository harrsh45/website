#!/usr/bin/env node
/**
 * Re-test every link the site depends on, in a real browser.
 *   npm run check-links
 *
 * Checks each project URL in src/data/projects.ts, the Instagram profile and the
 * live studio domain. Reports HTTP status, final URL and page title. Run it before
 * every deploy and update `available` / `lastChecked` in projects.ts accordingly.
 */
import fs from "node:fs";
import { chromium } from "playwright-core";

const src = fs.readFileSync("src/data/projects.ts", "utf8");
const projects = [...src.matchAll(/slug:\s*"([^"]+)"[\s\S]*?url:\s*"([^"]+)"[\s\S]*?available:\s*(true|false)/g)].map((m) => ({
  name: m[1],
  url: m[2],
  expectAvailable: m[3] === "true",
}));
const extra = [
  { name: "instagram", url: "https://www.instagram.com/the.lumen.desk/" },
  { name: "studio domain", url: "https://thelumendesk.com/" },
];

const CHROME =
  process.env.CHROME_PATH ||
  ["C:/Program Files/Google/Chrome/Application/chrome.exe", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome"].find((p) =>
    fs.existsSync(p),
  );
const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
let problems = 0;

for (const item of [...projects, ...extra]) {
  const page = await ctx.newPage();
  let status = "ERR", title = "", finalUrl = "", note = "";
  try {
    const res = await page.goto(item.url, { waitUntil: "domcontentloaded", timeout: 30000 });
    status = res?.status() ?? "?";
    await page.waitForTimeout(1500);
    title = (await page.title()).slice(0, 70);
    finalUrl = page.url();
    if (item.name === "instagram") {
      const og = await page.$eval('meta[property="og:title"]', (m) => m.content).catch(() => "");
      const body = await page.evaluate(() => document.body.innerText.slice(0, 4000));
      const mentions = /the\.lumen\.desk/i.test(og + " " + body + " " + title);
      const missing = /isn.t available|page not found|sorry, this page/i.test(body);
      note = missing ? "PROFILE NOT FOUND" : mentions ? "profile handle seen on page" : "login wall: handle not visible to a logged-out browser, check manually";
    }
  } catch (e) {
    note = e.message.split("\n")[0];
  }
  const okNow = typeof status === "number" && status < 400;
  const flag = "expectAvailable" in item && okNow !== item.expectAvailable ? "  <-- update `available` in projects.ts" : "";
  if (flag || (!okNow && !("expectAvailable" in item && !item.expectAvailable))) problems++;
  console.log(`${String(status).padEnd(4)} ${item.name.padEnd(28)} ${title}${note ? "  [" + note + "]" : ""}${finalUrl && finalUrl !== item.url ? "  -> " + finalUrl : ""}${flag}`);
  await page.close();
}
await browser.close();
console.log(problems ? `\n${problems} link(s) need attention.` : "\nAll links behave as the data expects.");
