"use client";

import { CloverPaymentModal } from "@/components/clover/CloverPaymentModal";
import { CateringSection } from "@/components/catering/CateringSection";
import { FinalConversion } from "@/components/cta/FinalConversion";
import { SiteFooter } from "@/components/footer/SiteFooter";
import { Hero } from "@/components/hero/Hero";
import { InteractiveMenu } from "@/components/menu/InteractiveMenu";
import { LocationsSection } from "@/components/locations/LocationsSection";
import BrandTicker from "@/components/marquee/BrandTicker";
import { EditorialNav } from "@/components/nav/EditorialNav";
import { OrderDrawer } from "@/components/order/OrderDrawer";
import { FixedBrandBackdrop } from "@/components/prologue/FixedBrandBackdrop";
import { Prologue } from "@/components/prologue/Prologue";
import { SocialPromoSection } from "@/components/social/SocialPromoSection";
import { StorySection } from "@/components/story/StorySection";
import { useOrder } from "@/context/OrderContext";

export function HomeView() {
  const { paymentModalOpen, setPaymentModalOpen } = useOrder();

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50">
        <BrandTicker />
        <EditorialNav />
      </div>
      <main className="relative">
        <FixedBrandBackdrop />
        <Hero />
        <Prologue />
        <StorySection />
        <InteractiveMenu />
        <LocationsSection />
        <SocialPromoSection />
        <CateringSection />
        <FinalConversion />
        <SiteFooter />
      </main>
      <OrderDrawer />
      <CloverPaymentModal open={paymentModalOpen} onOpenChange={setPaymentModalOpen} />
    </>
  );
}
