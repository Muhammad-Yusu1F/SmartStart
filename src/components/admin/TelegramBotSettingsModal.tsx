import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Bot,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  Shield,
  Key,
  MessageSquare,
  Loader2,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  apiGetBotConfig,
  apiSaveBotConfig,
  apiTestBotConfig,
  apiSyncBotUpdates,
  BotConfigResponse
} from '../../api/applicationsApi';

interface TelegramBotSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast?: (msg: string) => void;
}

export const TelegramBotSettingsModal: React.FC<TelegramBotSettingsModalProps> = ({
  isOpen,
  onClose,
  onSuccessToast
}) => {
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [botEnabled, setBotEnabled] = useState(true);
  const [config, setConfig] = useState<BotConfigResponse | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadConfig();
      setTestResult(null);
      setSaveSuccess(false);
    }
  }, [isOpen]);

  const loadConfig = async () => {
    try {
      setIsLoading(true);
      const data = await apiGetBotConfig();
      setConfig(data);
      setChatId(data.chatId || '');
      setBotEnabled(data.botEnabled);
    } catch (err) {
      console.error('Failed to load bot config:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncFromTelegram = async () => {
    try {
      setIsSyncing(true);
      setTestResult(null);
      const res = await apiSyncBotUpdates();
      if (res.chatId) {
        setChatId(res.chatId);
        setTestResult({
          success: true,
          message: `Tabriklaymiz! Chat ID avtomatik aniqlandi va ulandi (${res.chatId}). Endi arizalar shu yerga keladi!`
        });
        await loadConfig();
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else {
        setTestResult({
          success: false,
          message: "Telegram botda hali hech qanday yangi xabar (/start) topilmadi. Avval Telegramda https://t.me/stmartstartt_bot ga kirib START tugmasini bosing, so'ng qayta tekshiring!"
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || "Tekshirishda xatolik yuz berdi"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await apiSaveBotConfig({
        botToken: botToken.trim() || undefined,
        chatId: chatId.trim(),
        botEnabled
      });
      setSaveSuccess(true);
      if (onSuccessToast) onSuccessToast("Telegram bot sozlamalari saqlandi!");
      await loadConfig();
      setBotToken('');
    } catch (err: any) {
      alert(err.message || "Saqlashda xatolik");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async () => {
    try {
      setIsTesting(true);
      setTestResult(null);
      const res = await apiTestBotConfig(
        botToken.trim() || undefined,
        chatId.trim() || undefined
      );
      setTestResult({
        success: true,
        message: res.message || "Test xabari Telegramga muvaffaqiyatli yuborildi! Telegramingizni tekshiring."
      });
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || "Xatolik: Token yoki Chat ID noto'g'ri bo'lishi mumkin."
      });
    } finally {
      setIsTesting(false);
    }
  };

  const isConfigured = Boolean(config?.hasToken && config?.chatId);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#0B1A33]/85 dark:bg-black/90 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 p-5 sm:p-8 my-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Telegram Bot Integratsiyasi</span>
                  {isConfigured ? (
                    <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Faol
                    </span>
                  ) : (
                    <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold">
                      Hali ulanmagan
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Saytdan yuborilgan barcha qabul arizalari darhol Telegram botingizga boradi.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Test Status feedback */}
          {testResult && (
            <div
              className={`mt-4 p-3.5 rounded-2xl text-xs font-semibold flex items-start gap-2.5 ${
                testResult.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          {saveSuccess && !testResult && (
            <div className="mt-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Sozlamalar muvaffaqiyatli saqlandi!</span>
            </div>
          )}

          {/* Bot Connection Card */}
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-blue-500/10 border border-blue-200 dark:border-blue-900/60 text-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
                <span className="font-extrabold text-blue-950 dark:text-blue-200 uppercase tracking-wider">
                  Bot: @stmartstartt_bot
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="https://t.me/stmartstartt_bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Telegramda ochish (/start)</span>
                  <ExternalLink className="w-3 h-3 opacity-80" />
                </a>

                <button
                  type="button"
                  onClick={handleSyncFromTelegram}
                  disabled={isSyncing}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 text-slate-800 dark:text-slate-200 font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {isSyncing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  )}
                  <span>{isSyncing ? 'Tekshirilmoqda...' : 'Chat ID ni avtomatik ulash'}</span>
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              💡 <strong>Qanday qilib arizalarni qabul qilish mumkin?</strong> Telegramda{' '}
              <a
                href="https://t.me/stmartstartt_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 font-bold underline"
              >
                @stmartstartt_bot
              </a>
              ga kirib <strong>START</strong> tugmasini bosing yoki botni ma'muriyat guruhiga qo'shing. Tizim avtomatik tarzda Chat ID ni aniqlaydi va arizalarni uzatishni boshlaydi!
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                <span>Telegram Bot Token *</span>
                {config?.hasToken && (
                  <span className="text-[11px] font-normal text-emerald-600 dark:text-emerald-400 font-mono">
                    Hozirgi: {config.maskedToken}
                  </span>
                )}
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  placeholder={config?.hasToken ? "O'zgartirish uchun yangi tokenni kiriting..." : "Masalan, 7123456789:AAHk4_..."}
                  className="w-full min-h-[44px] pl-10 pr-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-mono focus:ring-2 focus:ring-[#13294B] dark:focus:ring-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                Telegram Chat ID (yoki Guruh ID) *
              </label>
              <div className="relative">
                <MessageSquare className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={chatId}
                  onChange={(e) => setChatId(e.target.value)}
                  placeholder="Masalan, 123456789 yoki -1001234567890"
                  className="w-full min-h-[44px] pl-10 pr-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-mono focus:ring-2 focus:ring-[#13294B] dark:focus:ring-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 cursor-pointer">
              <input
                type="checkbox"
                checked={botEnabled}
                onChange={(e) => setBotEnabled(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#13294B] focus:ring-[#13294B] accent-[#13294B]"
              />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Arizalarni Telegram botga avtomatik jo'natish faol bo'lsin
              </span>
            </label>

            {/* Action buttons */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                disabled={isTesting || (!chatId && !config?.chatId)}
                onClick={handleTest}
                className="px-4 py-2.5 rounded-xl border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Xabar yuborilmoqda...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Test xabari yuborish</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Yopish
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2.5 rounded-xl bg-[#13294B] dark:bg-amber-400 hover:bg-[#0B1A33] dark:hover:bg-amber-300 text-white dark:text-slate-950 font-extrabold text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saqlanmoqda...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-300 dark:text-slate-950" />
                      <span>Sozlamalarni saqlash</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
