import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Users, Play, Pause, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface RushHourWidgetProps {
    onTriggerRushAction: () => void;
}

export const RushHourWidget: React.FC<RushHourWidgetProps> = ({ onTriggerRushAction }) => {
    const [isActive, setIsActive] = useState(false);
    const [progress, setProgress] = useState(0);
    const [secondsNext, setSecondsNext] = useState(8);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Toggle Rush Hour
    const toggleRushHour = () => {
        setIsActive(!isActive);
        if (!isActive) {
            toast.success("🔥 Rush Hour Simulation Started!", {
                description: "Generating random POS bills every 8 seconds..."
            });
        } else {
            toast("Simulation Paused");
        }
    };

    useEffect(() => {
        if (isActive) {
            // Timer countdown logic
            let timeLeft = 800; // 8 seconds * 100 for smoother progress

            timerRef.current = setInterval(() => {
                timeLeft -= 10;
                const secs = Math.ceil(timeLeft / 100);
                setSecondsNext(secs);
                setProgress(((800 - timeLeft) / 800) * 100);

                if (timeLeft <= 0) {
                    // Trigger Action
                    onTriggerRushAction();
                    timeLeft = 800; // Reset
                }
            }, 100); // Update every 100ms
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
            setSecondsNext(8);
            setProgress(0);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isActive, onTriggerRushAction]);

    return (
        <Card className={`border-2 transition-colors duration-500 overflow-hidden ${isActive ? 'border-amber-400 bg-amber-50/50' : 'border-slate-200 bg-white'}`}>
            <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">

                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full transition-colors ${isActive ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                            <Clock className={`w-6 h-6 ${isActive ? 'animate-bounce' : ''}`} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                Rush Hour Simulation
                                {isActive && <Zap className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />}
                            </h3>
                            <p className="text-sm text-slate-500">
                                {isActive ? 'Generating bills automatically...' : 'Simulate high-traffic environment'}
                            </p>
                        </div>
                    </div>

                    {/* Progress Indicator */}
                    {isActive && (
                        <div className="flex-1 w-full max-w-xs space-y-2">
                            <div className="flex justify-between text-xs font-semibold text-amber-700">
                                <span>Next Customer</span>
                                <span>{secondsNext}s</span>
                            </div>
                            <Progress value={progress} className="h-2 bg-amber-200 text-amber-500" />
                        </div>
                    )}

                    <Button
                        size="lg"
                        className={`min-w-[180px] font-bold transition-all shadow-md ${isActive
                                ? 'bg-amber-500 hover:bg-amber-600 text-white hover:shadow-amber-500/25'
                                : 'bg-slate-900 hover:bg-slate-800 text-white'
                            }`}
                        onClick={toggleRushHour}
                    >
                        {isActive ? (
                            <>
                                <Pause className="w-4 h-4 mr-2" />
                                Pause Rush
                            </>
                        ) : (
                            <>
                                <Play className="w-4 h-4 mr-2" />
                                Start Simulation
                            </>
                        )}
                    </Button>

                </div>
            </CardContent>
        </Card>
    );
};
