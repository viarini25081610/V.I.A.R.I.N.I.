import React from 'react';
import { playSciFiSound } from '../utils/audio';

interface ArcReactorProps {
  isSpeaking?: boolean;
  isListening?: boolean;
  isProcessing?: boolean;
  powerOutput?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ArcReactor: React.FC<ArcReactorProps> = ({
  isSpeaking = false,
  isListening = false,
  isProcessing = false,
  powerOutput = '98.7 GW',
  size = 'md',
}) => {
  const handleClick = () => {
    playSciFiSound('repulsor');
  };

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  }[size];

  return (
    <div
      onClick={handleClick}
      title="Arc Reactor Core (Click to test Repulsor power)"
      className="relative flex items-center justify-center cursor-pointer group select-none"
    >
      {/* Outer Glow Field */}
      <div
        className={`absolute rounded-full transition-all duration-500 ${
          isSpeaking
            ? 'w-28 h-28 bg-cyan-400/25 blur-xl animate-pulse'
            : isListening
            ? 'w-28 h-28 bg-amber-400/25 blur-xl animate-ping'
            : isProcessing
            ? 'w-28 h-28 bg-blue-500/25 blur-xl animate-pulse'
            : 'w-20 h-20 bg-cyan-500/15 blur-lg group-hover:bg-cyan-400/30'
        }`}
      />

      {/* Main Container */}
      <div
        className={`relative ${sizeClasses} rounded-full border border-cyan-400/40 bg-[#040814] flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-105 ${
          isListening ? 'border-amber-400 shadow-amber-400/50' : 'border-cyan-400/60 shadow-cyan-500/30'
        }`}
      >
        {/* Outer Rotating Segmented Ring */}
        <div className="absolute inset-0.5 rounded-full border border-dashed border-cyan-300/40 spin-slow pointer-events-none" />

        {/* Reverse Rotating Internal Ring with notches */}
        <div className="absolute inset-1.5 rounded-full border border-dotted border-cyan-400/60 spin-slow-reverse pointer-events-none" />

        {/* 10 Coils array around the core (Iconic Mark VII Arc Reactor feature) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-2.5 bg-cyan-300/70 rounded-xs"
              style={{
                transform: `rotate(${i * 36}deg) translateY(-${size === 'lg' ? '36px' : size === 'md' ? '24px' : '15px'})`,
                boxShadow: isSpeaking
                  ? '0 0 6px rgba(0, 240, 255, 0.9)'
                  : isListening
                  ? '0 0 6px rgba(251, 191, 36, 0.9)'
                  : '0 0 3px rgba(0, 240, 255, 0.4)',
              }}
            />
          ))}
        </div>

        {/* Inner Glass Chamber */}
        <div className="relative w-2/3 h-2/3 rounded-full bg-gradient-to-tr from-cyan-950 via-[#031326] to-cyan-900 border border-cyan-300/80 flex items-center justify-center shadow-inner overflow-hidden">
          {/* Core Energy Cell */}
          <div
            className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
              isListening
                ? 'bg-amber-300 shadow-[0_0_15px_#f59e0b]'
                : isSpeaking
                ? 'bg-white shadow-[0_0_18px_#00f0ff] animate-ping'
                : 'bg-cyan-200 shadow-[0_0_10px_#00f0ff]'
            }`}
          />

          {/* Holographic light scan beam */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent transform -translate-y-full group-hover:translate-y-full transition-transform duration-1000" />
        </div>
      </div>

      {/* Floating Mini Energy Label for lg/md */}
      {size === 'lg' && (
        <span className="absolute -bottom-6 font-tech text-[10px] text-cyan-400 tracking-wider">
          {powerOutput}
        </span>
      )}
    </div>
  );
};
