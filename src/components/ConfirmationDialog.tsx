import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Check, Sparkles, AlertTriangle, MessageSquare, Phone, Trash2, X } from 'lucide-react';
import { PendingConfirmation } from '../types';

interface ConfirmationDialogProps {
  pending: PendingConfirmation;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ pending, onConfirm, onCancel }) => {
  const { name, args, isAutoConfirmed } = pending;

  // Auto-close simple toasts after 2.5 seconds
  useEffect(() => {
    if (isAutoConfirmed) {
      const timer = setTimeout(() => {
        onConfirm();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isAutoConfirmed, onConfirm]);

  const getActionStatusText = () => {
    const url = String(args.url || '').toLowerCase();
    const platform = String(args.platform || '').toLowerCase();

    if (name === 'openMaps' || name === 'getDirections' || name === 'searchNearby') {
      return 'Opening Google Maps...';
    }
    if (name === 'openWhatsApp') {
      return 'Opening WhatsApp...';
    }
    if (name === 'openWebsite') {
      if (url.includes('facebook.com')) return 'Opening Facebook...';
      if (url.includes('instagram.com')) return 'Opening Instagram...';
      if (url.includes('whatsapp.com')) return 'Opening WhatsApp...';
      if (url.includes('youtube.com')) return 'Opening YouTube...';
      if (url.includes('google.com')) return 'Opening Google...';
      if (url.includes('spotify.com')) return 'Opening Spotify...';
      
      try {
        const parsedUrl = new URL(args.url);
        const host = parsedUrl.hostname.replace('www.', '');
        return `Opening ${host.charAt(0).toUpperCase() + host.slice(1)}...`;
      } catch (e) {
        return `Opening ${args.url}...`;
      }
    }
    if (name === 'openSocialMedia') {
      if (platform === 'facebook') return 'Opening Facebook...';
      if (platform === 'instagram') return 'Opening Instagram...';
      if (platform === 'whatsapp') return 'Opening WhatsApp...';
      return `Opening ${platform.charAt(0).toUpperCase() + platform.slice(1)}...`;
    }
    if (name === 'openEntertainment') {
      if (platform === 'youtube' || url.includes('youtube.com')) return 'Opening YouTube...';
      if (platform === 'spotify' || url.includes('spotify.com')) return 'Opening Spotify...';
      return `Opening ${platform.charAt(0).toUpperCase() + platform.slice(1)}...`;
    }
    if (name === 'searchGoogle') {
      return 'Searching Google...';
    }
    if (name === 'openCalendar') {
      return 'Opening Calendar...';
    }
    if (name === 'setReminder') {
      return 'Setting Reminder...';
    }
    if (name === 'openNotes') {
      return 'Opening Notes...';
    }
    if (name === 'openEmail') {
      return 'Opening Email Client...';
    }
    if (name === 'callContact') {
      return `Calling ${args.name || args.number || 'Contact'}...`;
    }
    if (name === 'sendSMS') {
      return 'Drafting SMS...';
    }
    if (name === 'shareText') {
      return 'Sharing Content...';
    }

    return 'Executing Action...';
  };

  const getConfirmationPromptText = () => {
    if (name === 'sendSMS') {
      return `Send SMS to ${args.recipient || args.number || 'recipient'} with message: "${args.message || ''}"?`;
    }
    if (name === 'openWhatsApp') {
      return `Send WhatsApp message to ${args.recipient || args.number || 'recipient'}: "${args.message || ''}"?`;
    }
    if (name === 'callContact') {
      return `Make a phone call to ${args.name || args.number || 'contact'}?`;
    }
    if (name === 'manageFile') {
      if (args.action === 'delete') {
        return `Permanently delete file or folder "${args.targetName || 'item'}"?`;
      }
      if (args.action === 'empty_recycle_bin') {
        return 'Empty the Recycle Bin?';
      }
    }
    return `Are you sure you want to execute ${name}?`;
  };

  const getConfirmationIcon = () => {
    if (name === 'sendSMS' || name === 'openWhatsApp') {
      return <MessageSquare className="w-6 h-6 text-purple-400" />;
    }
    if (name === 'callContact') {
      return <Phone className="w-6 h-6 text-cyan-400" />;
    }
    if (name === 'manageFile') {
      return <Trash2 className="w-6 h-6 text-rose-400" />;
    }
    return <AlertTriangle className="w-6 h-6 text-amber-400" />;
  };

  if (isAutoConfirmed) {
    const statusText = getActionStatusText();
    return (
      <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-full max-w-sm px-4">
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="pointer-events-auto w-full glass rounded-full py-3 px-5 border border-purple-500/30 flex items-center gap-3.5 shadow-[0_12px_40px_rgba(168,85,247,0.25)] relative overflow-hidden bg-zinc-950/90"
        >
          {/* Subtle flowing border light effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-purple-500/10 to-cyan-500/10 opacity-50 pointer-events-none" />
          
          {/* Glowing Emerald Check Icon */}
          <div className="relative flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
            <Check className="w-4 h-4 text-emerald-400" />
            <span className="absolute inset-0 rounded-full border border-emerald-400 animate-ping opacity-25" />
          </div>

          {/* Status Text message */}
          <div className="flex-1 flex flex-col min-w-0">
            <span className="text-[13px] font-sans font-semibold text-white tracking-wide truncate">
              {statusText}
            </span>
            <span className="text-[8px] font-mono text-zinc-400 uppercase tracking-widest leading-none mt-0.5">
              Instant Assistant Action
            </span>
          </div>

          {/* Small sparkling corner accent */}
          <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse flex-shrink-0" />
        </motion.div>
      </div>
    );
  }

  // Active user interactive confirmation modal layout
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="glass rounded-3xl p-6 w-full max-w-md shadow-[0_24px_64px_rgba(139,92,246,0.15)] relative overflow-hidden bg-zinc-950/90 border border-white/10"
      >
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-400 via-rose-500 to-indigo-500" />
        
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
              {getConfirmationIcon()}
            </div>
            <div>
              <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-purple-300">
                Action Confirmation
              </h3>
              <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest leading-none mt-0.5">
                Jarvis Security Verification
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-full glass text-zinc-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 border-y border-white/5 my-4">
          <p className="text-zinc-200 text-sm leading-relaxed font-sans">
            {getConfirmationPromptText()}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-zinc-300 hover:text-white text-xs font-mono font-bold cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl text-white text-xs font-mono font-bold hover:opacity-90 transition-all cursor-pointer shadow-lg ${
              name === 'manageFile' && args.action === 'delete'
                ? 'bg-gradient-to-r from-rose-500 to-red-600'
                : 'bg-gradient-to-r from-purple-500 to-indigo-600'
            }`}
          >
            Confirm Action
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ConfirmationDialog;
