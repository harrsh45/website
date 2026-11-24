"use client";

import { useEffect } from "react";
import Lenis from "lenis";

const FOCUSABLE = "a[href],button,input,textarea,select,summary,[tabindex]";

/**
 * Lenis smooth scrolling (https://github.com/darkroomengineering/lenis).
 *
 * - Wheel and trackpad scrolling are smoothed. Touch is left native (`syncTouch: false`),
 *   so phones, including Instagram's in-app browser, scroll exactly as they normally do.
 * - Not started at all under prefers-reduced-motion: the page scrolls natively.
 * - Lenis writes the real window scroll position, so the Scrollcraft engine and
 *   LampLight keep reading `scrollY` as before.
 * - Same-page anchor links are handled here rather than with Lenis's `anchors`
 *   option: that option scrolls without cancelling the browser's own jump (the two
 *   fight for a frame) and leaves keyboard focus behind. Here the jump is cancelled,
 *   Lenis glides to the target (respecting scroll-padding and scroll-margin), the URL
 *   hash is updated, and focus moves to the target so the skip link works.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      autoRaf: true,
      smoothWheel: true,
      syncTouch: false,
      allowNestedScroll: true, // e.g. the enquiry textarea and the mobile project index
      stopInertiaOnNavigate: true,
    });

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!link || (link.target && link.target !== "_self")) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || !url.hash) return;
      const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!target) return;

      e.preventDefault();
      if (window.location.hash !== url.hash) history.pushState(null, "", url.hash);
      lenis.scrollTo(target, {
        onComplete: () => {
          if (!target.matches(FOCUSABLE)) target.setAttribute("tabindex", "-1");
          target.focus({ preventScroll: true });
        },
      });
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      lenis.destroy();
    };
  }, []);

  return null;
}
