import React from 'react';
import { Shield, Eye, Terminal, Volume2, VolumeX, Menu, Activity } from 'lucide-react';
import { VoiceVisualizer } from './VoiceVisualizer';
import { ArcReactor } from './ArcReactor';
import { playSciFiSound } from '../utils/audio';

interface HeaderProps {
  onOpenSidebar: () => void;
  onOpenVision: () => void;
  onOpenProtocols: () => void;
  isVoiceActive: boolean;
  voiceMode: 'speaking' | 'listening' | 'idle';
  soundFxEnabled: boolean;
  onToggleSoundFx: () => void;
  voiceFeedbackEnabled: boolean;
  onToggleVoiceFeedback: () => void;
  suitModel?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSidebar,
  onOpenVision,
  onOpenProtocols,
  isVoiceActive,
  voiceMode,
  soundFxEnabled,
  onToggleSoundFx,
  voiceFeedbackEnabled,
  onToggleVoiceFeedback,
  suitModel = 'MARK VII // AVENGERS PROTOCOL',
}) => {
  return (
    <header className="h-16 border-b border-cyan-900/30 bg-[#070c18]/90 backdrop-blur-md px-4 md:px-6 flex items-center justify-between shrink-0 z-30 select-none">
      {/* Left: Mobile Sidebar toggle + System designation */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            playSciFiSound('click');
            onOpenSidebar();
          }}
          className="md:hidden p-2 rounded-lg border border-cyan-900/50 hover:border-cyan-400 bg-cyan-950/30 text-cyan-400 cursor-pointer"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <ArcReactor size="sm" isSpeaking={voiceMode === 'speaking'} isListening={voiceMode === 'listening'} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-orbitron font-extrabold text-sm md:text-base text-cyan-400 tracking-widest text-glow-cyan">
                V.I.A.R.I.N.I.
              </span>
              <span className="hidden sm:inline-block font-tech text-[10px] text-cyan-600 border border-cyan-900/60 px-1.5 py-0.5 rounded-xs tracking-wider">
                CORE MATRIX
              </span>
            </div>
            <p className="text-[10px] font-tech text-slate-400 hidden sm:block">
              {suitModel}
            </p>
          </div>
        </div>
      </div>

      {/* Center: Live Waveform Visualizer & Status */}
      <div className="hidden lg:flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/30 border border-cyan-900/40">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
          </span>
          <span className="font-tech text-xs text-cyan-300">
            {voiceMode === 'listening'
              ? 'AUDIO SENSOR: TRANSCRIBING VOICE...'
              : voiceMode === 'speaking'
              ? 'VOCAL SYNTHESIZER: ACTIVE'
              : 'SYSTEM STATUS: OPTIMAL & SCANNING'}
          </span>
        </div>

        <VoiceVisualizer isActive={isVoiceActive} mode={voiceMode} />
      </div>

      {/* Right: Quick Tools (Vision, Protocols, Audio FX Toggle) */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Optical Vision Scanner button */}
        <button
          onClick={() => {
            playSciFiSound('scan');
            onOpenVision();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-cyan-500/40 hover:border-cyan-400 bg-cyan-950/30 hover:bg-cyan-900/40 text-cyan-300 font-tech text-xs tracking-wider transition-colors cursor-pointer glow-cyan-sm"
          title="Open Optical Sensor Reconnaissance (Webcam / Image Scan)"
        >
          <Eye className="w-4 h-4 text-cyan-400" />
          <span className="hidden sm:inline">OPTICAL SCAN</span>
        </button>

        {/* Protocols Trigger Button */}
        <button
          onClick={() => {
            playSciFiSound('alert');
            onOpenProtocols();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/40 hover:border-amber-400 bg-amber-950/25 hover:bg-amber-900/40 text-amber-300 font-tech text-xs tracking-wider transition-colors cursor-pointer"
          title="Execute Stark Tactical Protocols"
        >
          <Terminal className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">PROTOCOLS</span>
        </button>

        {/* Voice Feedback Toggle */}
        <button
          onClick={() => {
            playSciFiSound('click');
            onToggleVoiceFeedback();
          }}
          className={`p-2 rounded-xl border transition-colors cursor-pointer ${
            voiceFeedbackEnabled
              ? 'border-cyan-400 bg-cyan-950/40 text-cyan-400 glow-cyan-sm'
              : 'border-slate-800 bg-slate-900/50 text-slate-500 hover:text-slate-300'
          }`}
          title={voiceFeedbackEnabled ? 'Vocal feedback enabled (Click to mute)' : 'Vocal feedback muted (Click to enable)'}
        >
          {voiceFeedbackEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Audio FX SFX Toggle */}
        <button
          onClick={() => {
            onToggleSoundFx();
          }}
          className={`p-2 rounded-xl border text-[10px] font-tech transition-colors cursor-pointer ${
            soundFxEnabled
              ? 'border-cyan-500/40 bg-cyan-950/30 text-cyan-300'
              : 'border-slate-800 bg-slate-900/50 text-slate-500 hover:text-slate-300'
          }`}
          title={soundFxEnabled ? 'Interface SFX enabled' : 'Interface SFX disabled'}
        >
          SFX
        </button>
      </div>
    </header>
  );
};
