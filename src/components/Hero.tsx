import type { Project } from "@/data/projects";
import { site } from "@/data/site";
import { ArrowDown, Instagram } from "./icons";
import { PhoneFrame } from "./ProjectPiece";

const POSITIONS = ["center", "left", "right"] as const;
const DEPTH = { center: "0.55", left: "-0.5", right: "-1.1" } as const; // parallax rates (x100 px)

export default function Hero({ phones }: { phones: Project[] }) {
  return (
    <section id="top" className="hero ground-paper" data-sc-act="flow" aria-labelledby="hero-title">
      <div className="wrap hero__grid">
        <div className="hero__copy">
          {/* The supplied logo animation (laptop opens, lamp switches on), played once and held
              lit. Reduced motion gets the lit frame as a still. Canvas colour matches the page. */}
          <picture className="hero__lamp">
            <source srcSet="/brand/lamp-lit.webp" media="(prefers-reduced-motion: reduce)" type="image/webp" />
            <img
              src="/brand/lamp-switch-on.webp"
              width={512}
              height={512}
              alt="The Lumen Desk logo: a desk lamp switching on over a laptop"
              decoding="async"
            />
          </picture>
          <p className="eyebrow">Independent website design studio</p>
          <h1 id="hero-title" className="display display--xl">
            Make your first impression <em>worth remembering.</em>
          </h1>
          <p className="lead">
            Thoughtfully designed, custom-built websites for beauty studios and independent businesses that care
            about how they show up online.
          </p>
          <div className="hero__actions">
            <a className="btn btn--amber" href="#work">
              Explore the websites
              <ArrowDown />
            </a>
            <a
              className="btn btn--line"
              href={site.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              data-track="click_contact"
              data-track-id="hero-instagram"
            >
              <Instagram />
              Message on Instagram
            </a>
          </div>
        </div>

        {phones.length > 0 && (
          <div className="desk">
            <div className="desk__glow" data-sc-parallax="-1.6" aria-hidden="true" />
            {phones.slice(0, 3).map((p, i) => {
              const pos = POSITIONS[i];
              return (
                <a
                  key={p.slug}
                  href={`#work-${p.slug}`}
                  className={`desk__phone desk__phone--${pos}`}
                  data-sc-parallax={DEPTH[pos]}
                  aria-label={`${p.title}: see it in the work below`}
                  // Pointer shortcut only: the project index in #work gives keyboard users
                  // the same jumps without three extra tab stops before the work.
                  tabIndex={-1}
                >
                  <span className="desk__tilt">
                    <PhoneFrame project={p} sizes="(max-width: 860px) 42vw, 260px" priority={i === 0} />
                  </span>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
