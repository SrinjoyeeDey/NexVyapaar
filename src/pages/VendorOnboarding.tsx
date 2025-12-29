import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Store } from 'lucide-react';
import { VendorOnboardingStep1 } from '@/components/vendor/VendorOnboardingStep1';
import { VendorOnboardingStep2 } from '@/components/vendor/VendorOnboardingStep2';
import { VendorOnboardingStep3 } from '@/components/vendor/VendorOnboardingStep3';
import { VendorOnboardingStep4 } from '@/components/vendor/VendorOnboardingStep4';
import { useVendor } from '@/contexts/VendorContext';
import Confetti from 'react-confetti';
import { toast } from '@/hooks/use-toast';

const STEPS = [
  { id: 1, title: 'Business Info', shortTitle: '1' },
  { id: 2, title: 'Location', shortTitle: '2' },
  { id: 3, title: 'Verification', shortTitle: '3' },
  { id: 4, title: 'Review', shortTitle: '4' },
];

const VendorOnboarding = () => {
  const navigate = useNavigate();
  const { updateVendorData } = useVendor();
  const [currentStep, setCurrentStep] = useState(1);
  const [stepValidation, setStepValidation] = useState<Record<number, boolean>>({
    1: false,
    2: false,
    3: false,
    4: false,
  });
  const [showConfetti, setShowConfetti] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const handleValidationChange = (step: number) => (isValid: boolean) => {
    setStepValidation(prev => ({ ...prev, [step]: isValid }));
  };

  const handleNext = () => {
    if (currentStep < 4 && stepValidation[currentStep]) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    updateVendorData({
      isRegistered: true,
      registeredAt: new Date().toISOString(),
    });

    setShowConfetti(true);
    
    toast({
      title: '🎉 Registration Complete!',
      description: 'Welcome to NexVyapaar! Your vendor account is now active.',
    });

    // Redirect after confetti
    setTimeout(() => {
      navigate('/dashboard');
    }, 3000);

    setIsCompleting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={500}
        />
      )}

      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Store className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-display font-bold text-lg">NexVyapaar</h1>
                <p className="text-xs text-muted-foreground">Vendor Registration</p>
              </div>
            </div>
            <Button variant="ghost" onClick={() => navigate('/')}>
              Exit
            </Button>
          </div>
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                      currentStep === step.id
                        ? 'bg-primary text-primary-foreground scale-110 shadow-lg'
                        : currentStep > step.id
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {currentStep > step.id ? '✓' : step.shortTitle}
                  </div>
                  <span className={`text-xs mt-1 hidden sm:block ${
                    currentStep >= step.id ? 'text-foreground font-medium' : 'text-muted-foreground'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`h-0.5 w-12 sm:w-24 mx-2 transition-colors ${
                    currentStep > step.id ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-3">
            Step {currentStep} of 4
          </p>
        </div>
      </div>

      {/* Form Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-xl mx-auto">
          {currentStep === 1 && (
            <VendorOnboardingStep1 onValidationChange={handleValidationChange(1)} />
          )}
          {currentStep === 2 && (
            <VendorOnboardingStep2 onValidationChange={handleValidationChange(2)} />
          )}
          {currentStep === 3 && (
            <VendorOnboardingStep3 onValidationChange={handleValidationChange(3)} />
          )}
          {currentStep === 4 && (
            <VendorOnboardingStep4 
              onValidationChange={handleValidationChange(4)} 
              onComplete={handleComplete}
              isCompleting={isCompleting}
            />
          )}

          {/* Navigation Buttons */}
          {currentStep < 4 && (
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={!stepValidation[currentStep]}
                className="gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default VendorOnboarding;
