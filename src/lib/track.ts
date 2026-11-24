/**
 * Meaningful-action analytics, and nothing else.
 *
 * No analytics script ships with the site, so by default every call is a no-op and
 * no visitor is tracked. If you add a privacy-friendly provider (see README
 * "Analytics"), these four events are forwarded to it:
 *   view_portfolio   the Work section scrolled into view (once per visit)
 *   open_preview     a project's live link was opened
 *   click_contact    an Instagram / email / "Start a project" action was used
 *   submit_enquiry   the enquiry form was sent successfully
 */
export type TrackEvent = "view_portfolio" | "open_preview" | "click_contact" | "submit_enquiry";

type Props = Record<string, string>;
type W = Window & {
  plausible?: (event: string, options?: { props?: Props }) => void;
  gtag?: (command: "event", event: string, params?: Props) => void;
};

export function track(event: TrackEvent, props?: Props) {
  if (typeof window === "undefined") return;
  const w = window as W;
  try {
    if (typeof w.plausible === "function") w.plausible(event, props ? { props } : undefined);
    else if (typeof w.gtag === "function") w.gtag("event", event, props);
  } catch {
    // Analytics must never break the page.
  }
}
