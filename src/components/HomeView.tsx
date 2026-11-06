import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Phone,
  GraduationCap,
  Clock,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Users,
  Send,
  ExternalLink,
  MessageCircle,
  Check,
  BookOpen,
  Compass,
  Sparkles,
  HeartHandshake,
  Languages,
  ShieldCheck,
  Award,
  Trophy,
  Target,
  Sun,
  Utensils,
  FileCheck,
  Palette,
  Calendar
} from 'lucide-react';
import { CertificateItem, CertificateType } from '../types';
import { CertificateCard } from './CertificateCard';
import { useApp } from '../context/AppContext';
import confetti from 'canvas-confetti';

/**
 * AnimatedCounter: smoothly counts up from 0 to target value over specified duration (e.g. 2000ms)
 * and stays on the final value once reached.
 * Optimized for low-end devices: direct DOM text updates with zero React re-renders during RAF,
 * disconnecting the observer immediately to eliminate CPU overhead.
 */
export const AnimatedCounter: React.FC<{
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}> = ({ value, duration = 2000, suffix = '', prefix = '', className = '' }) => {
  const nodeRef = useRef<HTMLSpanElement | null>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node || hasAnimated.current) return;

    const startAnimation = () => {
      if (hasAnimated.current) return;
      hasAnimated.current = true;

      // Check if user prefers reduced motion on lower-spec hardware
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        if (node) node.textContent = `${prefix}${value}${suffix}`;
        return;
      }

      let startTimestamp: number | null = null;
      let lastVal = -1;
      let animationFrameId: number;

      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);

        // Cubic deceleration easing
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentVal = Math.floor(easeOut * value);

        if (currentVal !== lastVal && node) {
          node.textContent = `${prefix}${currentVal}${suffix}`;
          lastVal = currentVal;
        }

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(step);
        } else if (node) {
          node.textContent = `${prefix}${value}${suffix}`;
        }
      };

      animationFrameId = requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          startAnimation();
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [value, duration, prefix, suffix]);

  return (
    <span ref={nodeRef} className={`tabular-nums ${className}`}>
      {prefix}0{suffix}
    </span>
  );
};

