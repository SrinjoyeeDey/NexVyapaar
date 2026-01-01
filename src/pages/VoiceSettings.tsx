import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mic, Volume2, Book, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageCode } from '@/utils/translations';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface VoiceSettings {
  enableVoiceInput: boolean;
  confirmBeforeExecuting: boolean;
  showTranscription: boolean;
  saveCommandHistory: boolean;
  inputSensitivity: number;
  autoStopAfter: number;
  beepOnStartStop: boolean;
}

const defaultSettings: VoiceSettings = {
  enableVoiceInput: true,
  confirmBeforeExecuting: true,
  showTranscription: true,
  saveCommandHistory: true,
  inputSensitivity: 50,
  autoStopAfter: 10,
  beepOnStartStop: true
};

export default function VoiceSettings() {
  const navigate = useNavigate();
  const { t, language, setLanguage, languageOptions } = useLanguage();
  const [settings, setSettings] = useState<VoiceSettings>(defaultSettings);

  useEffect(() => {
    const stored = localStorage.getItem('voice-settings');
    if (stored) {
      setSettings({ ...defaultSettings, ...JSON.parse(stored) });
    }
  }, []);

  const updateSetting = <K extends keyof VoiceSettings>(key: K, value: VoiceSettings[K]) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    localStorage.setItem('voice-settings', JSON.stringify(updated));
  };

  const commandExamples = {
    sales: [
      { en: "Sold 5 milk packets", hi: "5 दूध के पैकेट बेचे", bn: "5টি দুধ প্যাকেট বিক্রি" },
      { en: "Sold 10 biscuits", hi: "10 बिस्किट बेचे", bn: "10টি বিস্কুট বিক্রি" }
    ],
    inventory: [
      { en: "Add 20 Maggi", hi: "20 मैगी जोड़ें", bn: "20টি ম্যাগি যোগ করুন" },
      { en: "Stock mein 30 chips daalo", hi: "स्टॉक में 30 चिप्स डालो", bn: "স্টকে 30টি চিপস দাও" }
    ],
    expiry: [
      { en: "3 bread expired", hi: "3 ब्रेड खराब", bn: "3টি রুটি নষ্ট" },
      { en: "2 milk packets kharab ho gaye", hi: "2 दूध के पैकेट खराब हो गए", bn: "2টা দুধ খারাপ হয়ে গেছে" }
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container flex items-center gap-4 py-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Mic className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-semibold">{t.voiceSettings.title}</h1>
        </div>
      </header>

      <main className="container py-6 space-y-6 max-w-2xl">
        {/* Language Preference */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t.voiceSettings.languagePreference}</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              value={language} 
              onValueChange={(val) => setLanguage(val as LanguageCode)}
              className="grid grid-cols-2 gap-2"
            >
              {languageOptions.slice(0, 8).map((lang) => (
                <div key={lang.code} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value={lang.code} id={lang.code} />
                  <Label htmlFor={lang.code} className="cursor-pointer">
                    {lang.nativeName} <span className="text-muted-foreground text-xs">({lang.name})</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Voice Commands Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t.voiceSettings.voiceCommands}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="enableVoice">{t.voiceSettings.enableVoiceInput}</Label>
              <Switch 
                id="enableVoice" 
                checked={settings.enableVoiceInput}
                onCheckedChange={(val) => updateSetting('enableVoiceInput', val)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="confirm">{t.voiceSettings.confirmBeforeExecuting}</Label>
              <Switch 
                id="confirm" 
                checked={settings.confirmBeforeExecuting}
                onCheckedChange={(val) => updateSetting('confirmBeforeExecuting', val)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="transcription">{t.voiceSettings.showTranscription}</Label>
              <Switch 
                id="transcription" 
                checked={settings.showTranscription}
                onCheckedChange={(val) => updateSetting('showTranscription', val)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="history">{t.voiceSettings.saveCommandHistory}</Label>
              <Switch 
                id="history" 
                checked={settings.saveCommandHistory}
                onCheckedChange={(val) => updateSetting('saveCommandHistory', val)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Audio Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              {t.voiceSettings.audioSettings}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{t.voiceSettings.inputSensitivity}</Label>
                <span className="text-sm text-muted-foreground">{settings.inputSensitivity}%</span>
              </div>
              <Slider 
                value={[settings.inputSensitivity]}
                onValueChange={([val]) => updateSetting('inputSensitivity', val)}
                max={100}
                step={5}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{t.voiceSettings.autoStopAfter}</Label>
                <span className="text-sm text-muted-foreground">{settings.autoStopAfter} {t.voiceSettings.seconds}</span>
              </div>
              <Slider 
                value={[settings.autoStopAfter]}
                onValueChange={([val]) => updateSetting('autoStopAfter', val)}
                min={5}
                max={30}
                step={5}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="beep">{t.voiceSettings.beepOnStartStop}</Label>
              <Switch 
                id="beep" 
                checked={settings.beepOnStartStop}
                onCheckedChange={(val) => updateSetting('beepOnStartStop', val)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Commands Library */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Book className="h-4 w-4" />
              {t.voiceSettings.quickCommandsLibrary}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  {t.voiceSettings.viewAllCommands}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    📚 {t.commandGuide.title}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6 py-4">
                  <div>
                    <h3 className="font-semibold mb-2">{t.commandGuide.sales}:</h3>
                    <div className="space-y-2">
                      {commandExamples.sales.map((ex, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <span className="text-green-600">✓</span>
                          <span>"{ex[language as keyof typeof ex] || ex.en}"</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">{t.commandGuide.inventory}:</h3>
                    <div className="space-y-2">
                      {commandExamples.inventory.map((ex, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <span className="text-green-600">✓</span>
                          <span>"{ex[language as keyof typeof ex] || ex.en}"</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">{t.commandGuide.expiry}:</h3>
                    <div className="space-y-2">
                      {commandExamples.expiry.map((ex, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <span className="text-green-600">✓</span>
                          <span>"{ex[language as keyof typeof ex] || ex.en}"</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Tutorial */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t.voiceSettings.tutorial}</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full gap-2">
              <Play className="h-4 w-4" />
              {t.voiceSettings.watchHowToVideo}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
