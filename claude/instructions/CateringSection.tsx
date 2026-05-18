// components/catering/CateringSection.tsx
// ──────────────────────────────────────────────────────────────────────────────
// REPLACE existing file.
//
// What changed from the version in the screenshot:
//
//   1. TYPOGRAPHY
//      - Kicker → t-kicker t-kicker-gold (sentence case)
//      - Headline → t-section with <em> on "the party"
//        (auto-picks gold italic via globals-additions.css rule)
//      - Body paragraphs → t-body-lg
//      - Phone numbers → t-price-mono inside <a href="tel:"> tap targets
//
//   2. FORM-STAGE FIX (the watermark-bleed-through issue)
//      The section wrapper stays glass (bg-charcoal/45 backdrop-blur-sm) so the
//      watermark is still subtly visible in the negative space.
//      The form gets its OWN opaque card (bg-charcoal/85 backdrop-blur-md +
//      border) so input fields read cleanly without competing with the logo.
//
//   3. FORM-FIELD STYLE SYSTEM
//      Every input shares one class string: t-form-input (declared inline here
//      for portability — can be lifted to globals.css if reused elsewhere).
//      Labels use t-form-label (kicker pattern, smaller).
//
//   4. MOTION
//      - Section reveal on scroll (Reveal wrapper)
//      - Focus state on inputs: border tints gold + ring fades in
//      - Submit button: primary-style lift + arrow slide
//      - Phone tap links: subtle underline on hover
//
//   5. ACCESSIBILITY
//      - Every input has a real <label htmlFor>
//      - Required fields marked with required + aria-required
//      - Phone/email use proper input types for mobile keyboards
//      - Form has an aria-labelledby pointing at the headline
//
//   6. SUBMIT BEHAVIOR
//      The handleSubmit below is a STUB. Wire it to your existing endpoint
//      (mailto, Resend, EmailJS, Formspree, whatever you use). See the comment
//      block above onSubmit for swap points.
// ──────────────────────────────────────────────────────────────────────────────

"use client";

import { useState, FormEvent } from "react";
import Reveal from "@/components/ui/Reveal";

// Form field styling — kept as constants so any consumer can match the look
// without re-typing the long Tailwind string.
const FORM_INPUT_CLASS = [
  "w-full px-4 py-3 rounded-xl",
  "bg-white/[0.04] border border-white/10",
  "text-cream placeholder:text-cream/40",
  "font-sans text-sm",
  "transition-all duration-300 ease-out",
  "hover:bg-white/[0.06] hover:border-white/15",
  "focus:outline-none focus:bg-white/[0.07]",
  "focus:border-gold/60 focus:ring-2 focus:ring-gold/20",
].join(" ");

const FORM_LABEL_CLASS =
  "block mb-2 font-sans text-[10px] font-semibold uppercase tracking-[0.28em] text-cream/65";

interface CateringFormState {
  name: string;
  phone: string;
  email: string;
  eventDate: string;
  eventTime: string;
  guestCount: string;
  eventLocation: string;
  message: string;
}

const EMPTY_FORM: CateringFormState = {
  name: "",
  phone: "",
  email: "",
  eventDate: "",
  eventTime: "",
  guestCount: "",
  eventLocation: "",
  message: "",
};

