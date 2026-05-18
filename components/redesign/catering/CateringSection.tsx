"use client";

import { useCallback, useState } from "react";
import Reveal from "@/components/ui/Reveal";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { CATERING_REQUEST_EMAILS } from "@/lib/data/catering-requests";
import { CONTACT } from "@/lib/data/locations";
import { FORM_INPUT_CLASS, FORM_LABEL_CLASS } from "@/lib/ui/form-field-styles";
import { homeBandClass } from "@/lib/ui/home-band";
import {
  openCateringInquiry,
  type CateringRequestLaunch,
} from "@/lib/utils/catering-inquiry";

const initial = {
  name: "",
  phone: "",
  email: "",
  eventDate: "",
  eventType: "",
  guestCount: "",
  location: "",
  message: "",
};

export function CateringSection() {
  const site = useSiteSettings();
  const c = site.catering;
  const [form, setForm] = useState(initial);
  const [postSubmit, setPostSubmit] = useState<CateringRequestLaunch | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPostSubmit(openCateringInquiry(form));
  };

  const clearForm = useCallback(() => {
    setForm(initial);
    setPostSubmit(null);
  }, []);

  return (
    <section id="catering" className={homeBandClass}>
      <div
        id="catering-start"
        tabIndex={-1}
        className="scroll-mt-[calc(var(--header-stack-h)+1rem)] outline-none focus:outline-none"
        aria-hidden
      />
      <Reveal as="div" className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
          <div>
            <h2 id="catering-heading" className="t-section mb-6">
              {c.title}
            </h2>
            <div className="prose-stack mb-8">
              <p className="t-body-lg">{c.subtitle}</p>
              <p className="t-body">
                When you book Angie&apos;s, you are booking bold Tex-Mex on wheels — tacos,
                birria, burritos, fresh waters, and hospitality tuned for Kansas City crowds.
              </p>
              <p className="t-body">
                Tell us your crowd size, date, time, and address. We&apos;ll confirm menu pacing,
                service window, and add-ons so guests get hot food and cold drinks.
              </p>
            </div>

            <div className="space-y-2.5 border-t border-white/10 pt-6">
              <div className="t-kicker mb-3">Call or text</div>
              {CONTACT.phones.map((p) => (
                <a
                  key={p.tel}
                  href={`tel:${p.tel}`}
                  className="group flex items-center gap-3 transition-colors hover:text-angie-orange"
                >
                  <PhoneIcon />
                  <span className="t-price-mono text-cream transition-colors group-hover:text-angie-orange">
                    {p.display}
                  </span>
                </a>
              ))}
              {CONTACT.email ? (
                <a
                  href={`mailto:${CONTACT.email}?subject=Catering%20request`}
                  className="group mt-3 flex items-center gap-3 transition-colors hover:text-angie-orange"
                >
                  <MailIcon />
                  <span className="break-all font-mono text-[13px] text-cream transition-colors group-hover:text-angie-orange">
                    {CONTACT.email}
                  </span>
                </a>
              ) : null}
            </div>
          </div>

          <form
            id="catering-form"
            onSubmit={onSubmit}
            aria-labelledby="catering-heading"
            className="relative rounded-3xl border border-white/12 bg-charcoal/85 p-6 backdrop-blur-md sm:p-8 lg:p-10"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] rounded-t-3xl"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(246,162,26,0.6) 50%, transparent 100%)",
              }}
            />

            <div className="t-kicker t-kicker-gold mb-6">Request form</div>

            {postSubmit ? (
              <div className="mb-6 space-y-3 rounded-2xl border border-agave/40 bg-agave/10 p-4 text-sm text-cream">
                <p>
                  Your email app should open with <strong>To:</strong>{" "}
                  {CATERING_REQUEST_EMAILS.join(" · ")} — tap <strong>Send</strong> to deliver the
                  request. Text <strong>(913) 433-1732</strong> or <strong>(913) 954-8745</strong>{" "}
                  with the same message if email is not available on this device.
                </p>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={postSubmit.smsCombinedHref}
                    className="inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-cream hover:bg-white/15"
                  >
                    Text both numbers
                  </a>
                  {postSubmit.smsIndividualHrefs.map(({ label, href }) => (
                    <a
                      key={label}
                      href={href}
                      className="inline-flex rounded-full border border-white/20 px-4 py-2 text-[10px] uppercase tracking-[0.28em] text-cream hover:bg-white/5"
                    >
                      Text {label}
                    </a>
                  ))}
                  <a
                    href={postSubmit.mailtoHref}
                    className="inline-flex rounded-full border border-white/20 px-4 py-2 text-[10px] uppercase tracking-[0.28em] text-cream hover:bg-white/5"
                  >
                    Open email again
                  </a>
                </div>
                <textarea
                  readOnly
                  className={`${FORM_INPUT_CLASS} max-h-40 resize-y font-mono text-xs`}
                  value={postSubmit.body}
                  rows={8}
                  aria-label="Request text"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-full border border-white/20 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-cream hover:bg-white/5"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(postSubmit.body);
                      } catch {
                        /* ignore */
                      }
                    }}
                  >
                    Copy details
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-white/20 px-4 py-2 text-[10px] uppercase tracking-[0.28em] text-cream hover:bg-white/5"
                    onClick={clearForm}
                  >
                    New request
                  </button>
                </div>
              </div>
            ) : null}

            <fieldset disabled={!!postSubmit} className="min-w-0 border-0 p-0">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field
                  id="catering-name"
                  label="Name"
                  value={form.name}
                  onChange={(v) => setForm((f) => ({ ...f, name: v }))}
                  required
                />
                <Field
                  id="catering-phone"
                  label="Phone"
                  type="tel"
                  value={form.phone}
                  onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
                  required
                  autoComplete="tel"
                />
                <Field
                  id="catering-email"
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(v) => setForm((f) => ({ ...f, email: v }))}
                  className="sm:col-span-2"
                  autoComplete="email"
                />
                <Field
                  id="catering-date"
                  label="Event date"
                  type="date"
                  value={form.eventDate}
                  onChange={(v) => setForm((f) => ({ ...f, eventDate: v }))}
                />
                <Field
                  id="catering-time"
                  label="Event time"
                  value={form.eventType}
                  onChange={(v) => setForm((f) => ({ ...f, eventType: v }))}
                  placeholder="e.g. 11:00 AM — 2:00 PM"
                />
                <Field
                  id="catering-guests"
                  label="Guest count"
                  type="number"
                  value={form.guestCount}
                  onChange={(v) => setForm((f) => ({ ...f, guestCount: v }))}
                  inputMode="numeric"
                />
                <Field
                  id="catering-location"
                  label="Event location"
                  value={form.location}
                  onChange={(v) => setForm((f) => ({ ...f, location: v }))}
                />
                <div className="sm:col-span-2">
                  <label htmlFor="catering-message" className={FORM_LABEL_CLASS}>
                    Message / details
                  </label>
                  <textarea
                    id="catering-message"
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    className={`${FORM_INPUT_CLASS} min-h-[120px] resize-y`}
                  />
                </div>
              </div>
            </fieldset>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={!!postSubmit}
                className="group inline-flex items-center gap-2 rounded-full bg-angie-orange px-7 py-3.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-cream shadow-lg shadow-angie-orange/40 transition-all duration-250 hover:-translate-y-0.5 hover:bg-angie-orange/90 hover:shadow-xl hover:shadow-angie-orange/55 disabled:cursor-not-allowed disabled:opacity-45"
              >
                Send request
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </button>
              <button
                type="button"
                onClick={clearForm}
                className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-7 py-3.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-cream transition-all duration-250 hover:border-white/35 hover:bg-white/10"
              >
                Clear form
              </button>
            </div>

            <p className="t-micro mt-6 normal-case tracking-normal text-cream/50">
              We read every request and reply within a day. No spam, no resale of contact info.
            </p>
          </form>
        </div>
      </Reveal>
    </section>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  className,
  placeholder,
  required,
  type = "text",
  autoComplete,
  inputMode,
}: {
  id?: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className={FORM_LABEL_CLASS}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        aria-required={required || undefined}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={FORM_INPUT_CLASS}
        autoComplete={autoComplete}
        inputMode={inputMode}
      />
    </div>
  );
}

function PhoneIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="text-gold transition-colors group-hover:text-angie-orange"
      aria-hidden
    >
      <path
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="text-gold transition-colors group-hover:text-angie-orange"
      aria-hidden
    >
      <path
        d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline points="22,6 12,13 2,6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
