"use client";

import { SquarePaymentModal } from "@/components/square/SquarePaymentModal";
import { CateringSection } from "@/components/catering/CateringSection";
import { FinalConversion } from "@/components/cta/FinalConversion";
import { SiteFooter } from "@/components/footer/SiteFooter";
import { Hero } from "@/components/hero/Hero";
import { InteractiveMenu } from "@/components/menu/InteractiveMenu";
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
      <EditorialNav />
      <main className="relative">
        <FixedBrandBackdrop />
        <Hero />
        <Prologue />
        <StorySection />
        <InteractiveMenu />
        <SocialPromoSection />
        <CateringSection />
        <FinalConversion />
        <SiteFooter />
      </main>
      <OrderDrawer />
      <SquarePaymentModal open={paymentModalOpen} onOpenChange={setPaymentModalOpen} />
    </>
  );
}
