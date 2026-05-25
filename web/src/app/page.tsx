import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Steps } from "@/components/landing/Steps";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { FinalCta } from "@/components/landing/FinalCta";
import { ensureDemoSeed } from "@/lib/store";

export default function HomePage() {
  ensureDemoSeed();

  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <Features />
        <Steps />
        <Pricing />
        <FAQ />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
