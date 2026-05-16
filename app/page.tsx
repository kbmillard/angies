import { HomeView } from "@/components/home/HomeView";
import { LocationsCatalogProvider } from "@/context/LocationsCatalogContext";
import { MenuCatalogProvider } from "@/context/MenuCatalogContext";
import { OrderProvider } from "@/context/OrderContext";
import { ScheduleCatalogProvider } from "@/context/ScheduleCatalogContext";
import { SiteSettingsProvider } from "@/context/SiteSettingsContext";
import { loadSiteSettingsResolved } from "@/lib/site-settings/load";

export default async function Page() {
  const siteSettings = await loadSiteSettingsResolved();

  return (
    <SiteSettingsProvider value={siteSettings}>
      <MenuCatalogProvider>
        <LocationsCatalogProvider>
          <ScheduleCatalogProvider>
            <OrderProvider>
              <HomeView />
            </OrderProvider>
          </ScheduleCatalogProvider>
        </LocationsCatalogProvider>
      </MenuCatalogProvider>
    </SiteSettingsProvider>
  );
}
