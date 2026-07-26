import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Key, ShieldCheck, ExternalLink, X, Eye, EyeOff, Check, AlertCircle, Trash2, Sparkles } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApiKeySaved?: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onApiKeySaved }) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [hasServerKey, setHasServerKey] = useState<boolean | null>(null);

  useEffect(() => {
    if (isOpen) {
      const storedKey = localStorage.getItem('babu_custom_api_key') || '';
      setApiKey(storedKey);
      setSavedSuccess(false);

      // Check health endpoint to see if server has default API key
      fetch('/api/health')
        .then((res) => res.json())
        .then((data) => {
          if (data && typeof data.apiKeyConfigured === 'boolean') {
            setHasServerKey(data.apiKeyConfigured);
          }
        })
        .catch(() => setHasServerKey(false));
    }
  }, [isOpen]);

  const handleSave = () => {
    const trimmed = apiKey.trim();
    if (trimmed) {
      localStorage.setItem('babu_custom_api_key', trimmed);
    } else {
      localStorage.removeItem('babu_custom_api_key');
    }
    setSavedSuccess(true);
    if (onApiKeySaved) {
      onApiKeySaved();
    }
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleClear = () => {
    localStorage.removeItem('babu_custom_api_key');
    setApiKey('');
    setSavedSuccess(false);
    if (onApiKeySaved) {
      onApiKeySaved();
    }
  };

  if (!isOpen) return null;

  const currentSavedKey = typeof localStorage !== 'undefined' ? localStorage.getItem('babu_custom_api_key') : null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="glass rounded-3xl p-6 w-full max-w-lg shadow-2xl relative overflow-hidden z-10 border border-white/10"
        >
          {/* Top Decorative Gradient Accent */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-cyan-400 to-purple-500" />

          {/* Header */}
          <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold font-display tracking-tight text-white flex items-center gap-2">
                  Gemini API Key Section
                </h2>
                <p className="text-[10px] text-zinc-400 font-mono">
                  Configure custom API key for voice & AI capabilities
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full glass text-zinc-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Active Status Badge */}
          <div className="mb-5 p-3 rounded-2xl bg-zinc-900/60 border border-white/5 flex items-center justify-between font-mono text-xs">
            <span className="text-zinc-400 text-[11px]">Key Status:</span>
            {currentSavedKey ? (
              <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 text-[10px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                Custom Key Active
              </span>
            ) : hasServerKey ? (
              <span className="flex items-center gap-1.5 text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20 text-[10px] font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                Default Server Key Active
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 text-[10px] font-bold">
                <AlertCircle className="w-3.5 h-3.5" />
                No Key Configured
              </span>
            )}
          </div>

          {/* Input Section */}
          <div className="flex flex-col gap-4 font-mono text-xs">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex justify-between">
                <span>Enter Gemini API Key</span>
                {currentSavedKey && (
                  <span className="text-[9px] text-emerald-400 lowercase font-normal">Saved in browser storage</span>
                )}
              </label>

              <div className="relative flex items-center">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full pl-3.5 pr-10 py-3 rounded-2xl bg-zinc-950/80 border border-white/10 focus:border-amber-400/50 focus:outline-none text-zinc-200 placeholder-zinc-600 font-mono text-xs tracking-wider transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 p-1 text-zinc-400 hover:text-white transition-colors"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Explanatory text */}
            <p className="text-[11px] leading-relaxed text-zinc-400 font-sans">
              Your API key is used directly to establish voice session connections. It is stored securely in your browser's local storage and is never saved permanently on external servers.
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={handleSave}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-xs font-mono font-bold text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300 animate-bounce" /> Saved Successfully!
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4" /> Save API Key
                  </>
                )}
              </button>

              {currentSavedKey && (
                <button
                  onClick={handleClear}
                  className="px-4 py-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 transition-all text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                  title="Remove saved API key"
                >
                  <Trash2 className="w-4 h-4" /> Clear
                </button>
              )}
            </div>

            {/* External Link to get free key */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-sans">
              <span className="text-zinc-400">Don't have an API key?</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:text-amber-300 font-mono font-bold flex items-center gap-1 hover:underline transition-colors"
              >
                Get Free Key in AI Studio <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ApiKeyModal;
