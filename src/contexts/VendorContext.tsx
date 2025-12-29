import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface VendorData {
  // Step 1: Business Information
  businessName: string;
  businessCategory: string;
  gstNumber: string;
  storeDescription: string;
  
  // Step 2: Location Details
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pinCode: string;
  coordinates: { lat: number; lng: number } | null;
  
  // Step 3: Aadhaar Verification
  aadhaarFile: File | null;
  aadhaarFilePreview: string | null;
  aadhaarVerified: boolean;
  blockchainHash: string | null;
  verifiedAt: string | null;
  
  // Registration status
  isRegistered: boolean;
  registeredAt: string | null;
}

interface VendorContextType {
  vendorData: VendorData;
  updateVendorData: (data: Partial<VendorData>) => void;
  resetVendorData: () => void;
  isVerifiedVendor: boolean;
}

const initialVendorData: VendorData = {
  businessName: '',
  businessCategory: '',
  gstNumber: '',
  storeDescription: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  pinCode: '',
  coordinates: null,
  aadhaarFile: null,
  aadhaarFilePreview: null,
  aadhaarVerified: false,
  blockchainHash: null,
  verifiedAt: null,
  isRegistered: false,
  registeredAt: null,
};

const VendorContext = createContext<VendorContextType | undefined>(undefined);

export const VendorProvider = ({ children }: { children: ReactNode }) => {
  const [vendorData, setVendorData] = useState<VendorData>(initialVendorData);

  const updateVendorData = (data: Partial<VendorData>) => {
    setVendorData(prev => ({ ...prev, ...data }));
  };

  const resetVendorData = () => {
    setVendorData(initialVendorData);
  };

  const isVerifiedVendor = vendorData.isRegistered && vendorData.aadhaarVerified;

  return (
    <VendorContext.Provider value={{ vendorData, updateVendorData, resetVendorData, isVerifiedVendor }}>
      {children}
    </VendorContext.Provider>
  );
};

export const useVendor = () => {
  const context = useContext(VendorContext);
  if (context === undefined) {
    throw new Error('useVendor must be used within a VendorProvider');
  }
  return context;
};
