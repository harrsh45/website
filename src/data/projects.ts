/**
 * Portfolio inventory: the single source of truth for every project on the site.
 *
 * Editing rules (see README "Editing projects"):
 * - Never invent projects, clients, testimonials, results or dates.
 * - `status: "client"` only for work a business actually commissioned and paid for.
 *   Everything else is `"preview"` and is labelled as an independent concept.
 * - `available` reflects the last link check. Unavailable projects are kept here
 *   but never rendered.
 * - `rightsCleared` records whether the founder has confirmed permission to publish
 *   screenshots and names for that project. See `site.requireRightsClearance`.
 * - Screenshots in /public/projects are real captures made by `npm run capture`.
 * - `group` + `order` set where a project appears. Order was art-directed after
 *   reviewing the captures on 2026-11-22 (strongest, most relevant first).
 */

export type ProjectStatus = "client" | "preview";
export type ProjectGroup = "featured" | "more" | "hidden";

export type Project = {
  slug: string;
  title: string;
  /** Short, factual category label shown on the card. */
  category: string;
  /** Where the business in the project is based, as stated on that site. */
  location?: string;
  status: ProjectStatus;
  /** The exact link visitors open. */
  url: string;
  /** Other known deployments of the same project (internal reference only). */
  altUrls?: string[];
  /** One sentence about what was built, based on features visible in the site. */
  description: string;
  thumbnail: string;
  /** A second real capture, one screen down the homepage. Only kept where it lands cleanly. */
  thumbnailMid?: string;
  mobileThumbnail?: string;
  alt: { desktop: string; mobile?: string };
  group: ProjectGroup;
  order: number;
  featured: boolean;
  /** Link responded with the real site on the last check (see lastChecked). */
  available: boolean;
  /** Founder has confirmed permission to publish this project's screenshots/branding. */
  rightsCleared: boolean;
  lastChecked: string;
  /**
   * A real video testimonial the client recorded. Only for `status: "client"`.
   * `quote` and `transcript` must be the client's own words, word for word, from
   * the video (the captions file is the timed version of the same transcript).
   */
  testimonial?: Testimonial;
  /** Internal notes. Never rendered. */
  notes?: string;
};

export type Testimonial = {
  /** Who is speaking, as they introduce themselves in the video. */
  name: string;
  /** The line pulled out beside the video: an exact sentence from it. */
  quote: string;
  /** Everything said in the video, for people who can't or won't play it. */
  transcript: string;
  video: { src: string; poster: string; captions: string; width: number; height: number };
  /** Spoken length shown on the play button, e.g. "30 sec". */
  duration: string;
};

const CHECKED = "2026-11-22";

