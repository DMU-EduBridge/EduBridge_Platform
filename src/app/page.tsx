import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Stats } from "@/components/landing/stats";
import { CTA } from "@/components/landing/cta";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Stats />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
