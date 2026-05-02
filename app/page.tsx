import { HomeView } from "@/components/home/HomeView";
import { LocationsCatalogProvider } from "@/context/LocationsCatalogContext";
import { MenuCatalogProvider } from "@/context/MenuCatalogContext";
import { OrderProvider } from "@/context/OrderContext";
import { ScheduleCatalogProvider } from "@/context/ScheduleCatalogContext";

export default function Page() {
  return (
    <MenuCatalogProvider>
      <LocationsCatalogProvider>
        <ScheduleCatalogProvider>
          <OrderProvider>
            <HomeView />
          </OrderProvider>
        </ScheduleCatalogProvider>
      </LocationsCatalogProvider>
    </MenuCatalogProvider>
  );
}
