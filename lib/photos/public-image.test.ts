import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isAllowedNextImageHost, normalizePublicImageSrc } from "./public-image";

describe("normalizePublicImageSrc", () => {
  it("decodes percent-encoded local menu paths so next/image does not double-encode", () => {
    assert.equal(
      normalizePublicImageSrc("/menu/menu_final/Taco%20de%20canasta.png"),
      "/menu/menu_final/Taco de canasta.png",
    );
  });

  it("leaves Vercel Blob URLs absolute so they can be proxied same-origin", () => {
    const src =
      "https://w4cehkcaqyccblgv.public.blob.vercel-storage.com/angies/menu/1779318696923-food16.png";
    assert.equal(normalizePublicImageSrc(src), src);
  });

  it("prefixes relative paths missing a leading slash", () => {
    assert.equal(normalizePublicImageSrc("gallery/truck.png"), "/gallery/truck.png");
  });
});

describe("isAllowedNextImageHost", () => {
  it("allows the public Vercel Blob hostname used by this project", () => {
    assert.equal(
      isAllowedNextImageHost("w4cehkcaqyccblgv.public.blob.vercel-storage.com"),
      true,
    );
  });

  it("rejects unknown hosts", () => {
    assert.equal(isAllowedNextImageHost("evil.example.com"), false);
  });
});
