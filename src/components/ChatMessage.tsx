import React, { useState } from 'react';
import { marked } from 'marked';
import { Volume2, VolumeX, Copy, Check, Terminal, Cpu } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../types';
import { speakWithJarvisVoice, stopJarvisVoice, playSciFiSound } from '../utils/audio';

interface ChatMessageProps {
  message: ChatMessageType;
  isSpeakingThisMessage?: boolean;
  onStartSpeaking?: (id: string) => void;
  onStopSpeaking?: () => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isSpeakingThisMessage = false,
  onStartSpeaking,
  onStopSpeaking,
}) => {
  const [copied, setCopied] = useState(false);
  const isJarvis = message.role === 'assistant';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    playSciFiSound('click');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleVoice = () => {
    if (isSpeakingThisMessage) {
      stopJarvisVoice();
      onStopSpeaking?.();
    } else {
      playSciFiSound('beep');
      onStartSpeaking?.(message.id);
      speakWithJarvisVoice(
        message.content,
        () => onStartSpeaking?.(message.id),
        () => onStopSpeaking?.()
      );
    }
  };

  const renderContent = () => {
    try {
      const html = marked.parse(message.content) as string;
      return { __html: html };
    } catch {
      return { __html: message.content };
    }
  };

  if (!isJarvis) {
    // User message
    return (
      <div className="flex items-start justify-end gap-3 max-w-4xl mx-auto w-full group">
        <div className="flex flex-col items-end max-w-2xl">
          <div className="flex items-center gap-2 mb-1 px-1">
            <span className="font-tech text-[11px] text-cyan-500/80 uppercase tracking-wider">
              COMMAND AUTHORIZED // STARK
            </span>
            <span className="text-[10px] text-slate-500 font-mono">{message.timestamp}</span>
          </div>

          <div className="relative bg-gradient-to-r from-cyan-950/80 to-[#0c1f38] border border-cyan-500/40 rounded-2xl rounded-tr-xs p-4 text-sm text-cyan-50 shadow-lg shadow-cyan-950/50 backdrop-blur-md">
            {message.metadata?.imagePreview && (
              <div className="mb-3 rounded-lg overflow-hidden border border-cyan-400/30 max-w-xs">
                <img
                  src={message.metadata.imagePreview}
                  alt="Optical input"
                  className="w-full h-auto object-cover max-h-48"
                />
                <div className="bg-black/60 px-2 py-1 text-[10px] font-tech text-cyan-300">
                  OPTICAL SENSOR CAPTURE
                </div>
              </div>
            )}
            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
          </div>
        </div>

        {/* User Icon */}
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/40 flex items-center justify-center text-xs font-bold text-cyan-300 shrink-0 shadow-md">
          <span className="font-orbitron text-xs">TS</span>
        </div>
      </div>
    );
  }

  // J.A.R.V.I.S. Message
  return (
    <div className="flex items-start gap-3.5 max-w-4xl mx-auto w-full group">
      {/* Jarvis Hex Arc Avatar */}
      <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-950 via-[#06182c] to-[#040c17] border border-cyan-400/60 flex items-center justify-center shrink-0 glow-cyan-sm shadow-md mt-1">
        <div className="w-3.5 h-3.5 rounded-full border border-cyan-300 bg-cyan-400/80 animate-pulse flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-white" />
        </div>
        <span className="absolute -bottom-1 -right-1 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
        </span>
      </div>

      <div className="flex flex-col flex-1 max-w-3xl overflow-hidden">
        {/* Header Metadata */}
        <div className="flex items-center justify-between mb-1.5 px-1">
          <div className="flex items-center gap-2">
            <span className="font-orbitron font-bold text-xs text-cyan-400 tracking-wider text-glow-cyan">
              V.I.A.R.I.N.I.
            </span>
            <span className="font-tech text-[10px] text-cyan-600 tracking-widest border border-cyan-900/60 px-1.5 py-0.2 rounded-xs">
              NEURAL STREAM
            </span>
            {message.metadata?.protocol && (
              <span className="font-tech text-[10px] text-amber-400 bg-amber-950/40 border border-amber-500/40 px-1.5 py-0.2 rounded-xs flex items-center gap-1">
                <Terminal className="w-2.5 h-2.5" />
                {message.metadata.protocol}
              </span>
            )}
            {message.metadata?.visionScan && (
              <span className="font-tech text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-500/40 px-1.5 py-0.2 rounded-xs flex items-center gap-1">
                <Cpu className="w-2.5 h-2.5" />
                OPTICAL ANALYSIS
              </span>
            )}
          </div>

          <span className="text-[10px] text-slate-500 font-mono">{message.timestamp}</span>
        </div>

        {/* Message Bubble */}
        <div className="relative bg-[#09111e]/90 border border-cyan-900/50 hover:border-cyan-500/40 transition-colors duration-200 rounded-2xl rounded-tl-xs p-4.5 text-sm text-slate-200 shadow-xl leading-relaxed backdrop-blur-md">
          {message.isStreaming && (
            <div className="absolute top-2 right-2 flex items-center gap-1 font-tech text-[10px] text-cyan-400 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              TRANSMITTING...
            </div>
          )}

          {/* Render Markdown Content */}
          <div
            className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed
              prose-headings:font-orbitron prose-headings:text-cyan-300 prose-headings:font-semibold prose-headings:tracking-wide
              prose-h1:text-base prose-h2:text-sm prose-h3:text-xs
              prose-p:my-2 prose-p:leading-relaxed
              prose-ul:my-2 prose-li:my-0.5
              prose-strong:text-cyan-300 prose-strong:font-semibold
              prose-code:text-cyan-300 prose-code:bg-cyan-950/60 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-xs prose-code:border prose-code:border-cyan-800/40 prose-code:font-mono prose-code:text-xs
              prose-pre:bg-[#040811] prose-pre:border prose-pre:border-cyan-900/60 prose-pre:rounded-xl prose-pre:p-3
              prose-table:border-collapse prose-th:border prose-th:border-cyan-800/50 prose-th:p-2 prose-th:bg-cyan-950/40 prose-td:border prose-td:border-cyan-900/50 prose-td:p-2"
            dangerouslySetInnerHTML={renderContent()}
          />

          {/* Action Bar at bottom */}
          <div className="mt-3 pt-2.5 border-t border-cyan-900/30 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleVoice}
                className={`flex items-center gap-1 px-2 py-1 rounded-md border text-[11px] font-tech transition-colors cursor-pointer ${
                  isSpeakingThisMessage
                    ? 'border-cyan-400 bg-cyan-950/70 text-cyan-300 glow-cyan-sm animate-pulse'
                    : 'border-cyan-900/50 hover:border-cyan-500/50 bg-cyan-950/20 text-slate-300 hover:text-cyan-300'
                }`}
                title={isSpeakingThisMessage ? 'Stop vocalization' : 'Vocalize message with V.I.A.R.I.N.I. voice'}
              >
                {isSpeakingThisMessage ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-cyan-400" />
                    <span>MUTE VOCALIZATION</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>SPEAK (BRITISH ACCENT)</span>
                  </>
                )}
              </button>
            </div>

            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1 px-2 py-1 rounded-md border border-cyan-900/40 hover:border-cyan-500/50 bg-cyan-950/20 text-[11px] font-tech text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
              title="Copy response to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">COPIED</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>COPY</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
