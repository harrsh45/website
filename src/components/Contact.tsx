import { site } from "@/data/site";
import EmailLink from "./EmailLink";
import EnquiryForm from "./EnquiryForm";
import { Instagram, Lock, Mail } from "./icons";

/**
 * The close: the last object in the collection is the visitor's own website. An
 * empty screen, lit like every project above it, holding the two ways to get in touch.
 */
export default function Contact({ formEnabled }: { formEnabled: boolean }) {
  return (
    <section id="contact" className="contact ground-navy" data-sc-act="flow" aria-labelledby="contact-title">
      <div className="wrap">
        <div className="contact__stage" data-lamp>
          <div className="contact__frame-wrap">
          <span className="cone" aria-hidden="true" />
          <span className="pool" aria-hidden="true" />
          <div className="frame frame--browser contact__frame">
            <span className="frame__bar" aria-hidden="true">
              <Lock />
              <span>yourbusiness.com</span>
            </span>
            <div className="frame__screen contact__screen" data-sc-reveal="iris" data-sc-reveal-at="0.02 0.24">
              <h2 id="contact-title" className="display display--lg">
                Let&rsquo;s give your business a website you love sharing.
              </h2>
              <p className="lead">
                Have an idea, an Instagram page, or an existing site you&rsquo;d like to improve? Send me a message
                and tell me about it.
              </p>
              <div className="contact__actions">
                <a
                  className="btn btn--navy"
                  href={site.instagram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-track="click_contact"
                  data-track-id="contact-instagram"
                >
                  <Instagram />
                  Message on Instagram
                </a>
                <EmailLink className="btn btn--line" trackId="contact-email">
                  <Mail />
                  Email me
                </EmailLink>
              </div>
              <p className="contact__email">
                <EmailLink trackId="contact-email-address">{site.email}</EmailLink> &middot; Instagram{" "}
                <a href={site.instagram.url} target="_blank" rel="noopener noreferrer">
                  {site.instagram.handle}
                </a>
              </p>
              <span className="veil" aria-hidden="true" />
            </div>
          </div>
          </div>
        </div>

        <div className="contact__label">
          <div className="label">
            <p className="status status--next">
              <span className="status__dot" aria-hidden="true" />
              Next on the desk
            </p>
            <p className="display display--sm">Your business</p>
            <p className="label__meta">Wherever you&rsquo;re based &middot; Built remotely, with you</p>
          </div>
          <p className="contact__aside">
            Need more than a website? I also set up practical automations, like enquiry notifications or sending
            form submissions to your CRM. Ask me about it when you get in touch.
          </p>
        </div>

        {formEnabled && (
          <div className="enquiry">
            <div>
              <h3 className="display display--sm">Prefer a form?</h3>
              <p className="small enquiry__intro">
                No phone number or budget needed. Just a few details and I&rsquo;ll get back to you.
              </p>
            </div>
            <EnquiryForm />
          </div>
        )}
      </div>
    </section>
  );
}
