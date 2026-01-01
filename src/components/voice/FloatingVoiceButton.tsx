import React, { useState } from 'react';
import { Mic } from 'lucide-react';
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

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={() => setIsModalOpen(true)}
            size="lg"
            className={cn(
              "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg",
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

      <VoiceInputModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCommandConfirmed={handleCommandConfirmed}
      />
    </>
  );
}
