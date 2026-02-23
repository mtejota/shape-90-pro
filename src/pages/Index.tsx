import HeroSection from "@/components/HeroSection";
import PainSection from "@/components/PainSection";
import SolutionSection from "@/components/SolutionSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import AuthoritySection from "@/components/AuthoritySection";
import OfferSection from "@/components/OfferSection";
import FaqSection from "@/components/FaqSection";
import FooterSection from "@/components/FooterSection";

const Index = () => {
  return (
    <main className="overflow-hidden">
      <HeroSection />
      <PainSection />
      <SolutionSection />
      <HowItWorksSection />
      <AuthoritySection />
      <OfferSection />
      <FaqSection />
      <FooterSection />
    </main>
  );
};

export default Index;
