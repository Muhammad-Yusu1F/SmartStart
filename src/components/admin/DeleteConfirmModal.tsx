import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { CertificateItem } from '../../types';
import { useApp } from '../../context/AppContext';

interface DeleteConfirmModalProps {
  item: CertificateItem | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  item,
  onConfirm,
  onCancel
}) => {
  const { language } = useApp();
  if (!item) return null;

  const title = language === 'ru'
    ? 'Удалить сертификат?'
    : language === 'en'
    ? 'Delete Certificate?'
    : "Sertifikatni o'chirasizmi?";

  const desc = language === 'ru'
    ? `Сертификат ученика ${item.name} (${item.type} ${item.score}) будет безвозвратно удален с сайта.`
    : language === 'en'
    ? `The certificate of ${item.name} (${item.type} ${item.score}) will be permanently removed from the website.`
    : `${item.name} (${item.type} ${item.score}) sertifikati va uning barcha ma'lumotlari natijalar sahifasidan ham butunlay olib tashlanadi.`;

  const cancelLabel = language === 'ru' ? 'Отмена' : language === 'en' ? 'Cancel' : 'Bekor qilish';
  const confirmLabel = language === 'ru' ? 'Да, удалить' : language === 'en' ? 'Yes, delete' : "Ha, o'chirish";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          className="fixed inset-0 bg-[#0B1A33]/70 dark:bg-black/80 backdrop-blur-xs"
        />

        {/* Dialog Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          role="alertdialog"
          aria-modal="true"
          className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 space-y-5"
        >
          <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
              {title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {desc}
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-bold text-sm transition-colors cursor-pointer"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm transition-colors shadow-sm active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>{confirmLabel}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
