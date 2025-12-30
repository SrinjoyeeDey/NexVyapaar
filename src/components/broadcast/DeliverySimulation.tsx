import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Send, Users, Eye, MousePointer } from 'lucide-react';

interface DeliverySimulationProps {
  isActive: boolean;
  recipientCount: number;
  onComplete?: () => void;
}

export function DeliverySimulation({ isActive, recipientCount, onComplete }: DeliverySimulationProps) {
  const [stage, setStage] = useState<'sending' | 'delivered' | 'opened' | 'clicked' | 'complete'>('sending');
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({
    sent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
  });

  useEffect(() => {
    if (!isActive) {
      setStage('sending');
      setProgress(0);
      setStats({ sent: 0, delivered: 0, opened: 0, clicked: 0 });
      return;
    }

    // Simulate delivery in stages
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 2;
        
        // Update stats based on progress
        if (newProgress <= 25) {
          setStats(s => ({
            ...s,
            sent: Math.floor((newProgress / 25) * recipientCount),
          }));
          setStage('sending');
        } else if (newProgress <= 50) {
          setStats(s => ({
            ...s,
            sent: recipientCount,
            delivered: Math.floor(((newProgress - 25) / 25) * recipientCount * 0.95),
          }));
          setStage('delivered');
        } else if (newProgress <= 75) {
          setStats(s => ({
            ...s,
            sent: recipientCount,
            delivered: Math.floor(recipientCount * 0.95),
            opened: Math.floor(((newProgress - 50) / 25) * recipientCount * 0.45),
          }));
          setStage('opened');
        } else if (newProgress <= 100) {
          setStats(s => ({
            ...s,
            sent: recipientCount,
            delivered: Math.floor(recipientCount * 0.95),
            opened: Math.floor(recipientCount * 0.45),
            clicked: Math.floor(((newProgress - 75) / 25) * recipientCount * 0.12),
          }));
          setStage('clicked');
        }
        
        if (newProgress >= 100) {
          setStage('complete');
          clearInterval(interval);
          onComplete?.();
          return 100;
        }
        
        return newProgress;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isActive, recipientCount, onComplete]);

  if (!isActive) return null;

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/30 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <h4 className="font-medium flex items-center gap-2">
          <Send className="h-4 w-4 animate-pulse" />
          Live Delivery Simulation
        </h4>
        <Badge variant={stage === 'complete' ? 'default' : 'secondary'}>
          {stage === 'complete' ? 'Complete' : 'In Progress'}
        </Badge>
      </div>

      <Progress value={progress} className="h-2" />

      <div className="grid grid-cols-4 gap-2 text-center">
        <div className={`p-2 rounded-lg transition-colors ${stage === 'sending' ? 'bg-primary/10' : ''}`}>
          <Users className={`h-4 w-4 mx-auto mb-1 ${stats.sent > 0 ? 'text-primary' : 'text-muted-foreground'}`} />
          <p className="text-lg font-bold">{stats.sent}</p>
          <p className="text-xs text-muted-foreground">Sent</p>
        </div>
        <div className={`p-2 rounded-lg transition-colors ${stage === 'delivered' ? 'bg-green-500/10' : ''}`}>
          <CheckCircle2 className={`h-4 w-4 mx-auto mb-1 ${stats.delivered > 0 ? 'text-green-500' : 'text-muted-foreground'}`} />
          <p className="text-lg font-bold">{stats.delivered}</p>
          <p className="text-xs text-muted-foreground">Delivered</p>
        </div>
        <div className={`p-2 rounded-lg transition-colors ${stage === 'opened' ? 'bg-blue-500/10' : ''}`}>
          <Eye className={`h-4 w-4 mx-auto mb-1 ${stats.opened > 0 ? 'text-blue-500' : 'text-muted-foreground'}`} />
          <p className="text-lg font-bold">{stats.opened}</p>
          <p className="text-xs text-muted-foreground">Opened</p>
        </div>
        <div className={`p-2 rounded-lg transition-colors ${stage === 'clicked' ? 'bg-purple-500/10' : ''}`}>
          <MousePointer className={`h-4 w-4 mx-auto mb-1 ${stats.clicked > 0 ? 'text-purple-500' : 'text-muted-foreground'}`} />
          <p className="text-lg font-bold">{stats.clicked}</p>
          <p className="text-xs text-muted-foreground">Clicked</p>
        </div>
      </div>

      {stage === 'complete' && (
        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-center animate-in fade-in duration-500">
          <CheckCircle2 className="h-6 w-6 text-green-500 mx-auto mb-2" />
          <p className="font-medium text-green-700 dark:text-green-400">
            Broadcast delivered successfully!
          </p>
          <p className="text-sm text-muted-foreground">
            {Math.round((stats.delivered / recipientCount) * 100)}% delivery rate • 
            {Math.round((stats.opened / stats.delivered) * 100)}% open rate
          </p>
        </div>
      )}
    </div>
  );
}
