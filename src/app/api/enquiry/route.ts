import { NextResponse, type NextRequest } from "next/server";
import { validateEnquiry } from "@/lib/enquiry";
import { isEnquiryConfigured, sendEnquiry } from "@/lib/enquiry-server";
import { site } from "@/data/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Best-effort rate limit: 5 enquiries per 10 minutes per IP, per server instance.
// (On serverless hosts instances are not shared; the honeypot and timing check do most of the work.)
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

const wantsJson = (req: NextRequest) => (req.headers.get("content-type") || "").includes("application/json");

/** Plain HTML reply for the no-JavaScript form post, so personal data never lands in a URL. */
function htmlPage(title: string, body: string, status: number) {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} | The Lumen Desk</title><meta name="robots" content="noindex"><style>body{font:18px/1.6 system-ui,sans-serif;background:#f4f3f0;color:#132237;display:grid;place-items:center;min-height:100vh;margin:0;padding:24px}main{max-width:32rem}a{color:#132237;font-weight:600}</style></head><body><main><h1>${title}</h1><p>${body}</p><p><a href="/#contact">Back to The Lumen Desk</a></p></main></body></html>`;
  return new NextResponse(html, { status, headers: { "Content-Type": "text/html; charset=utf-8" } });
}

function reply(req: NextRequest, status: number, payload: Record<string, unknown>, html: [string, string]) {
  return wantsJson(req) ? NextResponse.json(payload, { status }) : htmlPage(html[0], html[1], status);
}

export async function POST(req: NextRequest) {
  const fallback = `Please email ${site.email} or message ${site.instagram.handle} on Instagram instead.`;

  if (!isEnquiryConfigured()) {
    return reply(req, 503, { ok: false, error: "not_configured" }, ["The form isn’t available", fallback]);
  }

  // Same-origin posts only.
  const origin = req.headers.get("origin");
  if (origin && new URL(origin).host !== req.nextUrl.host) {
    return reply(req, 403, { ok: false, error: "forbidden" }, ["Something went wrong", fallback]);
  }

  let raw: Record<string, unknown> = {};
  try {
    raw = wantsJson(req) ? await req.json() : Object.fromEntries((await req.formData()).entries());
  } catch {
    return reply(req, 400, { ok: false, error: "bad_request" }, ["Something went wrong", fallback]);
  }

  // Spam controls: a hidden field people never fill, and a minimum time on the form.
  if (typeof raw.website === "string" && raw.website.trim() !== "") {
    return reply(req, 400, { ok: false, error: "rejected" }, ["Something went wrong", fallback]);
  }
  const started = Number(raw.t);
  if (Number.isFinite(started) && started > 0 && Date.now() - started < 2500) {
    return reply(req, 400, { ok: false, error: "too_fast" }, ["Something went wrong", fallback]);
  }

  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
  if (limited(ip)) {
    return reply(req, 429, { ok: false, error: "rate_limited" }, ["Please try again later", fallback]);
  }

  const result = validateEnquiry(raw);
  if (!result.ok) {
    return reply(req, 422, { ok: false, error: "invalid", fields: result.errors }, [
      "A few details are missing",
      "Please go back and check the form. " + fallback,
    ]);
  }

  const sent = await sendEnquiry(result.data);
  if (!sent.ok) {
    console.error("enquiry delivery failed:", sent.reason);
    return reply(req, 502, { ok: false, error: "delivery_failed" }, ["Your message wasn’t sent", fallback]);
  }

  return reply(req, 200, { ok: true }, [
    "Thank you, your message was sent",
    "I’ll reply as soon as I can, using the contact details you gave.",
  ]);
}
