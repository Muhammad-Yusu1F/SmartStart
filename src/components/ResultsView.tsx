import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, RotateCcw, Filter, ChevronDown, Check, ArrowRight } from 'lucide-react';
import { CertificateItem, CertificateType, FilterState } from '../types';
import { CertificateCard } from './CertificateCard';
import { getRankValue } from '../utils/certificateUtils';
import { useApp } from '../context/AppContext';

interface ResultsViewProps {
  certificates: CertificateItem[];
  onOpenCertificate: (item: CertificateItem) => void;
  onOpenAdmission: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  certificates,
  onOpenCertificate,
  onOpenAdmission
}) => {
  const { t, language } = useApp();

  const [filters, setFilters] = useState<FilterState>({
    type: 'all',
    year: 'all',
    grade: 'all',
    search: '',
    sort: 'new'
  });

  const [visibleCount, setVisibleCount] = useState<number>(12);

  // Filter types with badge counts
  const typeOptions: { id: 'all' | CertificateType; label: string }[] = [
    { id: 'all', label: t.filterAll },
    { id: 'IELTS', label: 'IELTS' },
    { id: 'CEFR', label: 'CEFR' },
    { id: 'SAT', label: 'SAT' },
    { id: 'Olimpiada', label: language === 'ru' ? 'Олимпиада' : language === 'en' ? 'Olympiad' : 'Olimpiada' }
  ];

  // Base matches without type filter to compute type badge counts
  const baseMatches = useMemo(() => {
    return certificates.filter((c) => {
      const matchYear = filters.year === 'all' || String(c.year) === filters.year;
      const matchGrade = filters.grade === 'all' || String(c.grade) === filters.grade;
      const query = filters.search.toLowerCase().trim();
      const matchSearch =
        !query ||
        c.name.toLowerCase().includes(query) ||
        (c.subject && c.subject.toLowerCase().includes(query)) ||
        (c.certNumber && c.certNumber.toLowerCase().includes(query));

      return matchYear && matchGrade && matchSearch;
    });
  }, [certificates, filters.year, filters.grade, filters.search]);

  // Filtered and sorted items
  const filteredList = useMemo(() => {
    let result = baseMatches.filter((c) => {
      if (filters.type === 'all') return true;
      return c.type === filters.type;
    });

    const typeOrder: Record<CertificateType, number> = {
      IELTS: 0,
      SAT: 1,
      CEFR: 2,
      Olimpiada: 3
    };

    result = result.slice().sort((a, b) => {
      if (filters.sort === 'top') {
        const orderDiff = typeOrder[a.type] - typeOrder[b.type];
        if (orderDiff !== 0) return orderDiff;
        return getRankValue(b) - getRankValue(a);
      }
      if (filters.sort === 'name') {
        return a.name.localeCompare(b.name);
      }
      // default: new
      return b.year - a.year || b.id - a.id;
    });

    return result;
  }, [baseMatches, filters.type, filters.sort]);

  const hasActiveFilters =
    filters.type !== 'all' ||
    filters.year !== 'all' ||
    filters.grade !== 'all' ||
    filters.search.trim() !== '' ||
    filters.sort !== 'new';

  const resetFilters = () => {
    setFilters({
      type: 'all',
      year: 'all',
      grade: 'all',
      search: '',
      sort: 'new'
    });
    setVisibleCount(12);
  };

  const displayedItems = filteredList.slice(0, visibleCount);
  const remainingCount = Math.max(0, filteredList.length - visibleCount);

  return (
    <div id="natijalar-section" className="space-y-8 py-8">
      {/* Search and Filters Bar */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-100/90 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5 transition-colors">
        {/* Type Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t.filterTypeLabel}>
          {typeOptions.map((tItem) => {
            const isSelected = filters.type === tItem.id;
            const count =
              tItem.id === 'all'
                ? baseMatches.length
                : baseMatches.filter((c) => c.type === tItem.id).length;

            return (
              <button
                key={tItem.id}
                type="button"
                onClick={() => {
                  setFilters({ ...filters, type: tItem.id });
                  setVisibleCount(12);
                }}
                className={`min-h-[44px] px-4 sm:px-5 py-2 rounded-full font-bold text-sm transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-[#13294B] dark:bg-amber-400 text-white dark:text-slate-950 shadow-md shadow-slate-900/10'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-750'
                }`}
              >
                <span>{tItem.label}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-extrabold ${
                    isSelected
                      ? 'bg-amber-400 dark:bg-slate-950 text-slate-900 dark:text-amber-300'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search, Year, Grade, Sort Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
          {/* Search input */}
          <div className="relative">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
              {t.searchLabel}
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={filters.search}
                onChange={(e) => {
                  setFilters({ ...filters, search: e.target.value });
                  setVisibleCount(12);
                }}
                placeholder={t.searchPlaceholder}
                className="w-full min-h-[48px] pl-10 pr-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#13294B] dark:focus:ring-amber-400 focus:border-transparent transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Year select */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
              {t.yearLabel}
            </label>
            <div className="relative">
              <select
                value={filters.year}
                onChange={(e) => {
                  setFilters({ ...filters, year: e.target.value });
                  setVisibleCount(12);
                }}
                className="w-full min-h-[48px] px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#13294B] dark:focus:ring-amber-400 focus:border-transparent transition-all appearance-none cursor-pointer shadow-2xs"
              >
                <option value="all">{t.yearAll}</option>
                <option value="2026">2026{t.yearSuffix}</option>
                <option value="2025">2025{t.yearSuffix}</option>
                <option value="2024">2024{t.yearSuffix}</option>
                <option value="2023">2023{t.yearSuffix}</option>
                <option value="2022">2022{t.yearSuffix}</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Grade select */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
              {t.gradeLabel}
            </label>
            <div className="relative">
              <select
                value={filters.grade}
                onChange={(e) => {
                  setFilters({ ...filters, grade: e.target.value });
                  setVisibleCount(12);
                }}
                className="w-full min-h-[48px] px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#13294B] dark:focus:ring-amber-400 focus:border-transparent transition-all appearance-none cursor-pointer shadow-2xs"
              >
                <option value="all">{t.gradeAll}</option>
                <option value="5">5{t.gradeSuffix}</option>
                <option value="6">6{t.gradeSuffix}</option>
                <option value="7">7{t.gradeSuffix}</option>
                <option value="8">8{t.gradeSuffix}</option>
                <option value="9">9{t.gradeSuffix}</option>
                <option value="10">10{t.gradeSuffix}</option>
                <option value="11">11{t.gradeSuffix}</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Sort select */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
              {t.sortLabel}
            </label>
            <div className="relative">
              <select
                value={filters.sort}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    sort: e.target.value as FilterState['sort']
                  })
                }
                className="w-full min-h-[48px] px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#13294B] dark:focus:ring-amber-400 focus:border-transparent transition-all appearance-none cursor-pointer shadow-2xs"
              >
                <option value="new">{t.sortNew}</option>
                <option value="top">{t.sortTop}</option>
                <option value="name">{t.sortName}</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Results Meta Count & Reset */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-xl text-slate-900 dark:text-white">
            {filteredList.length} {t.certsFound}
          </span>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {filters.type !== 'all' ? `(${filters.type} ${t.byType})` : t.fromFullBase}
          </span>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-red-700 dark:hover:text-red-400 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.clearFilters}</span>
          </button>
        )}
      </div>

      {/* Empty State */}
      {filteredList.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-12 sm:p-16 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Filter className="w-8 h-8" />
          </div>
          <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
            {t.emptyTitle}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {t.emptyDesc}
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="px-5 py-2.5 rounded-xl bg-[#13294B] dark:bg-amber-400 text-white dark:text-slate-950 font-bold text-sm hover:bg-[#0B1A33] dark:hover:bg-amber-300 transition-colors cursor-pointer"
          >
            {t.clearFilters}
          </button>
        </motion.div>
      )}

      {/* Certificate Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayedItems.map((item, index) => (
          <CertificateCard
            key={item.id}
            item={item}
            onClick={() => onOpenCertificate(item)}
            index={index}
          />
        ))}
      </div>

      {/* Load More Button */}
      {remainingCount > 0 && (
        <div className="pt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + 12)}
            className="px-8 py-3.5 rounded-2xl border-2 border-[#13294B] dark:border-amber-400 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-[#13294B] dark:text-amber-400 font-display font-bold text-sm transition-all shadow-sm active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <span>{t.loadMore} ({remainingCount} {t.remainingText})</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Bottom Conversion Section - Solid Deep Navy Blue */}
      <section className="mt-16 p-8 sm:p-12 rounded-3xl bg-[#13294B] dark:bg-[#0D1D35] text-white border border-[#234374] dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg transition-colors">
        <div className="space-y-2 max-w-xl text-center md:text-left">
          <span className="text-xs font-extrabold uppercase tracking-widest text-amber-300">
            {t.conversionKicker}
          </span>
          <h3 className="font-display font-bold text-2xl sm:text-3xl text-white leading-snug">
            {t.conversionTitle}
          </h3>
          <p className="text-sm text-slate-200">
            {t.conversionDesc}
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAdmission}
          className="px-8 py-4 rounded-2xl bg-[#CF9E2E] hover:bg-[#b88c27] text-[#0B1A33] font-extrabold text-base transition-all shadow-md active:scale-95 shrink-0 flex items-center gap-2 cursor-pointer"
        >
          <span>{t.conversionBtn}</span>
          <ArrowRight className="w-5 h-5 text-[#0B1A33]" />
        </button>
      </section>
    </div>
  );
};
