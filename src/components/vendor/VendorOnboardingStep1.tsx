import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2, FileText, Hash, Store } from 'lucide-react';
import { useVendor } from '@/contexts/VendorContext';

const BUSINESS_CATEGORIES = [
  'Grocery',
  'Medical',
  'Electronics',
  'Clothing',
  'Restaurant',
  'General Store',
  'Other',
];

// GST format: 22AAAAA0000A1Z5 (15 characters)
const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

interface VendorOnboardingStep1Props {
  onValidationChange: (isValid: boolean) => void;
}

export const VendorOnboardingStep1 = ({ onValidationChange }: VendorOnboardingStep1Props) => {
  const { vendorData, updateVendorData } = useVendor();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!vendorData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    } else if (vendorData.businessName.length < 3) {
      newErrors.businessName = 'Business name must be at least 3 characters';
    }

    if (!vendorData.businessCategory) {
      newErrors.businessCategory = 'Please select a business category';
    }

    if (vendorData.gstNumber && !GST_REGEX.test(vendorData.gstNumber)) {
      newErrors.gstNumber = 'Invalid GST format (e.g., 22AAAAA0000A1Z5)';
    }

    if (vendorData.storeDescription.length > 500) {
      newErrors.storeDescription = 'Description must be 500 characters or less';
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0 && 
                    vendorData.businessName.trim() !== '' && 
                    vendorData.businessCategory !== '';
    onValidationChange(isValid);
    return isValid;
  };

  useEffect(() => {
    validateForm();
  }, [vendorData.businessName, vendorData.businessCategory, vendorData.gstNumber, vendorData.storeDescription]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Building2 className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-display font-bold">Business Information</h2>
        <p className="text-muted-foreground mt-2">Tell us about your business</p>
      </div>

      <div className="space-y-4">
        {/* Business Name */}
        <div className="space-y-2">
          <Label htmlFor="businessName" className="flex items-center gap-2">
            <Store className="w-4 h-4" />
            Business Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="businessName"
            placeholder="e.g., Sharma General Store"
            value={vendorData.businessName}
            onChange={(e) => updateVendorData({ businessName: e.target.value })}
            className={errors.businessName ? 'border-destructive' : ''}
          />
          {errors.businessName && (
            <p className="text-sm text-destructive">{errors.businessName}</p>
          )}
        </div>

        {/* Business Category */}
        <div className="space-y-2">
          <Label htmlFor="businessCategory" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Business Category <span className="text-destructive">*</span>
          </Label>
          <Select
            value={vendorData.businessCategory}
            onValueChange={(value) => updateVendorData({ businessCategory: value })}
          >
            <SelectTrigger className={errors.businessCategory ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {BUSINESS_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.businessCategory && (
            <p className="text-sm text-destructive">{errors.businessCategory}</p>
          )}
        </div>

        {/* GST Number */}
        <div className="space-y-2">
          <Label htmlFor="gstNumber" className="flex items-center gap-2">
            <Hash className="w-4 h-4" />
            GST Number <span className="text-muted-foreground text-xs">(Optional)</span>
          </Label>
          <Input
            id="gstNumber"
            placeholder="e.g., 22AAAAA0000A1Z5"
            value={vendorData.gstNumber}
            onChange={(e) => updateVendorData({ gstNumber: e.target.value.toUpperCase() })}
            className={errors.gstNumber ? 'border-destructive' : ''}
            maxLength={15}
          />
          {errors.gstNumber && (
            <p className="text-sm text-destructive">{errors.gstNumber}</p>
          )}
          <p className="text-xs text-muted-foreground">
            15-character alphanumeric code issued by GST authorities
          </p>
        </div>

        {/* Store Description */}
        <div className="space-y-2">
          <Label htmlFor="storeDescription" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Store Description
          </Label>
          <Textarea
            id="storeDescription"
            placeholder="Describe your business, products, and services..."
            value={vendorData.storeDescription}
            onChange={(e) => updateVendorData({ storeDescription: e.target.value })}
            className={`min-h-[100px] ${errors.storeDescription ? 'border-destructive' : ''}`}
            maxLength={500}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{errors.storeDescription || ''}</span>
            <span>{vendorData.storeDescription.length}/500</span>
          </div>
        </div>
      </div>
    </div>
  );
};
