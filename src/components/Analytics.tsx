"use client";

import { useEffect } from "react";
import { track, type TrackEvent } from "@/lib/track";

const EVENTS: TrackEvent[] = ["open_preview", "click_contact"];

/**
 * Forwards the meaningful actions to `track()` (a no-op unless an analytics provider
 * is added). Links opt in declaratively: data-track="open_preview" data-track-id="slug".
 * Also wires "Want something similar?" links to prefill the enquiry form, if present.
 */
export default function Analytics() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>("[data-track],[data-similar]");
      if (!el) return;
      const ev = el.dataset.track as TrackEvent | undefined;
      if (ev && EVENTS.includes(ev)) track(ev, el.dataset.trackId ? { id: el.dataset.trackId } : undefined);
      if (el.dataset.similar) {
        window.dispatchEvent(new CustomEvent("lumen:similar", { detail: el.dataset.similar }));
      }
    };
    document.addEventListener("click", onClick);

    let io: IntersectionObserver | null = null;
    const work = document.getElementById("work");
    if (work && "IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => {
          if (entries.some((x) => x.isIntersecting)) {
            track("view_portfolio");
            io?.disconnect();
          }
        },
        { threshold: 0.15 },
      );
      io.observe(work);
    }
    return () => {
      document.removeEventListener("click", onClick);
      io?.disconnect();
    };
  }, []);

  return null;
}
