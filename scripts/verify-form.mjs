#!/usr/bin/env node
/**
 * Enquiry form checks. Needs a build made WITH the env vars set (so the form renders):
 *   RESEND_API_KEY=placeholder ENQUIRY_FROM_EMAIL=placeholder@example.com npm run build && npm start
 *   node scripts/verify-form.mjs [--url http://localhost:4600]
 *
 * Only exercises paths that are rejected BEFORE any email provider is called
 * (client validation, server validation, honeypot, timing, no-JS post), so no request
 * ever leaves the machine. Real delivery must be tested once with a real key.
 */
import { chromium } from "playwright-core";

const argv = process.argv.slice(2);
const URL = argv.includes("--url") ? argv[argv.indexOf("--url") + 1] : "http://localhost:4600";
const results = [];
const ok = (name, pass, detail = "") => {
  results.push({ name, pass });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? "  " + detail : ""}`);
};

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const outbound = [];
page.on("request", (r) => { if (!r.url().startsWith(URL)) outbound.push(r.url()); });
await page.goto(URL, { waitUntil: "load" });

const form = await page.$("form[action='/api/enquiry']");
ok("form renders when delivery is configured", Boolean(form));
if (!form) process.exit(1);
ok("form posts (never GET) so details never land in a URL", (await form.getAttribute("method")) === "post");

// "Want something similar?" prefills the message
await page.click("#work-bels-beauty-studio >> text=Want something similar?");
await page.waitForTimeout(300);
const prefill = await page.inputValue("#f-message");
ok("'Want something similar?' prefills the message", prefill.includes("Bel's Beauty Studio"), JSON.stringify(prefill));
await page.fill("#f-message", "");

// Empty submit: client-side errors, focus moves to the first problem
await page.click("form >> text=Send message");
const invalid = await page.$$eval("[aria-invalid='true']", (els) => els.map((e) => e.name));
const focused = await page.evaluate(() => document.activeElement?.getAttribute("name"));
ok("empty submit shows field errors", invalid.length === 4, invalid.join(","));
ok("focus moves to the first invalid field", focused === "name", String(focused));

// Bad email format
await page.fill("#f-name", "Test Person");
await page.fill("#f-business", "Test Studio");
await page.fill("#f-reply", "someone@nowhere");
await page.fill("#f-message", "I would like a new website for my studio.");
await page.click("form >> text=Send message");
ok("malformed email address is caught", (await page.getAttribute("#f-reply", "aria-invalid")) === "true");

// Honeypot filled: server rejects before contacting any provider, UI shows an honest error
await page.fill("#f-reply", "test@example.com");
await page.evaluate(() => { document.querySelector("#f-website").value = "http://spam.example"; });
await page.waitForTimeout(2600); // clear the minimum-time check so the honeypot is what rejects it
const [resp] = await Promise.all([page.waitForResponse("**/api/enquiry"), page.click("form >> text=Send message")]);
await page.waitForTimeout(300);
const statusText = await page.textContent("[aria-live='polite']");
ok("honeypot submissions are rejected server-side", resp.status() === 400, `HTTP ${resp.status()}`);
ok("UI never claims success on a failed send", !/Thank you|was sent/i.test(statusText) && /wasn’t sent/.test(statusText), JSON.stringify(statusText.trim().slice(0, 80)));

// Direct API checks
const api = await page.evaluate(async () => {
  const post = (body) =>
    fetch("/api/enquiry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => ({ s: r.status, b: await r.json() }));
  return {
    invalid: await post({ name: "", business: "", reply: "", message: "" }),
    tooFast: await post({ name: "A", business: "B", reply: "c@d.com", message: "Hello there, a website please", t: Date.now() }),
  };
});
ok("server validates fields (422 with per-field errors)", api.invalid.s === 422 && Object.keys(api.invalid.b.fields || {}).length === 4, JSON.stringify(api.invalid.b.fields));
ok("server rejects instant bot submissions", api.tooFast.s === 400 && api.tooFast.b.error === "too_fast");

// No-JS form post: plain HTML answer, no personal data in the URL
const nojs = await page.evaluate(async () => {
  const r = await fetch("/api/enquiry", { method: "POST", body: new URLSearchParams({ name: "", business: "", reply: "", message: "" }) });
  return { s: r.status, type: r.headers.get("content-type"), url: r.url, html: (await r.text()).slice(0, 200) };
});
ok("no-JS post gets a readable HTML page", nojs.s === 422 && /text\/html/.test(nojs.type) && /A few details are missing/.test(nojs.html), `HTTP ${nojs.s} ${nojs.type}`);
ok("no-JS post keeps details out of the URL", !/\?/.test(nojs.url));

ok("no request left the machine during these checks", outbound.length === 0, outbound.join(", "));

await browser.close();
const failed = results.filter((r) => !r.pass).length;
console.log(`\n${results.length - failed}/${results.length} form checks passed`);
process.exit(failed ? 1 : 0);
