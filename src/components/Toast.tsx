import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, X, ExternalLink } from 'lucide-react';

export interface ToastMessage {
  id: string;
  text: string;
  actionText?: string;
  onAction?: () => void;
}

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-6 right-6 z-50 max-w-md bg-[#13294B] text-white p-4 rounded-2xl shadow-2xl border border-slate-700 flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold"
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
            <span className="leading-snug">{toast.text}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {toast.actionText && toast.onAction && (
              <button
                type="button"
                onClick={toast.onAction}
                className="text-amber-400 hover:text-amber-300 underline font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <span>{toast.actionText}</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}

            <button
              type="button"
              onClick={onDismiss}
              aria-label="Yopish"
              className="p-1 rounded-md text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
