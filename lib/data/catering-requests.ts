/** Inbox for catering / truck booking requests (mailto To: line). */
export const CATERING_REQUEST_EMAILS = ["angiesfoodtruck83@gmail.com"] as const;

/** SMS recipients — same pre-filled body goes to both lines. */
export const CATERING_REQUEST_SMS_RECIPIENTS = [
  { e164: "+19134331732", label: "(913) 433-1732" },
  { e164: "+19139548745", label: "(913) 954-8745" },
] as const;
