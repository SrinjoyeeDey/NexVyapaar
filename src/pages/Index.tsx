import React, { useEffect } from 'react';
import Hero from '@/components/landing/Hero';
import ProblemSection from '@/components/landing/ProblemSection';
import SolutionSection from '@/components/landing/SolutionSection';
import FeatureShowcase from '@/components/landing/FeatureShowcase';
import SocialProof from '@/components/landing/SocialProof';
import Pricing from '@/components/landing/Pricing';
import { FinalCTA, Footer } from '@/components/landing/CTAAndFooter';

const Index = () => {
  useEffect(() => {
    // Force smooth scroll for all page
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <div className="flex flex-col w-full overflow-x-hidden antialiased">
      {/* 
        NO NAVBAR. NO FOOTER. 
        As per the request: "Pure Marketing Page • No Nav Bar • No Footer • Immersive Experience"
        The footer implemented in components is the "Minimal Footer" from Section 8.
      */}

      <Hero />
      <ProblemSection />
      <SolutionSection />
      <FeatureShowcase />
      <SocialProof />
      <Pricing />
      <FinalCTA />
      <Footer />
    </div>
  );
};

export default Index;
