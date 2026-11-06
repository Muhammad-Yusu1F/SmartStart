import React, { useEffect, useState } from 'react';
import { motion, useInView } from 'motion/react';
import { Award, BookOpen, GraduationCap, Trophy } from 'lucide-react';
import { CertificateItem } from '../types';
import { getRankValue } from '../utils/certificateUtils';
import { useApp } from '../context/AppContext';

interface StatsCounterProps {
  certificates: CertificateItem[];
}

const AnimatedNumber: React.FC<{ value: number }> = ({ value }) => {
  const [count, setCount] = useState(0);
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const duration = 1200;
    const stepTime = 25;
    const steps = duration / stepTime;
    const increment = value / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isInView, value]);

  return <span ref={ref}>{count}</span>;
};

export const StatsCounter: React.FC<StatsCounterProps> = ({ certificates }) => {
  const { t } = useApp();

  const ieltsCount = certificates.filter(
    (c) => c.type === 'IELTS' && getRankValue(c) >= 7.0
  ).length;

  const cefrCount = certificates.filter(
    (c) => c.type === 'CEFR' && getRankValue(c) >= 4 // B2 or C1
  ).length;

  const satCount = certificates.filter(
    (c) => c.type === 'SAT' && getRankValue(c) >= 1300
  ).length;

  const olympCount = certificates.filter((c) => c.type === 'Olimpiada').length;

  const stats = [
    {
      number: ieltsCount,
      label: 'IELTS 7.0+',
      sublabel: t.statIeltsSub,
      icon: <Award className="w-5 h-5 text-[#E6BE5E]" />,
      delay: 0.1
    },
    {
      number: cefrCount,
      label: t.statCefrTitle,
      sublabel: t.statCefrSub,
      icon: <BookOpen className="w-5 h-5 text-[#E6BE5E]" />,
      delay: 0.2
    },
    {
      number: satCount,
      label: t.statSatTitle,
      sublabel: t.statSatSub,
      icon: <GraduationCap className="w-5 h-5 text-[#E6BE5E]" />,
      delay: 0.3
    },
    {
      number: olympCount,
      label: t.statOlympTitle,
      sublabel: t.statOlympSub,
      icon: <Trophy className="w-5 h-5 text-[#E6BE5E]" />,
      delay: 0.4
    }
  ];

  return (
    <div id="statistika" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s, idx) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: s.delay, ease: [0.16, 1, 0.3, 1] }}
          className="p-5 sm:p-6 rounded-2xl bg-[#1C3762] dark:bg-slate-900 border border-[#2A4A7A] dark:border-slate-800 hover:border-[#CF9E2E]/40 transition-colors shadow-lg relative overflow-hidden group"
        >
          {/* Subtle light glow on hover */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#CF9E2E]/10 rounded-full blur-2xl group-hover:scale-150 transition-transform pointer-events-none" />

          <div className="flex items-center justify-between mb-3">
            <span className="p-2.5 rounded-xl bg-slate-900/40 border border-white/10">
              {s.icon}
            </span>
            <span className="text-xs font-mono font-bold text-slate-400">
              0{idx + 1}
            </span>
          </div>

          <div className="font-display text-4xl sm:text-5xl font-extrabold text-[#E6BE5E] tracking-tight mb-1">
            <AnimatedNumber value={s.number} />
            <span className="text-2xl text-amber-300 font-normal ml-0.5">+</span>
          </div>

          <div className="font-bold text-base text-white mb-0.5">
            {s.label}
          </div>

          <div className="text-xs text-slate-300 dark:text-slate-400 font-medium">
            {s.sublabel}
          </div>
        </motion.div>
      ))}
    </div>
  );
};
