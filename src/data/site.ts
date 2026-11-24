/**
 * Studio facts used across the site. Every value here was supplied by the founder
 * (see the build brief). Change them here and nowhere else.
 */
export const site = {
  name: "The Lumen Desk",
  url: "https://thelumendesk.com",
  domain: "thelumendesk.com",
  email: "harsh@thelumendesk.com",
  founder: "Harsh Padhiyar",
  founderFirstName: "Harsh",
  instagram: {
    handle: "@the.lumen.desk",
    url: "https://www.instagram.com/the.lumen.desk/",
  },
  basedIn: "Mumbai, India",
  title: "The Lumen Desk | Custom Websites for Independent Businesses",
  description:
    "Explore custom website designs and working previews by The Lumen Desk. Beautiful, mobile-friendly websites for beauty brands, studios, and independent businesses.",
  /**
   * When true, only projects with `rightsCleared: true` are shown publicly.
   * Set NEXT_PUBLIC_REQUIRE_RIGHTS_CLEARANCE=true once you have recorded which
   * projects you have permission to show (see README "Before you go live").
   */
  requireRightsClearance: process.env.NEXT_PUBLIC_REQUIRE_RIGHTS_CLEARANCE === "true",
} as const;
