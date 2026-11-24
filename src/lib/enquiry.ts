/** Enquiry form validation, shared by the browser form and the server route. */

export type EnquiryInput = {
  name: string;
  business: string;
  reply: string;
  message: string;
};
export type EnquiryField = keyof EnquiryInput;
export type FieldErrors = Partial<Record<EnquiryField, string>>;

export const LIMITS: Record<EnquiryField, number> = { name: 100, business: 200, reply: 200, message: 2000 };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const looksLikeEmail = (v: string) => EMAIL.test(v.trim());

const clean = (v: unknown) =>
  typeof v === "string" ? v.replace(/\r\n/g, "\n").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim() : "";

export function validateEnquiry(
  raw: Record<string, unknown>,
): { ok: true; data: EnquiryInput } | { ok: false; errors: FieldErrors } {
  const data: EnquiryInput = {
    name: clean(raw.name),
    business: clean(raw.business),
    reply: clean(raw.reply),
    message: clean(raw.message),
  };
  const errors: FieldErrors = {};

  if (!data.name) errors.name = "Please tell me your name.";
  if (!data.business) errors.business = "Add your business name, Instagram handle or current website.";
  if (!data.reply) errors.reply = "Add an email or Instagram handle so I can reply.";
  // "@handle" is an Instagram handle; an "@" anywhere else means it must be a real email.
  else if (data.reply.indexOf("@") > 0 && !looksLikeEmail(data.reply))
    errors.reply = "That email address doesn’t look quite right.";
  if (!data.message) errors.message = "Tell me a little about the website you’re after.";
  else if (data.message.length < 10) errors.message = "A few more words would help me reply properly.";

  (Object.keys(LIMITS) as EnquiryField[]).forEach((k) => {
    if (data[k].length > LIMITS[k]) errors[k] = `Please keep this under ${LIMITS[k]} characters.`;
  });

  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, data };
}
