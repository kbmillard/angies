import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ADMIN_PHOTOS_COOKIE, verifyAdminSession } from "@/lib/admin/session";
import { getPhotosAdminStatus } from "@/lib/photos/admin-status";
import { PhotosAdminClient } from "@/components/admin/PhotosAdminClient";

export const metadata: Metadata = {
  title: "Admin",
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const tab = (await searchParams).tab;
  const jar = await cookies();
  const token = jar.get(ADMIN_PHOTOS_COOKIE)?.value;
  const authed = verifyAdminSession(token);
  const status = getPhotosAdminStatus();

  return (
    <PhotosAdminClient initialAuthed={authed} status={status} initialTab={tab} />
  );
}
