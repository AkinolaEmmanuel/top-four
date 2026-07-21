import { SiteNav } from "@/components/marketing/site-nav";
import { Hero } from "@/components/marketing/hero";
import { Ticker } from "@/components/marketing/ticker";
import { Competitions } from "@/components/marketing/competitions";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { FinalCta } from "@/components/marketing/final-cta";
import { SiteFooter } from "@/components/marketing/site-footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-black">
      <SiteNav />
      <main id="top">
        <Hero />
        <Ticker />
        <Competitions />
        <HowItWorks />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}
