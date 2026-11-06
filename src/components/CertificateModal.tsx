import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
  CheckCircle2,
  Award,
  ShieldCheck,
  Calendar,
  User,
  GraduationCap,
  Sparkles,
  QrCode,
  Printer,
  Copy,
  Check,
  Send,
  MessageCircle,
  ExternalLink,
  FileText,
  FileCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CertificateItem } from '../types';
import {
  TYPE_COLORS,
  getDocTitle,
  formatScore,
  formatDisplayName,
  formatDetail
} from '../utils/certificateUtils';
import { downloadCertificateAsImage } from '../utils/certificateExport';
import { useApp } from '../context/AppContext';

interface CertificateModalProps {
  item: CertificateItem | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  currentIndex: number;
  totalCount: number;
  allCertificates?: CertificateItem[];
  onSelectIndex?: (idx: number) => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  item,
  onClose,
  onPrev,
  onNext,
  currentIndex,
  totalCount,
  allCertificates = [],
  onSelectIndex
}) => {
  const { t, theme, language } = useApp();
  // Direction for animation: 1 = next, -1 = prev
  const [direction, setDirection] = useState<number>(1);

  // Popover menus state
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showPrintMenu, setShowPrintMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [viewMode, setViewMode] = useState<'sheet' | 'scan'>(item?.imagePath ? 'scan' : 'sheet');

  // Reset to scan when switching certificates if scan exists
  useEffect(() => {
    setViewMode(item?.imagePath ? 'scan' : 'sheet');
  }, [item?.id, item?.imagePath]);

  const handleNextClick = () => {
    setDirection(1);
    setShowShareMenu(false);
    setShowPrintMenu(false);
    onNext();
  };

  const handlePrevClick = () => {
    setDirection(-1);
    setShowShareMenu(false);
    setShowPrintMenu(false);
    onPrev();
  };

  // Keyboard navigation support
  useEffect(() => {
    if (!item) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') {
        setDirection(-1);
        setShowShareMenu(false);
        setShowPrintMenu(false);
        onPrev();
      }
      if (e.key === 'ArrowRight') {
        setDirection(1);
        setShowShareMenu(false);
        setShowPrintMenu(false);
        onNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [item, onClose, onPrev, onNext]);

  if (!item) return null;

  const colors = TYPE_COLORS[item.type];
  const docTitle = getDocTitle(item.type, language);
  const scoreText = formatScore(item, language);
  const displayName = formatDisplayName(item, language);
  const detail = formatDetail(item, language);

  // Next & prev candidate names for helpful preview
  const prevItem = allCertificates.length > 0
    ? allCertificates[(currentIndex - 1 + totalCount) % totalCount]
    : null;
  const nextItem = allCertificates.length > 0
    ? allCertificates[(currentIndex + 1) % totalCount]
    : null;

  // Real Share URL (direct permalink with query param ?cert=ID)
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?cert=${item.id}`
    : '';

  const shareText = `${t.schoolName} ${t.schoolSubtitle}: ${displayName} — ${item.type} ${scoreText}!`;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const input = document.createElement('input');
        input.value = shareUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      confetti({
        particleCount: 45,
        spread: 55,
        origin: { y: 0.7 }
      });
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Smart Start Maktabi - ${displayName}`,
          text: shareText,
          url: shareUrl
        });
      } catch (err) {
        // user cancelled or share dismissed
      }
    } else {
      handleCopyLink();
    }
  };

  const handlePrint = () => {
    setShowPrintMenu(false);
    window.print();
  };

  const handleDownloadPng = () => {
    try {
      setIsExporting(true);
      downloadCertificateAsImage(item, displayName, scoreText, docTitle, colors.primary);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.75 }
      });
    } catch (err) {
      console.error('PNG export failed:', err);
    } finally {
      setIsExporting(false);
      setShowPrintMenu(false);
    }
  };

  // Highly optimized GPU-accelerated variants (zero CPU blur filters for 60fps on low-end machines)
  const certVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 60 : -60,
      opacity: 0,
      scale: 0.96,
      transition: {
        x: { type: 'spring' as const, stiffness: 400, damping: 32 },
        opacity: { duration: 0.2 },
        scale: { duration: 0.2 }
      }
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring' as const, stiffness: 400, damping: 32 },
        opacity: { duration: 0.2 },
        scale: { duration: 0.2 }
      }
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -60 : 60,
      opacity: 0,
      scale: 0.96,
      transition: {
        x: { type: 'spring' as const, stiffness: 400, damping: 32 },
        opacity: { duration: 0.16 },
        scale: { duration: 0.16 }
      }
    })
  };

  // Details panel fade & slide variants
  const detailsVariants = {
    enter: (dir: number) => ({
      y: dir > 0 ? 12 : -12,
      opacity: 0
    }),
    center: {
      y: 0,
      opacity: 1,
      transition: {
        y: { type: 'spring' as const, stiffness: 420, damping: 34 },
        opacity: { duration: 0.2 }
      }
    },
    exit: (dir: number) => ({
      y: dir > 0 ? -12 : 12,
      opacity: 0,
      transition: {
        y: { duration: 0.14 },
        opacity: { duration: 0.14 }
      }
    })
  };

  const progressPercentage = Math.round(((currentIndex + 1) / totalCount) * 100);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 overflow-y-auto">
        {/* Backdrop - lightweight opacity for high performance on all devices */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#0B1A33]/85 dark:bg-black/90 transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          role="dialog"
          aria-modal="true"
          className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 flex flex-col md:flex-row my-auto max-h-[96vh] transform-gpu"
        >
          {/* Top Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-800 z-30">
            <motion.div
              className="h-full bg-gradient-to-r from-[#CF9E2E] to-amber-500"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            />
          </div>

          {/* Close button top right */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Yopish"
            className="absolute top-3.5 right-3.5 z-40 p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left Side: Animated GPU-Optimized Certificate Preview Sheet - Solid Deep Navy Blue */}
          <div className="md:w-7/12 bg-slate-100 dark:bg-[#0B1A33] p-4 sm:p-6 flex flex-col justify-between overflow-hidden transition-colors">
            {/* If real scan exists, render switcher pills at top */}
            {item.imagePath && (
              <div className="flex items-center justify-between pb-3 z-20">
                <div className="inline-flex items-center gap-1 p-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
                  <button
                    type="button"
                    onClick={() => setViewMode('sheet')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      viewMode === 'sheet'
                        ? 'bg-[#13294B] dark:bg-amber-400 text-white dark:text-slate-950 shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{t.scanModeSheet}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('scan')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      viewMode === 'scan'
                        ? 'bg-[#13294B] dark:bg-amber-400 text-white dark:text-slate-950 shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <FileCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{t.scanModeOriginal}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </button>
                </div>

                <a
                  href={item.imagePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold text-blue-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                >
                  <span>{t.openFull}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            <div className="flex-1 flex items-center justify-center my-auto">
              <AnimatePresence mode="wait" custom={direction}>
                {viewMode === 'scan' && item.imagePath ? (
                  <motion.div
                    key={`scan-${item.id}`}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.2 }}
                    className="w-full max-h-[460px] rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white shadow-xl overflow-hidden flex flex-col items-center justify-center relative group p-2"
                  >
                    <img
                      src={item.imagePath}
                      alt={`${displayName} - Haqiqiy davlat sertifikati`}
                      className="w-full h-full object-contain max-h-[440px] rounded-lg"
                      decoding="async"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src.endsWith('.webp')) {
                          target.src = target.src.replace(/\.webp$/, '.png');
                        }
                      }}
                    />
                    <div className="absolute bottom-3 right-3 flex items-center gap-2">
                      <a
                        href={item.imagePath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-slate-900/85 hover:bg-slate-900 text-white text-[11px] font-bold flex items-center gap-1.5 backdrop-blur-xs shadow-md transition-all active:scale-95"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Katta hajmda ko'rish</span>
                      </a>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key={item.id}
                    id="printable-certificate"
                    custom={direction}
                    variants={certVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    style={{ willChange: 'transform, opacity' }}
                    className="w-full bg-[#FFFDF7] dark:bg-[#13294B] rounded-xl border-2 border-[#E3D7BA] dark:border-[#22406E] p-5 sm:p-6 shadow-xl relative flex flex-col justify-between min-h-[370px] sm:min-h-[430px] select-none transform-gpu print-certificate-target"
                  >
                    {/* Guilloche Corner Accents */}
                    <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#C9B992] dark:border-[#CF9E2E]/70" />
                    <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#C9B992] dark:border-[#CF9E2E]/70" />
                    <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#C9B992] dark:border-[#CF9E2E]/70" />
                    <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#C9B992] dark:border-[#CF9E2E]/70" />

                    {/* Watermark in background */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
                      <span className="font-display font-extrabold text-6xl sm:text-7xl text-[#13294B] dark:text-white rotate-[-25deg]">
                        SMART START
                      </span>
                    </div>

                    {/* Certificate Header */}
                    <div className="border-b-2 border-[#EFE7D2] dark:border-[#22406E] pb-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <picture>
                          <source srcSet="/smart-start-logo.webp" type="image/webp" />
                          <img
                            src="/smart-start-logo.png"
                            alt="Logo"
                            className="w-9 h-9 sm:w-10 sm:h-10 object-contain"
                            decoding="async"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/assets/b9beb49f5a7d0c49502c2b2852bb209a.png';
                            }}
                          />
                        </picture>
                        <div>
                          <span className="text-[9px] font-mono tracking-widest text-slate-400 dark:text-slate-500 block uppercase">
                            Smart Start Maktabi
                          </span>
                          <span
                            className="text-xs sm:text-sm font-extrabold tracking-wide"
                            style={{ color: colors.primary }}
                          >
                            {docTitle}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-mono bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 px-2 py-0.5 rounded">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>{item.certNumber || `SS-${item.year}-${item.id}`}</span>
                      </div>
                    </div>

                    {/* Certificate Body */}
                    <div className="py-4 text-center space-y-3 my-auto relative z-10">
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold">
                        {t.modalCertifies}
                      </p>

                      <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#13294B] dark:text-slate-100 tracking-tight">
                        {displayName}
                      </h3>

                      <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                        Smart Start {t.schoolSubtitle.toLowerCase()} <strong>{item.grade}{t.gradeSuffix}</strong> {t.modalStudentDesc}
                      </p>

                      {/* Big Score Box */}
                      <div
                        className="inline-flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-2xl border-2 my-1 shadow-inner min-w-[190px]"
                        style={{
                          backgroundColor: theme === 'dark' ? '#1E293B' : colors.bgLight,
                          borderColor: colors.border
                        }}
                      >
                        <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
                          {t.scoreAchieved}
                        </span>
                        <span
                          className="font-display text-3xl sm:text-4xl font-extrabold my-0.5"
                          style={{ color: colors.primary }}
                        >
                          {scoreText}
                        </span>
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                          {item.type} {item.subject ? `(${item.subject})` : ''}
                        </span>
                      </div>

                      {/* Subscores breakdown if available */}
                      {item.subScores && (
                        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-0.5">
                          {Object.entries(item.subScores).map(([k, v]) => (
                            <div
                              key={k}
                              className="bg-white dark:bg-[#0B1A33] border border-[#E3D7BA] dark:border-[#22406E] px-2.5 py-0.5 rounded text-[11px] font-mono shadow-2xs text-slate-800 dark:text-slate-100"
                            >
                              <span className="text-slate-500 dark:text-slate-400 uppercase">{k}:</span>{' '}
                              <strong>{v}</strong>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer with Seal & QR */}
                    <div className="border-t-2 border-[#EFE7D2] dark:border-[#22406E] pt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-9 h-9 rounded-full border-2 border-dashed flex flex-col items-center justify-center p-1 text-center"
                          style={{ borderColor: colors.primary, color: colors.primary }}
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span className="text-[6px] font-bold uppercase leading-none">{t.official}</span>
                        </div>
                        <div className="text-[9.5px] leading-tight">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block">{t.examinationBoard}</span>
                          <span className="text-slate-400 dark:text-slate-500">Tashkent · {item.date || `${item.year}`}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-right font-mono text-[10px] text-slate-400 dark:text-slate-500">
                        <QrCode className="w-6 h-6 text-slate-700 dark:text-slate-300" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Side: Information & Interactive Directional Navigation */}
          <div className="md:w-5/12 p-5 sm:p-7 flex flex-col justify-between space-y-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 overflow-y-auto">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={item.id}
                custom={direction}
                variants={detailsVariants}
                initial="enter"
                animate="center"
                exit="exit"
                style={{ willChange: 'transform, opacity' }}
                className="space-y-3.5 transform-gpu"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-2xs"
                    style={{
                      backgroundColor: theme === 'dark' ? '#1E293B' : colors.badgeBg,
                      color: colors.primary
                    }}
                  >
                    {item.type} {t.filterTypeLabel}
                  </span>

                  <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500">
                    № {currentIndex + 1} / {totalCount}
                  </span>
                </div>

                <div>
                  <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white leading-tight">
                    {displayName}
                  </h2>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {item.grade}{t.gradeSuffix}
                  </span>
                </div>

                <dl className="space-y-2 text-sm divide-y divide-slate-100 dark:divide-slate-800">
                  <div className="flex justify-between pt-1.5">
                    <dt className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-[#CF9E2E]" />
                      <span>{t.resultLabel}</span>
                    </dt>
                    <dd className="font-extrabold text-base" style={{ color: colors.primary }}>
                      {scoreText}
                    </dd>
                  </div>

                  <div className="flex justify-between pt-1.5">
                    <dt className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-slate-400" />
                      <span>{t.gradeLabel}</span>
                    </dt>
                    <dd className="font-bold text-slate-800 dark:text-slate-200">{item.grade}{t.gradeSuffix}</dd>
                  </div>

                  <div className="flex justify-between pt-1.5">
                    <dt className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>{t.examDate}</span>
                    </dt>
                    <dd className="font-semibold text-slate-700 dark:text-slate-300">{item.date || `${item.year}${t.yearSuffix}`}</dd>
                  </div>

                  {item.teacher && (
                    <div className="flex justify-between pt-1.5">
                      <dt className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <User className="w-4 h-4 text-slate-400" />
                        <span>{t.mentor}</span>
                      </dt>
                      <dd className="font-semibold text-slate-700 dark:text-slate-300">{item.teacher}</dd>
                    </div>
                  )}

                  <div className="flex justify-between pt-1.5">
                    <dt className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>{t.parentConsent}</span>
                    </dt>
                    <dd className="font-bold">
                      {item.consent ? (
                        <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {t.consentGranted}
                        </span>
                      ) : (
                        <span className="text-amber-700 dark:text-amber-400">{t.consentHidden}</span>
                      )}
                    </dd>
                  </div>

                  <div className="flex justify-between pt-1.5">
                    <dt className="text-slate-500 dark:text-slate-400">{t.detailsTitle}</dt>
                    <dd className="font-medium text-slate-700 dark:text-slate-300 text-right max-w-[210px] truncate">{detail}</dd>
                  </div>
                </dl>

                {/* Action Buttons: Ulashish (Share) & Chop etish (Print / Download) */}
                <div className="pt-1 space-y-2 relative">
                  <div className="flex gap-2">
                    {/* Ulashish Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowShareMenu((prev) => !prev);
                        setShowPrintMenu(false);
                      }}
                      className={`flex-1 py-2.5 px-3 rounded-xl border active:scale-97 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        showShareMenu
                          ? 'border-[#13294B] dark:border-amber-400 bg-slate-100 dark:bg-slate-800 text-[#13294B] dark:text-amber-400 shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <Share2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      <span>{t.shareBtn}</span>
                    </button>

                    {/* Chop etish Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowPrintMenu((prev) => !prev);
                        setShowShareMenu(false);
                      }}
                      className={`flex-1 py-2.5 px-3 rounded-xl border active:scale-97 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        showPrintMenu
                          ? 'border-[#13294B] dark:border-amber-400 bg-slate-100 dark:bg-slate-800 text-[#13294B] dark:text-amber-400 shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      <span>{t.printBtn}</span>
                    </button>
                  </div>

                  {/* Share Popover Menu */}
                  <AnimatePresence>
                    {showShareMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-700/60">
                          <span className="font-extrabold text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            {t.shareBtn}
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowShareMenu(false)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Copy Link Button */}
                        <button
                          type="button"
                          onClick={handleCopyLink}
                          className={`w-full py-2 px-3 rounded-xl font-bold flex items-center justify-between transition-colors cursor-pointer ${
                            copied
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-slate-50 dark:bg-slate-750 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-600'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {copied ? (
                              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <Copy className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                            )}
                            <span>{copied ? t.linkCopied : t.copyLink}</span>
                          </div>
                          {copied && (
                            <span className="text-[10px] font-extrabold uppercase text-emerald-600 dark:text-emerald-400">
                              ✓ OK
                            </span>
                          )}
                        </button>

                        <div className="grid grid-cols-2 gap-2 pt-0.5">
                          {/* Telegram Share Link */}
                          <a
                            href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setShowShareMenu(false)}
                            className="py-2 px-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 font-bold flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Telegram</span>
                          </a>

                          {/* WhatsApp Share Link */}
                          <a
                            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setShowShareMenu(false)}
                            className="py-2 px-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 font-bold flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
                        </div>

                        {/* Native Share on mobile devices if available */}
                        {typeof navigator !== 'undefined' && 'share' in navigator && (
                          <button
                            type="button"
                            onClick={handleNativeShare}
                            className="w-full py-1.5 text-center text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 underline cursor-pointer"
                          >
                            Boshqa ilovalar orqali ulashish...
                          </button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Print & Download Popover Menu */}
                  <AnimatePresence>
                    {showPrintMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-700/60">
                          <span className="font-extrabold text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            {t.printBtn}
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowPrintMenu(false)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Option 1: Print / Save PDF */}
                        <button
                          type="button"
                          onClick={handlePrint}
                          className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-750 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-600 font-bold flex items-center gap-2.5 transition-colors cursor-pointer text-left"
                        >
                          <Printer className="w-4 h-4 text-[#13294B] dark:text-amber-400 shrink-0" />
                          <div>
                            <span className="block font-bold">{t.printPdf}</span>
                            <span className="text-[10.5px] font-normal text-slate-500 dark:text-slate-400 block">
                              Printer orqali qog'ozga yoki PDF fayl qilib chiqarish
                            </span>
                          </div>
                        </button>

                        {/* Option 2: Download PNG */}
                        <button
                          type="button"
                          disabled={isExporting}
                          onClick={handleDownloadPng}
                          className="w-full py-2.5 px-3 rounded-xl bg-[#13294B] dark:bg-amber-400 hover:bg-[#0B1A33] dark:hover:bg-amber-300 text-white dark:text-slate-950 font-extrabold flex items-center gap-2.5 transition-all shadow-sm active:scale-98 cursor-pointer text-left"
                        >
                          <Download className="w-4 h-4 shrink-0 text-amber-300 dark:text-slate-950" />
                          <div>
                            <span className="block">{t.downloadPng}</span>
                            <span className="text-[10.5px] font-normal text-slate-200 dark:text-slate-800 block">
                              Yuqori sifatli rasm fayli (1400x980 px)
                            </span>
                          </div>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Bottom Navigation Bar */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
              {/* Quick Dots / Indicator */}
              {allCertificates.length > 0 && onSelectIndex && (
                <div className="flex items-center justify-center gap-1 overflow-x-auto py-0.5 max-w-full">
                  {allCertificates.slice(0, 15).map((c, i) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setDirection(i > currentIndex ? 1 : -1);
                        onSelectIndex(i);
                      }}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        i === currentIndex
                          ? 'w-5 bg-[#13294B] dark:bg-amber-400'
                          : 'w-1.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                      }`}
                      title={c.name}
                    />
                  ))}
                </div>
              )}

              {/* Prev / Next Buttons */}
              <div className="flex items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={handlePrevClick}
                  className="group px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-[#13294B] dark:hover:border-slate-500 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 font-extrabold text-xs text-slate-800 dark:text-slate-100 flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-300 group-hover:-translate-x-0.5 transition-transform" />
                  <div className="text-left">
                    <span className="block leading-tight">{t.prevBtn}</span>
                    {prevItem && (
                      <span className="text-[9.5px] font-normal text-slate-400 dark:text-slate-400 block truncate max-w-[75px]">
                        {prevItem.name.split(' ')[0]}
                      </span>
                    )}
                  </div>
                </button>

                <div className="text-center font-mono">
                  <span className="text-sm font-extrabold text-[#13294B] dark:text-amber-400">
                    {currentIndex + 1}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500"> / {totalCount}</span>
                </div>

                <button
                  type="button"
                  onClick={handleNextClick}
                  className="group px-3.5 py-2 rounded-xl border border-[#13294B] dark:border-amber-400 bg-[#13294B] dark:bg-amber-400 hover:bg-[#0B1A33] dark:hover:bg-amber-300 text-white dark:text-slate-950 active:scale-95 font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-slate-900/10 cursor-pointer"
                >
                  <div className="text-right">
                    <span className="block leading-tight">{t.nextBtn}</span>
                    {nextItem && (
                      <span className="text-[9.5px] font-normal text-amber-200 dark:text-slate-800 block truncate max-w-[75px]">
                        {nextItem.name.split(' ')[0]}
                      </span>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-300 dark:text-slate-950 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              {/* Keyboard navigation hint */}
              <p className="text-[9.5px] text-center text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                {t.kbdTip}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
