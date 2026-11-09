import React from 'react';
import {
  Plus,
  MessageSquare,
  Trash2,
  Cpu,
  Zap,
  Activity,
  Shield,
  Sliders,
  X,
  Volume2,
} from 'lucide-react';
import { ChatThread, TelemetryData } from '../types';
import { ArcReactor } from './ArcReactor';
import { playSciFiSound } from '../utils/audio';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  threads: ChatThread[];
  activeThreadId: string;
  onSelectThread: (id: string) => void;
  onNewThread: () => void;
  onDeleteThread: (id: string) => void;
  telemetry: TelemetryData | null;
  onQuickPrompt: (prompt: string) => void;
  userTitle: string;
  onChangeUserTitle: (title: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  threads,
  activeThreadId,
  onSelectThread,
  onNewThread,
  onDeleteThread,
  telemetry,
  onQuickPrompt,
  userTitle,
  onChangeUserTitle,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 w-80 bg-[#060b17] border-r border-cyan-900/40 flex flex-col justify-between z-50 transition-transform duration-300 ease-in-out select-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Section */}
        <div className="flex flex-col h-full overflow-hidden p-4 space-y-4">
          {/* Header & Logo */}
          <div className="flex items-center justify-between pb-3 border-b border-cyan-900/40">
            <div className="flex items-center gap-3">
              <ArcReactor size="sm" />
              <div>
                <h1 className="font-orbitron font-extrabold text-lg text-cyan-400 tracking-wider text-glow-cyan leading-none">
                  V.I.A.R.I.N.I.
                </h1>
                <p className="font-tech text-[10px] text-cyan-600 tracking-widest uppercase mt-0.5">
                  STARK INTELLIGENT SYSTEM
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="md:hidden p-1.5 rounded-lg border border-cyan-900/60 text-slate-400 hover:text-cyan-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* New Thread Button */}
          <button
            onClick={() => {
              playSciFiSound('powerup');
              onNewThread();
              if (window.innerWidth < 768) onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-cyan-400/40 hover:border-cyan-300 bg-gradient-to-r from-cyan-950/60 to-cyan-900/40 hover:from-cyan-900/60 hover:to-cyan-800/40 text-cyan-300 font-orbitron text-xs tracking-wider font-semibold transition-all duration-200 glow-cyan-sm cursor-pointer shadow-lg"
          >
            <Plus className="w-4 h-4 text-cyan-400" />
            <span>INITIALIZE NEW SESSION</span>
          </button>

          {/* Telemetry Diagnostics HUD Widget */}
          <div className="bg-[#040812]/90 border border-cyan-950 rounded-xl p-3 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-tech text-[11px] text-cyan-400 font-semibold tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                STARK LAB TELEMETRY
              </span>
              <span className="font-tech text-[10px] text-emerald-400 bg-emerald-950/40 px-1.5 py-0.2 rounded-xs border border-emerald-500/30">
                {telemetry?.status || 'ONLINE'}
              </span>
            </div>

            {/* Bars */}
            <div className="space-y-2 text-[11px] font-tech">
              <div>
                <div className="flex justify-between text-slate-400 mb-0.5">
                  <span>NEURAL LOAD (CPU)</span>
                  <span className="text-cyan-300">{telemetry?.cpuPercent || 28}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-1 overflow-hidden">
                  <div
                    className="bg-cyan-400 h-1 rounded-full transition-all duration-500 shadow-[0_0_6px_#00f0ff]"
                    style={{ width: `${telemetry?.cpuPercent || 28}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-0.5">
                  <span>CORE MATRIX (RAM)</span>
                  <span className="text-cyan-300">{telemetry?.ramPercent || 45}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-1 overflow-hidden">
                  <div
                    className="bg-cyan-500 h-1 rounded-full transition-all duration-500"
                    style={{ width: `${telemetry?.ramPercent || 45}%` }}
                  />
                </div>
              </div>

              <div className="pt-1 grid grid-cols-2 gap-2 text-[10px] border-t border-cyan-950">
                <div>
                  <span className="text-slate-500 block">ARC CORE OUTPUT</span>
                  <span className="text-cyan-400 font-semibold">{telemetry?.arcCoreOutput || '98.7 GW'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">TEMPERATURE</span>
                  <span className="text-cyan-400 font-semibold">{telemetry?.coreTemp || '38.4 °C'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Sessions List (ChatGPT Style) */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 -mr-1">
            <span className="font-tech text-[10px] text-slate-500 tracking-wider uppercase block px-1">
              RECORDED NEURAL THREADS
            </span>

            {threads.length === 0 ? (
              <p className="font-tech text-xs text-slate-600 px-2 py-3">
                No active archives. Initialize thread above.
              </p>
            ) : (
              threads.map((thread) => {
                const isActive = thread.id === activeThreadId;
                return (
                  <div
                    key={thread.id}
                    onClick={() => {
                      playSciFiSound('click');
                      onSelectThread(thread.id);
                      if (window.innerWidth < 768) onClose();
                    }}
                    className={`group flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                      isActive
                        ? 'bg-cyan-950/50 border border-cyan-500/50 text-cyan-200 shadow-md'
                        : 'hover:bg-cyan-950/20 border border-transparent hover:border-cyan-900/50 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <MessageSquare
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isActive ? 'text-cyan-400' : 'text-slate-500'
                        }`}
                      />
                      <span className="truncate">{thread.title || 'Untitled Session'}</span>
                    </div>

                    {threads.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playSciFiSound('click');
                          onDeleteThread(thread.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-950/60 hover:text-red-400 text-slate-500 transition-all cursor-pointer"
                        title="Purge thread from memory"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Directives */}
          <div className="space-y-1.5 pt-2 border-t border-cyan-950">
            <span className="font-tech text-[10px] text-slate-500 tracking-wider uppercase block px-1">
              RAPID TACTICAL QUERIES
            </span>
            <div className="space-y-1">
              <button
                onClick={() => {
                  playSciFiSound('click');
                  onQuickPrompt('Run a complete Mark VII armor and system diagnostic.');
                  if (window.innerWidth < 768) onClose();
                }}
                className="w-full text-left font-tech text-[11px] p-2 rounded-lg bg-[#08101e]/60 hover:bg-cyan-950/40 border border-cyan-900/30 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-200 transition-colors"
              >
                ⚡ "Run complete armor diagnostics."
              </button>
              <button
                onClick={() => {
                  playSciFiSound('click');
                  onQuickPrompt('Who is Tony Stark, and what are your primary directives?');
                  if (window.innerWidth < 768) onClose();
                }}
                className="w-full text-left font-tech text-[11px] p-2 rounded-lg bg-[#08101e]/60 hover:bg-cyan-950/40 border border-cyan-900/30 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-200 transition-colors"
              >
                👤 "Who is Tony Stark?"
              </button>
              <button
                onClick={() => {
                  playSciFiSound('click');
                  onQuickPrompt('Calibrate flight stabilization surfaces and compute mach 2 exit vector.');
                  if (window.innerWidth < 768) onClose();
                }}
                className="w-full text-left font-tech text-[11px] p-2 rounded-lg bg-[#08101e]/60 hover:bg-cyan-950/40 border border-cyan-900/30 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-200 transition-colors"
              >
                🚀 "Prepare flight protocols."
              </button>
            </div>
          </div>
        </div>

        {/* Bottom User Preference / Salutation */}
        <div className="p-3 border-t border-cyan-900/40 bg-[#040811] flex items-center justify-between text-xs font-tech">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">HONORIFIC:</span>
            <select
              value={userTitle}
              onChange={(e) => onChangeUserTitle(e.target.value)}
              className="bg-[#09111e] border border-cyan-900/60 rounded-md px-2 py-1 text-cyan-300 font-semibold focus:outline-none focus:border-cyan-400 cursor-pointer text-xs"
            >
              <option value="Sir">Sir</option>
              <option value="Ma'am">Ma'am</option>
              <option value="Boss">Boss</option>
              <option value="Mr. Stark">Mr. Stark</option>
            </select>
          </div>

          <div className="text-[10px] text-cyan-600 tracking-wider">
            V.I.A.R.I.N.I. v7.4
          </div>
        </div>
      </aside>
    </>
  );
};
