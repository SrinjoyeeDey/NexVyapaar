import React, { useEffect, useState } from 'react';

interface WaveformVisualizerProps {
  audioLevel: number;
  isActive: boolean;
  barCount?: number;
}

export function WaveformVisualizer({ audioLevel, isActive, barCount = 7 }: WaveformVisualizerProps) {
  const [bars, setBars] = useState<number[]>(Array(barCount).fill(0.1));

  useEffect(() => {
    if (!isActive) {
      setBars(Array(barCount).fill(0.1));
      return;
    }

    const interval = setInterval(() => {
      setBars(prev => 
        prev.map((_, i) => {
          const baseLevel = audioLevel * 0.8;
          const randomVariation = Math.random() * 0.4 - 0.2;
          const positionEffect = Math.sin((i / barCount) * Math.PI) * 0.3;
          return Math.min(1, Math.max(0.1, baseLevel + randomVariation + positionEffect));
        })
      );
    }, 50);

    return () => clearInterval(interval);
  }, [audioLevel, isActive, barCount]);

  return (
    <div className="flex items-center justify-center gap-1 h-24">
      {bars.map((height, index) => (
        <div
          key={index}
          className="w-3 rounded-full transition-all duration-75 ease-out"
          style={{
            height: `${height * 100}%`,
            background: `linear-gradient(to top, hsl(var(--primary)), hsl(var(--primary) / 0.6))`,
            opacity: isActive ? 1 : 0.3
          }}
        />
      ))}
    </div>
  );
}
