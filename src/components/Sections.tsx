import Image from "next/image";
import { site } from "@/data/site";

const PROMISES = [
  {
    title: "A look that’s yours.",
    body: "An intentional design shaped around your business, your customers and your services, not a one-size-fits-all template.",
  },
  {
    title: "Made for mobile.",
    body: "A polished experience for the people who find you on Instagram and browse from their phones.",
  },
  {
    title: "Ready for real customers.",
    body: "Clear service pages, galleries and enquiries, with links to the booking tools you already use, like Fresha or Booksy.",
  },
  {
    title: "A real launch, not just a mockup.",
    body: "I build it, refine it with you, connect your domain and hand over a finished, live website, as agreed for your project.",
  },
];

export function Services() {
  return (
    <section id="services" className="services ground-paper" aria-labelledby="services-title">
      <div className="wrap services__grid">
        <div className="services__intro" data-sc-in data-sc-stagger="70">
          <h2 id="services-title" className="display display--lg">
            Designed to look good. Built to work.
          </h2>
          <p className="lead">
            Beautiful design matters. So does making it easy for your customers to understand what you offer, find
            your services, and take the next step.
          </p>
        </div>
        <ul className="promises" data-sc-in data-sc-stagger="60">
          {PROMISES.map((p) => (
            <li key={p.title}>
              <h3 className="display display--sm">{p.title}</h3>
              <p>{p.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const STEPS = [
  { title: "We talk", body: "Tell me about your business, what you offer, and the style you’re after." },
  { title: "You see the direction", body: "I shape the design and share a preview so you can see where it’s going." },
  {
    title: "We refine and build",
    body: "We make sure the pages, details, and booking or enquiry links work for your business.",
  },
  { title: "Your site goes live", body: "Once approved and ready, the finished website is connected and launched." },
];

export function Process() {
  return (
    <section className="process ground-paper-2" data-sc-act="flow" aria-labelledby="process-title">
      <div className="wrap">
        <div className="process__head" data-sc-in>
          <h2 id="process-title" className="display display--lg">
            From the first idea to your finished website.
          </h2>
        </div>
        <div className="steps">
          <span className="steps__rule" data-sc-reveal="left" data-sc-reveal-at="0.12 0.5" aria-hidden="true" />
          <ol className="steps__list">
          {STEPS.map((s, i) => (
            <li key={s.title} className="step" data-sc-in>
              <span className="step__num" aria-hidden="true">
                {i + 1}
              </span>
              <h3 className="display display--sm">
                <span className="sr-only">Step {i + 1}: </span>
                {s.title}
              </h3>
              <p>{s.body}</p>
            </li>
          ))}
          </ol>
        </div>
        <p className="small process__note">Scope, timing and price are agreed with you for each project.</p>
      </div>
    </section>
  );
}

export function About() {
  return (
    <section id="about" className="about ground-paper" aria-labelledby="about-title">
      <div className="wrap about__grid">
        <Image
          className="about__mark"
          src="/brand/logo-512.webp"
          alt="The Lumen Desk logo: a navy desk lamp shining warm light onto a laptop"
          width={300}
          height={300}
          sizes="(max-width: 860px) 132px, 300px"
        />
        <div className="about__copy" data-sc-in data-sc-stagger="70">
          <h2 id="about-title" className="display display--lg">
            Independent by design. <em>Personal by nature.</em>
          </h2>
          <p className="body">
            I&rsquo;m {site.founderFirstName}, the developer behind The Lumen Desk. I build distinctive websites for
            independent businesses, from the first concept to the finished launch. You&rsquo;ll work directly with
            me, and I&rsquo;ll treat the details of your business with the same care you do.
          </p>
          <p className="about__sign">
            <strong>{site.founder}</strong>, founder. Based in Mumbai, working remotely with businesses, including in
            the UK.
          </p>
        </div>
      </div>
    </section>
  );
}

const FAQS = [
  {
    q: "Can you work with a business outside India?",
    a: "Yes. The Lumen Desk works remotely, and I’ve already delivered a website for a business in the UK.",
  },
  {
    q: "Can I see a real example before reaching out?",
    a: "Absolutely. Every project on this page links to a working website or design preview, so you can open it and click around for yourself.",
  },
  {
    q: "Can the website connect to my booking platform?",
    a: "Yes, where the platform supports suitable links or integrations. Booking services such as Fresha and Booksy can usually be linked from your site.",
  },
  {
    q: "Do you work from templates?",
    a: "The aim is a look and experience tailored to your business and the scope we agree, rather than forcing every client into the same design.",
  },
  {
    q: "How much does a website cost?",
    a: "It depends on the number of pages, features and design requirements. Share a few details and I’ll send you a tailored quote.",
  },
  {
    q: "How do we start?",
    a: "Send a message on Instagram or an email with your business name, your Instagram or current website, and what you’d like to improve.",
  },
];

export function Faq() {
  return (
    <section className="faq ground-paper-2" aria-labelledby="faq-title">
      <div className="wrap faq__grid">
        <h2 id="faq-title" className="display display--lg" data-sc-in>
          Questions people usually ask.
        </h2>
        <div>
          {FAQS.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="site-footer__grid">
          <div>
            <a className="brand" href="#top">
              <Image className="brand__mark" src="/brand/logo-256.webp" alt="" width={36} height={36} unoptimized />
              <span className="brand__word">THE LUMEN DESK</span>
            </a>
            <p>The Lumen Desk. Independent websites, thoughtfully made.</p>
          </div>
          <nav aria-label="Footer">
            <ul>
              <li>
                <a href="#work">Work</a>
              </li>
              <li>
                <a href="#services">Services</a>
              </li>
              <li>
                <a href="#about">About</a>
              </li>
              <li>
                <a href="#contact">Contact</a>
              </li>
            </ul>
          </nav>
          <ul>
            <li>
              <a href={site.instagram.url} target="_blank" rel="noopener noreferrer" data-track="click_contact" data-track-id="footer-instagram">
                Instagram {site.instagram.handle}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} data-track="click_contact" data-track-id="footer-email">
                {site.email}
              </a>
            </li>
          </ul>
        </div>
        <div className="site-footer__base">
          <p>Independent digital studio. Based in Mumbai, working remotely.</p>
          <p>
            &copy; {year} The Lumen Desk &middot; {site.domain}
          </p>
        </div>
      </div>
    </footer>
  );
}
