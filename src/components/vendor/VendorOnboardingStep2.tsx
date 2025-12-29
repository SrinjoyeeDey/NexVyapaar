import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MapPin, Navigation, Building, Map } from 'lucide-react';
import { useVendor } from '@/contexts/VendorContext';
import { toast } from '@/hooks/use-toast';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
  'Andaman and Nicobar Islands', 'Dadra and Nagar Haveli and Daman and Diu', 'Lakshadweep'
];

const PIN_REGEX = /^[1-9][0-9]{5}$/;

interface VendorOnboardingStep2Props {
  onValidationChange: (isValid: boolean) => void;
}

export const VendorOnboardingStep2 = ({ onValidationChange }: VendorOnboardingStep2Props) => {
  const { vendorData, updateVendorData } = useVendor();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!vendorData.addressLine1.trim()) {
      newErrors.addressLine1 = 'Address line 1 is required';
    }

    if (!vendorData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!vendorData.state) {
      newErrors.state = 'State is required';
    }

    if (!vendorData.pinCode.trim()) {
      newErrors.pinCode = 'PIN code is required';
    } else if (!PIN_REGEX.test(vendorData.pinCode)) {
      newErrors.pinCode = 'Invalid PIN code (6 digits)';
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0 &&
                    vendorData.addressLine1.trim() !== '' &&
                    vendorData.city.trim() !== '' &&
                    vendorData.state !== '' &&
                    vendorData.pinCode.trim() !== '';
    onValidationChange(isValid);
    return isValid;
  };

  useEffect(() => {
    validateForm();
  }, [vendorData.addressLine1, vendorData.city, vendorData.state, vendorData.pinCode]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: 'Geolocation not supported',
        description: 'Your browser does not support geolocation',
        variant: 'destructive',
      });
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateVendorData({
          coordinates: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
        });
        toast({
          title: 'Location captured',
          description: 'Your current location has been saved',
        });
        setIsGettingLocation(false);
      },
      (error) => {
        toast({
          title: 'Location error',
          description: error.message || 'Could not get your location',
          variant: 'destructive',
        });
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <MapPin className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-display font-bold">Location Details</h2>
        <p className="text-muted-foreground mt-2">Where is your business located?</p>
      </div>

      <div className="space-y-4">
        {/* Address Line 1 */}
        <div className="space-y-2">
          <Label htmlFor="addressLine1" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            Address Line 1 <span className="text-destructive">*</span>
          </Label>
          <Input
            id="addressLine1"
            placeholder="Shop No., Building Name, Street"
            value={vendorData.addressLine1}
            onChange={(e) => updateVendorData({ addressLine1: e.target.value })}
            className={errors.addressLine1 ? 'border-destructive' : ''}
          />
          {errors.addressLine1 && (
            <p className="text-sm text-destructive">{errors.addressLine1}</p>
          )}
        </div>

        {/* Address Line 2 */}
        <div className="space-y-2">
          <Label htmlFor="addressLine2">Address Line 2</Label>
          <Input
            id="addressLine2"
            placeholder="Landmark, Area"
            value={vendorData.addressLine2}
            onChange={(e) => updateVendorData({ addressLine2: e.target.value })}
          />
        </div>

        {/* City and State */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">
              City <span className="text-destructive">*</span>
            </Label>
            <Input
              id="city"
              placeholder="e.g., Mumbai"
              value={vendorData.city}
              onChange={(e) => updateVendorData({ city: e.target.value })}
              className={errors.city ? 'border-destructive' : ''}
            />
            {errors.city && (
              <p className="text-sm text-destructive">{errors.city}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">
              State <span className="text-destructive">*</span>
            </Label>
            <Select
              value={vendorData.state}
              onValueChange={(value) => updateVendorData({ state: value })}
            >
              <SelectTrigger className={errors.state ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {INDIAN_STATES.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.state && (
              <p className="text-sm text-destructive">{errors.state}</p>
            )}
          </div>
        </div>

        {/* PIN Code */}
        <div className="space-y-2">
          <Label htmlFor="pinCode">
            PIN Code <span className="text-destructive">*</span>
          </Label>
          <Input
            id="pinCode"
            placeholder="e.g., 400001"
            value={vendorData.pinCode}
            onChange={(e) => updateVendorData({ pinCode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
            className={errors.pinCode ? 'border-destructive' : ''}
            maxLength={6}
          />
          {errors.pinCode && (
            <p className="text-sm text-destructive">{errors.pinCode}</p>
          )}
        </div>

        {/* Map and Location Button */}
        <div className="space-y-4 pt-4">
          <div className="relative rounded-xl overflow-hidden border border-border bg-muted/30">
            <div className="aspect-video w-full bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center">
              <div className="text-center">
                <Map className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                {vendorData.coordinates ? (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-primary">Location Captured</p>
                    <p className="text-xs text-muted-foreground">
                      Lat: {vendorData.coordinates.lat.toFixed(6)}, 
                      Lng: {vendorData.coordinates.lng.toFixed(6)}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Use the button below to capture your location
                  </p>
                )}
              </div>
            </div>
            {vendorData.coordinates && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  <MapPin className="w-8 h-8 text-destructive drop-shadow-lg" />
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-destructive animate-ping" />
                </div>
              </div>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full gap-2"
            onClick={handleGetCurrentLocation}
            disabled={isGettingLocation}
          >
            <Navigation className={`w-4 h-4 ${isGettingLocation ? 'animate-spin' : ''}`} />
            {isGettingLocation ? 'Getting Location...' : 'Use Current Location'}
          </Button>
        </div>
      </div>
    </div>
  );
};
