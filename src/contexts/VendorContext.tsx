import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

export interface CivicConnection {
  civicId: string;
  connectedAt: string;
  isActive: boolean;
}

interface VendorContextType {
  vendorData: VendorData;
  updateVendorData: (data: Partial<VendorData>) => void;
  resetVendorData: () => void;
  isVerifiedVendor: boolean;
  saveVendorToDatabase: () => Promise<boolean>;
  loadVendorFromDatabase: () => Promise<void>;
  isLoading: boolean;
  civicConnection: CivicConnection | null;
  connectCivic: () => Promise<boolean>;
  disconnectCivic: () => Promise<void>;
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
  const [isLoading, setIsLoading] = useState(true);
  const [civicConnection, setCivicConnection] = useState<CivicConnection | null>(null);

  useEffect(() => {
    loadVendorFromDatabase();
    loadCivicConnection();
  }, []);

  const loadVendorFromDatabase = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading vendor data:', error);
        setIsLoading(false);
        return;
      }

      if (data) {
        setVendorData({
          businessName: data.business_name || '',
          businessCategory: data.business_category || '',
          gstNumber: data.gst_number || '',
          storeDescription: data.store_description || '',
          addressLine1: data.address_line1 || '',
          addressLine2: data.address_line2 || '',
          city: data.city || '',
          state: data.state || '',
          pinCode: data.pin_code || '',
          coordinates: data.latitude && data.longitude 
            ? { lat: data.latitude, lng: data.longitude } 
            : null,
          aadhaarFile: null,
          aadhaarFilePreview: null,
          aadhaarVerified: data.aadhaar_verified || false,
          blockchainHash: data.blockchain_hash || null,
          verifiedAt: data.verified_at || null,
          isRegistered: data.is_registered || false,
          registeredAt: data.registered_at || null,
        });
      }
    } catch (error) {
      console.error('Error loading vendor:', error);
    }
    setIsLoading(false);
  };

  const loadCivicConnection = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('civic_connections')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data && !error) {
        setCivicConnection({
          civicId: data.civic_id,
          connectedAt: data.connected_at,
          isActive: data.is_active,
        });
      }
    } catch (error) {
      console.error('Error loading civic connection:', error);
    }
  };

  const saveVendorToDatabase = async (): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const vendorRecord = {
        user_id: user.id,
        business_name: vendorData.businessName,
        business_category: vendorData.businessCategory,
        gst_number: vendorData.gstNumber || null,
        store_description: vendorData.storeDescription || null,
        address_line1: vendorData.addressLine1 || null,
        address_line2: vendorData.addressLine2 || null,
        city: vendorData.city || null,
        state: vendorData.state || null,
        pin_code: vendorData.pinCode || null,
        latitude: vendorData.coordinates?.lat || null,
        longitude: vendorData.coordinates?.lng || null,
        aadhaar_verified: vendorData.aadhaarVerified,
        blockchain_hash: vendorData.blockchainHash,
        verified_at: vendorData.verifiedAt,
        is_registered: vendorData.isRegistered,
        registered_at: vendorData.registeredAt,
      };

      const { error } = await supabase
        .from('vendors')
        .upsert(vendorRecord, { onConflict: 'user_id' });

      if (error) {
        console.error('Error saving vendor:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error saving vendor:', error);
      return false;
    }
  };

  const connectCivic = async (): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const civicId = `civic_${Math.random().toString(36).substring(2, 15)}`;
      
      const { error } = await supabase
        .from('civic_connections')
        .upsert({
          user_id: user.id,
          civic_id: civicId,
          is_active: true,
        }, { onConflict: 'user_id' });

      if (error) {
        console.error('Error connecting Civic:', error);
        return false;
      }

      setCivicConnection({
        civicId,
        connectedAt: new Date().toISOString(),
        isActive: true,
      });

      return true;
    } catch (error) {
      console.error('Error connecting Civic:', error);
      return false;
    }
  };

  const disconnectCivic = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('civic_connections')
        .delete()
        .eq('user_id', user.id);

      setCivicConnection(null);
    } catch (error) {
      console.error('Error disconnecting Civic:', error);
    }
  };

  const updateVendorData = (data: Partial<VendorData>) => {
    setVendorData(prev => ({ ...prev, ...data }));
  };

  const resetVendorData = () => {
    setVendorData(initialVendorData);
  };

  const isVerifiedVendor = vendorData.isRegistered && vendorData.aadhaarVerified;

  return (
    <VendorContext.Provider value={{ 
      vendorData, 
      updateVendorData, 
      resetVendorData, 
      isVerifiedVendor,
      saveVendorToDatabase,
      loadVendorFromDatabase,
      isLoading,
      civicConnection,
      connectCivic,
      disconnectCivic,
    }}>
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
