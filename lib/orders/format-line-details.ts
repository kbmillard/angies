import type { CartLine } from "@/lib/types/order";

/** Strip trailing price suffix like " — $3.75" from option labels. */
export function stripOptionPrice(label: string): string {
  return label.replace(/\s*[—–-]\s*\$\d+(?:\.\d{2})?\s*$/, "").trim();
}

function normalizeMeat(value: string): string {
  return stripOptionPrice(value).toLowerCase();
}

function meatAlreadyShown(selectedMeat: string | undefined, optionValue: string): boolean {
  if (!selectedMeat?.trim()) return false;
  return normalizeMeat(selectedMeat) === normalizeMeat(optionValue);
}

/** Plain-text detail lines for one cart line (Telegram, logs). */
export function formatLineDetailLines(line: CartLine): string[] {
  const lines: string[] = [];

  if (line.selectedMeat?.trim()) {
    lines.push(`Meat: ${stripOptionPrice(line.selectedMeat)}`);
  }

  if (line.selectedOptions) {
    for (const [groupId, value] of Object.entries(line.selectedOptions)) {
      if (groupId === "meat" && line.selectedMeat?.trim()) continue;

      const values = Array.isArray(value) ? value : [value];
      for (const raw of values) {
        if (typeof raw !== "string" || !raw.trim()) continue;
        if (meatAlreadyShown(line.selectedMeat, raw)) continue;
        lines.push(stripOptionPrice(raw));
      }
    }
  }

  if (line.modifiers?.length) {
    for (const mod of line.modifiers) {
      lines.push(stripOptionPrice(mod.label));
    }
  }

  if (line.includesFries) {
    lines.push("Includes fries");
  }

  if (line.notes?.trim()) {
    lines.push(`Notes: ${line.notes.trim()}`);
  }

  return lines;
}

/** Telegram block for one line item. */
export function formatLineItemTelegram(line: CartLine): string {
  let text = `• ${line.quantity}x ${line.name}`;
  const details = formatLineDetailLines(line);

  for (const detail of details) {
    if (detail.startsWith("Notes:")) {
      text += `\n  → ${detail.slice("Notes:".length).trim()}`;
    } else if (detail.startsWith("Meat:")) {
      text += `\n  ${detail}`;
    } else {
      text += `\n  • ${detail}`;
    }
  }

  return text;
}

/** HTML list item for email notifications. */
export function formatLineItemHtml(line: CartLine): string {
  const unitPrice = ((line.unitPriceCents ?? 0) / 100).toFixed(2);
  const lineTotal = (((line.unitPriceCents ?? 0) * line.quantity) / 100).toFixed(2);
  const details = formatLineDetailLines(line);

  const detailHtml = details
    .map((d) => `<br />&nbsp;&nbsp;&nbsp;&nbsp;• ${d}`)
    .join("");

  return `<li style="margin-bottom: 8px;">
    ${line.quantity}x ${line.name}${detailHtml}
    <br />
    <span style="color: #666; font-size: 14px;">$${unitPrice} each = $${lineTotal}</span>
  </li>`;
}

/** Compact HTML for merchant kitchen ticket. */
export function formatMerchantLineItemHtml(line: CartLine): string {
  const details = formatLineDetailLines(line);
  const detailHtml = details.map((d) => `<br />&nbsp;&nbsp;• ${d}`).join("");

  return `<li style="margin-bottom: 8px;">${line.quantity}x ${line.name}${detailHtml}</li>`;
}
