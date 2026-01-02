import React, { useState } from 'react';
import { Mic, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { VoiceInputModal } from './VoiceInputModal';
import { useLanguage } from '@/contexts/LanguageContext';
import { ParsedCommand } from '@/utils/voiceCommandParser';
import { cn } from '@/lib/utils';

interface FloatingVoiceButtonProps {
  onCommandConfirmed?: (command: ParsedCommand) => void;
}

export function FloatingVoiceButton({ onCommandConfirmed }: FloatingVoiceButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const { t } = useLanguage();

  const handleCommandConfirmed = (command: ParsedCommand) => {
    onCommandConfirmed?.(command);
    
    // Store in voice history
    const history = JSON.parse(localStorage.getItem('voice-history') || '[]');
    history.unshift({
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      command: command.rawText,
      parsedAction: command.action,
      type: command.type,
      product: command.product,
      quantity: command.quantity,
      amount: command.amount,
      updatedModules: command.type === 'sale' ? ['Sales', 'Inventory'] : 
                      command.type === 'inventory' ? ['Inventory'] :
                      command.type === 'expired' ? ['Inventory', 'Waste Log'] : ['Sales']
    });
    localStorage.setItem('voice-history', JSON.stringify(history.slice(0, 100)));
  };

  const handleOpenModal = (demo: boolean) => {
    setDemoMode(demo);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end">
        {/* Demo Mode Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => handleOpenModal(true)}
              size="sm"
              variant="outline"
              className={cn(
                "h-10 w-10 rounded-full shadow-md",
                "bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20",
                "text-amber-600"
              )}
            >
              <Zap className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Demo Mode (for presentations)</p>
          </TooltipContent>
        </Tooltip>

        {/* Main Voice Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => handleOpenModal(false)}
              size="lg"
              className={cn(
                "h-14 w-14 rounded-full shadow-lg",
                "bg-primary hover:bg-primary/90",
                "animate-pulse hover:animate-none",
                "transition-all duration-300 hover:scale-110"
              )}
            >
              <Mic className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>{t.voice.voiceInput}</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <VoiceInputModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCommandConfirmed={handleCommandConfirmed}
        demoMode={demoMode}
      />
    </>
  );
}
