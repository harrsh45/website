"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Close, Menu } from "./icons";

const LINKS = [
  { href: "#work", label: "Work" },
  { href: "#services", label: "Services" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  return (
    <header ref={ref} className="site-header" data-menu={open ? "open" : "closed"}>
      <div className="wrap site-header__inner">
        <a className="brand" href="#top" aria-label="The Lumen Desk, back to top">
          <Image
            className="brand__mark"
            src="/brand/logo-256.webp"
            alt=""
            width={36}
            height={36}
            unoptimized
            priority
          />
          <span className="brand__word">
            <span>THE LUMEN</span> <span>DESK</span>
          </span>
        </a>

        <nav className="nav" id="site-nav" aria-label="Main">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
        </nav>

        <a className="btn btn--amber btn--sm" href="#contact" data-track="click_contact" data-track-id="header">
          Start a project
        </a>

        <button
          type="button"
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="site-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <Close /> : <Menu />}
        </button>
      </div>
    </header>
  );
}
