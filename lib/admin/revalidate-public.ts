import { revalidatePath } from "next/cache";

/** Bust cached homepage data after admin edits (menu/locations/schedule APIs are dynamic). */
export function revalidatePublicCatalog(): void {
  revalidatePath("/", "layout");
}
