import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Mic, Square, Check, Edit, X, Loader2, HelpCircle } from 'lucide-react';
import { WaveformVisualizer } from './WaveformVisualizer';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { useLanguage } from '@/contexts/LanguageContext';
import { parseVoiceCommand, ParsedCommand, ProductSuggestion } from '@/utils/voiceCommandParser';
import { toast } from 'sonner';

interface VoiceInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCommandConfirmed: (command: ParsedCommand) => void;
}

type ModalState = 'listening' | 'processing' | 'result' | 'clarify';

export function VoiceInputModal({ isOpen, onClose, onCommandConfirmed }: VoiceInputModalProps) {
  const { t, language } = useLanguage();
  const [modalState, setModalState] = useState<ModalState>('listening');
  const [recordingTime, setRecordingTime] = useState(0);
  const [parsedCommand, setParsedCommand] = useState<ParsedCommand | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string>('');

  const handleResult = useCallback((result: { transcript: string; isFinal: boolean }) => {
    if (result.isFinal && result.transcript.trim()) {
      setModalState('processing');
      
      // Simulate NLP processing delay
      setTimeout(() => {
        const parsed = parseVoiceCommand(result.transcript, language);
        setParsedCommand(parsed);
        
        if (parsed.type === 'unknown') {
          toast.error(t.voice.commandNotUnderstood);
          setModalState('listening');
        } else if (parsed.suggestions && parsed.suggestions.length > 0) {
          setModalState('clarify');
        } else {
          setModalState('result');
        }
      }, 1500);
    }
  }, [language, t]);

  const {
    isListening,
    transcript,
    interimTranscript,
    audioLevel,
    startListening,
    stopListening,
    resetTranscript
  } = useVoiceRecognition({
    onResult: handleResult,
    onError: (error) => {
      toast.error(error);
    }
  });

  // Timer for recording duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isListening) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isListening]);

  // Auto-start listening when modal opens
  useEffect(() => {
    if (isOpen && modalState === 'listening') {
      startListening();
      setRecordingTime(0);
    }
    return () => {
      if (isListening) {
        stopListening();
      }
    };
  }, [isOpen]);

  const handleClose = () => {
    stopListening();
    resetTranscript();
    setModalState('listening');
    setParsedCommand(null);
    setSelectedProduct('');
    setRecordingTime(0);
    onClose();
  };

  const handleStop = () => {
    stopListening();
    if (!transcript.trim() && !interimTranscript.trim()) {
      toast.error(t.voice.noSpeechDetected);
    }
  };

  const handleConfirm = () => {
    if (parsedCommand) {
      onCommandConfirmed(parsedCommand);
      toast.success(`✓ ${parsedCommand.type === 'sale' ? t.voice.saleRecorded : t.voice.inventoryUpdated}`);
      handleClose();
    }
  };

  const handleProductSelect = () => {
    if (selectedProduct && parsedCommand) {
      const updatedCommand: ParsedCommand = {
        ...parsedCommand,
        product: selectedProduct,
        amount: parsedCommand.quantity ? 
          parsedCommand.quantity * (parsedCommand.suggestions?.find(s => s.name === selectedProduct)?.price || 10) : 
          undefined,
        confidence: 0.9,
        suggestions: undefined
      };
      setParsedCommand(updatedCommand);
      setModalState('result');
    }
  };

  const handleRetry = () => {
    resetTranscript();
    setParsedCommand(null);
    setSelectedProduct('');
    setRecordingTime(0);
    setModalState('listening');
    startListening();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        <div className="bg-gradient-to-b from-background to-muted/30 p-8">
          {/* Listening State */}
          {modalState === 'listening' && (
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center gap-2 text-primary">
                <Mic className="h-6 w-6 animate-pulse" />
                <span className="text-xl font-semibold">{t.voice.listening}</span>
              </div>

              <WaveformVisualizer 
                audioLevel={audioLevel} 
                isActive={isListening} 
              />

              <div className="text-sm text-muted-foreground">
                {formatTime(recordingTime)}
              </div>

              {(transcript || interimTranscript) && (
                <div className="bg-muted/50 rounded-lg p-4 min-h-[60px]">
                  <p className="text-foreground">
                    {transcript}
                    <span className="text-muted-foreground">{interimTranscript}</span>
                  </p>
                </div>
              )}

              <Button 
                onClick={handleStop}
                variant="destructive" 
                size="lg"
                className="rounded-full h-16 w-16"
              >
                <Square className="h-6 w-6" />
              </Button>

              <p className="text-sm text-muted-foreground">
                {t.voice.tryExample}
              </p>
            </div>
          )}

          {/* Processing State */}
          {modalState === 'processing' && (
            <div className="text-center space-y-6 py-8">
              <div className="flex items-center justify-center gap-2 text-primary">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-xl font-semibold">{t.voice.processing}</span>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-foreground">{transcript}</p>
              </div>
            </div>
          )}

          {/* Result State */}
          {modalState === 'result' && parsedCommand && (
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-2 text-green-600">
                <Check className="h-6 w-6" />
                <span className="text-xl font-semibold">{t.voice.commandUnderstood}</span>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t.voice.action}:</span>
                  <span className="font-medium">{parsedCommand.action}</span>
                </div>
                {parsedCommand.product && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.voice.product}:</span>
                    <span className="font-medium">{parsedCommand.product}</span>
                  </div>
                )}
                {parsedCommand.quantity && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.voice.quantity}:</span>
                    <span className="font-medium">{parsedCommand.quantity} {t.common.packets}</span>
                  </div>
                )}
                {parsedCommand.amount && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.voice.amount}:</span>
                    <span className="font-medium">₹{parsedCommand.amount} <span className="text-xs text-muted-foreground">({t.common.autoCalculated})</span></span>
                  </div>
                )}
                {parsedCommand.customer && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Customer:</span>
                    <span className="font-medium">{parsedCommand.customer}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t.voice.date}:</span>
                  <span className="font-medium">{t.common.today}, {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleConfirm} className="flex-1">
                  <Check className="h-4 w-4 mr-2" />
                  {t.voice.confirm}
                </Button>
                <Button onClick={handleRetry} variant="outline" className="flex-1">
                  <Edit className="h-4 w-4 mr-2" />
                  {t.voice.edit}
                </Button>
                <Button onClick={handleClose} variant="ghost">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Clarify State */}
          {modalState === 'clarify' && parsedCommand && (
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-2 text-amber-600">
                <HelpCircle className="h-6 w-6" />
                <span className="text-xl font-semibold">{t.voice.pleaseCarify}</span>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-2">You said:</p>
                <p className="font-medium">"{parsedCommand.rawText}"</p>
              </div>

              <div>
                <p className="text-sm font-medium mb-3">{t.voice.whichProduct}</p>
                <RadioGroup value={selectedProduct} onValueChange={setSelectedProduct}>
                  {parsedCommand.suggestions?.map((product) => (
                    <div key={product.name} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50">
                      <RadioGroupItem value={product.name} id={product.name} />
                      <Label htmlFor={product.name} className="flex-1 cursor-pointer">
                        <span className="font-medium">{product.name}</span>
                        <span className="text-muted-foreground ml-2">(₹{product.price} {t.common.each})</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleProductSelect} 
                  className="flex-1"
                  disabled={!selectedProduct}
                >
                  {t.common.select}
                </Button>
                <Button onClick={handleRetry} variant="outline">
                  Retry
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
