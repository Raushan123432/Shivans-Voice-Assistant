import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UploadCloud, X, FileAudio, Check, AlertTriangle, RefreshCw, Sparkles } from 'lucide-react';

interface AudioUploadModalProps {
  onClose: () => void;
  onAnalyzeComplete: (transcriptText: string) => void;
}

export const AudioUploadModal: React.FC<AudioUploadModalProps> = ({ onClose, onAnalyzeComplete }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (file: File) => {
    setErrorMsg(null);
    if (!file.type.startsWith('audio/')) {
      setErrorMsg('Invalid file format. Please upload an audio file (mp3, wav, ogg, m4a).');
      return;
    }
    // Limit to 20MB
    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg('File size too large. Maximum size is 20MB.');
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleSelectFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleProcessAudio = () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setErrorMsg(null);
    setAnalysisProgress(0);

    // Simulate real-time audio parsing sequence
    const interval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsProcessing(false);
            const sampleTranscripts = [
              "Hello Babu AI! Analyze my tone in this audio snippet.",
              "Greetings! Can you parse this custom vocal recording?",
              "This is a voice sample for model calibration.",
              "Hey JARVIS, run a full audio diagnostics scan on this vocal file."
            ];
            const randomText = sampleTranscripts[Math.floor(Math.random() * sampleTranscripts.length)];
            onAnalyzeComplete(`[Audio Upload: ${selectedFile.name}] ${randomText}`);
            onClose();
          }, 400);
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 150);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="glass rounded-3xl w-full max-w-md shadow-[0_24px_64px_rgba(0,229,255,0.1)] relative overflow-hidden bg-zinc-950/95 border border-white/10 p-6 flex flex-col"
      >
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500" />

        {/* Top Header */}
        <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-5">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold font-mono tracking-wider text-white uppercase">Upload Audio File</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full glass text-zinc-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drag Drop Area */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={!selectedFile && !isProcessing ? handleSelectFileClick : undefined}
          className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[200px] ${
            dragActive 
              ? 'border-cyan-400 bg-cyan-400/5' 
              : selectedFile 
                ? 'border-emerald-500/30 bg-emerald-500/5' 
                : 'border-white/10 hover:border-cyan-400/30 hover:bg-white/5'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {isProcessing ? (
            <div className="space-y-4 w-full">
              <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin mx-auto" />
              <div className="space-y-1.5">
                <p className="text-xs font-mono text-zinc-300">Decompressing PCM stream: {analysisProgress}%</p>
                <div className="h-1.5 w-full max-w-xs mx-auto bg-zinc-900 border border-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-cyan-400 transition-all duration-150" 
                    style={{ width: `${analysisProgress}%` }}
                  />
                </div>
              </div>
            </div>
          ) : selectedFile ? (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 max-w-fit mx-auto">
                <FileAudio className="w-8 h-8" />
              </div>
              <div>
                <p className="text-xs font-mono text-white font-bold truncate max-w-xs">{selectedFile.name}</p>
                <p className="text-[10px] font-mono text-zinc-500 uppercase mt-0.5">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                }}
                className="text-[10px] font-mono text-rose-400 hover:text-rose-300 underline cursor-pointer"
              >
                Remove File
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-cyan-400/10 text-cyan-400 border border-cyan-400/25 max-w-fit mx-auto">
                <UploadCloud className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-mono text-zinc-300 font-medium">
                  Drag and drop audio file here, or <span className="text-cyan-400 underline">browse</span>
                </p>
                <p className="text-[10px] font-mono text-zinc-500 uppercase">
                  Supports MP3, WAV, OGG, M4A up to 20MB
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Error notification */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-start gap-2.5 text-[11px] font-mono"
            >
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Control Footer */}
        {selectedFile && !isProcessing && (
          <div className="mt-5 flex gap-2">
            <button
              onClick={() => setSelectedFile(null)}
              className="flex-1 py-2.5 rounded-xl border border-white/5 hover:bg-white/5 text-zinc-400 hover:text-white font-mono text-xs cursor-pointer transition-all"
            >
              Reset
            </button>
            <button
              onClick={handleProcessAudio}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-black hover:opacity-90 font-mono text-xs font-extrabold cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-lg"
            >
              <Sparkles className="w-3.5 h-3.5" /> Analyze Audio
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AudioUploadModal;
