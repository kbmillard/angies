import {
  CATERING_REQUEST_EMAILS,
  CATERING_REQUEST_SMS_RECIPIENTS,
} from "@/lib/data/catering-requests";

export type CateringFormFields = {
  name: string;
  phone: string;
  email: string;
  eventDate: string;
  eventType: string;
  guestCount: string;
  location: string;
  message: string;
};

const SMS_BODY_MAX = 1200;

export function formatCateringInquiry(form: CateringFormFields): string {
  const lines = [
    "Angie's Food Truck — catering / truck booking",
    "",
    `Name: ${form.name}`,
    `Phone: ${form.phone}`,
    form.email ? `Email: ${form.email}` : "Email: (not provided)",
    `Event date: ${form.eventDate || "—"}`,
    `Event time: ${form.eventType || "—"}`,
    `Guest count: ${form.guestCount || "—"}`,
    `Location: ${form.location || "—"}`,
    "",
    "Details:",
    form.message.trim() || "—",
  ];
  return lines.join("\n");
}

function smsBodyForUri(fullBody: string): string {
  if (fullBody.length <= SMS_BODY_MAX) return fullBody;
  return `${fullBody.slice(0, SMS_BODY_MAX - 30)}\n…(message truncated)`;
}

export type CateringRequestLaunch = {
  body: string;
  mailtoHref: string;
  /** Some devices open a group thread; others ignore extra recipients — individual links are also shown. */
  smsCombinedHref: string;
  smsIndividualHrefs: { label: string; href: string }[];
};

function buildCateringRequestLaunch(form: CateringFormFields): CateringRequestLaunch {
  const body = formatCateringInquiry(form);
  const subject = encodeURIComponent("Angie's Food Truck — catering request");
  const to = CATERING_REQUEST_EMAILS.join(",");
  const mailtoHref = `mailto:${to}?subject=${subject}&body=${encodeURIComponent(body)}`;

  const smsText = smsBodyForUri(body);
  const enc = encodeURIComponent(smsText);
  const numbersJoined = CATERING_REQUEST_SMS_RECIPIENTS.map((r) => r.e164).join(",");
  const smsCombinedHref = `sms:${numbersJoined}?body=${enc}`;

  const smsIndividualHrefs = CATERING_REQUEST_SMS_RECIPIENTS.map((r) => ({
    label: r.label,
    href: `sms:${r.e164}?body=${enc}`,
  }));

  return { body, mailtoHref, smsCombinedHref, smsIndividualHrefs };
}

/**
 * Opens the default mail app with To: both catering inboxes and the request pre-filled.
 * Returns URLs + body for follow-up (SMS must be opened separately; see UI links).
 */
export function openCateringInquiry(form: CateringFormFields): CateringRequestLaunch {
  const launch = buildCateringRequestLaunch(form);
  if (typeof window !== "undefined") {
    window.location.href = launch.mailtoHref;
  }
  return launch;
}
