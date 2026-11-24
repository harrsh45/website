import Analytics from "@/components/Analytics";
import Contact from "@/components/Contact";
import Hero from "@/components/Hero";
import LampLight from "@/components/LampLight";
import ScrollcraftMount from "@/components/ScrollcraftMount";
import SmoothScroll from "@/components/SmoothScroll";
import { About, Faq, Process, Services, SiteFooter } from "@/components/Sections";
import SiteHeader from "@/components/SiteHeader";
import Work from "@/components/Work";
import { publicProjects } from "@/data/projects";
import { site } from "@/data/site";
import { isEnquiryConfigured } from "@/lib/enquiry-server";

// Hero phones, in order: centre (front), left, right. Picked for contrast with each other.
const HERO_PHONES = ["sarah-ollivierre-beauty", "kimberly-nails", "perfection-beauty-and-body"];

export default function Home() {
  const visible = publicProjects(site.requireRightsClearance);
  const featured = visible.filter((p) => p.group === "featured");
  const more = visible.filter((p) => p.group === "more");
  const phones = [
    ...HERO_PHONES.map((s) => visible.find((p) => p.slug === s)).filter((p) => p !== undefined),
    ...featured.filter((p) => !HERO_PHONES.includes(p.slug)),
  ].slice(0, 3);

  return (
    <>
      <a className="skip-link" href="#work">
        Skip to the work
      </a>
      <SiteHeader />
      <main id="main" data-sc-root>
        <Hero phones={phones} />
        <Work featured={featured} more={more} />
        <Services />
        <Process />
        <About />
        <Faq />
        <Contact formEnabled={isEnquiryConfigured()} />
      </main>
      <SiteFooter />
      <ScrollcraftMount />
      <SmoothScroll />
      <LampLight />
      <Analytics />
    </>
  );
}
