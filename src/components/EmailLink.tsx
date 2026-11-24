"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { site } from "@/data/site";

const FINE_POINTER = "(hover: hover) and (pointer: fine)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(FINE_POINTER);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const hasFinePointer = () => window.matchMedia(FINE_POINTER).matches;

/**
 * An email link that still works when the visitor has no email app set up.
 *
 * `mailto:` only opens something if the device has a mail handler. Phones almost
 * always do, so on touch devices this stays a plain one-tap mailto link. On
 * computers many people only use webmail and a mailto click silently does nothing,
 * so there the link opens a small menu instead: your email app, Gmail, Outlook, or
 * copy the address. Without JavaScript it is a plain mailto link everywhere.
 */
export default function EmailLink({
  className,
  children,
  subject = "Website enquiry",
  trackId,
  placement = "above",
}: {
  className?: string;
  children: ReactNode;
  subject?: string;
  trackId: string;
  placement?: "below" | "above";
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const wrap = useRef<HTMLSpanElement>(null);
  const trigger = useRef<HTMLAnchorElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const id = useId();
  // Server render and phones: a plain mailto link. Computers: a disclosure with options.
  const asMenu = useSyncExternalStore(subscribe, hasFinePointer, () => false);

  const s = encodeURIComponent(subject);
  const to = encodeURIComponent(site.email);
  const mailto = `mailto:${site.email}?subject=${s}`;
  const gmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${s}`;
  const outlook = `https://outlook.live.com/mail/0/deeplink/compose?to=${to}&subject=${s}`;

  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector<HTMLElement>("a,button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    const onDown = (e: PointerEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(site.email);
    } catch {
      // Older or locked-down browsers: fall back to a temporary selection.
      const t = document.createElement("textarea");
      t.value = site.email;
      t.setAttribute("readonly", "");
      t.style.position = "fixed";
      t.style.opacity = "0";
      document.body.appendChild(t);
      t.select();
      document.execCommand("copy");
      t.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2400);
  }

  return (
    <span ref={wrap} className={`email-link email-link--${placement}`}>
      <a
        ref={trigger}
        href={mailto}
        className={className}
        aria-expanded={asMenu ? open : undefined}
        aria-controls={asMenu ? id : undefined}
        data-track="click_contact"
        data-track-id={trackId}
        onClick={(e) => {
          // Phones and tablets: let mailto open the mail app directly.
          if (!asMenu) return;
          e.preventDefault();
          setOpen((o) => !o);
        }}
      >
        {children}
      </a>
      {open && (
        <div ref={panel} id={id} className="email-link__panel" role="group" aria-label={`Ways to email ${site.email}`}>
          <a href={mailto} data-track="click_contact" data-track-id={`${trackId}-app`} onClick={() => setOpen(false)}>
            Open your email app
          </a>
          <a href={gmail} target="_blank" rel="noopener noreferrer" data-track="click_contact" data-track-id={`${trackId}-gmail`}>
            Write in Gmail
          </a>
          <a href={outlook} target="_blank" rel="noopener noreferrer" data-track="click_contact" data-track-id={`${trackId}-outlook`}>
            Write in Outlook
          </a>
          <button type="button" onClick={copy}>
            {copied ? "Copied" : "Copy address"}
          </button>
          <p className="email-link__address" aria-live="polite">
            {copied ? `${site.email} is on your clipboard` : site.email}
          </p>
        </div>
      )}
    </span>
  );
}
