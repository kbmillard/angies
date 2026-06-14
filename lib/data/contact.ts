/** Angie’s public contact — single source of truth (not order-notification / Resend). */

export const CONTACT_PHONES = [
  { display: "(913) 433-1732", tel: "+19134331732" },
  { display: "(913) 954-8745", tel: "+19139548745" },
] as const;

export const CONTACT_EMAILS = [
  "foodtruck83@icloud.com",
  "angiesfoodtruck83@gmail.com",
] as const;

export const CONTACT = {
  phones: CONTACT_PHONES,
  emails: CONTACT_EMAILS,
  /** First email — use CONTACT.emails when showing or linking all inboxes */
  email: CONTACT_EMAILS[0],
} as const;
