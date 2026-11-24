"use client";

import { useEffect } from "react";

type Instance = { destroy: () => void };

/**
 * Mounts the vendored, unmodified Scrollcraft engine on the page root.
 * The engine is a browser-only IIFE (it reads window/matchMedia at load), so it is
 * imported here, after hydration, never on the server.
 */
export default function ScrollcraftMount({ root = "[data-sc-root]" }: { root?: string }) {
  useEffect(() => {
    let instance: Instance | null = null;
    let cancelled = false;
    import("@/vendor/scrollcraft/scrollcraft.js")
      .then(() => {
        const engine = window.ScrollCraft;
        const el = document.querySelector(root);
        if (cancelled || !engine || !el) return;
        instance = engine.mount(el);
      })
      .catch(() => {
        // Fail open: drop the pre-hide so nothing stays invisible.
        document.documentElement.classList.remove("sc-armed");
      });
    return () => {
      cancelled = true;
      instance?.destroy();
    };
  }, [root]);

  return null;
}
