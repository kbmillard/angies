import { redirect } from "next/navigation";

/** Admin index — same app on custom domain (e.g. angieskc.com/admin → photos). */
export default function AdminIndexPage() {
  redirect("/admin/photos");
}
