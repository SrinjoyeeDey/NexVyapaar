import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  Store, 
  MapPin, 
  Shield, 
  CheckCircle2,
  Building2,
  FileText,
  Hash,
  Navigation
} from 'lucide-react';
import { useVendor } from '@/contexts/VendorContext';

interface VendorOnboardingStep4Props {
  onValidationChange: (isValid: boolean) => void;
  onComplete: () => void;
  isCompleting: boolean;
}

export const VendorOnboardingStep4 = ({ 
  onValidationChange, 
  onComplete,
  isCompleting 
}: VendorOnboardingStep4Props) => {
  const { vendorData } = useVendor();
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleTermsChange = (checked: boolean) => {
    setAcceptedTerms(checked);
    onValidationChange(checked);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <CheckCircle2 className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-display font-bold">Review & Confirm</h2>
        <p className="text-muted-foreground mt-2">Please review your information</p>
      </div>

      <div className="space-y-4">
        {/* Business Information Summary */}
        <div className="p-4 bg-card rounded-xl border">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b">
            <Building2 className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Business Information</h3>
          </div>
          <div className="grid gap-3 text-sm">
            <div className="flex items-start gap-3">
              <Store className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-muted-foreground">Business Name</p>
                <p className="font-medium">{vendorData.businessName}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-muted-foreground">Category</p>
                <p className="font-medium">{vendorData.businessCategory}</p>
              </div>
            </div>
            {vendorData.gstNumber && (
              <div className="flex items-start gap-3">
                <Hash className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-muted-foreground">GST Number</p>
                  <p className="font-medium font-mono">{vendorData.gstNumber}</p>
                </div>
              </div>
            )}
            {vendorData.storeDescription && (
              <div className="flex items-start gap-3">
                <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-muted-foreground">Description</p>
                  <p className="font-medium">{vendorData.storeDescription}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Location Summary */}
        <div className="p-4 bg-card rounded-xl border">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b">
            <MapPin className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Location Details</h3>
          </div>
          <div className="grid gap-3 text-sm">
            <div className="flex items-start gap-3">
              <Building2 className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-muted-foreground">Address</p>
                <p className="font-medium">
                  {vendorData.addressLine1}
                  {vendorData.addressLine2 && `, ${vendorData.addressLine2}`}
                </p>
                <p className="font-medium">
                  {vendorData.city}, {vendorData.state} - {vendorData.pinCode}
                </p>
              </div>
            </div>
            {vendorData.coordinates && (
              <div className="flex items-start gap-3">
                <Navigation className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-muted-foreground">Coordinates</p>
                  <p className="font-medium font-mono text-xs">
                    {vendorData.coordinates.lat.toFixed(6)}, {vendorData.coordinates.lng.toFixed(6)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Verification Status */}
        <div className="p-4 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl border border-primary/20">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-primary/10">
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Verification Status</h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-primary">Aadhaar Verified</p>
              <p className="text-xs text-muted-foreground font-mono">
                Hash: {vendorData.blockchainHash?.slice(0, 20)}...
              </p>
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="p-4 bg-muted/30 rounded-xl border">
          <div className="flex items-start gap-3">
            <Checkbox
              id="terms"
              checked={acceptedTerms}
              onCheckedChange={(checked) => handleTermsChange(checked as boolean)}
              className="mt-1"
            />
            <Label htmlFor="terms" className="text-sm cursor-pointer leading-relaxed">
              I confirm that all the information provided is accurate. I agree to the{' '}
              <span className="text-primary underline cursor-pointer">Terms of Service</span>,{' '}
              <span className="text-primary underline cursor-pointer">Privacy Policy</span>, and{' '}
              <span className="text-primary underline cursor-pointer">Vendor Agreement</span>.
              I understand that false information may result in account suspension.
            </Label>
          </div>
        </div>

        {/* Complete Button */}
        <Button
          className="w-full gap-2 h-12 text-lg"
          size="lg"
          onClick={onComplete}
          disabled={!acceptedTerms || isCompleting}
        >
          {isCompleting ? (
            <>
              <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              Completing Registration...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              Complete Registration
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
