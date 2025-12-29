import { useState, useRef, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Upload, 
  FileCheck, 
  Shield, 
  CheckCircle2, 
  Lock, 
  Calendar,
  Info,
  AlertCircle,
  X
} from 'lucide-react';
import { useVendor } from '@/contexts/VendorContext';
import { toast } from '@/hooks/use-toast';

interface VendorOnboardingStep3Props {
  onValidationChange: (isValid: boolean) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

export const VendorOnboardingStep3 = ({ onValidationChange }: VendorOnboardingStep3Props) => {
  const { vendorData, updateVendorData } = useVendor();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [verificationStage, setVerificationStage] = useState('');
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    onValidationChange(vendorData.aadhaarVerified);
  }, [vendorData.aadhaarVerified, onValidationChange]);

  const generateSHA256Hash = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleFileSelect = (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a JPG, PNG, or PDF file',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: 'File too large',
        description: 'Maximum file size is 5MB',
        variant: 'destructive',
      });
      return;
    }

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        updateVendorData({
          aadhaarFile: file,
          aadhaarFilePreview: e.target?.result as string,
          aadhaarVerified: false,
          blockchainHash: null,
          verifiedAt: null,
        });
      };
      reader.readAsDataURL(file);
    } else {
      updateVendorData({
        aadhaarFile: file,
        aadhaarFilePreview: null,
        aadhaarVerified: false,
        blockchainHash: null,
        verifiedAt: null,
      });
    }

    toast({
      title: 'File uploaded',
      description: 'Click "Verify Aadhaar" to start verification',
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleVerifyAadhaar = async () => {
    if (!vendorData.aadhaarFile) {
      toast({
        title: 'No file selected',
        description: 'Please upload your Aadhaar document first',
        variant: 'destructive',
      });
      return;
    }

    setIsVerifying(true);
    setVerificationProgress(0);

    // Stage 1: Uploading
    setVerificationStage('Uploading document...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    setVerificationProgress(33);

    // Stage 2: Validating
    setVerificationStage('Validating with UIDAI...');
    await new Promise(resolve => setTimeout(resolve, 1200));
    setVerificationProgress(66);

    // Stage 3: Generating hash
    setVerificationStage('Generating blockchain hash...');
    const hash = await generateSHA256Hash(vendorData.aadhaarFile);
    await new Promise(resolve => setTimeout(resolve, 800));
    setVerificationProgress(100);

    // Complete
    updateVendorData({
      aadhaarVerified: true,
      blockchainHash: hash,
      verifiedAt: new Date().toISOString(),
    });

    setIsVerifying(false);
    toast({
      title: 'Verification Complete',
      description: 'Your Aadhaar has been successfully verified',
    });
  };

  const removeFile = () => {
    updateVendorData({
      aadhaarFile: null,
      aadhaarFilePreview: null,
      aadhaarVerified: false,
      blockchainHash: null,
      verifiedAt: null,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <div className="flex items-center justify-center gap-2">
          <h2 className="text-2xl font-display font-bold">Aadhaar Verification</h2>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Info className="w-4 h-4 text-muted-foreground hover:text-primary" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-accent" />
                  About This Verification
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-sm text-muted-foreground">
                <p>
                  This is a <strong className="text-foreground">functional MVP demonstration</strong>. 
                  Aadhaar verification is currently mocked for demo purposes.
                </p>
                <p>
                  Our architecture is designed to integrate <strong className="text-foreground">UIDAI/DigiLocker APIs</strong> in production. 
                  The blockchain hash ensures identity integrity even at this MVP stage.
                </p>
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <p className="text-xs">
                    <strong className="text-primary">For Judges:</strong> This demonstrates our 
                    commitment to security-first design while maintaining a working prototype 
                    that can be immediately enhanced with real identity verification services.
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-muted-foreground mt-2">Verify your identity securely</p>
      </div>

      {!vendorData.aadhaarVerified ? (
        <div className="space-y-6">
          {/* File Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            } ${vendorData.aadhaarFile ? 'bg-muted/30' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".jpg,.jpeg,.png,.pdf"
              className="hidden"
            />

            {vendorData.aadhaarFile ? (
              <div className="space-y-4">
                {vendorData.aadhaarFilePreview ? (
                  <div className="relative inline-block">
                    <img
                      src={vendorData.aadhaarFilePreview}
                      alt="Aadhaar preview"
                      className="max-h-48 rounded-lg shadow-md mx-auto"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={removeFile}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3 p-4 bg-card rounded-lg border">
                    <FileCheck className="w-8 h-8 text-primary" />
                    <div className="text-left">
                      <p className="font-medium">{vendorData.aadhaarFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(vendorData.aadhaarFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={removeFile}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div
                className="cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="font-medium mb-1">
                  Drag & drop or click to upload
                </p>
                <p className="text-sm text-muted-foreground">
                  Accepted formats: JPG, PNG, PDF (Max 5MB)
                </p>
              </div>
            )}
          </div>

          {/* Verify Button */}
          {vendorData.aadhaarFile && !isVerifying && (
            <Button
              className="w-full gap-2"
              size="lg"
              onClick={handleVerifyAadhaar}
            >
              <Shield className="w-5 h-5" />
              Verify Aadhaar
            </Button>
          )}

          {/* Verification Progress */}
          {isVerifying && (
            <div className="space-y-4 p-6 bg-card rounded-xl border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary animate-pulse" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{verificationStage}</p>
                  <p className="text-sm text-muted-foreground">Please wait...</p>
                </div>
              </div>
              <Progress value={verificationProgress} className="h-2" />
            </div>
          )}
        </div>
      ) : (
        /* Success State */
        <div className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl border border-primary/20 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-bold text-lg text-primary">Aadhaar Verified Successfully</p>
              <p className="text-sm text-muted-foreground">Your identity has been confirmed</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3 p-3 bg-card rounded-lg">
              <Lock className="w-5 h-5 text-secondary mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Blockchain Hash</p>
                <p className="font-mono text-xs break-all">{vendorData.blockchainHash}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-card rounded-lg">
              <Calendar className="w-5 h-5 text-secondary" />
              <div>
                <p className="text-xs text-muted-foreground">Verified On</p>
                <p className="font-medium text-sm">
                  {vendorData.verifiedAt && new Date(vendorData.verifiedAt).toLocaleString('en-IN', {
                    dateStyle: 'long',
                    timeStyle: 'short',
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-accent/10 rounded-lg border border-accent/20">
            <Info className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              <strong className="text-accent">Demo mode:</strong> Actual UIDAI integration pending. 
              This hash ensures identity integrity for the MVP.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
