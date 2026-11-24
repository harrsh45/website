// Server code only (imported by the API route and server components; reads secrets).
import { site } from "@/data/site";
import { looksLikeEmail, type EnquiryInput } from "./enquiry";

/**
 * Enquiries are delivered by email through Resend (https://resend.com), using its
 * HTTP API directly (no SDK). The form is only shown when this is configured:
 *
 *   RESEND_API_KEY       API key from Resend
 *   ENQUIRY_FROM_EMAIL   a sender on a domain verified in Resend,
 *                        e.g. "The Lumen Desk <website@thelumendesk.com>"
 *   ENQUIRY_TO_EMAIL     optional, defaults to the studio email
 */
export function isEnquiryConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.ENQUIRY_FROM_EMAIL);
}

export async function sendEnquiry(data: EnquiryInput): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!isEnquiryConfigured()) return { ok: false, reason: "not_configured" };

  const to = process.env.ENQUIRY_TO_EMAIL || site.email;
  const text = [
    `New website enquiry from ${site.domain}`,
    "",
    `Name: ${data.name}`,
    `Business / Instagram / website: ${data.business}`,
    `Reply to: ${data.reply}`,
    "",
    data.message,
  ].join("\n");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.ENQUIRY_FROM_EMAIL,
        to: [to],
        subject: `Website enquiry: ${data.business}`.slice(0, 140),
        text,
        ...(looksLikeEmail(data.reply) ? { reply_to: data.reply } : {}),
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return { ok: false, reason: `provider_${res.status}` };
    return { ok: true };
  } catch {
    return { ok: false, reason: "provider_unreachable" };
  }
}
