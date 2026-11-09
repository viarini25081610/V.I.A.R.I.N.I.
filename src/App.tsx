import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Sparkles,
  Eye,
  Terminal,
  Shield,
  Zap,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatMessage } from './components/ChatMessage';
import { ArcReactor } from './components/ArcReactor';
import { VisionModal } from './components/VisionModal';
import { ProtocolModal } from './components/ProtocolModal';
import { ChatMessage as ChatMessageType, ChatThread, TelemetryData } from './types';
import {
  playSciFiSound,
  speakWithJarvisVoice,
  stopJarvisVoice,
} from './utils/audio';

const STORAGE_THREADS_KEY = 'viarini_ai_threads_v1';
const STORAGE_TITLE_KEY = 'viarini_user_title_v1';

export default function App() {
  const [threads, setThreads] = useState<ChatThread[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_THREADS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [
      {
        id: 'initial-thread',
        title: 'Core Neural Initialization',
        createdAt: new Date().toISOString(),
        messages: [
          {
            id: 'msg-welcome',
            role: 'assistant',
            content:
              'Online and fully calibrated, Sir. I am **V.I.A.R.I.N.I.**—your personal autonomous intelligence core. Repulsor capacitors and sensor grids are active at 100% capacity. You may dictate commands verbally via microphone, transmit queries below, or deploy tactical protocols.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ],
      },
    ];
  });

  const [activeThreadId, setActiveThreadId] = useState<string>(
    () => threads[0]?.id || 'initial-thread'
  );
  const [inputPrompt, setInputPrompt] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isVisionOpen, setIsVisionOpen] = useState(false);
  const [isProtocolOpen, setIsProtocolOpen] = useState(false);

  // Audio & Voice states
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentlySpeakingMsgId, setCurrentlySpeakingMsgId] = useState<string | null>(null);
  const [voiceFeedbackEnabled, setVoiceFeedbackEnabled] = useState(true);
  const [soundFxEnabled, setSoundFxEnabled] = useState(true);
  const [userTitle, setUserTitle] = useState(() => {
    return localStorage.getItem(STORAGE_TITLE_KEY) || 'Sir';
  });

  // Telemetry state
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Active thread
  const activeThread =
    threads.find((t) => t.id === activeThreadId) || threads[0];

  // Save threads to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_THREADS_KEY, JSON.stringify(threads));
    } catch {}
  }, [threads]);

  // Save honorific
  const handleUserTitleChange = (title: string) => {
    setUserTitle(title);
    localStorage.setItem(STORAGE_TITLE_KEY, title);
  };

  // Scroll to bottom on messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThread?.messages, isStreaming]);

  // Poller for Stark telemetry
  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const res = await fetch('/api/telemetry');
        if (res.ok) {
          const data = await res.json();
          setTelemetry(data);
        }
      } catch {}
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 3500);
    return () => clearInterval(interval);
  }, []);

  // Web Speech API Voice Recognition setup
  const toggleVoiceDictation = () => {
    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      alert('Speech Recognition is not supported by your browser. Please use Chrome, Edge, or Brave.');
      return;
    }

    if (isListening) {
      speechRecognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      if (soundFxEnabled) playSciFiSound('scan');
      const recognition = new SpeechRecognitionClass();
      speechRecognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          setInputPrompt(transcript);
          // Auto send after speech
          handleSendMessage(transcript);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
    }
  };

  // Thread management
  const handleNewThread = () => {
    const newId = `thread-${Date.now()}`;
    const newThread: ChatThread = {
      id: newId,
      title: 'New Neural Thread',
      createdAt: new Date().toISOString(),
      messages: [
        {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: `New session initialized, ${userTitle}. Telemetry arrays are reset and clear. How may V.I.A.R.I.N.I. assist you?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    };
    setThreads((prev) => [newThread, ...prev]);
    setActiveThreadId(newId);
  };

  const handleDeleteThread = (id: string) => {
    setThreads((prev) => {
      const filtered = prev.filter((t) => t.id !== id);
      if (filtered.length === 0) {
        return [
          {
            id: `thread-${Date.now()}`,
            title: 'Primary Core',
            createdAt: new Date().toISOString(),
            messages: [
              {
                id: `msg-${Date.now()}`,
                role: 'assistant',
                content: `System cache cleared. Ready for your command, ${userTitle}.`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ],
          },
        ];
      }
      return filtered;
    });
    if (activeThreadId === id) {
      setActiveThreadId(threads[0]?.id || 'initial-thread');
    }
  };

  // Send message & stream response
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text || isStreaming) return;

    if (soundFxEnabled) playSciFiSound('click');
    setInputPrompt('');

    const userMessageId = `user-${Date.now()}`;
    const userMessage: ChatMessageType = {
      id: userMessageId,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Prepare assistant placeholder message
    const assistantMessageId = `asst-${Date.now()}`;
    const assistantMessage: ChatMessageType = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isStreaming: true,
    };

    // Update thread messages
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === activeThreadId) {
          const isFirstUserMessage = t.messages.length <= 1;
          const updatedTitle = isFirstUserMessage
            ? text.slice(0, 32) + (text.length > 32 ? '...' : '')
            : t.title;
          return {
            ...t,
            title: updatedTitle,
            messages: [...t.messages, userMessage, assistantMessage],
          };
        }
        return t;
      })
    );

    setIsStreaming(true);

    try {
      const allThreadMessages = [
        ...(activeThread?.messages || []),
        userMessage,
      ].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: allThreadMessages,
          userPreferences: { userName: userTitle },
        }),
      });

      if (!response.body) throw new Error('No response stream available');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullAssistantText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const raw = decoder.decode(value, { stream: true });
        const lines = raw.split('\n\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (dataStr === '[DONE]') break;
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                fullAssistantText += parsed.text;
                // Live update assistant message
                setThreads((prev) =>
                  prev.map((t) => {
                    if (t.id === activeThreadId) {
                      return {
                        ...t,
                        messages: t.messages.map((m) =>
                          m.id === assistantMessageId
                            ? { ...m, content: fullAssistantText }
                            : m
                        ),
                      };
                    }
                    return t;
                  })
                );
              }
            } catch {}
          }
        }
      }

      // Finalize assistant message
      setThreads((prev) =>
        prev.map((t) => {
          if (t.id === activeThreadId) {
            return {
              ...t,
              messages: t.messages.map((m) =>
                m.id === assistantMessageId
                  ? { ...m, content: fullAssistantText, isStreaming: false }
                  : m
              ),
            };
          }
          return t;
        })
      );

      // Speak aloud with V.I.A.R.I.N.I. voice if enabled
      if (voiceFeedbackEnabled && fullAssistantText) {
        setIsSpeaking(true);
        setCurrentlySpeakingMsgId(assistantMessageId);
        speakWithJarvisVoice(
          fullAssistantText,
          () => setIsSpeaking(true),
          () => {
            setIsSpeaking(false);
            setCurrentlySpeakingMsgId(null);
          }
        );
      }
    } catch (err: any) {
      const fallback = `Satellite link error, ${userTitle}. Heuristic memory buffer intact.`;
      setThreads((prev) =>
        prev.map((t) => {
          if (t.id === activeThreadId) {
            return {
              ...t,
              messages: t.messages.map((m) =>
                m.id === assistantMessageId
                  ? { ...m, content: fallback, isStreaming: false }
                  : m
              ),
            };
          }
          return t;
        })
      );
    } finally {
      setIsStreaming(false);
    }
  };

  // Optical Vision Scan trigger
  const handleVisionAnalyze = async (imageDataUrl: string, prompt?: string) => {
    const userMessageId = `user-vis-${Date.now()}`;
    const userMessage: ChatMessageType = {
      id: userMessageId,
      role: 'user',
      content: prompt || 'Initiating optical reconnaissance scan on target visual input.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      metadata: { visionScan: true, imagePreview: imageDataUrl },
    };

    const asstMessageId = `asst-vis-${Date.now()}`;
    const asstMessage: ChatMessageType = {
      id: asstMessageId,
      role: 'assistant',
      content: 'Scanning target geometry with Gemini 3.8 Multimodal arrays, Sir...',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isStreaming: true,
      metadata: { visionScan: true },
    };

    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThreadId
          ? { ...t, messages: [...t.messages, userMessage, asstMessage] }
          : t
      )
    );

    try {
      const res = await fetch('/api/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageDataUrl, prompt }),
      });
      const data = await res.json();
      const analysisText = data.analysis || 'Optical scan completed, Sir.';

      setThreads((prev) =>
        prev.map((t) =>
          t.id === activeThreadId
            ? {
                ...t,
                messages: t.messages.map((m) =>
                  m.id === asstMessageId
                    ? { ...m, content: analysisText, isStreaming: false }
                    : m
                ),
              }
            : t
        )
      );

      if (voiceFeedbackEnabled) {
        setIsSpeaking(true);
        speakWithJarvisVoice(
          analysisText,
          () => setIsSpeaking(true),
          () => setIsSpeaking(false)
        );
      }
    } catch {
      setThreads((prev) =>
        prev.map((t) =>
          t.id === activeThreadId
            ? {
                ...t,
                messages: t.messages.map((m) =>
                  m.id === asstMessageId
                    ? {
                        ...m,
                        content: `Optical sensor feed failed to calibrate, ${userTitle}.`,
                        isStreaming: false,
                      }
                    : m
                ),
              }
            : t
        )
      );
    }
  };

  // Stark Protocol Trigger
  const handleExecuteProtocol = async (protocolId: string) => {
    try {
      const res = await fetch('/api/protocol', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ protocolId }),
      });
      const data = await res.json();

      const userMsg: ChatMessageType = {
        id: `user-proto-${Date.now()}`,
        role: 'user',
        content: `Execute Stark Protocol: ${data.title}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const asstMsg: ChatMessageType = {
        id: `asst-proto-${Date.now()}`,
        role: 'assistant',
        content: `**[${data.title} // STATUS: ${data.status}]**\n\n${data.response}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        metadata: { protocol: data.title },
      };

      setThreads((prev) =>
        prev.map((t) =>
          t.id === activeThreadId
            ? { ...t, messages: [...t.messages, userMsg, asstMsg] }
            : t
        )
      );

      if (voiceFeedbackEnabled) {
        setIsSpeaking(true);
        speakWithJarvisVoice(
          data.response,
          () => setIsSpeaking(true),
          () => setIsSpeaking(false)
        );
      }
    } catch {
      alert('Stark network protocol execution timeout.');
    }
  };

  const voiceMode = isListening ? 'listening' : isSpeaking ? 'speaking' : 'idle';

  return (
    <div className="flex h-screen w-screen bg-[#050811] text-slate-100 overflow-hidden font-sans selection:bg-cyan-400 selection:text-black">
      {/* HUD Background Scanlines & subtle tech grid */}
      <div className="absolute inset-0 hud-hex-bg opacity-70 pointer-events-none z-0" />
      <div className="absolute inset-0 scanlines opacity-25 pointer-events-none z-10" />

      {/* Left Sidebar (ChatGPT Style with Stark Telemetry) */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        threads={threads}
        activeThreadId={activeThreadId}
        onSelectThread={(id) => setActiveThreadId(id)}
        onNewThread={handleNewThread}
        onDeleteThread={handleDeleteThread}
        telemetry={telemetry}
        onQuickPrompt={(prompt) => handleSendMessage(prompt)}
        userTitle={userTitle}
        onChangeUserTitle={handleUserTitleChange}
      />

      {/* Main AI Workspace */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-20">
        {/* Top Header */}
        <Header
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenVision={() => setIsVisionOpen(true)}
          onOpenProtocols={() => setIsProtocolOpen(true)}
          isVoiceActive={isListening || isSpeaking}
          voiceMode={voiceMode}
          soundFxEnabled={soundFxEnabled}
          onToggleSoundFx={() => setSoundFxEnabled(!soundFxEnabled)}
          voiceFeedbackEnabled={voiceFeedbackEnabled}
          onToggleVoiceFeedback={() => {
            if (voiceFeedbackEnabled) stopJarvisVoice();
            setVoiceFeedbackEnabled(!voiceFeedbackEnabled);
          }}
          suitModel={telemetry?.suitModel}
        />

        {/* Message Stream Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-6">
          {/* Welcome Arc Reactor Display on empty or single greeting */}
          {activeThread?.messages?.length <= 1 && (
            <div className="max-w-2xl mx-auto my-6 text-center space-y-4">
              <div className="flex justify-center">
                <ArcReactor
                  size="lg"
                  isSpeaking={isSpeaking}
                  isListening={isListening}
                  isProcessing={isStreaming}
                  powerOutput={telemetry?.arcCoreOutput}
                />
              </div>

              <div>
                <h2 className="font-orbitron font-bold text-xl md:text-2xl text-cyan-400 tracking-wider text-glow-cyan">
                  V.I.A.R.I.N.I. NEURAL CORE
                </h2>
                <p className="font-tech text-xs md:text-sm text-cyan-600 tracking-widest uppercase mt-1">
                  Very Intelligent Autonomous Reconnaissance &amp; Integrated Neural Interface
                </p>
              </div>

              {/* Quick Action Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 text-left">
                <button
                  onClick={() => {
                    if (soundFxEnabled) playSciFiSound('click');
                    handleSendMessage('Run a full diagnostic on all Mark VII flight surfaces and repulsor conduits.');
                  }}
                  className="p-3.5 rounded-xl bg-[#08111f]/80 hover:bg-cyan-950/40 border border-cyan-900/40 hover:border-cyan-400/60 transition-all text-left group cursor-pointer shadow-md"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-cyan-400 group-hover:animate-bounce" />
                    <span className="font-orbitron text-xs font-semibold text-cyan-300">
                      Armor Diagnostics
                    </span>
                  </div>
                  <p className="font-tech text-[11px] text-slate-400">
                    Scan repulsors, thruster outputs, and gold-titanium suit integrity.
                  </p>
                </button>

                <button
                  onClick={() => {
                    if (soundFxEnabled) playSciFiSound('click');
                    setIsVisionOpen(true);
                  }}
                  className="p-3.5 rounded-xl bg-[#08111f]/80 hover:bg-cyan-950/40 border border-cyan-900/40 hover:border-cyan-400/60 transition-all text-left group cursor-pointer shadow-md"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Eye className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                    <span className="font-orbitron text-xs font-semibold text-cyan-300">
                      Optical Recon
                    </span>
                  </div>
                  <p className="font-tech text-[11px] text-slate-400">
                    Activate webcam feed or upload tactical imagery for AI analysis.
                  </p>
                </button>

                <button
                  onClick={() => {
                    if (soundFxEnabled) playSciFiSound('click');
                    setIsProtocolOpen(true);
                  }}
                  className="p-3.5 rounded-xl bg-[#08111f]/80 hover:bg-amber-950/30 border border-cyan-900/40 hover:border-amber-400/60 transition-all text-left group cursor-pointer shadow-md"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Terminal className="w-4 h-4 text-amber-400" />
                    <span className="font-orbitron text-xs font-semibold text-amber-300">
                      Tactical Protocols
                    </span>
                  </div>
                  <p className="font-tech text-[11px] text-slate-400">
                    House Party, Clean Slate, Stealth Mode, and Repulsor Overcharge.
                  </p>
                </button>

                <button
                  onClick={() => {
                    if (soundFxEnabled) playSciFiSound('click');
                    handleSendMessage('Who is Tony Stark, and what role do you play in his operations?');
                  }}
                  className="p-3.5 rounded-xl bg-[#08111f]/80 hover:bg-cyan-950/40 border border-cyan-900/40 hover:border-cyan-400/60 transition-all text-left group cursor-pointer shadow-md"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span className="font-orbitron text-xs font-semibold text-cyan-300">
                      Tony Stark Archives
                    </span>
                  </div>
                  <p className="font-tech text-[11px] text-slate-400">
                    Access historical Stark records, Avengers dossiers, and AI directives.
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Conversation Messages */}
          {activeThread?.messages?.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              isSpeakingThisMessage={currentlySpeakingMsgId === msg.id}
              onStartSpeaking={(id) => {
                setCurrentlySpeakingMsgId(id);
                setIsSpeaking(true);
              }}
              onStopSpeaking={() => {
                setCurrentlySpeakingMsgId(null);
                setIsSpeaking(false);
              }}
            />
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input Console (ChatGPT style + Stark HUD) */}
        <div className="p-4 md:p-5 border-t border-cyan-900/40 bg-[#070c18]/95 backdrop-blur-lg shrink-0">
          <div className="max-w-4xl mx-auto flex items-center gap-2 md:gap-3">
            {/* Voice Dictation (Microphone) Button */}
            <button
              onClick={toggleVoiceDictation}
              title={isListening ? 'Click to stop speech listening' : 'Click to speak via microphone'}
              className={`p-3 md:p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                isListening
                  ? 'border-amber-400 bg-amber-950/60 text-amber-300 shadow-[0_0_15px_#f59e0b] animate-pulse'
                  : 'border-cyan-800/60 hover:border-cyan-400 bg-cyan-950/30 text-cyan-400 hover:text-cyan-200 glow-cyan-sm'
              }`}
            >
              {isListening ? (
                <MicOff className="w-5 h-5 text-amber-400 animate-spin" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>

            {/* Prompt Input Box */}
            <div className="relative flex-1">
              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                disabled={isStreaming}
                placeholder={
                  isListening
                    ? 'Listening... speak your instruction now...'
                    : `Instruct V.I.A.R.I.N.I. or click mic to speak...`
                }
                className="w-full bg-[#0a1222] border border-cyan-900/50 focus:border-cyan-400 focus:outline-none rounded-2xl py-3.5 px-4 text-sm text-slate-100 placeholder-slate-500 pr-12 transition-all shadow-inner font-sans disabled:opacity-50"
              />

              {/* Send Button */}
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputPrompt.trim() || isStreaming}
                className={`absolute right-2 top-2 p-2 rounded-xl transition-all cursor-pointer ${
                  inputPrompt.trim() && !isStreaming
                    ? 'bg-cyan-400 text-slate-950 hover:bg-cyan-300 glow-cyan font-bold'
                    : 'bg-slate-800/60 text-slate-600 cursor-not-allowed'
                }`}
                title="Transmit directive"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Subtext info */}
          <div className="max-w-4xl mx-auto mt-2 flex items-center justify-between text-[10px] font-tech text-slate-500 px-1">
            <span>V.I.A.R.I.N.I. // GEMINI 3.8 FLASH HIGH INTELLIGENCE MATRIX</span>
            <span className="hidden sm:inline">STARK INDUSTRIES AUTONOMOUS NETWORK</span>
          </div>
        </div>
      </main>

      {/* Multimodal Optical Reconnaissance Modal */}
      <VisionModal
        isOpen={isVisionOpen}
        onClose={() => setIsVisionOpen(false)}
        onAnalyze={handleVisionAnalyze}
      />

      {/* Stark Tactical Protocols Modal */}
      <ProtocolModal
        isOpen={isProtocolOpen}
        onClose={() => setIsProtocolOpen(false)}
        onExecuteProtocol={handleExecuteProtocol}
      />
    </div>
  );
}
