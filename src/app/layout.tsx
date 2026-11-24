import type { Metadata, Viewport } from "next";
import { Fraunces, Geist } from "next/font/google";
import { site } from "@/data/site";
import "@/vendor/scrollcraft/scrollcraft.css";
import "lenis/dist/lenis.css";
import "./globals.css";

// Display face: optical sizing only (the SOFT axis roughly doubled the file for a
// barely visible change). The italic is used for two phrases, so it is loaded
// separately and not preloaded: it must never compete with first paint on a phone.
const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  axes: ["opsz"],
  style: ["normal"],
  display: "swap",
});
const displayItalic = Fraunces({
  subsets: ["latin"],
  variable: "--font-display-italic",
  axes: ["opsz"],
  style: ["italic"],
  display: "swap",
  preload: false,
});
const text = Geist({ subsets: ["latin"], variable: "--font-text", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.title,
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.founder }],
  creator: site.founder,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: site.url,
    siteName: site.name,
    title: site.title,
    description: site.description,
    locale: "en_GB",
  },
  twitter: { card: "summary_large_image", title: site.title, description: site.description },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#f4f3f0",
  colorScheme: "light",
};

/*
 * Runs before first paint. Arms the two progressive enhancements, and disarms them
 * again if their scripts have not started within 3 s (slow in-app browser, blocked
 * script): content must never stay hidden or dimmed waiting for JavaScript.
 *   sc-armed    lets the Scrollcraft engine pre-hide [data-sc-in] content until it mounts
 *   lamp-armed  lets LampLight start projects unlit (skipped under reduced motion)
 */
const ARM = `(function(){var d=document.documentElement;d.classList.add('js','sc-armed');
var rm=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;if(!rm)d.classList.add('lamp-armed');
setTimeout(function(){if(!d.classList.contains('sc-ready'))d.classList.remove('sc-armed');if(!d.classList.contains('lamp-ready'))d.classList.remove('lamp-armed');},3000);})();`;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: site.name,
  url: site.url,
  email: site.email,
  logo: `${site.url}/brand/logo.png`,
  image: `${site.url}/brand/logo.png`,
  description: site.description,
  sameAs: [site.instagram.url],
  founder: { "@type": "Person", name: site.founder },
  address: { "@type": "PostalAddress", addressLocality: "Mumbai", addressCountry: "IN" },
  knowsAbout: ["Website design", "Website development", "Mobile-friendly websites", "Booking integrations"],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${displayItalic.variable} ${text.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: ARM }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
