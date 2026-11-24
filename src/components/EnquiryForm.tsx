"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { LIMITS, validateEnquiry, type EnquiryField, type FieldErrors } from "@/lib/enquiry";
import { track } from "@/lib/track";
import { site } from "@/data/site";

type State = "idle" | "sending" | "sent" | "error";

const FIELDS: { name: EnquiryField; label: string; hint?: string; type?: string; autoComplete?: string }[] = [
  { name: "name", label: "Your name", autoComplete: "name" },
  { name: "business", label: "Business name", hint: "Or your Instagram handle or current website" },
  { name: "reply", label: "Where should I reply?", hint: "Email address or Instagram handle", autoComplete: "email" },
];

export default function EnquiryForm() {
  const [state, setState] = useState<State>("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const startedAt = useRef(0);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    startedAt.current = Date.now();
    const onSimilar = (e: Event) => {
      const title = (e as CustomEvent<string>).detail;
      const box = messageRef.current;
      if (box && !box.value.trim()) box.value = `I’d like something similar to ${title}. `;
    };
    window.addEventListener("lumen:similar", onSimilar);
    return () => window.removeEventListener("lumen:similar", onSimilar);
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const raw = Object.fromEntries(new FormData(form).entries());
    const check = validateEnquiry(raw);
    if (!check.ok) {
      setErrors(check.errors);
      const first = Object.keys(check.errors)[0];
      form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setErrors({});
    setState("sending");
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...check.data, website: raw.website, t: startedAt.current }),
      });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; fields?: FieldErrors };
      if (res.ok && body.ok) {
        setState("sent");
        track("submit_enquiry");
        form.reset();
      } else {
        if (body.fields) setErrors(body.fields);
        setState("error");
      }
    } catch {
      setState("error");
    }
    requestAnimationFrame(() => statusRef.current?.focus());
  }

  return (
    <form method="post" action="/api/enquiry" onSubmit={onSubmit} noValidate aria-describedby="enquiry-privacy">
      {FIELDS.map((f) => (
        <div className="field" key={f.name}>
          <label htmlFor={`f-${f.name}`}>
            {f.label} {f.hint && <span className="hint">({f.hint})</span>}
          </label>
          <input
            id={`f-${f.name}`}
            name={f.name}
            type={f.type || "text"}
            autoComplete={f.autoComplete}
            maxLength={LIMITS[f.name]}
            required
            aria-invalid={errors[f.name] ? true : undefined}
            aria-describedby={errors[f.name] ? `e-${f.name}` : undefined}
          />
          {errors[f.name] && (
            <p className="field__error" id={`e-${f.name}`}>
              {errors[f.name]}
            </p>
          )}
        </div>
      ))}
      <div className="field">
        <label htmlFor="f-message">What kind of website are you looking for?</label>
        <textarea
          id="f-message"
          name="message"
          ref={messageRef}
          maxLength={LIMITS.message}
          required
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? "e-message" : undefined}
        />
        {errors.message && (
          <p className="field__error" id="e-message">
            {errors.message}
          </p>
        )}
      </div>
      {/* Spam trap: hidden from people, often filled by bots. */}
      <div className="hp" aria-hidden="true">
        <label htmlFor="f-website">Leave this empty</label>
        <input id="f-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <button className="btn btn--amber" type="submit" disabled={state === "sending"}>
          {state === "sending" ? "Sending…" : "Send message"}
        </button>
      </div>

      <p ref={statusRef} tabIndex={-1} aria-live="polite" className={state === "sent" ? "form-status form-status--ok" : state === "error" ? "form-status form-status--error" : "sr-only"}>
        {state === "sent" && "Thank you, your message was sent. I’ll reply as soon as I can."}
        {state === "error" &&
          `Your message wasn’t sent. Please check the form, or email ${site.email} or message ${site.instagram.handle} on Instagram instead.`}
      </p>
      <p id="enquiry-privacy" className="small">
        Your details go straight to my inbox and are only used to reply to you.
      </p>
    </form>
  );
}
