import { isAdminPasswordConfigured } from "@/lib/admin/session";
import { isBlobConfigured } from "@/lib/photos/storage";

export type PhotosAdminStatus = {
  passwordConfigured: boolean;
  metadataMode: "postgres" | "local-json";
  blobConfigured: boolean;
  devLocalUpload: boolean;
};

export function getPhotosAdminStatus(): PhotosAdminStatus {
  return {
    passwordConfigured: isAdminPasswordConfigured(),
    metadataMode: process.env.DATABASE_URL?.trim() ? "postgres" : "local-json",
    blobConfigured: isBlobConfigured(),
    devLocalUpload: process.env.NODE_ENV !== "production",
  };
}
