"use client";

import { CloverPaymentModal } from "@/components/clover/CloverPaymentModal";
import { CateringSection } from "@/components/redesign/catering/CateringSection";
import { FinalConversion } from "@/components/redesign/cta/FinalConversion";
import { SiteFooter } from "@/components/redesign/footer/SiteFooter";
import { Hero } from "@/components/redesign/hero/Hero";
import { PageShell } from "@/components/redesign/home/PageShell";
import { InteractiveMenu } from "@/components/redesign/menu/InteractiveMenu";
import { LocationsSection } from "@/components/redesign/locations/LocationsSection";
import { OrderDrawer } from "@/components/order/OrderDrawer";
import { Prologue } from "@/components/redesign/prologue/Prologue";
import { SocialPromoSection } from "@/components/redesign/social/SocialPromoSection";
import { StorySection } from "@/components/redesign/story/StorySection";
import { useOrder } from "@/context/OrderContext";

/** Redesign homepage — only mounted at `/redesign`. */
export function RedesignHomeView() {
  const { paymentModalOpen, setPaymentModalOpen } = useOrder();

  return (
    <>
      <PageShell>
        <Hero />
        <Prologue />
        <StorySection />
        <InteractiveMenu />
        <LocationsSection />
        <SocialPromoSection />
        <CateringSection />
        <FinalConversion />
        <SiteFooter />
      </PageShell>
      <OrderDrawer />
      <CloverPaymentModal open={paymentModalOpen} onOpenChange={setPaymentModalOpen} />
    </>
  );
}
