// Web Audio API sci-fi sound generator & Speech Synthesis manager

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const playSciFiSound = (type: 'beep' | 'repulsor' | 'scan' | 'alert' | 'click' | 'powerup') => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'beep') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.setValueAtTime(1600, now + 0.04);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'scan') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.linearRampToValueAtTime(880, now + 0.2);
      osc.frequency.linearRampToValueAtTime(1320, now + 0.35);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === 'repulsor') {
      // Repulsor blast / beam charge up
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(950, now + 0.3);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.5);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    } else if (type === 'alert') {
      // Dual-tone Stark alert
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.setValueAtTime(450, now + 0.1);
      osc.frequency.setValueAtTime(600, now + 0.2);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'powerup') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.4);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    }
  } catch {
    // Ignore audio context errors if user hasn't interacted with page yet
  }
};

// Jarvis Voice Speech Synthesis
export const speakWithJarvisVoice = (
  text: string,
  onStart?: () => void,
  onEnd?: () => void
) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Strip Markdown characters and URLs for crystal-clear natural speech
  const cleanText = text
    .replace(/```[\s\S]*?```/g, 'Code block omitted.')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[*#_~\[\]]/g, '')
    .replace(/https?:\/\/\S+/g, 'link')
    .slice(0, 800); // Read a reasonable concise summary if long

  if (!cleanText.trim()) return;

  const utterance = new SpeechSynthesisUtterance(cleanText);

  // Pick British voice if available (Paul Bettany style)
  const voices = window.speechSynthesis.getVoices();
  const britishVoice =
    voices.find(
      (v) =>
        (v.lang === 'en-GB' || v.lang.startsWith('en_GB')) &&
        (v.name.toLowerCase().includes('male') ||
          v.name.toLowerCase().includes('george') ||
          v.name.toLowerCase().includes('oliver') ||
          v.name.toLowerCase().includes('daniel'))
    ) ||
    voices.find((v) => v.lang.startsWith('en-GB') || v.lang.startsWith('en_GB')) ||
    voices.find((v) => v.lang.startsWith('en-US') && v.name.toLowerCase().includes('male')) ||
    voices[0];

  if (britishVoice) {
    utterance.voice = britishVoice;
  }

  utterance.pitch = 0.95; // Slightly deeper, refined Paul Bettany pitch
  utterance.rate = 1.05; // Confident, crisp cadence

  if (onStart) utterance.onstart = onStart;
  if (onEnd) utterance.onend = onEnd;
  utterance.onerror = () => onEnd?.();

  window.speechSynthesis.speak(utterance);
};

export const stopJarvisVoice = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};