export default function CateringSection() {
  const [form, setForm] = useState<CateringFormState>(EMPTY_FORM);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  // ───────────────────────────────────────────────────────────────────────────
  // SUBMIT — STUB. Replace the body of this function with your real endpoint.
  // Options:
  //   • mailto: build a mailto: URL and window.location.href = it
  //   • API route: fetch('/api/catering', { method: 'POST', body: JSON.stringify(form) })
  //   • EmailJS / Resend / Formspree: their respective SDK call
  // ───────────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");

    try {
      // ── REPLACE THIS BLOCK ──────────────────────────────────────────────────
      const subject = encodeURIComponent(
        `Catering request — ${form.name || "new lead"}`
      );
      const body = encodeURIComponent(
        [
          `Name: ${form.name}`,
          `Phone: ${form.phone}`,
          `Email: ${form.email}`,
          `Event date: ${form.eventDate}`,
          `Event time: ${form.eventTime}`,
          `Guest count: ${form.guestCount}`,
          `Event location: ${form.eventLocation}`,
          ``,
          form.message,
        ].join("\n")
      );
      window.location.href = `mailto:angiesfoodtruck83@gmail.com?subject=${subject}&body=${body}`;
      // ── /REPLACE ────────────────────────────────────────────────────────────

      setStatus("sent");
    } catch (err) {
      setStatus("error");
    }
  };

  const handleField =
    (field: keyof CateringFormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <section
      id="catering"
      className="relative z-10 border-t border-white/5 bg-charcoal/45 backdrop-blur-sm px-5 sm:px-8 py-24 sm:py-32"
    >
      <Reveal as="div" className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] gap-10 lg:gap-16 items-start">

          {/* ─── LEFT COLUMN — copy + contact ────────────────────────────── */}
          <div>
            <div className="t-kicker t-kicker-gold mb-5">
              Catering &amp; private events
            </div>

            <h2 id="catering-heading" className="t-section mb-6">
              Bring the truck —{" "}
              <em>bring the party.</em>
            </h2>

            <p className="t-body-lg mb-5">
              Festivals, office lunches, birthdays, and private parties — Angie&apos;s
              rolls up with a bright truck, Mexican favorites, aguas frescas, and
              a crew that keeps the line moving.
            </p>

            <p className="t-body mb-5">
              When you book Angie&apos;s, you are booking bold Tex-Mex on wheels —
              tacos, birria, burritos, fresh waters, and hospitality tuned for
              Kansas City crowds.
            </p>

            <p className="t-body mb-8">
              Tell us your crowd size, date, time, and address. We&apos;ll confirm
              menu pacing, service window, and add-ons so guests get hot food and
              cold drinks.
            </p>

            {/* Tap-to-call links — mono treatment makes them look intentional */}
            <div className="border-t border-white/10 pt-6 space-y-2.5">
              <div className="t-kicker mb-3">Call or text</div>
              <a
                href="tel:+19134331732"
                className="flex items-center gap-3 group hover:text-angie-orange transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold group-hover:text-angie-orange transition-colors">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="t-price-mono text-cream group-hover:text-angie-orange transition-colors">
                  (913) 433-1732
                </span>
              </a>
              <a
                href="tel:+19139548745"
                className="flex items-center gap-3 group hover:text-angie-orange transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold group-hover:text-angie-orange transition-colors">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="t-price-mono text-cream group-hover:text-angie-orange transition-colors">
                  (913) 954-8745
                </span>
              </a>
              <a
                href="mailto:angiesfoodtruck83@gmail.com?subject=Catering%20request"
                className="flex items-center gap-3 group hover:text-angie-orange transition-colors mt-3"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold group-hover:text-angie-orange transition-colors">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="22,6 12,13 2,6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="font-mono text-[13px] text-cream group-hover:text-angie-orange transition-colors break-all">
                  angiesfoodtruck83@gmail.com
                </span>
              </a>
            </div>
          </div>

          {/* ─── RIGHT COLUMN — form stage ───────────────────────────────────
               This is the "more opaque inner surface" that fixes the screenshot
               problem. Watermark stays visible in the section margins but the
               form fields sit on a clean dark stage. */}
          <form
            onSubmit={handleSubmit}
            aria-labelledby="catering-heading"
            className="relative rounded-3xl border border-white/12 bg-charcoal/85 backdrop-blur-md p-6 sm:p-8 lg:p-10"
          >
            {/* Subtle gold edge at the top — same flourish as the Prologue card */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] rounded-t-3xl"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(246,162,26,0.6) 50%, transparent 100%)",
              }}
            />

            <div className="t-kicker t-kicker-gold mb-6">Request form</div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="cat-name" className={FORM_LABEL_CLASS}>
                  Name
                </label>
                <input
                  id="cat-name"
                  type="text"
                  required
                  aria-required="true"
                  value={form.name}
                  onChange={handleField("name")}
                  className={FORM_INPUT_CLASS}
                  autoComplete="name"
                />
              </div>

              <div>
                <label htmlFor="cat-phone" className={FORM_LABEL_CLASS}>
                  Phone
                </label>
                <input
                  id="cat-phone"
                  type="tel"
                  required
                  aria-required="true"
                  value={form.phone}
                  onChange={handleField("phone")}
                  className={FORM_INPUT_CLASS}
                  autoComplete="tel"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="cat-email" className={FORM_LABEL_CLASS}>
                  Email
                </label>
                <input
                  id="cat-email"
                  type="email"
                  required
                  aria-required="true"
                  value={form.email}
                  onChange={handleField("email")}
                  className={FORM_INPUT_CLASS}
                  autoComplete="email"
                />
              </div>

              <div>
                <label htmlFor="cat-date" className={FORM_LABEL_CLASS}>
                  Event date
                </label>
                <input
                  id="cat-date"
                  type="date"
                  value={form.eventDate}
                  onChange={handleField("eventDate")}
                  className={FORM_INPUT_CLASS}
                />
              </div>

              <div>
                <label htmlFor="cat-time" className={FORM_LABEL_CLASS}>
                  Event time
                </label>
                <input
                  id="cat-time"
                  type="text"
                  placeholder="e.g. 11:00 AM — 2:00 PM"
                  value={form.eventTime}
                  onChange={handleField("eventTime")}
                  className={FORM_INPUT_CLASS}
                />
              </div>

              <div>
                <label htmlFor="cat-guests" className={FORM_LABEL_CLASS}>
                  Guest count
                </label>
                <input
                  id="cat-guests"
                  type="number"
                  min="1"
                  inputMode="numeric"
                  value={form.guestCount}
                  onChange={handleField("guestCount")}
                  className={FORM_INPUT_CLASS}
                />
              </div>

              <div>
                <label htmlFor="cat-location" className={FORM_LABEL_CLASS}>
                  Event location
                </label>
                <input
                  id="cat-location"
                  type="text"
                  value={form.eventLocation}
                  onChange={handleField("eventLocation")}
                  className={FORM_INPUT_CLASS}
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="cat-message" className={FORM_LABEL_CLASS}>
                  Message / details
                </label>
                <textarea
                  id="cat-message"
                  rows={5}
                  value={form.message}
                  onChange={handleField("message")}
                  className={`${FORM_INPUT_CLASS} resize-y min-h-[120px]`}
                />
              </div>
            </div>

            {/* Submit / Clear row */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={status === "sending"}
                className="group inline-flex items-center gap-2 rounded-full bg-angie-orange text-cream px-7 py-3.5 text-[11px] font-semibold uppercase tracking-[0.28em] shadow-lg shadow-angie-orange/40 transition-all duration-250 hover:bg-angie-orange/90 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-angie-orange/55 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {status === "sending" ? "Sending…" : "Send request"}
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setForm(EMPTY_FORM);
                  setStatus("idle");
                }}
                className="inline-flex items-center rounded-full border border-white/20 bg-white/5 text-cream px-7 py-3.5 text-[11px] font-semibold uppercase tracking-[0.28em] transition-all duration-250 hover:border-white/35 hover:bg-white/10"
              >
                Clear form
              </button>

              {/* Status hint — appears next to buttons */}
              {status === "sent" && (
                <span className="t-micro text-accent-green normal-case tracking-normal">
                  Thanks — we&apos;ll reply within a day.
                </span>
              )}
              {status === "error" && (
                <span className="t-micro text-salsa normal-case tracking-normal">
                  Hmm, that didn&apos;t send. Try email or text instead.
                </span>
              )}
            </div>

            {/* Privacy / commitment microcopy */}
            <p className="t-micro mt-6 normal-case tracking-normal text-cream/50">
              We read every request and reply within a day. No spam, no resale of
              contact info.
            </p>
          </form>

        </div>
      </Reveal>
    </section>
  );
}
