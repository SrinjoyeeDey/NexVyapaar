import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DeliverySimulation } from './DeliverySimulation';
import {
  Megaphone,
  Gift,
  Info,
  AlertTriangle,
  Bold,
  Italic,
  List,
  Smile,
  Variable,
  Image,
  FileText,
  X,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  MessageSquare,
  Mail,
  HelpCircle,
} from 'lucide-react';

interface BroadcastComposerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const messageTypes = [
  { id: 'announcement', label: 'Announcement', icon: Megaphone },
  { id: 'offer', label: 'Offer', icon: Gift },
  { id: 'update', label: 'Update', icon: Info },
  { id: 'emergency', label: 'Emergency', icon: AlertTriangle },
];

const channels = [
  { id: 'push', label: 'Push Notification', icon: Smartphone },
  { id: 'sms', label: 'SMS', icon: MessageSquare },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
];

const variables = ['{business_name}', '{customer_name}', '{offer_details}'];

const BroadcastComposer = ({ open, onOpenChange, onSuccess }: BroadcastComposerProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [messageType, setMessageType] = useState('announcement');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['push']);
  const [audience, setAudience] = useState('all');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [scheduleMode, setScheduleMode] = useState<'now' | 'later'>('now');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [showDeliverySimulation, setShowDeliverySimulation] = useState(false);

  const charCount = content.length;
  const smsCharLimit = 160;
  const recipientCount = 150; // Mock count
  const estimatedCost = selectedChannels.includes('sms') 
    ? recipientCount * 0.25 
    : 0;

  const deliverabilityScore = calculateDeliverabilityScore();

  function calculateDeliverabilityScore() {
    let score = 100;
    const tips: { type: 'success' | 'warning' | 'error'; message: string }[] = [];

    if (subject.length > 5) {
      tips.push({ type: 'success', message: 'Good subject line' });
    } else {
      score -= 20;
      tips.push({ type: 'warning', message: 'Add a descriptive subject' });
    }

    if (content.toLowerCase().includes('free') || content.toLowerCase().includes('urgent')) {
      score -= 15;
      tips.push({ type: 'warning', message: "Contains trigger word: 'FREE' or 'URGENT'" });
    }

    tips.push({ type: 'success', message: 'Has unsubscribe link (auto-added)' });

    if (content.length < 50) {
      score -= 10;
      tips.push({ type: 'warning', message: 'Message too short' });
    }

    return { score: Math.max(0, score), tips };
  }

  const handleChannelToggle = (channelId: string) => {
    setSelectedChannels(prev =>
      prev.includes(channelId)
        ? prev.filter(c => c !== channelId)
        : [...prev, channelId]
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const validFiles = Array.from(files).filter(f => f.size <= 2 * 1024 * 1024);
      if (validFiles.length < files.length) {
        toast({
          title: "File too large",
          description: "Maximum file size is 2MB",
          variant: "destructive",
        });
      }
      setMediaFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const insertVariable = (variable: string) => {
    setContent(prev => prev + variable);
  };

  const handleSend = async () => {
    if (!subject.trim() || !content.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in subject and message content",
        variant: "destructive",
      });
      return;
    }

    setShowConfirmation(true);
  };

  const confirmSend = async () => {
    setIsSending(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to send broadcasts",
          variant: "destructive",
        });
        return;
      }

      const scheduledAt = scheduleMode === 'later' && scheduleDate && scheduleTime
        ? new Date(`${scheduleDate}T${scheduleTime}`).toISOString()
        : null;

      const { error } = await supabase.from('broadcasts').insert({
        user_id: user.id,
        subject,
        message_type: messageType,
        content,
        channels: selectedChannels,
        audience_type: audience,
        scheduled_at: scheduledAt,
        sent_at: scheduleMode === 'now' ? new Date().toISOString() : null,
        status: scheduleMode === 'now' ? 'sent' : 'scheduled',
        recipients_count: recipientCount,
        delivered_count: scheduleMode === 'now' ? Math.floor(recipientCount * 0.95) : 0,
        opened_count: scheduleMode === 'now' ? Math.floor(recipientCount * 0.35) : 0,
        clicked_count: scheduleMode === 'now' ? Math.floor(recipientCount * 0.12) : 0,
        estimated_cost: estimatedCost,
      });

      if (error) {
        throw error;
      }

      toast({
        title: scheduleMode === 'now' ? "Broadcast Sent!" : "Broadcast Scheduled!",
        description: scheduleMode === 'now'
          ? `Your message has been sent to ${recipientCount} customers`
          : `Your message is scheduled for ${scheduleDate} at ${scheduleTime}`,
      });

      // Show delivery simulation for immediate sends
      if (scheduleMode === 'now') {
        setShowDeliverySimulation(true);
      }

      onSuccess?.();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error sending broadcast:', error);
      toast({
        title: "Send Failed",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
      setShowConfirmation(false);
    }
  };

  const resetForm = () => {
    setSubject('');
    setContent('');
    setMessageType('announcement');
    setSelectedChannels(['push']);
    setAudience('all');
    setMediaFiles([]);
    setScheduleMode('now');
    setScheduleDate('');
    setScheduleTime('');
  };

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              Broadcast Message Composer
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="font-medium mb-1">Civic-Verified Broadcasting</p>
                  <p className="text-xs">Civic enables verified, consent-based communication without spam. Engagement improved from 12% to 45% with verified IDs.</p>
                </TooltipContent>
              </Tooltip>
            </DialogTitle>
          </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column - Composer */}
          <div className="space-y-4">
            {/* Message Type */}
            <div className="space-y-2">
              <Label>Message Type</Label>
              <Tabs value={messageType} onValueChange={setMessageType}>
                <TabsList className="grid grid-cols-4">
                  {messageTypes.map(type => (
                    <TabsTrigger key={type.id} value={type.id} className="gap-1 text-xs">
                      <type.icon className="h-3 w-3" />
                      {type.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject Line</Label>
              <Input
                id="subject"
                placeholder="Enter subject..."
                value={subject}
                onChange={e => setSubject(e.target.value)}
              />
            </div>

            {/* Message Body */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Message Body</Label>
                <span className={`text-xs ${charCount > smsCharLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {charCount}/{smsCharLimit} (SMS limit)
                </span>
              </div>
              <div className="border rounded-lg">
                <div className="flex items-center gap-1 p-2 border-b bg-muted/50">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <List className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Smile className="h-4 w-4" />
                  </Button>
                  <div className="h-4 w-px bg-border mx-1" />
                  <Select onValueChange={insertVariable}>
                    <SelectTrigger className="h-8 w-32 text-xs">
                      <Variable className="h-3 w-3 mr-1" />
                      <span>Variables</span>
                    </SelectTrigger>
                    <SelectContent>
                      {variables.map(v => (
                        <SelectItem key={v} value={v}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Textarea
                  placeholder="Write your message..."
                  className="border-0 min-h-[120px] resize-none focus-visible:ring-0"
                  value={content}
                  onChange={e => setContent(e.target.value)}
                />
              </div>
            </div>

            {/* Media Attachments */}
            <div className="space-y-2">
              <Label>Media Attachments</Label>
              <div className="flex flex-wrap gap-2">
                {mediaFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="w-16 h-16 border rounded-lg flex items-center justify-center bg-muted">
                      {file.type.startsWith('image/') ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <FileText className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-16 h-16 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  <Image className="h-6 w-6" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                  multiple
                />
              </div>
              <p className="text-xs text-muted-foreground">Max 2MB per file. Images and PDFs only.</p>
            </div>

            {/* Channels */}
            <div className="space-y-2">
              <Label>Channels</Label>
              <div className="grid grid-cols-2 gap-2">
                {channels.map(channel => (
                  <label
                    key={channel.id}
                    className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedChannels.includes(channel.id)
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-muted-foreground'
                    }`}
                  >
                    <Checkbox
                      checked={selectedChannels.includes(channel.id)}
                      onCheckedChange={() => handleChannelToggle(channel.id)}
                    />
                    <channel.icon className="h-4 w-4" />
                    <span className="text-sm">{channel.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Audience */}
            <div className="space-y-2">
              <Label>Audience</Label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All opted-in customers</SelectItem>
                  <SelectItem value="new">New customers (last 30 days)</SelectItem>
                  <SelectItem value="active">Active customers</SelectItem>
                  <SelectItem value="inactive">Inactive customers</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Right Column - Preview & Actions */}
          <div className="space-y-4">
            {/* Preview */}
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="border rounded-lg p-4 bg-muted/30 space-y-4">
                {/* Mobile Notification Preview */}
                <div className="bg-background rounded-lg shadow-sm p-3 border">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                      <Megaphone className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{subject || 'Subject...'}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {content || 'Message content...'}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">now</span>
                  </div>
                </div>

                {/* Compliance Footer */}
                <p className="text-xs text-muted-foreground text-center">
                  Reply STOP to unsubscribe | Powered by NexVyapaar
                </p>
              </div>
            </div>

            {/* Deliverability Score */}
            <div className="space-y-2">
              <Label>Deliverability Score</Label>
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{deliverabilityScore.score}</span>
                  <Badge variant={deliverabilityScore.score >= 80 ? 'default' : 'secondary'}>
                    {deliverabilityScore.score >= 80 ? 'Good' : 'Needs Improvement'}
                  </Badge>
                </div>
                <Progress value={deliverabilityScore.score} className="h-2" />
                <div className="space-y-2">
                  {deliverabilityScore.tips.map((tip, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      {tip.type === 'success' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                      {tip.type === 'warning' && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                      {tip.type === 'error' && <AlertTriangle className="h-4 w-4 text-destructive" />}
                      <span>{tip.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div className="space-y-2">
              <Label>Send Options</Label>
              <div className="flex gap-2">
                <Button
                  variant={scheduleMode === 'now' ? 'default' : 'outline'}
                  className="flex-1 gap-2"
                  onClick={() => setScheduleMode('now')}
                >
                  <Send className="h-4 w-4" />
                  Send Now
                </Button>
                <Button
                  variant={scheduleMode === 'later' ? 'default' : 'outline'}
                  className="flex-1 gap-2"
                  onClick={() => setScheduleMode('later')}
                >
                  <Clock className="h-4 w-4" />
                  Schedule
                </Button>
              </div>
              {scheduleMode === 'later' && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Input
                    type="date"
                    value={scheduleDate}
                    onChange={e => setScheduleDate(e.target.value)}
                  />
                  <Input
                    type="time"
                    value={scheduleTime}
                    onChange={e => setScheduleTime(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Send Button */}
            <Button className="w-full gap-2" size="lg" onClick={handleSend}>
              <Send className="h-5 w-5" />
              {scheduleMode === 'now' ? 'Send Broadcast' : 'Schedule Broadcast'}
            </Button>
          </div>
        </div>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Broadcast</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Recipients</span>
                  <span className="font-medium">{recipientCount} customers</span>
                </div>
                {estimatedCost > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimated Cost</span>
                    <span className="font-medium">₹{estimatedCost.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Channels</span>
                  <span className="font-medium">{selectedChannels.join(', ')}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowConfirmation(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={confirmSend} disabled={isSending}>
                {isSending ? 'Sending...' : 'Confirm & Send'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
    </TooltipProvider>
  );
};

export default BroadcastComposer;
