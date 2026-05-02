#!/usr/bin/env python3
"""
Export Menu (sheet2) and Locations (sheet3) from the customer workbook to CSV
for parser validation. Uses stdlib only (no openpyxl).

Mapping matches la_hamburguesa_loca_customer_google_sheets.xlsx:
  sheet1 = Owner Guide, sheet2 = Menu, sheet3 = Locations, sheet4 = Option Groups, sheet5 = Image Guide
"""
from __future__ import annotations

import csv
import os
import re
import sys
import zipfile
import xml.etree.ElementTree as ET

NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}


def col_letters_to_index(letters: str) -> int:
    n = 0
    for ch in letters.upper():
        if not ch.isalpha():
            break
        n = n * 26 + (ord(ch) - ord("A") + 1)
    return n - 1


def split_cell_ref(ref: str) -> tuple[int, int]:
    m = re.match(r"^([A-Z]+)(\d+)$", ref, re.I)
    if not m:
        return 0, 0
    return col_letters_to_index(m.group(1)), int(m.group(2)) - 1


def load_shared_strings(z: zipfile.ZipFile) -> list[str]:
    try:
        data = z.read("xl/sharedStrings.xml")
    except KeyError:
        return []
    root = ET.fromstring(data)
    out: list[str] = []
    for si in root.findall("m:si", NS):
        texts: list[str] = []
        for t in si.findall(".//m:t", NS):
            if t.text:
                texts.append(t.text)
            if t.tail:
                texts.append(t.tail)
        out.append("".join(texts) if texts else "")
    return out


def cell_text(c: ET.Element, shared: list[str]) -> str:
    t = c.get("t")
    v = c.find("m:v", NS)
    is_el = c.find("m:is", NS)
    if t == "s" and v is not None and v.text is not None:
        i = int(v.text)
        return shared[i] if 0 <= i < len(shared) else ""
    if v is not None and v.text is not None:
        return v.text
    if is_el is not None:
        parts: list[str] = []
        for node in is_el.findall(".//m:t", NS):
            if node.text:
                parts.append(node.text)
            if node.tail:
                parts.append(node.tail)
        return "".join(parts)
    return ""


def sheet_to_rows(z: zipfile.ZipFile, sheet_path: str, shared: list[str]) -> list[list[str]]:
    data = z.read(sheet_path)
    root = ET.fromstring(data)
    rows_out: list[list[str]] = []
    for row in root.findall(".//m:sheetData/m:row", NS):
        cells: dict[int, str] = {}
        max_col = -1
        for c in row.findall("m:c", NS):
            ref = c.get("r")
            if not ref:
                continue
            col, _ = split_cell_ref(ref)
            cells[col] = cell_text(c, shared)
            max_col = max(max_col, col)
        if max_col < 0:
            continue
        line = [cells.get(i, "") for i in range(max_col + 1)]
        rows_out.append(line)
    return rows_out


def write_csv(path: str, rows: list[list[str]]) -> None:
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f, lineterminator="\n")
        for row in rows:
            w.writerow(row)


def main() -> None:
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    xlsx = sys.argv[1] if len(sys.argv) > 1 else os.path.join(root, "la_hamburguesa_loca_customer_google_sheets.xlsx")
    if not os.path.isfile(xlsx):
        print(f"ERROR: workbook not found: {xlsx}", file=sys.stderr)
        sys.exit(1)

    out_menu = os.path.join(root, "tmp", "menu-sheet-test.csv")
    out_loc = os.path.join(root, "tmp", "locations-sheet-test.csv")

    with zipfile.ZipFile(xlsx, "r") as z:
        shared = load_shared_strings(z)
        menu_rows = sheet_to_rows(z, "xl/worksheets/sheet2.xml", shared)
        loc_rows = sheet_to_rows(z, "xl/worksheets/sheet3.xml", shared)

    write_csv(out_menu, menu_rows)
    write_csv(out_loc, loc_rows)
    print(f"Wrote {out_menu} ({len(menu_rows)} rows)")
    print(f"Wrote {out_loc} ({len(loc_rows)} rows)")


if __name__ == "__main__":
    main()