export const projects: Project[] = [
  {
    slug: "sarah-ollivierre-beauty",
    title: "Sarah Ollivierre Beauty",
    category: "Nail & beauty studio",
    location: "Brixton, London",
    status: "client",
    url: "https://sarahollivierrebeauty.co.uk/",
    altUrls: ["https://sarahollivierrebeauty.vercel.app/"],
    description:
      "A polished online home for a London beauty studio, with treatment information, galleries, and clear booking and training enquiry paths.",
    thumbnail: "/projects/sarah-ollivierre-beauty-desktop.webp",
    thumbnailMid: "/projects/sarah-ollivierre-beauty-desktop-mid.webp",
    mobileThumbnail: "/projects/sarah-ollivierre-beauty-mobile.webp",
    alt: {
      desktop:
        "Homepage of the Sarah Ollivierre Beauty website on desktop: a close-up of deep red nails beside the headline “Nails with intention. Beauty with precision.”",
      mobile:
        "The Sarah Ollivierre Beauty website on a phone, with Book a treatment and Explore services buttons",
    },
    group: "featured",
    order: 1,
    featured: true,
    available: true,
    rightsCleared: false,
    lastChecked: CHECKED,
    testimonial: {
      name: "Sarah",
      quote: "He was very friendly and easy to communicate with.",
      transcript:
        "Hello, my name is Sarah. I worked with Harsh to create my website for Sarah Ollivierre Beauty. He was very organised in helping me to send over all of my information for the website. He used Google Drive, which helped me within my busy diary to make sure that all the information was sent over to him. Thank you very much, Harsh. He was very friendly and easy to communicate with.",
      video: {
        src: "/video/sarah-testimonial.mp4",
        poster: "/video/sarah-testimonial-poster.jpg",
        captions: "/video/sarah-testimonial.vtt",
        width: 720,
        height: 1280,
      },
      duration: "30 sec",
    },
    notes:
      "Completed, paid UK client website. Custom domain verified live on 2026-11-22. Confirm the client is happy to be shown publicly. Video testimonial recorded by Sarah on 2026-11-23 (source: Sarah Testimony.mov, kept out of git); transcript made locally with Whisper and corrected for the business name. No results claims.",
  },
  {
    slug: "bels-beauty-studio",
    title: "Bel's Beauty Studio",
    category: "Nails, brows & lashes",
    location: "Northfield, Birmingham",
    status: "preview",
    url: "https://bel-s-beauty-studio.vercel.app/",
    description:
      "A home-studio site that sorts nails, brows and lashes into clear treatment families with prices, then sends visitors straight to Fresha to book.",
    thumbnail: "/projects/bels-beauty-studio-desktop.webp",
    thumbnailMid: "/projects/bels-beauty-studio-desktop-mid.webp",
    mobileThumbnail: "/projects/bels-beauty-studio-mobile.webp",
    alt: {
      desktop:
        "Website preview for Bel's Beauty Studio on desktop: a cream and berry design with the headline “Nails, brows and lashes, finished with care.”",
      mobile: "Bel's Beauty Studio preview on a phone, with a Book on Fresha button",
    },
    group: "featured",
    order: 2,
    featured: true,
    available: true,
    rightsCleared: false,
    lastChecked: CHECKED,
  },
  {
    slug: "nails-and-beauty-by-nikki",
    title: "Nails & Beauty by Nikki",
    category: "Nail artist & educator",
    location: "Houston, Texas",
    status: "preview",
    url: "https://nails-and-beauty-by-nikki.vercel.app/",
    description:
      "Two clear paths in one site: clients book nail services on Fresha, and nail professionals find one-to-one training with Nikki.",
    thumbnail: "/projects/nails-and-beauty-by-nikki-desktop.webp",
    thumbnailMid: "/projects/nails-and-beauty-by-nikki-desktop-mid.webp",
    mobileThumbnail: "/projects/nails-and-beauty-by-nikki-mobile.webp",
    alt: {
      desktop:
        "Website preview for Nails & Beauty by Nikki on desktop: an illustrated burgundy nail in an arch beside the headline “Precision nail artistry, perfected over 20+ years.”",
      mobile: "Nails & Beauty by Nikki preview on a phone",
    },
    group: "featured",
    order: 3,
    featured: true,
    available: true,
    rightsCleared: false,
    lastChecked: CHECKED,
  },
  {
    slug: "kimberly-nails",
    title: "Kimberly Nails",
    category: "Nails, lashes & brows",
    location: "Chicago, Illinois",
    status: "preview",
    url: "https://kimberlynails.vercel.app/en",
    description:
      "A bilingual English and Spanish site with four service menus, starting prices and one-tap booking on Booksy.",
    thumbnail: "/projects/kimberly-nails-desktop.webp",
    thumbnailMid: "/projects/kimberly-nails-desktop-mid.webp",
    mobileThumbnail: "/projects/kimberly-nails-mobile.webp",
    alt: {
      desktop:
        "Website preview for Kimberly Nails on desktop: a fan of painted nail tips beside a starting-prices card for nails, lashes, waxing and brows",
      mobile: "Kimberly Nails preview on a phone, with an English and Spanish language switch",
    },
    group: "featured",
    order: 4,
    featured: true,
    available: true,
    rightsCleared: false,
    lastChecked: CHECKED,
  },
  {
    slug: "the-beauty-surgery",
    title: "The Beauty Surgery",
    category: "Beauty & skin salon",
    location: "Barrowford, Lancashire",
    status: "preview",
    url: "https://thebeautysurgery.vercel.app/",
    description:
      "A calm, consultation-led salon site that organises a long menu of skin, lash, waxing and nail treatments into four clear areas.",
    thumbnail: "/projects/the-beauty-surgery-desktop.webp",
    thumbnailMid: "/projects/the-beauty-surgery-desktop-mid.webp",
    mobileThumbnail: "/projects/the-beauty-surgery-mobile.webp",
    alt: {
      desktop:
        "Website preview for The Beauty Surgery on desktop: a soft neutral design with the headline “Skin, lashes and beauty care, chosen for you.”",
      mobile: "The Beauty Surgery preview on a phone, with Book an appointment and Call buttons",
    },
    group: "featured",
    order: 5,
    featured: true,
    available: true,
    rightsCleared: false,
    lastChecked: CHECKED,
  },
  {
    slug: "perfection-beauty-and-body",
    title: "Perfection Beauty & Body",
    category: "Lash studio",
    location: "Woolston, Christchurch",
    status: "preview",
    url: "https://pbb-nu.vercel.app/",
    description:
      "A dark, gold-lit site for a lash artist, covering lash styles, body sculpting, lash training and booking on Fresha.",
    thumbnail: "/projects/perfection-beauty-and-body-desktop.webp",
    thumbnailMid: "/projects/perfection-beauty-and-body-desktop-mid.webp",
    mobileThumbnail: "/projects/perfection-beauty-and-body-mobile.webp",
    alt: {
      desktop:
        "Website preview for Perfection Beauty & Body on desktop: a black and gold design with a gold lash illustration and the headline “Never generic. Always yours.”",
      mobile: "Perfection Beauty & Body preview on a phone, in black and gold",
    },
    group: "featured",
    order: 6,
    featured: true,
    available: true,
    rightsCleared: false,
    lastChecked: CHECKED,
  },
  {
    slug: "beauty-by-jayde",
    title: "Beauty by Jayde",
    category: "Beauty therapist",
    location: "Abbotsford, Dunedin",
    status: "preview",
    url: "https://beautybyjayde.vercel.app/",
    description:
      "A soft, personal site for a beauty therapist, with treatments grouped by type and booking on Fresha.",
    thumbnail: "/projects/beauty-by-jayde-desktop.webp",
    mobileThumbnail: "/projects/beauty-by-jayde-mobile.webp",
    alt: {
      desktop:
        "Website preview for Beauty by Jayde on desktop, with the headline “Beautifully considered. Entirely you.”",
      mobile: "Beauty by Jayde preview on a phone",
    },
    group: "more",
    order: 7,
    featured: false,
    available: true,
    rightsCleared: false,
    lastChecked: CHECKED,
    notes:
      "Moved from featured to 'more' after capture review: the desktop hero shows placeholder image panels.",
  },
  {
    slug: "lisvel-silvestre",
    title: "Lisvel Silvestre",
    category: "Hair stylist & nail tech",
    location: "The Bronx, New York",
    status: "preview",
    url: "https://lisvelsilvestre.vercel.app/",
    description:
      "A bright, modern site for a hair stylist and nail tech, with services, results and booking on Fresha.",
    thumbnail: "/projects/lisvel-silvestre-desktop.webp",
    mobileThumbnail: "/projects/lisvel-silvestre-mobile.webp",
    alt: {
      desktop:
        "Website preview for Lisvel Silvestre on desktop: a salon portrait beside the headline “Healthy hair. Made yours.”",
      mobile: "Lisvel Silvestre preview on a phone",
    },
    group: "more",
    order: 8,
    featured: false,
    available: true,
    rightsCleared: false,
    lastChecked: CHECKED,
    notes: "Category verified from the live preview on 2026-11-22 (Bronx hair stylist and nail technician).",
  },
  {
    slug: "vela-studio",
    title: "Vela Studio",
    category: "Photographer",
    location: "Lisbon",
    status: "preview",
    url: "https://photographers-seven.vercel.app/",
    description:
      "A quiet, image-first portfolio for a wedding and editorial photographer, with a simple way to check a date.",
    thumbnail: "/projects/vela-studio-desktop.webp",
    mobileThumbnail: "/projects/vela-studio-mobile.webp",
    alt: {
      desktop:
        "Website preview for a photography studio on desktop: a full-width wedding portrait under the headline “Photographs made slowly, in the light that was already there.”",
      mobile: "Photography studio preview on a phone",
    },
    group: "more",
    order: 9,
    featured: false,
    available: true,
    rightsCleared: false,
    lastChecked: CHECKED,
    notes: "Supplied as 'Photography Portfolio'. The name shown is the one used inside the preview.",
  },
  {
    slug: "ironhaus",
    title: "Ironhaus",
    category: "Gym & fitness club",
    location: "Indiranagar, Bengaluru",
    status: "preview",
    url: "https://gym-livid-rho.vercel.app/",
    description:
      "A bold gym site covering facilities, programmes, coaches and memberships, built around booking a free day pass.",
    thumbnail: "/projects/ironhaus-desktop.webp",
    mobileThumbnail: "/projects/ironhaus-mobile.webp",
    alt: {
      desktop:
        "Website preview for a gym on desktop: bold condensed type reading “Train heavy. Recover properly. Stay for years.” over a dark gym photo",
      mobile: "Gym website preview on a phone",
    },
    group: "more",
    order: 10,
    featured: false,
    available: true,
    rightsCleared: false,
    lastChecked: CHECKED,
    notes: "Supplied as 'Fitness / Gym Website'. The name shown is the one used inside the preview.",
  },
  {
    slug: "kapiti-barbers",
    title: "Kapiti Barbers",
    category: "Barber",
    status: "preview",
    url: "https://kapitibarbers.vercel.app/",
    description: "A barbershop website preview.",
    thumbnail: "/projects/kapiti-barbers-desktop.webp",
    mobileThumbnail: "/projects/kapiti-barbers-mobile.webp",
    alt: { desktop: "Website preview for Kapiti Barbers on desktop" },
    group: "hidden",
    order: 11,
    featured: false,
    available: false,
    rightsCleared: false,
    lastChecked: CHECKED,
    notes:
      "Supplied URL returned HTTP 404 (Vercel NOT_FOUND) on 2026-11-22, as did obvious variants. Redeploy or supply the correct URL, run `npm run capture -- kapiti-barbers`, then set available: true and group: \"more\".",
  },
];

/** Projects that may be rendered publicly, in display order. */
export function publicProjects(requireRightsClearance: boolean): Project[] {
  return projects
    .filter((p) => p.available && p.group !== "hidden")
    .filter((p) => !requireRightsClearance || p.rightsCleared)
    .sort((a, b) => a.order - b.order);
}

/** Hostname shown in a screenshot's address bar, e.g. "sarahollivierrebeauty.co.uk". */
export function hostOf(url: string): string {
  return new URL(url).host.replace(/^www\./, "");
}
