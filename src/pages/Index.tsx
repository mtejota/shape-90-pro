import HeroSection from "@/components/HeroSection";
import PainSection from "@/components/PainSection";
import SolutionSection from "@/components/SolutionSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import AuthoritySection from "@/components/AuthoritySection";
import TestimonialsSection from "@/components/TestimonialsSection";
import OfferSection from "@/components/OfferSection";
import FaqSection from "@/components/FaqSection";
import FooterSection from "@/components/FooterSection";
import SocialProofToast from "@/components/SocialProofToast";
import FloatingCTA from "@/components/FloatingCTA";
import { ScrollProgress } from "@/components/AnimatedSection";

const Index = () => {
  return (
    <main className="overflow-hidden">
      <ScrollProgress />
      <HeroSection />
      <PainSection />
      <SolutionSection />
      <HowItWorksSection />
      <AuthoritySection />
      <TestimonialsSection />
      <OfferSection />
      <FaqSection />
      <FooterSection />
      <SocialProofToast />
      <FloatingCTA />
    </main>
  );
};

export default Index;
