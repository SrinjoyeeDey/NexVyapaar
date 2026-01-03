import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Mic, Square, Check, Edit, X, Loader2, HelpCircle, Zap } from 'lucide-react';
import { WaveformVisualizer } from './WaveformVisualizer';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { useLanguage } from '@/contexts/LanguageContext';
import { parseVoiceCommand, ParsedCommand } from '@/utils/voiceCommandParser';
import { toast } from 'sonner';

interface VoiceInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCommandConfirmed: (command: ParsedCommand) => void;
  demoMode?: boolean;
}

type ModalState = 'listening' | 'processing' | 'result' | 'clarify';

// Pre-recorded demo samples for smooth judge presentations
const demoSamples = [
  { text: "Sold 10 Parle-G biscuits", language: 'en' },
  { text: "Added 20 Maggi packets to inventory", language: 'en' },
  { text: "Received 500 rupees from Raj Kumar", language: 'en' },
  { text: "5 milk packets expired", language: 'en' },
  { text: "10 पार्ले-जी बिस्किट बेचे", language: 'hi' },
  { text: "20 मैगी स्टॉक में जोड़ें", language: 'hi' },
  { text: "১০টি Parle-G বিস্কুট বিক্রি করেছি", language: 'bn' },
];

export function VoiceInputModal({ isOpen, onClose, onCommandConfirmed, demoMode = false }: VoiceInputModalProps) {
  const { t, language } = useLanguage();
  const [modalState, setModalState] = useState<ModalState>('listening');
  const [recordingTime, setRecordingTime] = useState(0);
  const [parsedCommand, setParsedCommand] = useState<ParsedCommand | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [manualProduct, setManualProduct] = useState<string>('');
  const [manualQuantity, setManualQuantity] = useState<string>('');
  const [manualAmount, setManualAmount] = useState<string>('');
  const [demoTranscript, setDemoTranscript] = useState('');
  const [demoSampleIndex, setDemoSampleIndex] = useState(0);

  const processTranscript = useCallback((text: string, lang: string) => {
    setModalState('processing');
    
    // In demo mode, process instantly; otherwise simulate delay
    const delay = demoMode ? 500 : 1500;
    
    setTimeout(() => {
      const parsed = parseVoiceCommand(text, lang);
      setParsedCommand(parsed);

      const needsProduct = (parsed.type === 'sale' || parsed.type === 'inventory' || parsed.type === 'expired') && !parsed.product;
      const needsQty = (parsed.type === 'sale' || parsed.type === 'inventory' || parsed.type === 'expired') && !parsed.quantity;
      const needsAmount = parsed.type === 'sale' && !parsed.amount;

      if (parsed.type === 'unknown') {
        toast.error(t.voice.commandNotUnderstood);
        setModalState('listening');
      } else if ((parsed.suggestions && parsed.suggestions.length > 0) || needsProduct || needsQty || needsAmount) {
        setManualProduct(parsed.product || '');
        setManualQuantity(parsed.quantity ? String(parsed.quantity) : '');
        setManualAmount(parsed.amount ? String(parsed.amount) : '');
        setModalState('clarify');
      } else {
        setModalState('result');
      }
    }, delay);
  }, [demoMode, t]);

  const handleResult = useCallback((result: { transcript: string; isFinal: boolean }) => {
    if (result.isFinal && result.transcript.trim()) {
      processTranscript(result.transcript, language);
    }
  }, [language, processTranscript]);

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
    if (isOpen && modalState === 'listening' && !demoMode) {
      const timer = setTimeout(() => {
        startListening();
      }, 100);
      setRecordingTime(0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, modalState, demoMode, startListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  // Demo mode: simulate typing effect
  const runDemoSample = useCallback(() => {
    const sample = demoSamples[demoSampleIndex % demoSamples.length];
    let charIndex = 0;
    setDemoTranscript('');
    setRecordingTime(0);
    
    const typeInterval = setInterval(() => {
      if (charIndex <= sample.text.length) {
        setDemoTranscript(sample.text.slice(0, charIndex));
        charIndex++;
        setRecordingTime(Math.floor(charIndex / 10));
      } else {
        clearInterval(typeInterval);
        setTimeout(() => {
          processTranscript(sample.text, sample.language);
        }, 300);
      }
    }, 50);

    return () => clearInterval(typeInterval);
  }, [demoSampleIndex, processTranscript]);

  const handleClose = () => {
    stopListening();
    resetTranscript();
    setModalState('listening');
    setParsedCommand(null);
    setSelectedProduct('');
    setManualProduct('');
    setManualQuantity('');
    setManualAmount('');
    setRecordingTime(0);
    setDemoTranscript('');
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
    if (parsedCommand?.suggestions?.length) {
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
      return;
    }

    // Manual clarification (missing fields)
    if (!parsedCommand) return;

    const qty = manualQuantity ? Number(manualQuantity) : undefined;
    const amt = manualAmount ? Number(manualAmount) : undefined;

    const updated: ParsedCommand = {
      ...parsedCommand,
      product: manualProduct || parsedCommand.product,
      quantity: Number.isFinite(qty) ? qty : parsedCommand.quantity,
      amount: Number.isFinite(amt) ? amt : parsedCommand.amount,
      confidence: 0.85,
      suggestions: undefined,
    };

    setParsedCommand(updated);
    setModalState('result');
  };

  const handleRetry = () => {
    resetTranscript();
    setParsedCommand(null);
    setSelectedProduct('');
    setRecordingTime(0);
    setDemoTranscript('');
    setModalState('listening');
    if (demoMode) {
      setDemoSampleIndex(prev => prev + 1);
    } else {
      startListening();
    }
  };

  const handleDemoStart = () => {
    runDemoSample();
  };

  const handleNextDemoSample = () => {
    setDemoSampleIndex(prev => prev + 1);
    setDemoTranscript('');
    setModalState('listening');
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
                {demoMode ? (
                  <>
                    <Zap className="h-6 w-6 text-amber-500" />
                    <span className="text-xl font-semibold">Demo Mode</span>
                  </>
                ) : (
                  <>
                    <Mic className="h-6 w-6 animate-pulse" />
                    <span className="text-xl font-semibold">{t.voice.listening}</span>
                  </>
                )}
              </div>

              <WaveformVisualizer 
                audioLevel={demoMode ? (demoTranscript.length % 10) * 0.1 : audioLevel} 
                isActive={isListening || demoTranscript.length > 0} 
              />

              <div className="text-sm text-muted-foreground">
                {formatTime(recordingTime)}
              </div>

              {(transcript || interimTranscript || demoTranscript) && (
                <div className="bg-muted/50 rounded-lg p-4 min-h-[60px]">
                  <p className="text-foreground">
                    {demoMode ? demoTranscript : (
                      <>
                        {transcript}
                        <span className="text-muted-foreground">{interimTranscript}</span>
                      </>
                    )}
                  </p>
                </div>
              )}

              {demoMode ? (
                <div className="flex flex-col gap-3">
                  <Button 
                    onClick={handleDemoStart}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                    size="lg"
                  >
                    <Zap className="h-5 w-5 mr-2" />
                    Run Demo Sample
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Sample {(demoSampleIndex % demoSamples.length) + 1} of {demoSamples.length}: "{demoSamples[demoSampleIndex % demoSamples.length].text}"
                  </p>
                  <Button variant="ghost" size="sm" onClick={handleNextDemoSample}>
                    Next Sample →
                  </Button>
                </div>
              ) : (
                <>
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
                </>
              )}
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
                <p className="text-foreground">{demoMode ? demoTranscript : transcript}</p>
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
                {parsedCommand.suggestions?.length ? (
                  <>
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
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label>{t.voice.product}</Label>
                      <Input value={manualProduct} onChange={(e) => setManualProduct(e.target.value)} placeholder="Parle-G / Milk / ..." />
                    </div>
                    <div className="grid gap-2">
                      <Label>{t.voice.quantity}</Label>
                      <Input value={manualQuantity} onChange={(e) => setManualQuantity(e.target.value)} inputMode="numeric" placeholder="10" />
                    </div>
                    {parsedCommand.type === 'sale' && (
                      <div className="grid gap-2">
                        <Label>{t.voice.amount}</Label>
                        <Input value={manualAmount} onChange={(e) => setManualAmount(e.target.value)} inputMode="numeric" placeholder="100" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleProductSelect} 
                  className="flex-1"
                  disabled={parsedCommand.suggestions?.length ? !selectedProduct : (!manualProduct || !manualQuantity)}
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