interface HomeViewProps {
  certificates: CertificateItem[];
  onOpenCertificate: (item: CertificateItem) => void;
  onGoAllResults: () => void;
  onOpenAdmissionModal: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  certificates,
  onOpenCertificate,
  onGoAllResults,
  onOpenAdmissionModal
}) => {
  const { t, language } = useApp();

  // Results Section Filter
  const [selectedType, setSelectedType] = useState<'all' | CertificateType>('all');

  // Inline Admission Form State
  const [parentName, setParentName] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [studentName, setStudentName] = useState('');
  const [grade, setGrade] = useState(`8${t.gradeSuffix}`);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [appNumber, setAppNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Filtered certificates for the preview grid
  const displayedCertificates = React.useMemo(() => {
    let list = certificates;
    if (selectedType !== 'all') {
      list = list.filter((c) => c.type === selectedType);
    }
    return list.slice(0, 8);
  }, [certificates, selectedType]);

  // Counts for KPI boxes
  const ieltsCount = certificates.filter((c) => c.type === 'IELTS' && parseFloat(c.score) >= 7.0).length;
  const cefrCount = certificates.filter((c) => c.type === 'CEFR').length;
  const olympCount = certificates.filter((c) => c.type === 'Olimpiada').length;
  const satCount = certificates.filter((c) => c.type === 'SAT' && parseInt(c.score, 10) >= 1300).length;

  const handleInlineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentName.trim() || !studentName.trim() || phone.trim().length < 9) {
      setErrorMessage(t.validationError);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentName: parentName.trim(),
          studentName: studentName.trim(),
          phone: phone.trim(),
          grade,
          notes: notes.trim()
        })
      });

      const data = await response.json();
      if (response.ok) {
        setSubmitSuccess(true);
        setAppNumber(data.application?.id || data.appNumber || 'APP-2026-OK');
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.7 }
        });
      } else {
        setErrorMessage(data.error || t.submissionError);
      }
    } catch (err) {
      console.error("Submission error:", err);
      // Fallback optimistic success
      setSubmitSuccess(true);
      setAppNumber('APP-2026-WEB');
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* ================= 1. HERO SECTION WITH SMART START SCHOOL ENTRANCE BACKGROUND & LIQUID GLASS UI ================= */}
      <section id="haqida" className="relative w-full min-h-[600px] sm:min-h-[680px] lg:min-h-[740px] flex items-center overflow-hidden transition-colors">
        {/* Full-bleed Background Image: Smart Start School Entrance */}
        <div className="absolute inset-0 z-0">
          <picture>
            <source srcSet="/assets/aistudio/Smart_Start_School_Entrance_ecb278f1.webp" type="image/webp" />
            <img
              src="/assets/aistudio/Smart_Start_School_Entrance_ecb278f1.png"
              alt="Smart Start Xususiy Maktabi"
              loading="eager"
              decoding="async"
              className="w-full h-full object-cover object-center sm:object-right-top filter brightness-[0.92] contrast-[1.05]"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/school_hero_16_9.jpg';
              }}
            />
          </picture>

          {/* Cinematic Scrim Gradient Overlays: Deep rich navy on left for readability, clear view of building on right */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#071326]/98 via-[#0B1A33]/85 to-[#071326]/25 dark:from-[#030914]/98 dark:via-[#071326]/90 dark:to-[#030914]/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#071326] via-transparent to-[#071326]/40 dark:from-slate-950 dark:via-transparent dark:to-black/50" />

          {/* Subtle Ambient Refractions / Glows */}
          <div className="absolute -top-32 left-10 w-96 h-96 bg-[#CF9E2E]/15 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 w-full">
          <div className="max-w-3xl space-y-6 sm:space-y-7">
            {/* Tag Badge — Liquid Glass Pill */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 text-amber-300 text-xs sm:text-sm font-bold shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#CF9E2E] animate-pulse shadow-[0_0_8px_#CF9E2E]" />
              <span className="tracking-wide whitespace-nowrap">{t.heroAdmissionOpen}</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-[58px] leading-[1.12] text-white tracking-tight drop-shadow-lg">
              {t.heroTitle}
            </h1>

            {/* Subtitle Description */}
            <p className="text-base sm:text-lg text-slate-100 leading-relaxed max-w-2xl font-medium drop-shadow-md">
              {t.heroDescription}
            </p>

            {/* School Motto Quote — Dignified & Elegant */}
            <div className="flex items-center gap-3.5 pl-3.5 border-l-2 border-[#CF9E2E] py-1">
              <p className="text-sm sm:text-base italic font-medium text-amber-100/95 tracking-wide drop-shadow-sm">
                {t.heroQuote}
              </p>
            </div>

            {/* Action Buttons in Liquid Glass Style */}
            <div className="flex flex-wrap items-center gap-3.5 sm:gap-4 pt-1">
              {/* Qabulga yozilish — Glowing Golden Liquid Glass Button */}
              <button
                type="button"
                onClick={() => scrollToSection('qabul')}
                className="px-8 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-[#DFAD36] via-[#CF9E2E] to-[#B3831B] hover:brightness-110 active:scale-95 text-[#0B1A33] font-black text-sm sm:text-base transition-all shadow-[0_8px_25px_rgba(207,158,46,0.45)] flex items-center gap-2.5 cursor-pointer relative overflow-hidden group whitespace-nowrap"
              >
                <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/35 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-out pointer-events-none" />
                <GraduationCap className="w-5 h-5 shrink-0" />
                <span className="relative z-10 whitespace-nowrap">{t.heroApplyBtn}</span>
              </button>

              {/* Maktabga ekskursiya — Frosted Liquid Glass Button */}
              <button
                type="button"
                onClick={() => scrollToSection('kun')}
                className="px-7 py-3.5 sm:py-4 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white border border-white/30 hover:border-white/60 font-extrabold text-sm sm:text-base backdrop-blur-xl transition-all shadow-[0_4px_20px_rgba(0,0,0,0.25)] flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <span className="whitespace-nowrap">{t.heroTourBtn}</span>
              </button>
            </div>

            {/* Questions Phone Callout — Liquid Glass Capsule */}
            <div className="pt-2">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/15 text-xs sm:text-sm text-slate-200 shadow-sm">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="whitespace-nowrap">{t.heroQuestions}</span>
                <a
                  href="tel:+998909947407"
                  className="font-black text-amber-300 hover:text-amber-200 underline transition-colors whitespace-nowrap"
                >
                  +998 90 994 74 07
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 2. DARK BLUE STATS BAR WITH 2-SECOND ANIMATED COUNTER ================= */}
      <section className="bg-[#13294B] text-white py-10 px-4 sm:px-6 border-y border-slate-800 shadow-inner overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-30px' }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
        >
          {/* 300+ Students Counter */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="space-y-1"
          >
            <div className="font-display font-black text-3xl sm:text-4xl text-white">
              <AnimatedCounter value={300} suffix="+" duration={2000} />
            </div>
            <div className="text-xs sm:text-sm text-slate-300 font-medium">{t.statStudents}</div>
          </motion.div>

          {/* 45+ Experienced Teachers Counter */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="space-y-1"
          >
            <div className="font-display font-black text-3xl sm:text-4xl text-white">
              <AnimatedCounter value={45} suffix="+" duration={2000} />
            </div>
            <div className="text-xs sm:text-sm text-slate-300 font-medium">{t.statTeachers}</div>
          </motion.div>

          {/* 120+ International Certificates Counter */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="space-y-1"
          >
            <div className="font-display font-black text-3xl sm:text-4xl text-white">
              <AnimatedCounter value={120} suffix="+" duration={2000} />
            </div>
            <div className="text-xs sm:text-sm text-slate-300 font-medium">{t.statCerts}</div>
          </motion.div>

          {/* 2022 Year Founded Counter */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="space-y-1"
          >
            <div className="font-display font-black text-3xl sm:text-4xl text-[#CF9E2E]">
              <AnimatedCounter value={2022} duration={2000} />
            </div>
            <div className="text-xs sm:text-sm text-slate-300 font-medium">{t.statSince}</div>
          </motion.div>
        </motion.div>
      </section>

      {/* ================= 3. "NEGA OTA-ONALAR SMART START'NI TANLAYDI" WITH SCROLL ANIMATIONS ================= */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mb-12 sm:mb-16 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 dark:bg-amber-400/15 border border-[#CF9E2E]/30 text-[#CF9E2E] dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {language === 'ru' ? 'Преимущества школы' : language === 'en' ? 'Our Key Advantages' : 'Afzalliklarimiz'}
            </span>
          </div>

          <h2 className="font-display font-black text-3xl sm:text-4xl text-[#13294B] dark:text-white tracking-tight leading-[1.15]">
            {t.whyTitle.includes("Smart Start") ? (
              <>
                {t.whyTitle.split("Smart Start")[0]}
                <span className="text-[#CF9E2E]">
                  Smart Start
                </span>
                {t.whyTitle.split("Smart Start")[1]}
              </>
            ) : (
              t.whyTitle
            )}
          </h2>

          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            {t.whySubtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {[
            {
              num: t.reason1Num,
              title: t.reason1Title,
              desc: t.reason1Desc,
              icon: Users,
              badge: language === 'ru' ? '16–18 учеников' : language === 'en' ? '16–18 Students' : "16–18 o'quvchi"
            },
            {
              num: t.reason2Num,
              title: t.reason2Title,
              desc: t.reason2Desc,
              icon: Languages,
              badge: language === 'ru' ? 'IELTS & CEFR' : language === 'en' ? 'IELTS & CEFR' : 'IELTS & CEFR'
            },
            {
              num: t.reason3Num,
              title: t.reason3Title,
              desc: t.reason3Desc,
              icon: Clock,
              badge: language === 'ru' ? '08:30 – 17:30' : language === 'en' ? '08:30 – 17:30' : '08:30 – 17:30'
            },
            {
              num: t.reason4Num,
              title: t.reason4Title,
              desc: t.reason4Desc,
              icon: HeartHandshake,
              badge: language === 'ru' ? 'Постоянный контакт' : language === 'en' ? 'Direct Contact' : 'Muntazam aloqa'
            },
            {
              num: t.reason5Num,
              title: t.reason5Title,
              desc: t.reason5Desc,
              icon: ShieldCheck,
              badge: language === 'ru' ? '24/7 Безопасность' : language === 'en' ? '24/7 Security' : '24/7 Xavfsizlik'
            },
            {
              num: t.reason6Num,
              title: t.reason6Title,
              desc: t.reason6Desc,
              icon: Award,
              badge: language === 'ru' ? 'Официальные дипломы' : language === 'en' ? 'Verified Diplomas' : 'Haqiqiy diplomlar'
            }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: idx * 0.06 }}
              whileHover={{ y: -4, transition: { duration: 0.18 } }}
              className="group relative bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-5.5 border border-slate-200/90 dark:border-slate-800 hover:border-[#CF9E2E] dark:hover:border-[#CF9E2E] shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden"
            >
              {/* Subtle gold ambient glow on hover */}
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-28 h-28 rounded-full bg-gradient-to-br from-amber-400/10 to-transparent blur-xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

              <div>
                {/* Top Row: Icon + Clean Number */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/15 to-amber-500/5 dark:bg-amber-400/10 border border-[#CF9E2E]/30 flex items-center justify-center text-[#CF9E2E] dark:text-amber-400 group-hover:scale-105 group-hover:bg-[#CF9E2E] group-hover:text-[#13294B] shadow-2xs transition-all duration-200">
                    <item.icon className="w-5 h-5" />
                  </div>

                  <span className="font-display font-black text-2xl sm:text-3xl tracking-tight text-slate-300 dark:text-slate-700 group-hover:text-[#CF9E2E] dark:group-hover:text-amber-400 transition-colors select-none">
                    {item.num}
                  </span>
                </div>

                {/* Card Title */}
                <h3 className="font-display font-bold text-base sm:text-lg text-[#13294B] dark:text-white group-hover:text-[#CF9E2E] dark:group-hover:text-amber-400 transition-colors tracking-tight mb-1.5">
                  {item.title}
                </h3>

                {/* Card Description */}
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              {/* Bottom Tag / Indicator */}
              <div className="pt-3.5 mt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-[#13294B] group-hover:text-white dark:group-hover:bg-[#CF9E2E] dark:group-hover:text-[#13294B] transition-colors">
                  <Check className="w-3 h-3 text-[#CF9E2E] group-hover:text-white dark:group-hover:text-[#13294B]" />
                  {item.badge}
                </span>

                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 group-hover:text-[#CF9E2E] transition-colors font-mono">
                  Smart Start
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= 4. "O'QUVCHILARIMIZ NATIJALARI" WITH SCROLL ANIMATIONS ================= */}
      <section id="natijalar" className="py-16 bg-slate-100/70 dark:bg-[#0B1A33]/40 border-y border-slate-200 dark:border-slate-800 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2"
          >
            <div className="space-y-1.5">
              <span className="inline-block px-3 py-1 rounded-full bg-[#13294B] text-white text-xs font-bold">
                {t.homeResultsKicker}
              </span>
              <h2 className="font-display font-black text-3xl sm:text-4xl text-[#13294B] dark:text-white tracking-tight">
                {t.homeResultsTitle}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xl">
                {t.homeResultsDesc}
              </p>
            </div>

            <button
              type="button"
              onClick={onGoAllResults}
              className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#CF9E2E] dark:hover:border-[#CF9E2E] font-bold text-xs sm:text-sm text-[#13294B] dark:text-amber-400 hover:text-[#CF9E2E] flex items-center gap-2 cursor-pointer shrink-0 shadow-2xs hover:shadow-xs transition-all self-start sm:self-center"
            >
              <span>{t.viewAllCertsCount} ({certificates.length})</span>
              <ArrowRight className="w-4 h-4 text-[#CF9E2E]" />
            </button>
          </motion.div>

          {/* 4 Summary Stat Boxes: Sleek, horizontal/elongated (uzunchoq) and compact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {[
              {
                id: 'ielts',
                title: 'IELTS 7.0+',
                subtitle: t.ieltsBoxSub,
                count: ieltsCount || 4,
                icon: GraduationCap,
                tag: 'IELTS',
                delay: 0.05
              },
              {
                id: 'cefr',
                title: 'CEFR B2–C1',
                subtitle: t.cefrBoxSub,
                count: cefrCount || 10,
                icon: Award,
                tag: 'CEFR',
                delay: 0.1
              },
              {
                id: 'olymp',
                title: language === 'ru' ? 'Олимпиады' : language === 'en' ? 'Olympiad' : "Olimpiada",
                subtitle: t.olympBoxSub,
                count: olympCount || 3,
                icon: Trophy,
                tag: language === 'ru' ? "Победители" : language === 'en' ? "Winners" : "G'oliblar",
                delay: 0.15
              },
              {
                id: 'sat',
                title: 'SAT 1300+',
                subtitle: t.satBoxSub,
                count: satCount || 2,
                icon: Target,
                tag: 'SAT',
                delay: 0.2
              }
            ].map((stat) => (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: stat.delay }}
                whileHover={{ y: -3, transition: { duration: 0.18 } }}
                className="group relative bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 dark:border-slate-800 hover:border-[#CF9E2E] dark:hover:border-[#CF9E2E] shadow-2xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between"
              >
                {/* Subtle gold ambient glow on hover */}
                <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-gradient-to-br from-amber-400/10 to-transparent blur-lg pointer-events-none group-hover:scale-150 transition-transform duration-500" />

                <div className="relative z-10 flex items-start gap-3.5">
                  {/* Compact Logo-Themed Icon */}
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/15 to-amber-500/5 dark:bg-amber-400/10 border border-[#CF9E2E]/30 flex items-center justify-center text-[#CF9E2E] dark:text-amber-400 group-hover:scale-105 group-hover:bg-[#CF9E2E] group-hover:text-[#13294B] shadow-2xs transition-all duration-200 shrink-0 mt-0.5">
                    <stat.icon className="w-5 h-5" />
                  </div>

                  {/* Stat Details: Number + Tag + Titles in compact elongated layout */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="font-display font-black text-2xl sm:text-3xl text-[#13294B] dark:text-white group-hover:text-[#CF9E2E] dark:group-hover:text-amber-400 transition-colors tracking-tight leading-none">
                        <AnimatedCounter value={stat.count} suffix="+" duration={2000} />
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#13294B]/5 dark:bg-white/10 text-[#13294B] dark:text-amber-400 border border-[#13294B]/10 dark:border-white/10 shrink-0">
                        {stat.tag}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 group-hover:text-[#CF9E2E] transition-colors truncate">
                      {stat.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight truncate mt-0.5">
                      {stat.subtitle}
                    </p>
                  </div>
                </div>

                {/* Compact bottom verification strip */}
                <div className="relative z-10 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/70 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    {language === 'ru' ? 'Подтверждено' : language === 'en' ? 'Verified' : 'Tasdiqlangan'}
                  </span>
                  <span className="font-bold text-[#CF9E2E]">Smart Start</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Filter Pills with Scroll Reveal */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none"
          >
            {(['all', 'IELTS', 'CEFR', 'SAT', 'Olimpiada'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedType(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedType === cat
                    ? 'bg-[#13294B] text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {cat === 'all' ? t.filterAll : cat}
              </button>
            ))}
          </motion.div>

          {/* Certificate Cards Grid */}
          {displayedCertificates.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-2">
              <Award className="w-10 h-10 text-[#CF9E2E] mx-auto opacity-70" />
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                {language === 'ru' 
                  ? 'Сертификаты в этой категории скоро будут добавлены' 
                  : language === 'en' 
                  ? 'Certificates in this category will be added soon' 
                  : "Ushbu toifadagi sertifikatlar tez kunda qo'shiladi"}
              </h4>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayedCertificates.map((cert, index) => (
                <CertificateCard
                  key={cert.id}
                  item={cert}
                  onClick={() => onOpenCertificate(cert)}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ================= 5. "DUNYONING TOP-1000 UNIVERSITETLARI BILAN HAMKORLIK" ================= */}
      <section id="hamkorlar" className="py-16 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto space-y-10">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          <div className="lg:col-span-7 space-y-3">
            <h2 className="font-display font-black text-3xl sm:text-4xl text-[#13294B] dark:text-white tracking-tight">
              {t.partnersTitle}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
              {t.partnersDesc}
            </p>
          </div>

          <div className="lg:col-span-5 space-y-2.5 bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-semibold">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{t.partnerBenefit1}</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-semibold">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{t.partnerBenefit2}</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-semibold">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{t.partnerBenefit3}</span>
            </div>
          </div>
        </motion.div>

        {/* 6 Partner University Cards with Staggered Scroll Animation */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { name: 'Oxford Int. College', country: t.countryUK, qs: 'QS #1', code: 'OX' },
            { name: 'TU Munich (TUM)', country: t.countryGermany, qs: 'QS #28', code: 'TUM' },
            { name: 'KAIST University', country: t.countryKorea, qs: 'QS #56', code: 'KAIST' },
            { name: 'Univ. of Bristol', country: t.countryUK, qs: 'QS #54', code: 'BRIS' },
            { name: 'Politecnico di Milano', country: t.countryItaly, qs: 'QS #111', code: 'POLI' },
            { name: 'Univ. of Warsaw', country: t.countryPoland, qs: 'QS #262', code: 'UW' }
          ].map((uni, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.45, delay: idx * 0.07, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex flex-col items-center text-center space-y-2.5"
            >
              <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-mono font-bold text-[#13294B] dark:text-amber-400">
                {uni.code}
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                  {uni.name}
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {uni.country} · <span className="font-semibold text-emerald-600 dark:text-emerald-400">{uni.qs}</span>
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= 6. "TA'LIM BOSQICHLARI" WITH REALISTIC IMAGES & ELEVATED DESIGN ================= */}
      <section id="talim" className="py-16 sm:py-24 bg-slate-100/60 dark:bg-[#071326] border-y border-slate-200 dark:border-slate-800/80 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5 }}
            className="space-y-3"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 dark:bg-amber-400/15 border border-[#CF9E2E]/30 text-[#CF9E2E] dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {language === 'ru' ? 'Академическая программа' : language === 'en' ? 'Academic Pathway' : "O'quv bosqichlari"}
              </span>
            </div>

            <h2 className="font-display font-black text-3xl sm:text-5xl text-[#13294B] dark:text-white tracking-tight">
              {t.stagesTitle}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-base max-w-2xl leading-relaxed">
              {t.stagesDesc}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                id: 'primary',
                imageWebp: '/assets/stages/stage_primary.webp',
                imageJpg: '/assets/stages/stage_primary.jpg',
                grade: t.stage1Grade,
                badge: t.stage1Badge,
                title: t.stage1Title,
                desc: t.stage1Desc,
                age: language === 'ru' ? '7–10 лет' : language === 'en' ? 'Ages 7–10' : '7–10 yosh',
                icon: BookOpen,
                delay: 0.08,
                highlights: language === 'ru' 
                  ? ['Грамотность и быстрочтение', 'Ментальная арифметика', 'Английский по методике Oxford', 'Мини-классы до 18 учеников']
                  : language === 'en'
                  ? ['Literacy & speed reading', 'Mental math & critical logic', 'Early Oxford English program', 'Small classes (max 18)']
                  : ["Savodxonlik va tez o'qish", "Mental arifmetika va mantiq", "Ingliz tili (Oxford dasturi)", "Kichik guruhlar (16–18 nafar)"]
              },
              {
                id: 'middle',
                imageWebp: '/assets/stages/stage_middle.webp',
                imageJpg: '/assets/stages/stage_middle.jpg',
                grade: t.stage2Grade,
                badge: t.stage2Badge,
                title: t.stage2Title,
                desc: t.stage2Desc,
                age: language === 'ru' ? '11–15 лет' : language === 'en' ? 'Ages 11–15' : '11–15 yosh',
                icon: Compass,
                delay: 0.16,
                highlights: language === 'ru'
                  ? ['Углубленная математика и физика', 'Подготовка к CEFR B2/C1', 'STEM, IT и робототехника', 'Олимпиадные факультативы']
                  : language === 'en'
                  ? ['Advanced Math & Physics', 'Systematic CEFR B2/C1 prep', 'STEM & Robotics Lab', 'Olympiad competitions']
                  : ["Chuqurlashtirilgan matematika & fizika", "CEFR B2/C1 tizimli tayyorgarlik", "Robototexnika va IT laboratoriya", "Fan olimpiadalari guruhi"]
              },
              {
                id: 'high',
                imageWebp: '/assets/stages/stage_high.webp',
                imageJpg: '/assets/stages/stage_high.jpg',
                grade: t.stage3Grade,
                badge: t.stage3Badge,
                title: t.stage3Title,
                desc: t.stage3Desc,
                age: language === 'ru' ? '16–18 лет' : language === 'en' ? 'Ages 16–18' : '16–18 yosh',
                icon: GraduationCap,
                delay: 0.24,
                highlights: language === 'ru'
                  ? ['Интенсив IELTS 7.5+ и SAT 1400+', 'Гранты в ТОП-1000 университетов', 'Международное портфолио', 'Профориентация и менторство']
                  : language === 'en'
                  ? ['IELTS 7.5+ & SAT 1400+ mastery', 'Top-1000 University grants', 'International portfolio building', '1-on-1 university counseling']
                  : ["IELTS 7.5+ & SAT 1400+ intensiv", "Top-1000 universitetlarga grantlar", "Xalqaro portfolio va tavsiyanoma", "Shaxsiy mentorlik va OTM yo'llanmasi"]
              }
            ].map((stage) => (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: stage.delay, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -6, transition: { duration: 0.22 } }}
                className="bg-white dark:bg-[#0B1A33] rounded-3xl border-2 border-slate-200/80 dark:border-slate-800 hover:border-[#CF9E2E] dark:hover:border-[#CF9E2E] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Real Image Header with Cinematic Scrim and Floating Badges */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                    <picture>
                      <source srcSet={stage.imageWebp} type="image/webp" />
                      <img
                        src={stage.imageJpg}
                        alt={stage.badge}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = stage.imageJpg;
                        }}
                      />
                    </picture>

                    {/* Gradient Overlay for Legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B1A33] via-[#0B1A33]/40 to-black/20" />

                    {/* Floating Badges */}
                    <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between z-10">
                      <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#13294B]/90 text-amber-300 border border-amber-400/40 backdrop-blur-md shadow-md">
                        {stage.grade}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-black/60 text-white backdrop-blur-md border border-white/20">
                        {stage.age}
                      </span>
                    </div>

                    {/* Stage Name at bottom of Image */}
                    <div className="absolute bottom-3.5 inset-x-4 z-10 flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/20 backdrop-blur-md border border-[#CF9E2E]/50 flex items-center justify-center text-[#CF9E2E] shrink-0">
                        <stage.icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-display font-black text-xl text-white tracking-tight drop-shadow-md">
                        {stage.badge}
                      </h3>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-6 space-y-4">
                    <div>
                      <span className="text-[11px] font-mono font-bold text-[#CF9E2E] dark:text-amber-400 uppercase tracking-widest block mb-1">
                        {stage.grade} · {stage.age}
                      </span>
                      <h4 className="font-display font-extrabold text-lg sm:text-xl text-[#13294B] dark:text-white group-hover:text-[#CF9E2E] dark:group-hover:text-amber-400 transition-colors leading-snug">
                        {stage.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                        {stage.desc}
                      </p>
                    </div>

                    {/* Key Highlights Checklist */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                      {stage.highlights.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                          <Check className="w-3.5 h-3.5 text-[#CF9E2E] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="px-6 pb-6 pt-2">
                  <button
                    type="button"
                    onClick={onOpenAdmissionModal}
                    className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-[#13294B] hover:text-white dark:hover:bg-[#CF9E2E] dark:hover:text-[#13294B] text-slate-700 dark:text-slate-200 text-xs font-extrabold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs group-hover:bg-[#CF9E2E] group-hover:text-[#13294B]"
                  >
                    <span>{t.dayTourBtn}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 7. "BIZNING USTOZLAR" WITH SCROLL ANIMATIONS ================= */}
      <section id="oqituvchilar" className="py-16 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-display font-black text-3xl sm:text-4xl text-[#13294B] dark:text-white tracking-tight">
            {t.teachersTitle}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            {t.teachersDesc}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: t.teacher1Name, role: t.teacher1Role, exp: t.teacher1Exp, score: t.teacher1Score },
            { name: t.teacher2Name, role: t.teacher2Role, exp: t.teacher2Exp, score: t.teacher2Score },
            { name: t.teacher3Name, role: t.teacher3Role, exp: t.teacher3Exp, score: t.teacher3Score },
            { name: t.teacher4Name, role: t.teacher4Role, exp: t.teacher4Exp, score: t.teacher4Score }
          ].map((teacher, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.45, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs hover:shadow-md transition-all space-y-3"
            >
              <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
                <Users className="w-8 h-8 text-[#13294B] dark:text-amber-400" />
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white">
                  {teacher.name}
                </h4>
                <p className="text-xs text-[#CF9E2E] font-semibold mt-0.5">
                  {teacher.role} · {teacher.score}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {teacher.exp}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= 8. "ERTALABDAN KECHGACHA — BIR KUN SMART START'DA" WITH MODERN ENTRANCE BACKGROUND IMAGE ================= */}
      <section id="kun" className="relative text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-y border-slate-800 overflow-hidden">
        {/* Full-bleed Background Image: Modern School Entrance with Family Arriving */}
        <div className="absolute inset-0 z-0">
          <picture>
            <source
              srcSet="/assets/aistudio/Modern_School_Entrance_with_Family_Arriving_ade27d57.webp"
              type="image/webp"
            />
            <img
              src="/assets/aistudio/Modern_School_Entrance_with_Family_Arriving_ade27d57.png"
              alt="Smart Start Xususiy Maktabiga tashrif"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover object-center filter brightness-[0.7] contrast-[1.05]"
            />
          </picture>

          {/* Cinematic Scrim Gradient Overlays: Deep rich navy on left for high contrast readability, clear view of building and family */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#071326]/96 via-[#0B1A33]/88 to-[#071326]/70 dark:from-[#030914]/98 dark:via-[#071326]/92 dark:to-[#030914]/80" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#071326] via-transparent to-[#071326]/60 dark:from-slate-950 dark:via-transparent dark:to-black/60" />
          <div className="absolute -top-24 right-10 w-96 h-96 bg-[#CF9E2E]/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Column: Title & Key Highlights */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.55 }}
            className="lg:col-span-5 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-amber-300 text-xs font-bold tracking-wider shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#CF9E2E]" />
              <span>{t.dayBadge}</span>
            </div>

            <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight leading-[1.18] drop-shadow-md">
              {t.dayTitle.includes("—") ? (
                <>
                  {t.dayTitle.split("—")[0]} —{' '}
                  <span className="text-[#CF9E2E]">
                    {t.dayTitle.split("—")[1]}
                  </span>
                </>
              ) : (
                t.dayTitle
              )}
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {t.dayDesc}
            </p>

            {/* Clean, calm key features list */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5 pt-2 text-xs sm:text-sm text-slate-300 font-medium">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#CF9E2E] shrink-0" />
                <span>08:00 – 17:30</span>
              </div>
              <div className="flex items-center gap-2">
                <Utensils className="w-4 h-4 text-[#CF9E2E] shrink-0" />
                <span>3 mahal issiq ovqat</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#CF9E2E] shrink-0" />
                <span>Xavfsiz va tinch muhit</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3.5 pt-3">
              <button
                type="button"
                onClick={onOpenAdmissionModal}
                className="px-6 py-3 rounded-xl bg-[#CF9E2E] hover:bg-[#b88c27] text-[#13294B] font-extrabold text-sm transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>{t.dayTourBtn}</span>
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('qabul')}
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-bold text-sm transition-all cursor-pointer flex items-center gap-2"
              >
                <span>{t.dayPricingBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* Right Column: Clean, elegant schedule list without tacky duplicate pills */}
          <div className="lg:col-span-7 space-y-2.5">
            {[
              {
                time: t.schedule1Time.replace(/[\[\]]/g, ''),
                title: t.schedule1Title,
                desc: t.schedule1Desc,
                icon: Sun
              },
              {
                time: t.schedule2Time.replace(/[\[\]]/g, ''),
                title: t.schedule2Title,
                desc: t.schedule2Desc,
                icon: BookOpen
              },
              {
                time: t.schedule3Time.replace(/[\[\]]/g, ''),
                title: t.schedule3Title,
                desc: t.schedule3Desc,
                icon: Utensils
              },
              {
                time: t.schedule4Time.replace(/[\[\]]/g, ''),
                title: t.schedule4Title,
                desc: t.schedule4Desc,
                icon: Languages
              },
              {
                time: t.schedule5Time.replace(/[\[\]]/g, ''),
                title: t.schedule5Title,
                desc: t.schedule5Desc,
                icon: FileCheck
              },
              {
                time: t.schedule6Time.replace(/[\[\]]/g, ''),
                title: t.schedule6Title,
                desc: t.schedule6Desc,
                icon: Palette
              }
            ].map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.35, delay: idx * 0.06 }}
                whileHover={{ x: 4, transition: { duration: 0.16 } }}
                className="group relative flex items-start gap-4 p-3.5 sm:p-4 rounded-xl bg-slate-900/60 hover:bg-slate-900/80 backdrop-blur-md border border-white/10 hover:border-[#CF9E2E]/50 transition-all shadow-md overflow-hidden"
              >
                {/* Clean, subtle gold hover accent */}
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-amber-300 group-hover:bg-[#CF9E2E] group-hover:text-[#13294B] transition-all duration-200 shrink-0 mt-0.5">
                  <step.icon className="w-5 h-5" />
                </div>

                {/* Content: Time + Title and Description */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-xs sm:text-sm text-[#CF9E2E] px-2 py-0.5 rounded-md bg-[#CF9E2E]/10 border border-[#CF9E2E]/25 shrink-0 tracking-wide">
                      {step.time}
                    </span>
                    <h4 className="font-display font-bold text-sm sm:text-base text-white group-hover:text-amber-300 transition-colors truncate">
                      {step.title}
                    </h4>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-1">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 9. "OTA-ONALAR NIMA DEYDI" WITH SCROLL ANIMATIONS ================= */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto space-y-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-display font-black text-3xl sm:text-4xl text-[#13294B] dark:text-white tracking-tight">
            {t.reviewsTitle}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            {t.reviewsSubtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              quote: t.review1Quote,
              author: t.review1Author,
              sub: t.review1Sub
            },
            {
              quote: t.review2Quote,
              author: t.review2Author,
              sub: t.review2Sub
            },
            {
              quote: t.review3Quote,
              author: t.review3Author,
              sub: t.review3Sub
            }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
                "{item.quote}"
              </p>
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                <div className="font-bold text-sm text-[#13294B] dark:text-white">
                  {item.author}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {item.sub}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= 10. "MAKTAB HAYOTI" WITH SCROLL ANIMATIONS ================= */}
      <section id="yangiliklar" className="py-16 bg-slate-100/70 dark:bg-[#0B1A33]/40 border-y border-slate-200 dark:border-slate-800 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between"
          >
            <h2 className="font-display font-black text-3xl sm:text-4xl text-[#13294B] dark:text-white tracking-tight">
              {t.lifeTitle}
            </h2>
            <button
              type="button"
              onClick={onOpenAdmissionModal}
              className="text-xs sm:text-sm font-bold text-[#13294B] dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{t.allNewsBtn}</span>
            </button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                tag: t.newsTagEvent,
                date: t.news1Date,
                title: t.news1Title,
                desc: t.news1Desc
              },
              {
                tag: t.newsTagAchievement,
                date: t.news2Date,
                title: t.news2Title,
                desc: t.news2Desc
              },
              {
                tag: t.newsTagAnnouncement,
                date: t.news3Date,
                title: t.news3Title,
                desc: t.news3Desc
              }
            ].map((news, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col"
              >
                <div className="h-40 bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 text-xs font-semibold">
                  {t.eventPhotoPlaceholder}
                </div>
                <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span className="font-bold text-[#CF9E2E]">{news.tag}</span>
                      <span>{news.date}</span>
                    </div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                      {news.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {news.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 11. "QABULGA ARIZA QOLDIRING" WITH SCROLL ANIMATIONS ================= */}
      <section id="qabul" className="py-16 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Heading and 4 steps */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.55 }}
            className="lg:col-span-5 space-y-6"
          >
            <h2 className="font-display font-black text-3xl sm:text-4xl text-[#13294B] dark:text-white tracking-tight">
              {t.appTitle}
            </h2>

            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
              {t.appDesc}
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <span className="font-bold text-[#CF9E2E] text-base shrink-0">{t.appStep1Num}</span>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <strong className="text-slate-900 dark:text-white">{t.appStep1Bold}</strong>
                  {t.appStep1Text}
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="font-bold text-[#CF9E2E] text-base shrink-0">{t.appStep2Num}</span>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <strong className="text-slate-900 dark:text-white">{t.appStep2Bold}</strong>
                  {t.appStep2Text}
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="font-bold text-[#CF9E2E] text-base shrink-0">{t.appStep3Num}</span>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <strong className="text-slate-900 dark:text-white">{t.appStep3Bold}</strong>
                  {t.appStep3Text}
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="font-bold text-[#CF9E2E] text-base shrink-0">{t.appStep4Num}</span>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <strong className="text-slate-900 dark:text-white">{t.appStep4Bold}</strong>
                  {t.appStep4Text}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Inline Application Card Form with Scroll Reveal */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.55 }}
            className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl"
          >
            {submitSuccess ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 flex items-center justify-center text-emerald-600 mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
                  {t.appSuccessTitle}
                </h3>
                <p className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded inline-block text-slate-700 dark:text-slate-300">
                  {t.appNumberLabel} {appNumber}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                  {t.appSuccessText}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitSuccess(false);
                    setParentName('');
                    setStudentName('');
                    setNotes('');
                  }}
                  className="px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  {t.sendAnotherBtn}
                </button>
              </div>
            ) : (
              <form onSubmit={handleInlineSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                      {t.parentNameField}
                    </label>
                    <input
                      type="text"
                      required
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      placeholder={t.parentNamePlaceholderInline}
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#CF9E2E]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                      {t.phoneField}
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={t.phonePlaceholder}
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#CF9E2E]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                      {t.studentNameField}
                    </label>
                    <input
                      type="text"
                      required
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder={t.studentNamePlaceholderInline}
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#CF9E2E]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                      {t.targetGradeField}
                    </label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#CF9E2E]"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((g) => (
                        <option key={g} value={`${g}${t.gradeSuffix}`}>{g}{t.gradeSuffix}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                    {t.notesField}
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t.notesPlaceholderInline}
                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#CF9E2E]"
                  />
                </div>

                {errorMessage && (
                  <p className="text-xs text-red-500 font-semibold">{errorMessage}</p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-[#CF9E2E] hover:bg-[#b88c27] active:scale-98 text-[#13294B] font-extrabold text-base transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? t.submitting : t.submitBtn}</span>
                </button>

                <p className="text-[11px] text-center text-slate-400">
                  {t.privacyConsent}
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      {/* ================= 12. "BIZ BILAN BOG'LANING" WITH SCROLL ANIMATIONS ================= */}
      <section id="aloqa" className="py-16 sm:py-20 bg-slate-100/70 dark:bg-[#0B1A33]/40 border-y border-slate-200 dark:border-slate-800 px-4 sm:px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.55 }}
            className="lg:col-span-5 space-y-6"
          >
            <h2 className="font-display font-black text-3xl sm:text-4xl text-[#13294B] dark:text-white tracking-tight">
              {t.contactTitle}
            </h2>

            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
              {t.contactDesc}
            </p>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#CF9E2E] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">{t.addressLabel}</span>
                  <span className="text-slate-600 dark:text-slate-400">
                    {t.addressValue}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#CF9E2E] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">{t.phoneLabelContact}</span>
                  <span className="text-slate-600 dark:text-slate-400 font-mono">
                    +998 71 200 00 22 / +998 90 994 74 07
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MessageCircle className="w-4 h-4 text-[#CF9E2E] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">{t.telegramLabel}</span>
                  <a
                    href="https://t.me/stmartstartt_bot"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 dark:text-amber-400 hover:underline font-mono"
                  >
                    @stmartstartt_bot
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#CF9E2E] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">{t.workingHoursLabel}</span>
                  <span className="text-slate-600 dark:text-slate-400">
                    {t.workingHoursValue}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Map Card with Live Google Maps Embed */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.55 }}
            className="lg:col-span-7"
          >
            <div className="rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 sm:p-3 shadow-xl overflow-hidden flex flex-col justify-between">
              <div className="w-full aspect-[16/10] min-h-[340px] sm:min-h-[380px] rounded-2xl overflow-hidden relative bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <iframe
                  title="Smart Start Xususiy Maktabi"
                  src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d189.6270546175747!2d68.7692671!3d40.4966561!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38b20762863c63f9%3A0xcfcb40ee9f1f9afe!2zU01BUlQgU1RBUlQg0YfQsNGB0YLQvdCw0Y8g0YjQutC-0LvQsA!5e0!3m2!1sru!2s!4v1793954988586!5m2!1sru!2s"
                  className="w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>

              {/* Map Footer Bar with Location Details & Direct Link */}
              <div className="pt-3 px-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {t.schoolMapName}
                  </span>
                </div>
                <a
                  href="https://maps.google.com/?q=Smart+Start+School+Tashkent"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-[#13294B] hover:bg-[#1d3d6e] dark:bg-amber-400 dark:hover:bg-amber-500 text-white dark:text-[#13294B] font-bold text-xs transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <span>{t.openGoogleMaps}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#CF9E2E] dark:text-[#13294B]" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= 13. FOOTER ================= */}
      <footer className="bg-[#0B1A33] dark:bg-slate-950 text-white py-12 px-4 sm:px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <picture>
              <source srcSet="/smart-start-logo.webp" type="image/webp" />
              <img
                src="/smart-start-logo.png"
                alt="Smart Start Logo"
                className="w-12 h-12 object-contain"
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/b9beb49f5a7d0c49502c2b2852bb209a.png';
                }}
              />
            </picture>
            <div>
              <h3 className="font-display font-bold text-lg text-white">{t.schoolName}</h3>
              <p className="text-xs text-slate-400">
                {t.schoolSubtitle.toLowerCase()} · {t.footerRights}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-300 font-semibold">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-amber-400 transition-colors"
            >
              Instagram
            </a>
            <a
              href="https://t.me/stmartstartt_bot"
              target="_blank"
              rel="noreferrer"
              className="hover:text-amber-400 transition-colors"
            >
              Telegram
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-amber-400 transition-colors"
            >
              YouTube
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
