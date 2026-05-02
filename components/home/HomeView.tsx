"use client";

import { CloverPaymentModal } from "@/components/clover/CloverPaymentModal";
import { CateringSection } from "@/components/catering/CateringSection";
import { FinalConversion } from "@/components/cta/FinalConversion";
import { SiteFooter } from "@/components/footer/SiteFooter";
import { GallerySection } from "@/components/gallery/GallerySection";
import { Hero } from "@/components/hero/Hero";
import { InteractiveMenu } from "@/components/menu/InteractiveMenu";
import { LocationsSection } from "@/components/locations/LocationsSection";
import { EditorialNav } from "@/components/nav/EditorialNav";
import { OrderDrawer } from "@/components/order/OrderDrawer";
import { FixedBrandBackdrop } from "@/components/prologue/FixedBrandBackdrop";
import { Prologue } from "@/components/prologue/Prologue";
import { ScheduleSection } from "@/components/schedule/ScheduleSection";
import { SocialPromoSection } from "@/components/social/SocialPromoSection";
import { StorySection } from "@/components/story/StorySection";
import { useOrder } from "@/context/OrderContext";

export function HomeView() {
  const { paymentModalOpen, setPaymentModalOpen } = useOrder();

  return (
    <>
      <EditorialNav />
      <main className="relative">
        <FixedBrandBackdrop />
        <Hero />
        <Prologue />
        <StorySection />
        <LocationsSection />
        <InteractiveMenu />
        <ScheduleSection />
        <GallerySection />
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
