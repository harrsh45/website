import Image from "next/image";
import { hostOf, type Project } from "@/data/projects";
import { ArrowUpRight, Lock } from "./icons";
import TestimonialVideo from "./TestimonialVideo";

export type PieceLayout = "feature" | "left" | "right" | "wide";

export function StatusLabel({ status }: { status: Project["status"] }) {
  return status === "client" ? (
    <p className="status status--client">
      <span className="status__dot" aria-hidden="true" />
      Completed client website
    </p>
  ) : (
    <p className="status status--preview">
      <span className="status__dot" aria-hidden="true" />
      Website preview
    </p>
  );
}

function OpenLink({ project, size }: { project: Project; size?: "sm" }) {
  const label = project.status === "client" ? "Open live website" : "Explore preview";
  return (
    <a
      className={`btn btn--line${size === "sm" ? " btn--sm" : ""}`}
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      data-track="open_preview"
      data-track-id={project.slug}
    >
      {label}
      <ArrowUpRight />
      <span className="sr-only"> for {project.title} (opens in a new tab)</span>
    </a>
  );
}

function Label({ project, compact }: { project: Project; compact?: boolean }) {
  const meta = [project.category, project.location].filter(Boolean).join(" · ");
  const titleId = `${project.slug}-title`;
  return (
    <div className="label">
      <StatusLabel status={project.status} />
      <h3 id={titleId} className={`display ${compact ? "display--sm" : "display--md"} label__title`}>
        {project.title}
      </h3>
      <p className="label__meta">{meta}</p>
      <p className="label__desc">{project.description}</p>
      <div className="label__actions">
        <OpenLink project={project} size={compact ? "sm" : undefined} />
        <a className="textlink" href="#contact" data-similar={project.title}>
          Want something similar?
        </a>
      </div>
      {project.status === "preview" && (
        <p className="label__note">Independent design concept. Not an official collaboration with the featured business.</p>
      )}
    </div>
  );
}

function BrowserFrame({ project, sizes }: { project: Project; sizes: string }) {
  return (
    <a
      className="frame frame--browser"
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      // Mouse/touch shortcut to the same link as the labelled button; keyboard users
      // get one tab stop (the button). The image alt still describes the screenshot.
      tabIndex={-1}
      data-track="open_preview"
      data-track-id={project.slug}
    >
      <span className="frame__bar">
        <Lock />
        <span>{hostOf(project.url)}</span>
      </span>
      <span className="frame__screen">
        <Image src={project.thumbnail} alt={project.alt.desktop} fill sizes={sizes} quality={82} />
        <span className="veil" />
      </span>
    </a>
  );
}

export function PhoneFrame({
  project,
  sizes,
  priority,
}: {
  project: Project;
  sizes: string;
  priority?: boolean;
}) {
  if (!project.mobileThumbnail) return null;
  return (
    <span className="phone">
      <span className="frame__screen">
        <Image
          src={project.mobileThumbnail}
          alt={project.alt.mobile ?? ""}
          fill
          sizes={sizes}
          quality={82}
          priority={priority}
        />
        <span className="veil" />
      </span>
    </span>
  );
}

/** The client's own video and words, under the same lamp as their website. */
function Testimony({ project }: { project: Project }) {
  const t = project.testimonial;
  if (!t) return null;
  return (
    <figure className="testimony" aria-label={`Testimonial from ${t.name}, ${project.title}`}>
      <div className="testimony__stage" data-lamp>
        <span className="cone" aria-hidden="true" />
        <span className="pool" aria-hidden="true" />
        <TestimonialVideo testimonial={t} />
      </div>
      <figcaption className="testimony__words" data-sc-in>
        <p className="eyebrow">In {t.name}&rsquo;s own words</p>
        <blockquote className="testimony__quote">
          <p className="display display--md">&ldquo;{t.quote}&rdquo;</p>
        </blockquote>
        <p className="testimony__by">
          <strong>{t.name}</strong>, {project.title}
        </p>
        <details className="testimony__transcript">
          <summary>Read the full transcript</summary>
          <p>{t.transcript}</p>
        </details>
      </figcaption>
    </figure>
  );
}

/** A featured project: desktop and phone captures under the lamp, label alongside. */
export function ProjectPiece({ project, layout }: { project: Project; layout: PieceLayout }) {
  const testimony = project.status === "client" && project.testimonial ? " piece--testimony" : "";
  return (
    <li
      id={`work-${project.slug}`}
      className={`piece piece--${layout}${testimony}`}
      aria-labelledby={`${project.slug}-title`}
    >
      <div className="piece__stage" data-lamp>
        <div className="piece__browser">
          <span className="cone" aria-hidden="true" />
          <span className="pool" aria-hidden="true" />
          <BrowserFrame project={project} sizes="(max-width: 860px) 66vw, (max-width: 1280px) 52vw, 760px" />
        </div>
        <div className="piece__phone">
          <PhoneFrame project={project} sizes="(max-width: 860px) 52vw, 220px" />
        </div>
      </div>
      <div className="piece__label" data-sc-in>
        <Label project={project} />
      </div>
      {testimony && <Testimony project={project} />}
    </li>
  );
}

/** A secondary project: one desktop capture under a smaller lamp, label below. */
export function CompactPiece({ project }: { project: Project }) {
  return (
    <li id={`work-${project.slug}`} className="compact" aria-labelledby={`${project.slug}-title`}>
      <div className="compact__stage" data-lamp>
        <div className="compact__frame">
          <span className="cone" aria-hidden="true" />
          <span className="pool" aria-hidden="true" />
          <BrowserFrame project={project} sizes="(max-width: 720px) 92vw, (max-width: 1280px) 44vw, 580px" />
        </div>
      </div>
      <div data-sc-in>
        <Label project={project} compact />
      </div>
    </li>
  );
}
