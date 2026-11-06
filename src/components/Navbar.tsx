import React, { useState } from 'react';
import { Shield, Sparkles, Menu, X, GraduationCap, Sun, Moon, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Language } from '../i18n/translations';

interface NavbarProps {
  currentScreen: 'home' | 'results' | 'featured' | 'admin';
  onNavigate: (screen: 'home' | 'results' | 'featured' | 'admin') => void;
  onOpenAdmission: () => void;
  featuredCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  onNavigate,
  onOpenAdmission,
  featuredCount
}) => {
  const { language, setLanguage, theme, setTheme, toggleTheme, t } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const languages: { code: Language; label: string }[] = [
    { code: 'uz', label: 'UZ' },
    { code: 'ru', label: 'RU' },
    { code: 'en', label: 'EN' }
  ];

  const handleLogoClick = () => {
    onNavigate('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavClick = (sectionId: string) => {
    if (currentScreen !== 'home') {
      onNavigate('home');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Top Prototype Switcher & Quick Utility Bar - Liquid Tinted Glass */}
      <div className="bg-[#0B1A33]/90 dark:bg-slate-950/90 backdrop-blur-md text-white border-b border-white/10 text-xs relative z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-3 flex-nowrap">
          <div className="flex items-center gap-2 shrink-0">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
            </span>
            <span className="font-bold tracking-wider text-slate-300 uppercase text-[11px] truncate whitespace-nowrap">
              {t.topNotice}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-nowrap">
            {/* Screen switcher */}
            <div className="flex items-center gap-1 bg-white/5 dark:bg-white/5 backdrop-blur-md p-0.5 rounded-full border border-white/10 shadow-inner shrink-0">
              <button
                type="button"
                onClick={() => onNavigate('home')}
                className={`px-3 py-1 rounded-full font-bold text-xs transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  currentScreen === 'home'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {t.protoHome}
              </button>
              <button
                type="button"
                onClick={() => onNavigate('results')}
                className={`px-3 py-1 rounded-full font-bold text-xs transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  currentScreen === 'results'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {t.protoResults}
              </button>
              {currentScreen === 'admin' && (
                <button
                  type="button"
                  onClick={() => onNavigate('admin')}
                  className="px-3 py-1 rounded-full font-bold text-xs bg-amber-400 text-slate-950 shadow-sm flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Users className="w-3.5 h-3.5 shrink-0" />
                  <span className="whitespace-nowrap">{t.protoAdmin}</span>
                </button>
              )}
            </div>

            {/* Language Switcher Buttons */}
            <div className="flex items-center bg-white/5 dark:bg-white/5 backdrop-blur-md p-0.5 rounded-full border border-white/10 text-xs">
              {languages.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLanguage(l.code)}
                  className={`px-2.5 py-0.5 rounded-full font-extrabold uppercase transition-all cursor-pointer ${
                    language === l.code
                      ? 'bg-amber-400 text-slate-950 shadow-2xs'
                      : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {/* Theme Toggle Button Group: Icon only */}
            <div className="flex items-center bg-white/5 dark:bg-white/5 backdrop-blur-md p-0.5 rounded-full border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setTheme('light')}
                title={t.themeLight}
                aria-label={t.themeLight}
                className={`p-1.5 rounded-full transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-amber-400 text-slate-950 shadow-2xs font-extrabold'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                title={t.themeDark}
                aria-label={t.themeDark}
                className={`p-1.5 rounded-full transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-amber-400 text-slate-950 shadow-2xs font-extrabold'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main School Header — Adaptive Liquid Glass (GPU-optimized with fast compositor) */}
      <header className="sticky top-0 z-30 transition-colors duration-200 bg-white/95 dark:bg-[#071326]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-white/10 shadow-xs relative transform-gpu">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4 flex-nowrap">
          {/* Logo & School Name */}
          <button
            type="button"
            onClick={handleLogoClick}
            title="Smart Start"
            className="flex items-center gap-3 sm:gap-3.5 text-left focus:outline-none group cursor-pointer relative shrink-0"
          >
            {/* Liquid glass logo emblem */}
            <div className="relative p-1 rounded-2xl bg-white/90 dark:bg-white/10 backdrop-blur-xs border border-slate-200/90 dark:border-white/20 shadow-xs group-hover:scale-105 group-hover:border-[#CF9E2E] dark:group-hover:border-amber-400/60 transition-transform duration-200 shrink-0">
              <picture>
                <source srcSet="/smart-start-logo.webp" type="image/webp" />
                <img
                  src="/smart-start-logo.png"
                  alt="Smart Start Logo"
                  className="w-10 h-10 sm:w-11 sm:h-11 object-contain rounded-xl drop-shadow-xs shrink-0"
                  decoding="async"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/b9beb49f5a7d0c49502c2b2852bb209a.png';
                  }}
                />
              </picture>
            </div>

            <div className="flex flex-col leading-tight whitespace-nowrap shrink-0">
              <span className="font-display font-black text-lg sm:text-xl text-[#13294B] dark:text-white tracking-tight group-hover:text-[#CF9E2E] dark:group-hover:text-amber-300 transition-colors whitespace-nowrap">
                {t.schoolName}
              </span>
              <span className="text-[9px] sm:text-[10px] font-extrabold tracking-[2px] sm:tracking-[2.5px] text-[#CF9E2E] dark:text-amber-400 uppercase whitespace-nowrap">
                {t.schoolSubtitle}
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links — Flat with Bottom Underline on Hover (No Rounded Pill Background) */}
          <nav className="hidden xl:flex items-center gap-4 2xl:gap-6 text-[13px] 2xl:text-[14px] font-bold shrink-0 flex-nowrap">
            {[
              { id: 'haqida', label: t.navAbout },
              { id: 'natijalar', label: t.navResults },
              { id: 'talim', label: t.navEducation },
              { id: 'hamkorlar', label: t.navPartners },
              { id: 'oqituvchilar', label: t.navTeachers },
              { id: 'qabul', label: t.navAdmission },
              { id: 'yangiliklar', label: t.navNews },
              { id: 'aloqa', label: t.navContact }
            ].map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className="relative py-2 px-1 font-bold text-slate-700 dark:text-slate-200 hover:text-[#13294B] dark:hover:text-amber-300 transition-colors duration-200 cursor-pointer whitespace-nowrap group"
              >
                <span>{link.label}</span>
                {/* Bottom animated underline on hover — no rounded pill background */}
                <span className="absolute bottom-0 left-0 w-0 h-[2.5px] bg-[#CF9E2E] dark:bg-amber-400 rounded-full transition-all duration-300 ease-out group-hover:w-full" />
              </button>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-2 xl:gap-2.5 shrink-0 flex-nowrap">
            {/* Staff / Xodimlar button — Light Frosted Glass Capsule */}
            <button
              type="button"
              onClick={() => onNavigate('admin')}
              className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full bg-slate-100/90 hover:bg-slate-200/90 dark:bg-white/10 dark:hover:bg-white/20 active:scale-95 border border-slate-200/90 dark:border-white/20 text-[#13294B] dark:text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer shadow-xs hover:border-[#CF9E2E]/50 dark:hover:border-amber-400/50 backdrop-blur-md whitespace-nowrap shrink-0"
            >
              <Users className="w-4 h-4 text-[#CF9E2E] dark:text-amber-300 shrink-0" />
              <span className="whitespace-nowrap">{t.navStaff}</span>
            </button>

            {/* Qabulga yozilish — Calm, Elegant Prestigious Button (No Eye-Straining Neon Glare) */}
            <button
              type="button"
              onClick={onOpenAdmission}
              className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#13294B] hover:bg-[#0B1A33] dark:bg-[#CF9E2E] dark:hover:bg-[#B8861B] text-white dark:text-[#0B1A33] font-bold text-xs sm:text-sm transition-all shadow-xs hover:shadow-sm active:scale-95 flex items-center gap-1.5 sm:gap-2 cursor-pointer border border-[#13294B] dark:border-[#CF9E2E] whitespace-nowrap shrink-0 group"
            >
              <GraduationCap className="w-4 h-4 text-[#CF9E2E] dark:text-[#0B1A33] shrink-0 transition-transform group-hover:rotate-6" />
              <span className="whitespace-nowrap">{t.applyBtn}</span>
            </button>
          </div>

          {/* Mobile Menu Button with Glass styling */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-xl text-slate-800 dark:text-white bg-slate-100/80 dark:bg-white/10 border border-slate-200 dark:border-white/20 hover:bg-slate-200/80 dark:hover:bg-white/20 backdrop-blur-md transition-colors cursor-pointer shadow-xs shrink-0"
            aria-label="Menyu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 shrink-0" /> : <Menu className="w-6 h-6 shrink-0" />}
          </button>
        </div>

        {/* Mobile Dropdown — Liquid Glass with Full-Width Rows */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl px-4 sm:px-6 py-4 space-y-3 shadow-2xl transition-all">
            <div className="flex flex-col gap-1">
              {[
                { id: 'haqida', label: t.navAbout },
                { id: 'natijalar', label: t.navResults },
                { id: 'talim', label: t.navEducation },
                { id: 'hamkorlar', label: t.navPartners },
                { id: 'oqituvchilar', label: t.navTeachers },
                { id: 'qabul', label: t.navAdmission },
                { id: 'yangiliklar', label: t.navNews },
                { id: 'aloqa', label: t.navContact }
              ].map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className="w-full text-left font-bold text-sm text-slate-800 dark:text-slate-100 hover:text-[#CF9E2E] dark:hover:text-amber-300 px-4 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap"
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Mobile Lang & Theme Toggles */}
            <div className="flex items-center justify-between py-2 border-t border-slate-200/80 dark:border-white/10 flex-nowrap">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                {t.langSelect}:
              </span>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-full border border-slate-200 dark:border-white/10 shrink-0">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setLanguage(l.code)}
                    className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase transition-all cursor-pointer whitespace-nowrap ${
                      language === l.code
                        ? 'bg-amber-400 text-slate-950 font-extrabold shadow-2xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Theme Toggle (icon only) */}
            <div className="flex items-center justify-between py-2 border-t border-slate-200/80 dark:border-white/10 flex-nowrap">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                {language === 'ru' ? 'Тема оформления:' : language === 'en' ? 'Appearance:' : 'Rejim:'}
              </span>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-full border border-slate-200 dark:border-white/10 shrink-0">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  aria-label={t.themeLight}
                  className={`p-2 rounded-full transition-all cursor-pointer ${
                    theme === 'light'
                      ? 'bg-amber-400 text-slate-950 shadow-2xs font-extrabold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  aria-label={t.themeDark}
                  className={`p-2 rounded-full transition-all cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-amber-400 text-slate-950 shadow-2xs font-extrabold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/80 dark:border-white/10">
              <button
                onClick={() => {
                  onNavigate('admin');
                  setMobileMenuOpen(false);
                }}
                className="py-3 px-2 text-center rounded-full border border-slate-200 dark:border-white/15 bg-slate-100/90 dark:bg-white/10 text-slate-800 dark:text-white font-bold text-xs shadow-xs cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <Users className="w-4 h-4 text-[#CF9E2E] dark:text-amber-300 shrink-0" />
                <span className="whitespace-nowrap">{t.navStaff}</span>
              </button>

              <button
                onClick={() => {
                  onOpenAdmission();
                  setMobileMenuOpen(false);
                }}
                className="py-3 px-2 text-center rounded-full bg-[#13294B] hover:bg-[#0B1A33] dark:bg-[#CF9E2E] dark:hover:bg-[#B8861B] text-white dark:text-[#0B1A33] font-bold text-xs shadow-xs cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5"
              >
                <GraduationCap className="w-4 h-4 text-[#CF9E2E] dark:text-[#0B1A33] shrink-0" />
                <span className="whitespace-nowrap">{t.applyBtn}</span>
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
