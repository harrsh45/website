// Types for the vendored engine (scrollcraft.js is a side-effect IIFE that sets window.ScrollCraft).
// This file is ours; the engine itself is unmodified.
export {};

declare global {
  interface Window {
    ScrollCraft?: {
      mount: (root?: Element | string | Document, opts?: { lerp?: number }) => { destroy: () => void; layout: () => void };
      reduce: boolean;
      instances: unknown[];
    };
  }
}
