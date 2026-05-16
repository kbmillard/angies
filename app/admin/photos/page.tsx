import { redirect } from "next/navigation";

/** Legacy URL → unified admin with Photos tab selected. */
export default function AdminPhotosRedirectPage() {
  redirect("/admin?tab=photos");
}
