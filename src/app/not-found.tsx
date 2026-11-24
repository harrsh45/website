import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { site } from "@/data/site";
import { Instagram } from "@/components/icons";

export const metadata: Metadata = {
  title: "Page not found | The Lumen Desk",
  robots: { index: false, follow: true },
};

/**
 * 404. The supplied animation's first frame (lamp off, laptop closed) as a still:
 * nothing is lit here, and the way back leads to the work, where everything is.
 */
export default function NotFound() {
  return (
    <main className="lost ground-paper">
      <div className="wrap lost__inner">
        <Link className="brand lost__brand" href="/">
          <Image className="brand__mark" src="/brand/logo-256.webp" alt="" width={36} height={36} unoptimized />
          <span className="brand__word">THE LUMEN DESK</span>
        </Link>
        <Image
          className="lost__lamp"
          src="/brand/lamp-off.webp"
          alt="The Lumen Desk lamp, switched off over a closed laptop"
          width={512}
          height={512}
          unoptimized
          priority
        />
        <h1 className="display display--lg">Nothing on the desk here.</h1>
        <p className="lead">
          This page has moved, or never existed. The websites are still where they were.
        </p>
        <div className="hero__actions">
          <Link className="btn btn--amber" href="/#work">
            See the work
          </Link>
          <a className="btn btn--line" href={site.instagram.url} target="_blank" rel="noopener noreferrer">
            <Instagram />
            Message on Instagram
          </a>
        </div>
      </div>
    </main>
  );
}
