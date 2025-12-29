import { BadgeCheck } from 'lucide-react';
import { useVendor } from '@/contexts/VendorContext';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface VerifiedVendorBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const VerifiedVendorBadge = ({ size = 'md', showText = true }: VerifiedVendorBadgeProps) => {
  const { isVerifiedVendor, vendorData } = useVendor();

  if (!isVerifiedVendor) return null;

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10 border border-primary/20 cursor-default">
          <BadgeCheck className={`${sizeClasses[size]} text-primary`} />
          {showText && (
            <span className={`${textSizeClasses[size]} font-medium text-primary`}>
              Verified
            </span>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <div className="text-sm">
          <p className="font-semibold">{vendorData.businessName}</p>
          <p className="text-muted-foreground">Verified Vendor</p>
          {vendorData.registeredAt && (
            <p className="text-xs text-muted-foreground mt-1">
              Since {new Date(vendorData.registeredAt).toLocaleDateString('en-IN')}
            </p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};
