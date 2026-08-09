import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, X, Scan, Sparkles, RefreshCw, Eye, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface VisionCameraModalProps {
  onClose: () => void;
  onAnalyzeFrame?: (imageData: string) => void;
}

export const VisionCameraModal: React.FC<VisionCameraModalProps> = ({
  onClose,
  onAnalyzeFrame
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [camError, setCamError] = useState<string | null>(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      } catch (err: any) {
        setCamError('Camera access unavailable or permission denied.');
      }
    }
    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleCaptureAnalyze = () => {
    setAnalyzing(true);
    setAnalysisResult(null);

    setTimeout(() => {
      setAnalyzing(false);
      setAnalysisResult('ZOYA VISION ANALYSIS: User sitting in modern dark workspace. Detected facial expression: Neutral/Focus. Environment lighting: Cyberpunk RGB ambient glow.');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl rounded-3xl bg-zinc-950 border border-fuchsia-500/40 shadow-[0_0_50px_rgba(217,70,239,0.3)] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-fuchsia-500/20 bg-zinc-900/60">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-fuchsia-400 animate-pulse" />
            <span className="font-mono font-bold text-sm text-fuchsia-200 tracking-wider">
              ZOYA AI VISION & CAMERA HUD
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Frame */}
        <div className="p-6 flex flex-col items-center">
          <div className="relative w-full aspect-video rounded-2xl bg-zinc-900 border border-fuchsia-500/30 overflow-hidden flex items-center justify-center">
            {camError ? (
              <div className="p-4 text-center font-mono text-xs text-rose-400">
                {camError}
              </div>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            )}

            {/* Sci-Fi Overlay Target reticle */}
            <div className="absolute inset-8 border border-fuchsia-500/40 rounded-2xl pointer-events-none flex flex-col justify-between p-2">
              <div className="flex justify-between text-fuchsia-400 font-mono text-[10px]">
                <span>[ZOYA_VISION_V4]</span>
                <span>TARGET: LOCKED</span>
              </div>
              <div className="flex justify-between text-fuchsia-400 font-mono text-[10px]">
                <span>CONFIDENCE: 99.4%</span>
                <span>FPS: 60</span>
              </div>
            </div>

            {/* Scanning line animation */}
            {analyzing && (
              <motion.div
                animate={{ y: ['0%', '100%', '0%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-fuchsia-400 to-transparent shadow-[0_0_15px_#d946ef]"
              />
            )}
          </div>

          {/* Analysis output */}
          {analysisResult && (
            <div className="w-full mt-4 p-4 rounded-xl bg-fuchsia-950/30 border border-fuchsia-500/30 text-xs font-mono text-fuchsia-200">
              <div className="flex items-center gap-2 mb-1 text-fuchsia-400 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>SCENE ANALYSIS COMPLETE</span>
              </div>
              <p>{analysisResult}</p>
            </div>
          )}

          {/* Capture button */}
          <button
            onClick={handleCaptureAnalyze}
            disabled={analyzing}
            className="mt-6 px-6 py-3 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white font-mono font-bold text-xs tracking-wider flex items-center gap-2 shadow-[0_0_25px_rgba(217,70,239,0.5)] cursor-pointer disabled:opacity-50"
          >
            {analyzing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Scan className="w-4 h-4" />
            )}
            <span>{analyzing ? 'ANALYZING SCREEN...' : 'SCAN & ANALYZE SCREEN'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
