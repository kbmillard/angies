import { RedesignHomeView } from "@/components/redesign/RedesignHomeView";
import { LocationsCatalogProvider } from "@/context/LocationsCatalogContext";
import { MenuCatalogProvider } from "@/context/MenuCatalogContext";
import { OrderProvider } from "@/context/OrderContext";
import { ScheduleCatalogProvider } from "@/context/ScheduleCatalogContext";
import { SiteSettingsProvider } from "@/context/SiteSettingsContext";
import { loadSiteSettingsResolved } from "@/lib/site-settings/load";

export async function RedesignHomePage() {
  const siteSettings = await loadSiteSettingsResolved();

  return (
    <SiteSettingsProvider value={siteSettings}>
      <MenuCatalogProvider>
        <LocationsCatalogProvider>
          <ScheduleCatalogProvider>
            <OrderProvider>
              <RedesignHomeView />
            </OrderProvider>
          </ScheduleCatalogProvider>
        </LocationsCatalogProvider>
      </MenuCatalogProvider>
    </SiteSettingsProvider>
  );
}
