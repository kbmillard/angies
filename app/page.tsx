import { permanentRedirect } from "next/navigation";

/** Legacy root — site home lives at `/redesign`. */
export default function RootPage() {
  permanentRedirect("/redesign");
}
