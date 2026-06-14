import { CONTACT_EMAILS, CONTACT_PHONES } from "@/lib/data/contact";

/** Inbox for catering / truck booking requests (mailto To: line). */
export const CATERING_REQUEST_EMAILS = [...CONTACT_EMAILS] as const;

/** SMS recipients — same pre-filled body goes to both lines. */
export const CATERING_REQUEST_SMS_RECIPIENTS = CONTACT_PHONES.map((p) => ({
  e164: p.tel,
  label: p.display,
})) as readonly { e164: string; label: string }[];
