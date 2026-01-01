import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mic, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';

interface VoiceHistoryItem {
  id: string;
  timestamp: string;
  command: string;
  parsedAction: string;
  type: string;
  product?: string;
  quantity?: number;
  amount?: number;
  updatedModules: string[];
}

export default function VoiceHistory() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [history, setHistory] = useState<VoiceHistoryItem[]>([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('voice-history') || '[]');
    setHistory(stored);
  }, []);

  const deleteItem = (id: string) => {
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem('voice-history', JSON.stringify(updated));
  };

  const groupByDate = (items: VoiceHistoryItem[]) => {
    const groups: Record<string, VoiceHistoryItem[]> = {};
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    items.forEach(item => {
      const date = new Date(item.timestamp).toDateString();
      let label = date;
      if (date === today) label = t.voiceHistory.today;
      else if (date === yesterday) label = t.voiceHistory.yesterday;
      
      if (!groups[label]) groups[label] = [];
      groups[label].push(item);
    });

    return groups;
  };

  const groupedHistory = groupByDate(history);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container flex items-center gap-4 py-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">{t.voiceHistory.title}</h1>
        </div>
      </header>

      <main className="container py-6 space-y-6">
        {Object.keys(groupedHistory).length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Mic className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t.voiceHistory.noHistory}</p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(groupedHistory).map(([dateLabel, items]) => (
            <div key={dateLabel} className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {dateLabel}
              </h2>
              
              <div className="space-y-3">
                {items.map((item) => (
                  <Card key={item.id} className="group">
                    <CardContent className="py-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Mic className="h-5 w-5 text-primary" />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {new Date(item.timestamp).toLocaleTimeString('en-IN', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                            <span>|</span>
                            <span>🎤 {t.voiceHistory.voiceCommand}</span>
                          </div>
                          
                          <p className="font-medium text-foreground mb-2">
                            "{item.command}"
                          </p>
                          
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm text-muted-foreground">→ {t.voiceHistory.updated}:</span>
                            {item.updatedModules.map((mod) => (
                              <Badge key={mod} variant="secondary" className="text-xs">
                                {mod}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => deleteItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
