import type { Project } from "@/data/projects";
import { CompactPiece, ProjectPiece, type PieceLayout } from "./ProjectPiece";

// Art-directed rhythm. The first piece is the peak (full width); after it: image right,
// image left, wide; repeat. Never more than two image-left/right alternations in a row.
const RHYTHM: PieceLayout[] = ["right", "left", "wide"];
const layoutFor = (i: number): PieceLayout => (i === 0 ? "feature" : RHYTHM[(i - 1) % RHYTHM.length]);

export default function Work({ featured, more }: { featured: Project[]; more: Project[] }) {
  const all = [...featured, ...more];
  if (!all.length) return null;
  const hasClient = all.some((p) => p.status === "client");
  const hasPreview = all.some((p) => p.status === "preview");

  return (
    <section id="work" className="work ground-navy" aria-labelledby="work-title">
      <div className="wrap">
        <div className="work__intro" data-sc-in data-sc-stagger="70">
          <h2 id="work-title" className="display display--lg">
            See what I&rsquo;ve built.
          </h2>
          <p className="lead">
            Every project below is clickable. Open the live sites, scroll through the pages, and picture what your
            business could look like online.
          </p>
          <div className="legend" aria-label="What the labels mean">
            {hasClient && (
              <p className="status status--client">
                <span className="status__dot" aria-hidden="true" />
                Completed client work
              </p>
            )}
            {hasPreview && (
              <p className="status status--preview">
                <span className="status__dot" aria-hidden="true" />
                Website concepts &amp; previews
              </p>
            )}
          </div>
          {hasPreview && (
            <p className="small">
              Previews are independent designs I built to show what&rsquo;s possible for a business. They aren&rsquo;t
              official collaborations with the businesses featured.
            </p>
          )}
          <nav className="index" aria-label="Projects on this page">
            <p className="index__label">Jump to a project</p>
            <ol>
              {all.map((p) => (
                <li key={p.slug}>
                  <a href={`#work-${p.slug}`}>
                    <span className={`status status--${p.status}`} aria-hidden="true">
                      <span className="status__dot" />
                    </span>
                    {p.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        {featured.length > 0 && (
          <ol className="pieces" aria-label="Featured websites">
            {featured.map((p, i) => (
              <ProjectPiece key={p.slug} project={p} layout={layoutFor(i)} />
            ))}
          </ol>
        )}

        <aside className="interlude" aria-label="Start a project" data-sc-in>
          <p className="display display--sm">Like what you&rsquo;re seeing? Let&rsquo;s make something for your business.</p>
          <a className="btn btn--amber" href="#contact" data-track="click_contact" data-track-id="interlude">
            Start a project
          </a>
        </aside>

        {more.length > 0 && (
          <div className="more">
            <div className="more__head" data-sc-in>
              <h3 className="display display--md">More to explore</h3>
              <p className="body">
                Beauty therapy, hair, photography and fitness: the same care, for different kinds of business.
              </p>
            </div>
            <ul className="more__grid" aria-label="More website previews">
              {more.map((p) => (
                <CompactPiece key={p.slug} project={p} />
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
