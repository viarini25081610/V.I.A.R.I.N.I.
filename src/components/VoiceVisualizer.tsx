import React from 'react';

interface VoiceVisualizerProps {
  isActive: boolean;
  mode: 'speaking' | 'listening' | 'idle';
}

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({ isActive, mode }) => {
  const barCount = 18;

  const getBarColor = () => {
    if (mode === 'listening') return 'bg-amber-400';
    if (mode === 'speaking') return 'bg-cyan-400';
    return 'bg-cyan-900/60';
  };

  return (
    <div className="flex items-center justify-center gap-1 h-6 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/20">
      {[...Array(barCount)].map((_, i) => {
        // Vary heights dynamically based on index and active state
        const delay = (i % 6) * 0.1;
        const baseHeight = isActive ? Math.sin((i / barCount) * Math.PI) * 16 + 4 : 3;

        return (
          <div
            key={i}
            className={`w-0.5 rounded-full transition-all duration-150 ${getBarColor()}`}
            style={{
              height: isActive ? `${Math.max(4, baseHeight)}px` : '3px',
              animation: isActive ? `pulse 0.7s infinite alternate ease-in-out ${delay}s` : 'none',
              boxShadow: isActive ? (mode === 'listening' ? '0 0 6px #f59e0b' : '0 0 6px #00f0ff') : 'none',
            }}
          />
        );
      })}
    </div>
  );
};
