"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CATERING_REQUEST_EMAILS } from "@/lib/data/catering-requests";
import { CONTACT } from "@/lib/data/locations";
import { openCateringInquiry, type CateringRequestLaunch } from "@/lib/utils/catering-inquiry";
import { scrollDocumentToAnchor } from "@/lib/utils/scroll-to-anchor";

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
  const [form, setForm] = useState(initial);
  const [postSubmit, setPostSubmit] = useState<CateringRequestLaunch | null>(null);

  const scrollToFormAndFocus = useCallback(() => {
    scrollDocumentToAnchor("catering-form");
    requestAnimationFrame(() => {
      document.getElementById("catering-name")?.focus();
    });
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPostSubmit(openCateringInquiry(form));
  };

  const clearForm = useCallback(() => {
    setForm(initial);
    setPostSubmit(null);
  }, []);

  return (
    <section
      id="catering"
      className="relative z-10 scroll-mt-[calc(var(--nav-h)+16px)] bg-charcoal/45 py-24 backdrop-blur-sm"
    >
      <div className="mx-auto max-w-[1100px] px-5 sm:px-8">
        <div id="catering-start" tabIndex={-1} className="outline-none focus:outline-none">
          <SectionHeading
            kicker="Catering & private events"
            title="Bring the truck — bring the party."
            subtitle="Festivals, office lunches, birthdays, and private parties — Angie’s rolls up with a bright truck, Mexican favorites, aguas frescas, and a crew that keeps the line moving."
          />
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            className="space-y-4 text-sm leading-relaxed text-cream/80"
          >
            <p>
              When you book Angie&apos;s, you are booking close-to-Mexico flavor on wheels — tacos,
              birria, burritos, fresh waters, and hospitality tuned for Kansas City crowds.
            </p>
            <p>
              Tell us your crowd size, date, time, and address. We will confirm menu pacing, service
              window, and add-ons so guests get hot food and cold drinks.
            </p>
            <p className="pt-2 text-sm text-cream/85">
              <a className="text-cream underline-offset-4 hover:underline" href={`tel:${CONTACT.phoneTel}`}>
                Call or text {CONTACT.phoneDisplay}
              </a>
              {CONTACT.email ? (
                <>
                  {" "}
                  ·{" "}
                  <a
                    className="text-cream underline-offset-4 hover:underline"
                    href={`mailto:${CONTACT.email}?subject=Catering%20request`}
                  >
                    {CONTACT.email}
                  </a>
                </>
              ) : null}
            </p>
            <div className="pt-4">
              <button
                type="button"
                className="rounded-full bg-salsa px-5 py-2 text-[10px] font-semibold uppercase tracking-editorial text-cream"
                onClick={scrollToFormAndFocus}
              >
                Open request form
              </button>
            </div>
          </motion.div>

          <form
            id="catering-form"
            onSubmit={onSubmit}
            className="space-y-4 rounded-3xl border border-white/10 bg-black/30 p-6 sm:p-8"
          >
            {postSubmit ? (
              <div className="space-y-3 rounded-2xl border border-agave/40 bg-agave/10 p-4 text-sm text-cream">
                <p>
                  Your email app should open with <strong>To:</strong>{" "}
                  {CATERING_REQUEST_EMAILS.join(" · ")} — tap <strong>Send</strong> to deliver the
                  request. Use the text button if email is not available on this device.
                </p>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={postSubmit.smsCombinedHref}
                    className="inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-2 text-[10px] font-semibold uppercase tracking-editorial text-cream hover:bg-white/15"
                  >
                    Text the truck line
                  </a>
                  {postSubmit.smsIndividualHrefs.map(({ label, href }) => (
                    <a
                      key={label}
                      href={href}
                      className="inline-flex rounded-full border border-white/20 px-4 py-2 text-[10px] uppercase tracking-editorial text-cream hover:bg-white/5"
                    >
                      Text {label}
                    </a>
                  ))}
                  <a
                    href={postSubmit.mailtoHref}
                    className="inline-flex rounded-full border border-white/20 px-4 py-2 text-[10px] uppercase tracking-editorial text-cream hover:bg-white/5"
                  >
                    Open email again
                  </a>
                </div>
                <textarea
                  readOnly
                  className="max-h-40 w-full resize-y rounded-xl border border-white/15 bg-black/30 p-3 font-mono text-xs text-cream/90"
                  value={postSubmit.body}
                  rows={8}
                  aria-label="Request text"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-full border border-white/20 px-4 py-2 text-[10px] font-semibold uppercase tracking-editorial text-cream hover:bg-white/5"
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
                    className="rounded-full border border-white/20 px-4 py-2 text-[10px] uppercase tracking-editorial text-cream hover:bg-white/5"
                    onClick={clearForm}
                  >
                    New request
                  </button>
                </div>
              </div>
            ) : null}
            <fieldset disabled={!!postSubmit} className="min-w-0 space-y-4 border-0 p-0">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                id="catering-name"
                label="Name"
                value={form.name}
                onChange={(v) => setForm((f) => ({ ...f, name: v }))}
                required
              />
              <Field
                label="Phone"
                value={form.phone}
                onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
                required
              />
              <Field
                label="Email"
                value={form.email}
                onChange={(v) => setForm((f) => ({ ...f, email: v }))}
                className="sm:col-span-2"
              />
              <Field
                label="Event date"
                value={form.eventDate}
                onChange={(v) => setForm((f) => ({ ...f, eventDate: v }))}
              />
              <Field
                label="Event time"
                value={form.eventType}
                onChange={(v) => setForm((f) => ({ ...f, eventType: v }))}
                placeholder="e.g. 11:00 AM – 2:00 PM"
              />
              <Field
                label="Guest count"
                value={form.guestCount}
                onChange={(v) => setForm((f) => ({ ...f, guestCount: v }))}
              />
              <Field
                label="Event location"
                value={form.location}
                onChange={(v) => setForm((f) => ({ ...f, location: v }))}
                className="sm:col-span-2"
              />
            </div>
            <label className="block text-xs text-cream/60">
              Message / details
              <textarea
                className="mt-1 min-h-[120px] w-full rounded-xl border border-white/10 bg-charcoal px-3 py-2 text-sm text-cream"
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              />
            </label>
            </fieldset>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={!!postSubmit}
                className="rounded-full bg-salsa px-6 py-3 text-xs font-semibold uppercase tracking-editorial text-cream disabled:pointer-events-none disabled:opacity-45"
              >
                Send request
              </button>
              <button
                type="button"
                className="rounded-full border border-white/15 px-6 py-3 text-xs uppercase tracking-editorial text-cream hover:bg-white/5"
                onClick={clearForm}
              >
                Clear form
              </button>
            </div>
          </form>
        </div>
      </div>
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
}: {
  id?: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className={`block text-xs text-cream/60 ${className ?? ""}`}>
      {label}
      <input
        id={id}
        required={required}
        className="mt-1 w-full rounded-xl border border-white/10 bg-charcoal px-3 py-2 text-sm text-cream"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
