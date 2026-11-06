import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, GraduationCap, Phone, User, Calendar, Send, Loader2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { apiSubmitApplication } from '../api/applicationsApi';

interface AdmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdmissionModal: React.FC<AdmissionModalProps> = ({ isOpen, onClose }) => {
  const { t } = useApp();
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignedId, setAssignedId] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    parentName: '',
    studentName: '',
    phone: '+998 ',
    grade: '8',
    notes: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.parentName.trim() || !formData.studentName.trim() || formData.phone.trim().length < 9) {
      setErrorMessage(t.validationError);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await apiSubmitApplication(formData);
      setAssignedId(res.application.id);
      setSubmitted(true);
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      console.error('Failed to submit application:', err);
      setErrorMessage(err.message || "Arizani yuborishda xatolik yuz berdi. Qayta urinib ko'ring.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setIsSubmitting(false);
    setErrorMessage(null);
    setFormData({
      parentName: '',
      studentName: '',
      phone: '+998 ',
      grade: '8',
      notes: ''
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleResetAndClose}
          className="fixed inset-0 bg-[#0B1A33]/80 dark:bg-black/85 backdrop-blur-xs"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 p-6 sm:p-8"
        >
          <button
            type="button"
            onClick={handleResetAndClose}
            aria-label="Yopish"
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 text-[11px] font-extrabold uppercase">
                  <GraduationCap className="w-3.5 h-3.5" />
                  {t.admBadge}
                </div>
                <h3 className="font-display font-bold text-2xl text-[#13294B] dark:text-white">
                  {t.admTitle}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t.admSubtitle}
                </p>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    {t.parentNameLabel}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={formData.parentName}
                      onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                      placeholder={t.parentNamePlaceholder}
                      className="w-full min-h-[46px] pl-10 pr-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-[#13294B] dark:focus:ring-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    {t.studentNameLabel}
                  </label>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={formData.studentName}
                      onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                      placeholder={t.studentNamePlaceholder}
                      className="w-full min-h-[46px] pl-10 pr-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-[#13294B] dark:focus:ring-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                      {t.phoneLabel}
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+998 90 123 45 67"
                        className="w-full min-h-[46px] pl-10 pr-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-[#13294B] dark:focus:ring-amber-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                      {t.targetGradeLabel}
                    </label>
                    <select
                      value={formData.grade}
                      onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                      className="w-full min-h-[46px] px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-[#13294B] dark:focus:ring-amber-400 focus:outline-none"
                    >
                      <option value="5">5{t.gradeSuffix}</option>
                      <option value="6">6{t.gradeSuffix}</option>
                      <option value="7">7{t.gradeSuffix}</option>
                      <option value="8">8{t.gradeSuffix}</option>
                      <option value="9">9{t.gradeSuffix}</option>
                      <option value="10">10{t.gradeSuffix}</option>
                      <option value="11">11{t.gradeSuffix}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    {t.notesLabel}
                  </label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder={t.notesPlaceholder}
                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-[#13294B] dark:focus:ring-amber-400 focus:outline-none resize-none"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full min-h-[50px] rounded-xl bg-[#13294B] dark:bg-amber-400 hover:bg-[#0B1A33] dark:hover:bg-amber-300 disabled:opacity-70 text-white dark:text-slate-950 font-extrabold text-sm transition-all flex items-center justify-center gap-2 active:scale-98 shadow-md cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-amber-300 dark:text-slate-950" />
                      <span>{t.submitting}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-amber-300 dark:text-slate-950" />
                      <span>{t.submitAppBtn}</span>
                    </>
                  )}
                </button>
                <p className="text-[11px] text-center text-slate-400 mt-2">
                  {t.privacyNote}
                </p>
              </div>
            </form>
          ) : (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle className="w-9 h-9" />
              </div>

              {assignedId && (
                <span className="inline-block px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-bold">
                  {t.appNumberLabel} {assignedId}
                </span>
              )}

              <h3 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
                {t.successTitle}
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
                <strong>{formData.parentName}</strong>, <strong>{formData.studentName}</strong> ({formData.grade}{t.gradeSuffix}) {t.successDesc}
              </p>

              <div className="pt-3 flex justify-center">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-8 py-2.5 rounded-xl bg-[#13294B] dark:bg-amber-400 text-white dark:text-slate-950 font-extrabold text-xs sm:text-sm hover:bg-[#0B1A33] dark:hover:bg-amber-300 transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  {t.understoodBtn}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
