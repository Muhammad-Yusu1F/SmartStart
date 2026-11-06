import React, { useState, useEffect, useMemo } from 'react';
import {
  Inbox,
  Phone,
  MessageSquare,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  FileSpreadsheet,
  Trash2,
  RefreshCw,
  ExternalLink,
  UserCheck,
  Send,
  Bot
} from 'lucide-react';
import {
  apiFetchApplications,
  apiUpdateApplicationStatus,
  apiDeleteApplication,
  AdmissionApplication
} from '../../api/applicationsApi';

interface ApplicationsManagerProps {
  onOpenBotSettings: () => void;
  onToast: (msg: string) => void;
}

export const ApplicationsManager: React.FC<ApplicationsManagerProps> = ({
  onOpenBotSettings,
  onToast
}) => {
  const [applications, setApplications] = useState<AdmissionApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await apiFetchApplications();
      setApplications(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Auto-refresh every 6 seconds to catch new incoming applications
    const timer = setInterval(loadData, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleStatusChange = async (id: string, newStatus: AdmissionApplication['status']) => {
    try {
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
      );
      await apiUpdateApplicationStatus(id, newStatus);
      onToast("Ariza holati yangilandi!");
    } catch (err) {
      console.error(err);
      loadData();
    }
  };

  const handleDelete = async (id: string, studentName: string) => {
    if (window.confirm(`"${studentName}" arizasini o'chirishga ishonchingiz komilmi?`)) {
      try {
        setApplications((prev) => prev.filter((a) => a.id !== id));
        await apiDeleteApplication(id);
        onToast("Ariza o'chirildi.");
      } catch (err) {
        console.error(err);
        loadData();
      }
    }
  };

  // KPIs
  const totalCount = applications.length;
  const newCount = applications.filter((a) => a.status === 'yangi').length;
  const contactedCount = applications.filter((a) => a.status === 'boglanildi').length;
  const acceptedCount = applications.filter((a) => a.status === 'qabul_qilindi').length;

  const filtered = useMemo(() => {
    return applications.filter((a) => {
      const matchStatus = statusFilter === 'all' || a.status === statusFilter;
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        a.parentName.toLowerCase().includes(q) ||
        a.studentName.toLowerCase().includes(q) ||
        a.phone.toLowerCase().includes(q) ||
        (a.notes && a.notes.toLowerCase().includes(q));

      return matchStatus && matchSearch;
    });
  }, [applications, statusFilter, search]);

  const handleExportCSV = () => {
    const headers = ['Ariza ID', 'Ota-ona F.I.SH.', "O'quvchi ismi", 'Sinf', 'Telefon', 'Izoh', 'Holati', 'Sana'];
    const rows = applications.map((a) => [
      a.id,
      `"${a.parentName}"`,
      `"${a.studentName}"`,
      `${a.grade}-sinf`,
      `"${a.phone}"`,
      `"${a.notes || ''}"`,
      a.status,
      `"${a.createdAt}"`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `qabul_arizalari_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: AdmissionApplication['status']) => {
    switch (status) {
      case 'yangi':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
            <Clock className="w-3 h-3" />
            Yangi
          </span>
        );
      case 'boglanildi':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700">
            <Phone className="w-3 h-3" />
            Bog'lanildi
          </span>
        );
      case 'qabul_qilindi':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
            <CheckCircle2 className="w-3 h-3" />
            Qabul qilindi
          </span>
        );
      case 'rad_etildi':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-700">
            <XCircle className="w-3 h-3" />
            Rad etildi
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#CF9E2E] mb-1">
            <Inbox className="w-4 h-4" />
            <span>Qabul 2026/2027</span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white">
            Qabul arizalari bazasi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Saytdan "Qabulga yozilish" orqali yuborilgan barcha arizalar va Telegram bot integratsiyasi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenBotSettings}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Bot className="w-4 h-4" />
            <span>Telegram Bot sozlamalari</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>CSV Eksport</span>
          </button>

          <button
            type="button"
            onClick={loadData}
            title="Yangilash"
            className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Jami arizalar
          </div>
          <div className="font-display font-extrabold text-3xl text-slate-900 dark:text-white">
            {totalCount}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Sayt orqali tushgan</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Yangi arizalar
          </div>
          <div className="font-display font-extrabold text-3xl text-amber-600 dark:text-amber-400">
            {newCount}
          </div>
          <span className="text-[11px] text-amber-700 dark:text-amber-500 mt-1 block">Ko'rib chiqilishi kerak</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Bog'lanilgan
          </div>
          <div className="font-display font-extrabold text-3xl text-blue-600 dark:text-blue-400">
            {contactedCount}
          </div>
          <span className="text-[11px] text-blue-700 dark:text-blue-500 mt-1 block">Suhbat o'tkazilgan</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Qabul qilindi
          </div>
          <div className="font-display font-extrabold text-3xl text-emerald-600 dark:text-emerald-400">
            {acceptedCount}
          </div>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-500 mt-1 block">Maktabga qabul qilingan</span>
        </div>
      </div>

      {/* Table Box */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Search & Filter Bar */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ota-ona, o'quvchi yoki telefon..."
              className="w-full min-h-[42px] pl-10 pr-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#13294B] dark:focus:ring-amber-400"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 whitespace-nowrap">
              Holati:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="min-h-[42px] px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#13294B] dark:focus:ring-amber-400 cursor-pointer"
            >
              <option value="all">Barchasi ({totalCount})</option>
              <option value="yangi">Yangi ({newCount})</option>
              <option value="boglanildi">Bog'lanildi ({contactedCount})</option>
              <option value="qabul_qilindi">Qabul qilindi ({acceptedCount})</option>
              <option value="rad_etildi">Rad etildi</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4">Ariza ID / Sana</th>
                <th className="py-3 px-4">Ota-ona</th>
                <th className="py-3 px-4">O'quvchi & Sinf</th>
                <th className="py-3 px-4">Telefon raqam</th>
                <th className="py-3 px-4">Izoh</th>
                <th className="py-3 px-4">Holati</th>
                <th className="py-3 px-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((app) => (
                <tr
                  key={app.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* ID & Date */}
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200 block">
                      {app.id}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                      {app.createdAt}
                    </span>
                  </td>

                  {/* Parent Name */}
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                    {app.parentName}
                  </td>

                  {/* Student & Grade */}
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                      {app.studentName}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {app.grade}-sinf
                    </span>
                  </td>

                  {/* Phone + Action buttons */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
                        {app.phone}
                      </span>
                      <a
                        href={`tel:${app.phone.replace(/\s+/g, '')}`}
                        title="Telefon qilish"
                        className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href={`https://t.me/${app.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Telegramdan yozish"
                        className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </td>

                  {/* Notes */}
                  <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400 max-w-xs truncate">
                    {app.notes || '—'}
                  </td>

                  {/* Status Dropdown */}
                  <td className="py-3.5 px-4">
                    <select
                      value={app.status}
                      onChange={(e) =>
                        handleStatusChange(app.id, e.target.value as AdmissionApplication['status'])
                      }
                      className="text-xs font-bold rounded-lg px-2 py-1 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 cursor-pointer"
                    >
                      <option value="yangi">🟡 Yangi</option>
                      <option value="boglanildi">🔵 Bog'lanildi</option>
                      <option value="qabul_qilindi">🟢 Qabul qilindi</option>
                      <option value="rad_etildi">🔴 Rad etildi</option>
                    </select>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(app.id, app.studentName)}
                      title="O'chirish"
                      className="p-2 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400 space-y-2">
            <p className="font-bold">Hech qanday ariza topilmadi</p>
            <p className="text-xs">
              Saytdagi "Qabulga yozilish" orqali yuborilgan barcha arizalar shu yerda ko'rinadi.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>
            Jami: <strong>{filtered.length}</strong> ta ariza ko'rsatilmoqda
          </span>
          <span className="font-mono text-slate-400">
            Smart Start Qabul Tizimi · Telegram Bot bilan sinxron
          </span>
        </div>
      </div>
    </div>
  );
};
