import React from 'react';
import { motion } from 'motion/react';
import { Award, CheckCircle2, ShieldCheck, Eye } from 'lucide-react';
import { CertificateItem } from '../types';
import {
  TYPE_COLORS,
  getDocTitle,
  formatScore,
  formatDisplayName,
  formatDetail
} from '../utils/certificateUtils';
import { useApp } from '../context/AppContext';

interface CertificateCardProps {
  item: CertificateItem;
  onClick: () => void;
  index: number;
}

export const CertificateCard: React.FC<CertificateCardProps> = ({ item, onClick, index }) => {
  const { t, theme, language } = useApp();
  const colors = TYPE_COLORS[item.type];
  const docTitle = getDocTitle(item.type, language);
  const scoreText = formatScore(item, language);
  const displayName = formatDisplayName(item, language);
  const detail = formatDetail(item, language);

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3), ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.18 } }}
      style={{ willChange: 'transform, opacity' }}
      className="group text-left w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col relative focus:outline-none focus:ring-2 focus:ring-[#CF9E2E] focus:ring-offset-2 dark:focus:ring-offset-slate-900 cursor-pointer transform-gpu"
    >
      {/* Visual Certificate Graphic Preview */}
      <div className="relative aspect-[4/3] bg-slate-100 dark:bg-[#0B1A33] p-2.5 sm:p-3 flex items-center justify-center overflow-hidden transition-colors">
        {item.imagePath ? (
          <div className="w-full h-full bg-white rounded-lg border border-slate-200 dark:border-slate-700 p-1 flex items-center justify-center shadow-md relative z-10 transition-transform duration-300 group-hover:scale-[1.02] overflow-hidden">
            <img
              src={item.imagePath}
              alt={displayName}
              className="w-full h-full object-contain"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src.endsWith('.webp')) {
                  target.src = target.src.replace(/\.webp$/, '.png');
                }
              }}
            />
          </div>
        ) : (
          /* Miniature Certificate Sheet */
          <div className="w-full h-full bg-[#FFFDF7] dark:bg-[#13294B] rounded-lg border border-[#E8DFC8] dark:border-[#22406E] p-3.5 flex flex-col justify-between shadow-md relative z-10 transition-transform duration-300 group-hover:scale-[1.02]">
            {/* Decorative Corner Ornaments */}
            <div className="absolute top-1.5 left-1.5 w-2 h-2 border-t-2 border-l-2 border-[#D5C7A7] dark:border-[#CF9E2E]/70" />
            <div className="absolute top-1.5 right-1.5 w-2 h-2 border-t-2 border-r-2 border-[#D5C7A7] dark:border-[#CF9E2E]/70" />
            <div className="absolute bottom-1.5 left-1.5 w-2 h-2 border-b-2 border-l-2 border-[#D5C7A7] dark:border-[#CF9E2E]/70" />
            <div className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b-2 border-r-2 border-[#D5C7A7] dark:border-[#CF9E2E]/70" />

            {/* Top header of certificate */}
            <div className="flex items-center justify-between gap-1 border-b border-[#ECE6D6] dark:border-[#22406E] pb-2">
              <span
                className="text-[9px] font-extrabold tracking-wider truncate"
                style={{ color: colors.primary }}
              >
                {docTitle}
              </span>
              <div className="flex items-center gap-1 shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400 dark:text-emerald-400 group-hover:text-emerald-500 transition-colors" />
                <span className="text-[8px] font-mono font-bold text-slate-400 dark:text-slate-300">
                  {item.year}
                </span>
              </div>
            </div>

            {/* Center Score & Student Info on Certificate */}
            <div className="my-auto py-1 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-400 block">
                  {t.resultLabel}
                </span>
                <div
                  className="font-display text-3xl font-extrabold tracking-tight leading-none"
                  style={{ color: colors.primary }}
                >
                  {scoreText}
                </div>
              </div>

              {/* Simulated Stamp / Emblem */}
              <div
                className="w-12 h-12 rounded-full border-2 border-dashed flex flex-col items-center justify-center p-1 text-center shrink-0 opacity-80 group-hover:opacity-100 transition-opacity"
                style={{ borderColor: colors.primary, color: colors.primary }}
              >
                <Award className="w-4 h-4 mb-0.5" />
                <span className="text-[7px] font-extrabold leading-none tracking-tighter uppercase">
                  Smart Start
                </span>
              </div>
            </div>

            {/* Bottom Security / Serial line */}
            <div className="flex items-center justify-between text-[8px] text-slate-400 dark:text-slate-300 border-t border-[#ECE6D6] dark:border-[#22406E] pt-1 font-mono">
              <span>{item.certNumber || `UZ-SS-${item.year}-${item.id.toString().padStart(4, '0')}`}</span>
              <span className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-0.5">
                <CheckCircle2 className="w-2.5 h-2.5" /> {t.verified}
              </span>
            </div>
          </div>
        )}

        {/* Hover overlay hint */}
        <div className="absolute inset-0 bg-[#0B1A33]/50 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center justify-center backdrop-blur-[1px]">
          <span className="bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="w-3.5 h-3.5 text-[#CF9E2E]" />
            {t.viewDetails}
          </span>
        </div>
      </div>

      {/* Card Body Info */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3 bg-white dark:bg-slate-900">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
              style={{
                backgroundColor: theme === 'dark' ? '#1E293B' : colors.badgeBg,
                color: colors.primary
              }}
            >
              {item.type} {item.type !== 'Olimpiada' && item.score}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium font-mono">
              {item.year}{t.yearSuffix}
            </span>
          </div>

          <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 group-hover:text-[#CF9E2E] transition-colors leading-snug">
            {displayName}
          </h3>

          {!item.consent && (
            <span className="inline-block text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/60 mt-1">
              {t.privacyProtected}
            </span>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {item.grade}{t.gradeSuffix}
          </span>
          <span className="truncate max-w-[180px] text-right font-medium text-slate-600 dark:text-slate-400">
            {detail}
          </span>
        </div>
      </div>
    </motion.button>
  );
};
