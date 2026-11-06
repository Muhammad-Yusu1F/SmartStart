import React from 'react';
import { Phone, Mail, MapPin, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface FooterProps {
  onOpenAdmin?: () => void;
  onGoResults: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onGoResults }) => {
  const { t } = useApp();

  const handleFooterLogoClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="aloqa" className="bg-[#0B1A33] dark:bg-slate-950 text-slate-300 border-t border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand */}
          <div className="space-y-4 md:col-span-1">
            <button
              type="button"
              onClick={handleFooterLogoClick}
              className="flex items-center gap-3 text-left focus:outline-none cursor-pointer group"
            >
              <picture>
                <source srcSet="/smart-start-logo.webp" type="image/webp" />
                <img
                  src="/smart-start-logo.png"
                  alt="Smart Start"
                  className="w-12 h-12 object-contain group-hover:scale-105 transition-transform"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/b9beb49f5a7d0c49502c2b2852bb209a.png';
                  }}
                />
              </picture>
              <div className="flex flex-col leading-tight">
                <span className="font-display font-bold text-lg text-white group-hover:text-amber-400 transition-colors">
                  {t.schoolName}
                </span>
                <span className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase">
                  {t.schoolSubtitle}
                </span>
              </div>
            </button>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t.footerDesc}
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-amber-300">
              {t.footerSections}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  type="button"
                  onClick={onGoResults}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t.navResults}
                </button>
              </li>
              <li>
                <a href="#statistika" className="hover:text-white transition-colors cursor-pointer">
                  {t.navStats}
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-amber-300">
              {t.footerContact}
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>+998 (71) 205-00-55</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>info@smartstart.uz</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Toshkent sh., Yakkasaroy t., Bobur ko'chasi 45-uy</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Social */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-amber-300">
              {t.footerSocial}
            </h4>
            <div className="flex flex-col space-y-2 text-xs">
              <a
                href="https://t.me"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800"
              >
                <span>Telegram</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800"
              >
                <span>Instagram</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800"
              >
                <span>YouTube</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} {t.schoolName} {t.schoolSubtitle.toLowerCase()}. {t.footerRights}</p>
          <div className="flex items-center gap-4 text-slate-500 text-xs">
            <span>{t.footerCity}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
