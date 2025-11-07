import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Upload, Sparkles, RotateCcw, Download, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const ARPreview = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [arOverlay, setArOverlay] = useState<string>("modern");
  const [processing, setProcessing] = useState(false);

  const overlays = {
    modern: { name: "Modern Minimalist", color: "from-slate-500 to-slate-700" },
    vibrant: { name: "Vibrant Colors", color: "from-purple-500 to-pink-500" },
    natural: { name: "Natural Wood", color: "from-amber-600 to-amber-800" },
    industrial: { name: "Industrial Chic", color: "from-gray-600 to-gray-800" }
  };

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      navigate("/auth");
    }
  }, [navigate]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: 1280, height: 720 }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      toast({
        title: "Camera activated! 📸",
        description: "Point at your store to preview improvements"
      });
    } catch (error) {
      toast({
        title: "Camera access denied",
        description: "Please allow camera access to use AR preview",
        variant: "destructive"
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const imageData = canvasRef.current.toDataURL('image/png');
        setCapturedImage(imageData);
        applyAROverlay(context);
      }
    }
  };

  const applyAROverlay = (context: CanvasRenderingContext2D) => {
    setProcessing(true);
    setTimeout(() => {
      // Simulate AR overlay processing
      const gradient = context.createLinearGradient(0, 0, canvasRef.current!.width, 0);
      gradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
      gradient.addColorStop(1, 'rgba(236, 72, 153, 0.3)');
      
      // Add overlay effects
      context.fillStyle = gradient;
      context.fillRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
      
      // Add AR markers
      context.strokeStyle = '#8b5cf6';
      context.lineWidth = 3;
      context.strokeRect(100, 100, 300, 200);
      
      context.font = '24px Arial';
      context.fillStyle = '#fff';
      context.fillText('New Signage', 120, 90);
      context.fillText('Updated Lighting', 120, 320);
      
      setProcessing(false);
      toast({
        title: "AR Preview Applied! ✨",
        description: `${overlays[arOverlay as keyof typeof overlays].name} overlay applied`
      });
    }, 1500);
  };

  const downloadImage = () => {
    if (capturedImage) {
      const link = document.createElement('a');
      link.download = 'ar-store-preview.png';
      link.href = capturedImage;
      link.click();
      toast({
        title: "Image downloaded! 📥",
        description: "AR preview saved to your device"
      });
    }
  };

  const reset = () => {
    setCapturedImage(null);
    if (canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="w-3 h-3" />
            Premium Feature
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-6 h-6" />
              AR Store Preview
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Visualize store improvements in real-time using your camera
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Camera/Preview Area */}
            <div className="relative bg-muted rounded-lg overflow-hidden aspect-video">
              {!stream && !capturedImage && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <Camera className="w-16 h-16 text-muted-foreground" />
                  <p className="text-muted-foreground">Start camera to preview</p>
                </div>
              )}
              
              {stream && !capturedImage && (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              )}

              {capturedImage && (
                <div className="relative w-full h-full">
                  <canvas ref={canvasRef} className="w-full h-full object-contain" />
                  {processing && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="flex flex-col items-center gap-2 text-white">
                        <Sparkles className="w-8 h-8 animate-pulse" />
                        <p>Applying AR overlay...</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">AR Overlay Style</label>
                <Select value={arOverlay} onValueChange={setArOverlay}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(overlays).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {value.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end gap-2">
                {!stream && !capturedImage && (
                  <Button onClick={startCamera} className="flex-1 gap-2">
                    <Camera className="w-4 h-4" />
                    Start Camera
                  </Button>
                )}

                {stream && !capturedImage && (
                  <>
                    <Button onClick={captureImage} className="flex-1 gap-2">
                      <Upload className="w-4 h-4" />
                      Capture
                    </Button>
                    <Button onClick={stopCamera} variant="outline">
                      Stop
                    </Button>
                  </>
                )}

                {capturedImage && (
                  <>
                    <Button onClick={downloadImage} className="flex-1 gap-2">
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                    <Button onClick={reset} variant="outline" className="gap-2">
                      <RotateCcw className="w-4 h-4" />
                      Reset
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['New Signage', 'Better Lighting', 'Modern Decor'].map((item, idx) => (
                <Card key={idx} className="bg-accent/50">
                  <CardContent className="p-4">
                    <p className="font-medium text-sm">{item}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Estimated cost: ₹{(idx + 1) * 5000}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ARPreview;
