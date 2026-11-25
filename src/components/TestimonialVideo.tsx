"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import type { Testimonial } from "@/data/projects";
import { Play } from "./icons";

const noop = () => () => {};

/**
 * A client's video testimonial in a phone frame.
 *
 * Nothing downloads until the visitor presses play (preload="none"; only the poster
 * loads). Before hydration, or with JS off, the browser's own controls are shown, so
 * the video always plays. Once hydrated, a single large play button sits over the
 * poster instead; the native controls come back as soon as it starts. Captions are
 * on by default: most people scroll Instagram-style with the sound off.
 */
export default function TestimonialVideo({ testimonial: t }: { testimonial: Testimonial }) {
  const ref = useRef<HTMLVideoElement>(null);
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const [started, setStarted] = useState(false);

  const play = () => {
    const v = ref.current;
    if (!v) return;
    setStarted(true);
    v.play().catch(() => {
      // Autoplay rules can't block a click, but a failed network fetch can: leave
      // the native controls up so the visitor can retry.
    });
    // The button is about to disappear: keep keyboard focus on the player.
    requestAnimationFrame(() => v.focus());
  };

  const reset = () => {
    // Back to the poster and the big play button for a replay.
    setStarted(false);
    ref.current?.load();
  };

  return (
    <div className="tvideo">
      <video
        ref={ref}
        controls={!hydrated || started}
        preload="none"
        playsInline
        poster={t.video.poster}
        width={t.video.width}
        height={t.video.height}
        onEnded={reset}
        aria-label={`Video testimonial from ${t.name}`}
      >
        <source src={t.video.src} type="video/mp4" />
        <track kind="captions" src={t.video.captions} srcLang="en" label="English" default />
      </video>
      <span className="veil" />
      {hydrated && !started && (
        <button type="button" className="tvideo__play" onClick={play}>
          <span className="tvideo__icon" aria-hidden="true">
            <Play />
          </span>
          <span className="tvideo__text">
            <span className="sr-only">Play {t.name}&rsquo;s video testimonial, </span>
            <span aria-hidden="true">Watch &middot; </span>
            {t.duration}
          </span>
        </button>
      )}
    </div>
  );
}
