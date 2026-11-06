import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Sparkles,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Shield,
  FileSpreadsheet,
  ExternalLink,
  LogOut,
  LayoutGrid,
  Sun,
  Moon,
  Inbox,
  Bot
} from 'lucide-react';
import { CertificateItem, CertificateType } from '../../types';
import { TYPE_COLORS, formatScore, formatDisplayName } from '../../utils/certificateUtils';
import { useApp } from '../../context/AppContext';
import { Language } from '../../i18n/translations';
import { CertificateFormModal } from './CertificateFormModal';
import { ApplicationsManager } from './ApplicationsManager';
import { TelegramBotSettingsModal } from './TelegramBotSettingsModal';
import { apiFetchApplications } from '../../api/applicationsApi';

interface AdminDashboardProps {
  certificates: CertificateItem[];
  onSaveCertificate: (item: Omit<CertificateItem, 'id'> & { id?: number }) => void;
  onDeleteRequest: (item: CertificateItem) => void;
  onToggleFeatured: (id: number) => void;
  onPreview: (item: CertificateItem) => void;
  onGoToSite: () => void;
  onLogout: () => void;
  onResetData: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  certificates,
  onSaveCertificate,
  onDeleteRequest,
  onToggleFeatured,
  onPreview,
  onGoToSite,
  onLogout,
  onResetData
}) => {
  const { t, language, setLanguage, theme, setTheme, toggleTheme } = useApp();
  const [viewMode, setViewMode] = useState<'list' | 'form' | 'applications'>('list');
  const [editingItem, setEditingItem] = useState<CertificateItem | null>(null);
  const [isBotModalOpen, setIsBotModalOpen] = useState(false);
  const [appsCount, setAppsCount] = useState<number>(0);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | CertificateType>('all');

  useEffect(() => {
    const fetchAppsCount = async () => {
      try {
        const apps = await apiFetchApplications();
        setAppsCount(apps.length);
      } catch (e) {
        // ignore
      }
    };
    fetchAppsCount();
    const interval = setInterval(fetchAppsCount, 8000);
    return () => clearInterval(interval);
  }, []);

  // KPI Computations
  const totalCount = certificates.length;
  const thisYearCount = certificates.filter((c) => c.year === 2026).length;
  const featuredCount = certificates.filter((c) => c.featured).length;
  const noConsentCount = certificates.filter((c) => !c.consent).length;

  const handleAddNew = () => {
    setEditingItem(null);
    setViewMode('form');
  };

  const handleEdit = (item: CertificateItem) => {
    setEditingItem(item);
    setViewMode('form');
  };

  const handleSave = (item: Omit<CertificateItem, 'id'> & { id?: number }) => {
    onSaveCertificate(item);
    setViewMode('list');
    setEditingItem(null);
  };

  // Filtered rows
  const filteredRows = useMemo(() => {
    return certificates.filter((c) => {
      const matchType = typeFilter === 'all' || c.type === typeFilter;
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        (c.subject && c.subject.toLowerCase().includes(q)) ||
        (c.certNumber && c.certNumber.toLowerCase().includes(q));

      return matchType && matchSearch;
    }).sort((a, b) => b.id - a.id);
  }, [certificates, typeFilter, search]);

  const handleExportCSV = () => {
    const headers = ['ID', 'F.I.SH.', 'Sinf', 'Turi', 'Ball', 'Fan', 'Yil', 'Ota-ona roziligi', 'Bosh sahifada'];
    const rows = certificates.map((c) => [
      c.id,
      `"${c.name}"`,
      c.grade,
      c.type,
      `"${c.score}"`,
      `"${c.subject || ''}"`,
      c.year,
      c.consent ? 'Ha' : 'Yoq',
      c.featured ? 'Ha' : 'Yoq'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `smart_start_sertifikatlar_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const languages: { code: Language; label: string }[] = [
    { code: 'uz', label: 'UZ' },
    { code: 'ru', label: 'RU' },
    { code: 'en', label: 'EN' }
  ];

  return (
    <div className="min-h-screen bg-[#F2F5FA] dark:bg-slate-950 flex flex-col md:flex-row transition-colors relative">
      {/* 
        FROZEN / LOCKED SIDEBAR (md:fixed top-0 bottom-0 left-0 w-64)
        Stays 100% frozen in place when scrolling. Never moves.
      */}
      <aside className="w-full md:w-64 md:fixed md:top-0 md:bottom-0 md:left-0 md:h-screen md:overflow-y-auto bg-[#13294B] dark:bg-slate-900 text-white p-5 flex flex-col justify-between shrink-0 border-r border-slate-800 z-30 select-none shadow-xl md:shadow-none">
        <div className="space-y-7">
          {/* Logo & School Header */}
          <div className="flex items-center gap-3 px-2">
            <img
              src="/smart-start-logo.png"
              alt="Logo"
              className="w-10 h-10 object-contain rounded-xl bg-white/5 p-1 border border-white/10"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/b9beb49f5a7d0c49502c2b2852bb209a.png';
              }}
            />
            <div className="leading-tight">
              <span className="font-display font-bold text-lg text-white block">
                {t.schoolName}
              </span>
              <span className="text-[10px] font-extrabold tracking-widest text-[#E6BE5E] uppercase">
                {t.protoAdmin}
              </span>
            </div>
          </div>

          {/* Quick Lang & Theme Bar in Frozen Sidebar */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-1">
              {languages.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLanguage(l.code)}
                  className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase transition-colors cursor-pointer ${
                    language === l.code
                      ? 'bg-amber-400 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setTheme('light')}
                title={t.themeLight}
                className={`p-1 rounded-md transition-colors cursor-pointer ${
                  theme === 'light' ? 'bg-amber-400 text-slate-950 font-bold shadow-2xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                title={t.themeDark}
                className={`p-1 rounded-md transition-colors cursor-pointer ${
                  theme === 'dark' ? 'bg-amber-400 text-slate-950 font-bold shadow-2xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1.5 text-sm font-bold">
            <button
              type="button"
              onClick={() => {
                setViewMode('list');
                setEditingItem(null);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[#22406E] dark:bg-slate-800 text-white shadow-xs border-l-4 border-[#CF9E2E]'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutGrid className="w-4 h-4 text-[#CF9E2E]" />
                <span>{t.adminTitle}</span>
              </div>
              <span className="text-xs bg-slate-900/60 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                {totalCount}
              </span>
            </button>

            <button
              type="button"
              onClick={handleAddNew}
              className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-2.5 transition-all cursor-pointer ${
                viewMode === 'form' && !editingItem
                  ? 'bg-[#22406E] dark:bg-slate-800 text-white shadow-xs border-l-4 border-[#CF9E2E]'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>{t.addCertBtn}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setViewMode('applications');
                setEditingItem(null);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                viewMode === 'applications'
                  ? 'bg-[#22406E] dark:bg-slate-800 text-white shadow-xs border-l-4 border-[#CF9E2E]'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Inbox className="w-4 h-4 text-amber-400" />
                <span>{language === 'ru' ? 'Заявки на приём' : language === 'en' ? 'Admission Requests' : 'Qabul arizalari'}</span>
              </div>
              {appsCount > 0 && (
                <span className="text-xs bg-[#CF9E2E] text-slate-950 font-extrabold px-2 py-0.5 rounded-full font-mono">
                  {appsCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsBotModalOpen(true)}
              className="w-full text-left px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <Bot className="w-4 h-4 text-blue-400" />
              <span>{language === 'ru' ? 'Настройки Telegram-бота' : language === 'en' ? 'Telegram Bot Settings' : 'Telegram Bot sozlash'}</span>
            </button>

            <button
              type="button"
              onClick={onGoToSite}
              className="w-full text-left px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 text-amber-300" />
              <span>{t.backToSite.replace('← ', '')}</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-6 border-t border-slate-700/60 space-y-3">
          <button
            type="button"
            onClick={onResetData}
            title={t.demoReset}
            className="w-full py-2 px-3 rounded-lg border border-slate-700 hover:bg-slate-800 text-xs text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.demoReset}</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-red-950/60 text-slate-300 hover:text-red-300 border border-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{t.logoutBtn}</span>
          </button>
        </div>
      </aside>

      {/* 
        MAIN CONTENT AREA (md:ml-64)
        Scrolls smoothly and independently while sidebar stays 100% frozen.
      */}
      <main className="md:ml-64 flex-1 min-h-screen p-5 sm:p-8 lg:p-10 space-y-8 bg-[#F2F5FA] dark:bg-slate-950 overflow-x-hidden">
        {viewMode === 'form' ? (
          <CertificateFormModal
            initialItem={editingItem}
            onSave={handleSave}
            onCancel={() => {
              setViewMode('list');
              setEditingItem(null);
            }}
          />
        ) : viewMode === 'applications' ? (
          <ApplicationsManager
            onOpenBotSettings={() => setIsBotModalOpen(true)}
            onToast={() => {}}
          />
        ) : (
          <>
            {/* Top Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white">
                  {t.adminTitle}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {t.adminDesc}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{t.exportCsv}</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddNew}
                  className="px-5 py-2.5 rounded-xl bg-[#CF9E2E] hover:bg-[#b88c27] text-[#13294B] font-extrabold text-sm flex items-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.addCertBtn}</span>
                </button>
              </div>
            </div>

            {/* 4 KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  {t.kpiTotal}
                </div>
                <div className="font-display font-extrabold text-3xl text-slate-900 dark:text-white">
                  {totalCount}
                </div>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">
                  {t.kpiTotalSub}
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  {t.kpiYear}
                </div>
                <div className="font-display font-extrabold text-3xl text-emerald-600 dark:text-emerald-400">
                  {thisYearCount}
                </div>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">
                  {t.kpiYearSub}
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  {t.kpiFeatured}
                </div>
                <div className="font-display font-extrabold text-3xl text-[#13294B] dark:text-amber-400 flex items-baseline gap-1">
                  <span>{featuredCount}</span>
                  <span className="text-sm font-sans font-normal text-slate-400">/ 8</span>
                </div>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">
                  {t.kpiFeaturedSub}
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  {t.kpiNoConsent}
                </div>
                <div className="font-display font-extrabold text-3xl text-amber-600 dark:text-amber-400">
                  {noConsentCount}
                </div>
                <span className="text-[11px] text-amber-700 dark:text-amber-500 mt-1 block">
                  {t.kpiNoConsentSub}
                </span>
              </div>
            </div>

            {/* Certificate Table Container */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
              {/* Table Search & Type Filter Bar */}
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t.tableSearchPlaceholder}
                    className="w-full min-h-[42px] pl-10 pr-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#13294B] dark:focus:ring-amber-400"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {t.filterTypeLabel}:
                  </label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
                    className="min-h-[42px] px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#13294B] dark:focus:ring-amber-400 cursor-pointer"
                  >
                    <option value="all">{t.filterAll} ({totalCount})</option>
                    <option value="IELTS">IELTS</option>
                    <option value="CEFR">CEFR</option>
                    <option value="SAT">SAT</option>
                    <option value="Olimpiada">Olimpiada</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse min-w-[850px]">
                  <thead>
                    <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <th className="py-3 px-4">{t.tableColStudent}</th>
                      <th className="py-3 px-4">{t.tableColScore}</th>
                      <th className="py-3 px-4">{t.tableColGrade}</th>
                      <th className="py-3 px-4">{t.tableColYear}</th>
                      <th className="py-3 px-4">{t.tableColConsent}</th>
                      <th className="py-3 px-4">{t.tableColFeatured}</th>
                      <th className="py-3 px-4 text-right">{t.tableColActions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredRows.map((item) => {
                      const colors = TYPE_COLORS[item.type];
                      const scoreText = formatScore(item, language);

                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
                        >
                          {/* Name */}
                          <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                            <div className="flex items-center gap-2">
                              <span>{item.name}</span>
                              {item.isNew && (
                                <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold">
                                  {t.newBadge}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono font-normal block">
                              {item.certNumber || `SS-${item.year}-${item.id}`}
                            </span>
                          </td>

                          {/* Score Badge */}
                          <td className="py-3.5 px-4">
                            <span
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold"
                              style={{
                                backgroundColor: theme === 'dark' ? '#1E293B' : colors.badgeBg,
                                color: colors.primary
                              }}
                            >
                              <span>{item.type}</span>
                              <span>{scoreText}</span>
                            </span>
                            {item.subject && (
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                                {item.subject} ({item.level})
                              </span>
                            )}
                          </td>

                          {/* Grade */}
                          <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                            {item.grade}{t.gradeSuffix}
                          </td>

                          {/* Year */}
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-mono">
                            {item.year}
                          </td>

                          {/* Consent status */}
                          <td className="py-3.5 px-4">
                            {item.consent ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{t.consentGranted}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-2.5 py-0.5 rounded-full">
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>{t.consentHidden}</span>
                              </span>
                            )}
                          </td>

                          {/* Featured toggle switch */}
                          <td className="py-3.5 px-4">
                            <button
                              type="button"
                              role="switch"
                              aria-checked={item.featured}
                              onClick={() => onToggleFeatured(item.id)}
                              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                item.featured ? 'bg-[#13294B] dark:bg-amber-400' : 'bg-slate-300 dark:bg-slate-700'
                              }`}
                            >
                              <span
                                aria-hidden="true"
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-slate-900 shadow-sm ring-0 transition duration-200 ease-in-out ${
                                  item.featured ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => onPreview(item)}
                              title="Saytdagi ko'rinishini ko'rish"
                              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEdit(item)}
                              title="Tahrirlash"
                              className="p-2 rounded-lg text-blue-600 dark:text-blue-400 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteRequest(item)}
                              title="O'chirish"
                              className="p-2 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredRows.length === 0 && (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400 space-y-2">
                  <p className="font-bold">{t.emptyTitle}</p>
                  <p className="text-xs">{t.emptyDesc}</p>
                </div>
              )}

              {/* Footer count */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>
                  {t.kpiTotal}: <strong>{filteredRows.length}</strong> {t.certsFound}
                </span>
                <span className="font-mono text-slate-400 dark:text-slate-500">
                  Smart Start CMS · v2.5 (Fixed Sidebar)
                </span>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Telegram Bot Settings Modal */}
      <TelegramBotSettingsModal
        isOpen={isBotModalOpen}
        onClose={() => setIsBotModalOpen(false)}
      />
    </div>
  );
};
