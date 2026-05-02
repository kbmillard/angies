/** Minimal RFC-style CSV parser: quoted fields, commas inside quotes, doubled quotes. */
export function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  const flushField = () => {
    row.push(field);
    field = "";
  };

  const flushRow = () => {
    if (row.length === 0) return;
    if (row.every((c) => c.trim() === "")) {
      row = [];
      return;
    }
    rows.push(row.map((c) => c.trim()));
    row = [];
  };

  for (let i = 0; i < text.length; i++) {
    const c = text[i]!;
    if (inQuotes) {
      if (c === '"') {
        const next = text[i + 1];
        if (next === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      flushField();
    } else if (c === "\r") {
      if (text[i + 1] === "\n") i++;
      flushField();
      flushRow();
    } else if (c === "\n") {
      flushField();
      flushRow();
    } else {
      field += c;
    }
  }
  flushField();
  flushRow();

  return rows;
}
