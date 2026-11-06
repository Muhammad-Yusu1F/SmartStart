import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { CertificateItem } from '../types';
import { CertificateCard } from './CertificateCard';
import { useApp } from '../context/AppContext';

interface FeaturedShowcaseProps {
  certificates: CertificateItem[];
  onOpenCertificate: (item: CertificateItem) => void;
  onGoAllResults: () => void;
  onOpenAdmission: () => void;
}

export const FeaturedShowcase: React.FC<FeaturedShowcaseProps> = ({
  certificates,
  onOpenCertificate,
  onGoAllResults,
  onOpenAdmission
}) => {
  const { t } = useApp();
  const featuredItems = certificates.filter((c) => c.featured).slice(0, 8);

  return (
    <div className="space-y-16 py-10">
      {/* Introduction Banner - Solid Deep Navy Blue (To'q ko'k / Tyomniy siniy) */}
      <section className="bg-[#13294B] dark:bg-[#0D1D35] text-white border border-[#234374] dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden transition-colors">
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            {t.featuredShowcaseKicker}
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight leading-tight">
            {t.featuredShowcaseTitle}
          </h2>
          <p className="text-slate-200 text-base leading-relaxed">
            {t.featuredShowcaseDesc}
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onGoAllResults}
              className="px-5 py-2.5 rounded-xl bg-[#CF9E2E] hover:bg-[#b88c27] text-[#0B1A33] font-bold text-sm transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
            >
              <span>{t.allCertsBaseBtn}</span>
              <ArrowRight className="w-4 h-4 text-[#0B1A33]" />
            </button>
            <button
              type="button"
              onClick={onOpenAdmission}
              className="px-5 py-2.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/15 text-white font-bold text-sm transition-colors cursor-pointer"
            >
              {t.applyBtn}
            </button>
          </div>
        </div>
      </section>

      {/* Featured Grid (Max 8) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[#CF9E2E] tracking-widest uppercase">
              {t.topKicker}
            </span>
            <h3 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white">
              {t.topHeading}
            </h3>
          </div>
          <button
            type="button"
            onClick={onGoAllResults}
            className="text-sm font-bold text-[#13294B] dark:text-amber-400 hover:text-[#CF9E2E] flex items-center gap-1 group transition-colors cursor-pointer"
          >
            <span>{t.goToAll} ({certificates.length})</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredItems.map((item, index) => (
            <CertificateCard
              key={item.id}
              item={item}
              onClick={() => onOpenCertificate(item)}
              index={index}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
