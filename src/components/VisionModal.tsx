import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Scan, RefreshCw, Eye } from 'lucide-react';
import { playSciFiSound } from '../utils/audio';

interface VisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalyze: (imageDataUrl: string, prompt?: string) => Promise<void>;
}

export const VisionModal: React.FC<VisionModalProps> = ({ isOpen, onClose, onAnalyze }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleStartCamera = async () => {
    try {
      playSciFiSound('scan');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
      setSelectedImage(null);
    } catch (err) {
      alert('Camera access denied or optical sensor unavailable.');
    }
  };

  const handleStopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const handleCaptureFrame = () => {
    if (!videoRef.current) return;
    playSciFiSound('beep');
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setSelectedImage(dataUrl);
      handleStopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      playSciFiSound('beep');
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
        handleStopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRunAnalysis = async () => {
    if (!selectedImage) return;
    try {
      setIsScanning(true);
      playSciFiSound('scan');
      await onAnalyze(selectedImage, customPrompt || 'Analyze this tactical optical sensor feed as J.A.R.V.I.S.');
      handleStopCamera();
      onClose();
    } catch {
      alert('Optical diagnostic scan failed.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleClose = () => {
    handleStopCamera();
    setSelectedImage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#090f1a] border border-cyan-500/50 rounded-2xl shadow-2xl overflow-hidden glow-cyan">
        {/* Header HUD */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-900/40 bg-gradient-to-r from-cyan-950/60 to-[#0c182b]">
          <div className="flex items-center gap-2.5">
            <Eye className="w-5 h-5 text-cyan-400 animate-pulse" />
            <div>
              <h3 className="font-orbitron font-bold text-sm text-cyan-300 tracking-wider">
                OPTICAL SENSOR ARRAY // VISION HUD
              </h3>
              <p className="font-tech text-[10px] text-cyan-600 tracking-widest uppercase">
                Multimodal Heuristic Reconnaissance
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg border border-cyan-900/60 hover:border-cyan-400 text-slate-400 hover:text-cyan-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {/* Viewport Frame */}
          <div className="relative w-full h-72 bg-black rounded-xl border border-cyan-800/40 overflow-hidden flex items-center justify-center">
            {/* HUD Reticle Overlay */}
            <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-4">
              <div className="flex justify-between items-start">
                <span className="font-tech text-[10px] text-cyan-400/80">RECON // 0048.9</span>
                <span className="font-tech text-[10px] text-cyan-400/80">TARGET LOCK: READY</span>
              </div>
              <div className="self-center w-24 h-24 border border-cyan-500/30 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-cyan-400/60" />
              </div>
              <div className="flex justify-between items-end">
                <span className="font-tech text-[10px] text-cyan-400/80">GRID: 34.02° N</span>
                <span className="font-tech text-[10px] text-cyan-400/80">SPECTRAL SCAN: NOMINAL</span>
              </div>
            </div>

            {/* Video stream */}
            {isCameraActive && (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            )}

            {/* Selected image snapshot */}
            {selectedImage && !isCameraActive && (
              <img
                src={selectedImage}
                alt="Captured Target"
                className="w-full h-full object-contain"
              />
            )}

            {/* Empty placeholder */}
            {!selectedImage && !isCameraActive && (
              <div className="text-center p-6 space-y-3 z-0">
                <Scan className="w-12 h-12 text-cyan-500/50 mx-auto animate-pulse" />
                <p className="font-tech text-xs text-slate-400">
                  Select input: activate live optical camera or upload imagery for tactical breakdown.
                </p>
              </div>
            )}

            {/* Scanning beam animation */}
            {isScanning && (
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent animate-pulse z-20 pointer-events-none" />
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {!isCameraActive ? (
              <button
                onClick={handleStartCamera}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-cyan-500/40 hover:border-cyan-400 bg-cyan-950/30 text-cyan-300 font-tech text-xs tracking-wider transition-colors cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                ACTIVATE WEBCAM
              </button>
            ) : (
              <button
                onClick={handleCaptureFrame}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-amber-500 bg-amber-950/40 text-amber-300 font-tech text-xs tracking-wider transition-colors cursor-pointer animate-pulse"
              >
                <Camera className="w-4 h-4" />
                CAPTURE TARGET FRAME
              </button>
            )}

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-cyan-800/60 hover:border-cyan-400 bg-slate-900/60 text-slate-200 font-tech text-xs tracking-wider transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4 text-cyan-400" />
              UPLOAD IMAGE FILE
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {/* Prompt input */}
          <div>
            <label className="block font-tech text-[11px] text-cyan-400 mb-1">
              SPECIFIC TACTICAL DIRECTIVE (OPTIONAL)
            </label>
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g. Identify any structural weaknesses or technology specs..."
              className="w-full bg-[#050912] border border-cyan-900/60 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-cyan-900/40 bg-[#060a14] flex items-center justify-between">
          <span className="font-tech text-[10px] text-slate-500">
            POWERED BY GEMINI 3.8 FLASH MULTIMODAL CORE
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 rounded-xl text-xs font-tech text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              ABORT
            </button>
            <button
              onClick={handleRunAnalysis}
              disabled={!selectedImage || isScanning}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl font-orbitron font-semibold text-xs tracking-wider transition-all cursor-pointer ${
                selectedImage && !isScanning
                  ? 'bg-cyan-400 text-slate-950 hover:bg-cyan-300 glow-cyan'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ANALYZING SENSORS...
                </>
              ) : (
                <>
                  <Scan className="w-3.5 h-3.5" />
                  EXECUTE OPTICAL SCAN
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
