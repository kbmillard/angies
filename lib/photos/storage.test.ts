import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  sniffImageMime,
  validateImageBytes,
} from "./storage";

function jpegStub(): Uint8Array {
  return Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
}

function pngStub(): Uint8Array {
  return Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);
}

function heicStub(): Uint8Array {
  const bytes = new Uint8Array(32);
  bytes.set([0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x63], 0);
  return bytes;
}

describe("sniffImageMime", () => {
  it("detects JPEG even when the browser reports an empty type (iOS Photos)", () => {
    assert.equal(sniffImageMime(jpegStub(), ""), "image/jpeg");
  });

  it("detects PNG", () => {
    assert.equal(sniffImageMime(pngStub(), "application/octet-stream"), "image/png");
  });

  it("rejects HEIC from iPhone camera rolls", () => {
    assert.equal(sniffImageMime(heicStub(), "image/heic"), null);
  });
});

describe("validateImageBytes", () => {
  it("accepts JPEG bytes with an empty MIME type", () => {
    assert.equal(validateImageBytes(jpegStub(), ""), null);
  });

  it("rejects HEIC with a clear message", () => {
    const err = validateImageBytes(heicStub(), "image/heic");
    assert.ok(err);
    assert.match(err, /JPEG, PNG, WebP, or GIF/i);
  });

  it("rejects oversized files", () => {
    const huge = new Uint8Array(13 * 1024 * 1024);
    huge.set([0xff, 0xd8, 0xff], 0);
    const err = validateImageBytes(huge, "image/jpeg");
    assert.ok(err);
    assert.match(err, /too large/i);
  });
});
