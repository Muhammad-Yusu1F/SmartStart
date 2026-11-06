import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, CheckCircle2, ArrowDown } from 'lucide-react';
import { StatsCounter } from './StatsCounter';
import { CertificateItem } from '../types';
import { useApp } from '../context/AppContext';

interface HeroSectionProps {
  certificates: CertificateItem[];
  onScrollToFilter: () => void;
  onOpenAdmission: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  certificates,
  onScrollToFilter,
  onOpenAdmission
}) => {
  const { t } = useApp();

  return (
    <section className="bg-gradient-to-b from-[#13294B] to-[#0D1D35] dark:from-slate-950 dark:to-slate-900 text-white pt-10 pb-16 px-4 sm:px-6 relative overflow-hidden transition-colors">
      {/* Background architectural geometric lines and lightweight ambient gradient */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_25%,rgba(207,158,46,0.08),transparent_50%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-10 relative z-10">
        {/* Top Badges and Intro */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-700/60 pb-8">
          <div className="max-w-3xl space-y-4">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-amber-300 text-xs font-bold"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.heroBadge}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-display font-bold text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.12]"
            >
              {t.heroTitlePrefix}{' '}
              <span className="text-[#E6BE5E] underline decoration-[#CF9E2E]/50 decoration-wavy decoration-2">
                {t.heroTitleAccent}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed"
            >
              {t.heroSubtitle}
            </motion.p>
          </div>

          {/* Quick CTA Actions */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="flex flex-wrap items-center gap-3 shrink-0"
          >
            <button
              type="button"
              onClick={onScrollToFilter}
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span>{t.viewCertsBtn}</span>
              <ArrowDown className="w-4 h-4 text-amber-300" />
            </button>
            <button
              type="button"
              onClick={onOpenAdmission}
              className="px-6 py-3 rounded-xl bg-[#CF9E2E] hover:bg-[#b88c27] text-[#13294B] font-extrabold text-sm transition-all shadow-md shadow-amber-900/30 active:scale-95 cursor-pointer"
            >
              {t.enrollChildBtn}
            </button>
          </motion.div>
        </div>

        {/* Live Animated Statistics Cards Grid */}
        <StatsCounter certificates={certificates} />

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-300 dark:text-slate-400 pt-2"
        >
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {t.trustBadge1}
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {t.trustBadge2}
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {t.trustBadge3}
          </span>
        </motion.div>
      </div>
    </section>
  );
};
