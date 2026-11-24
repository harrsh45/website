"use client";

import { useEffect } from "react";

/**
 * The signature move: the lamp switches on over each project as it rises into view.
 *
 * Every [data-lamp] element gets a --lit custom property from 0 to 1, driven by
 * its position in the viewport. It is a ratchet: light only ever comes on, so a
 * project never dims again after the visitor has seen it. CSS (globals.css, "the
 * lamp") turns --lit into the cone, the lifted veil and the pool of light.
 *
 * It only runs when the inline head script armed it (`lamp-armed`: JS on and no
 * reduced-motion preference). Otherwise every project is already fully lit.
 */
export default function LampLight() {
  useEffect(() => {
    const html = document.documentElement;
    if (!html.classList.contains("lamp-armed")) return;
    html.classList.add("lamp-ready");

    const pending = new Map<HTMLElement, number>();
    document.querySelectorAll<HTMLElement>("[data-lamp]").forEach((el) => {
      // Resume from any light already on (a remount must never dim a project).
      const already = parseFloat(el.style.getPropertyValue("--lit")) || 0;
      if (already < 1) pending.set(el, already);
    });

    let frame = 0;
    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      // The light starts as the top of a project enters the bottom of the screen
      // and is fully on by the time that top reaches the middle.
      const start = vh * 0.96;
      const end = vh * 0.5;
      for (const [el, prev] of pending) {
        const top = el.getBoundingClientRect().top;
        const p = Math.min(1, Math.max(0, (start - top) / (start - end)));
        if (p > prev) {
          pending.set(el, p);
          el.style.setProperty("--lit", p.toFixed(3));
        }
        if (p >= 1) pending.delete(el);
      }
      if (!pending.size) stop();
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const stop = () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      stop();
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
