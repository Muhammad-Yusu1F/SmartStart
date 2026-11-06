import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, User, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onGoBack: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onGoBack }) => {
  const { t, language } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage(
        language === 'ru'
          ? 'Введите логин и пароль!'
          : language === 'en'
          ? 'Please enter username and password!'
          : 'Login va parolni kiriting!'
      );
      return;
    }

    // Secure authentication
    if (username.trim().toLowerCase() === 'smartstart' && password === 'smartschool') {
      setErrorMessage('');
      onLoginSuccess();
    } else {
      setErrorMessage(
        language === 'ru'
          ? 'Неверный логин или пароль!'
          : language === 'en'
          ? 'Invalid username or password!'
          : "Login yoki parol noto'g'ri!"
      );
    }
  };

  return (
    <div className="min-h-[820px] bg-[#F2F5FA] dark:bg-slate-950 flex flex-col lg:flex-row items-stretch transition-colors">
      {/* Left Brand Panel */}
      <div className="lg:w-1/2 bg-[#13294B] dark:bg-slate-900 text-white p-8 sm:p-14 lg:p-16 flex flex-col justify-between gap-10 border-r border-slate-800">
        {/* Top Logo */}
        <div className="flex items-center gap-3.5">
          <img
            src="/smart-start-logo.png"
            alt="Smart Start Logo"
            className="w-14 h-14 object-contain rounded-2xl bg-white/5 p-1 border border-white/10"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/assets/b9beb49f5a7d0c49502c2b2852bb209a.png';
            }}
          />
          <div className="leading-tight">
            <span className="font-display font-bold text-2xl tracking-tight block">
              {t.schoolName}
            </span>
            <span className="text-xs font-extrabold tracking-[2px] text-amber-300 uppercase">
              {t.adminSubtitle}
            </span>
          </div>
        </div>

        {/* Center Content */}
        <div className="max-w-md space-y-4 my-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Xavfsiz boshqaruv tizimi</span>
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-white leading-tight">
            {t.adminTitle}
          </h1>
          <p className="text-slate-300 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            {t.adminDesc}
          </p>
        </div>

        {/* School Motto Quote */}
        <div className="border-t border-slate-700/60 pt-6">
          <p className="text-sm font-medium italic text-[#E6BE5E]">
            "Ilm axloq bilan olinsagina jamiyatga haqiqiy foyda keltiradi."
          </p>
          <span className="text-xs text-slate-400 mt-1 block">
            — {t.schoolName} {t.schoolSubtitle.toLowerCase()}
          </span>
        </div>
      </div>

      {/* Right Login Form Panel */}
      <div className="lg:w-1/2 p-6 sm:p-12 lg:p-16 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6"
        >
          <div>
            <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
              {t.loginTitle}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t.loginSubtitle}
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-300 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                {t.usernameLabel}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setErrorMessage('');
                  }}
                  placeholder={language === 'ru' ? 'Введите логин' : language === 'en' ? 'Enter username' : 'Loginni kiriting'}
                  className="w-full min-h-[48px] pl-10 pr-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-medium focus:ring-2 focus:ring-[#13294B] dark:focus:ring-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                {t.passwordLabel}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessage('');
                  }}
                  placeholder="••••••••"
                  className="w-full min-h-[48px] pl-10 pr-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-medium focus:ring-2 focus:ring-[#13294B] dark:focus:ring-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full min-h-[50px] rounded-xl bg-[#13294B] dark:bg-amber-400 hover:bg-[#0B1A33] dark:hover:bg-amber-300 text-white dark:text-slate-950 font-extrabold text-sm transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{t.enterBtn}</span>
              <ArrowRight className="w-4 h-4 text-amber-300 dark:text-slate-950" />
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
            <button
              type="button"
              onClick={onGoBack}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white underline block mx-auto cursor-pointer"
            >
              {t.backToSite}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
