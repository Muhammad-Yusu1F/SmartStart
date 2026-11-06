import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Upload,
  CheckCircle2,
  AlertCircle,
  Eye,
  FileCheck,
  Award,
  Sparkles
} from 'lucide-react';
import { CertificateItem, CertificateType, OlympiadLevel } from '../../types';
import { TYPE_COLORS, getDocTitle, formatScore, formatDisplayName, formatDetail } from '../../utils/certificateUtils';
import { useApp } from '../../context/AppContext';

interface CertificateFormModalProps {
  initialItem?: CertificateItem | null;
  onSave: (item: Omit<CertificateItem, 'id'> & { id?: number }) => void;
  onCancel: () => void;
}

export const CertificateFormModal: React.FC<CertificateFormModalProps> = ({
  initialItem,
  onSave,
  onCancel
}) => {
  const { t, language } = useApp();
  const isEditing = !!initialItem;

  const [name, setName] = useState(initialItem?.name || '');
  const [grade, setGrade] = useState<string>(initialItem ? String(initialItem.grade) : '10');
  const [type, setType] = useState<CertificateType>(initialItem?.type || 'IELTS');
  const [score, setScore] = useState<string>(initialItem?.score || '7.5');
  const [subject, setSubject] = useState<string>(initialItem?.subject || 'Matematika');
  const [level, setLevel] = useState<OlympiadLevel>(initialItem?.level || 'viloyat');
  const [year, setYear] = useState<string>(initialItem ? String(initialItem.year) : '2026');
  const [date, setDate] = useState<string>(initialItem?.date || 'Mart, 2026');
  const [fileName, setFileName] = useState<string>(initialItem?.fileName || '');
  const [imagePath, setImagePath] = useState<string>(initialItem?.imagePath || '');
  const [consent, setConsent] = useState<boolean>(initialItem ? initialItem.consent : true);
  const [featured, setFeatured] = useState<boolean>(initialItem ? initialItem.featured : false);
  const [teacher, setTeacher] = useState<string>(initialItem?.teacher || '');

  // Subscores
  const [listening, setListening] = useState<string>(initialItem?.subScores?.listening || '7.5');
  const [reading, setReading] = useState<string>(initialItem?.subScores?.reading || '7.5');
  const [writing, setWriting] = useState<string>(initialItem?.subScores?.writing || '7.0');
  const [speaking, setSpeaking] = useState<string>(initialItem?.subScores?.speaking || '7.5');
  const [math, setMath] = useState<string>(initialItem?.subScores?.math || '740');
  const [ebrw, setEbrw] = useState<string>(initialItem?.subScores?.ebrw || '640');

  const [tried, setTried] = useState(false);

  // Validation
  const isNameInvalid = name.trim().length < 3;
  const isScoreInvalid = !score.trim();
  const isSubjectInvalid = type === 'Olimpiada' && !subject.trim();

  const handleTypeSelect = (newType: CertificateType) => {
    setType(newType);
    if (newType === 'IELTS') setScore('7.5');
    else if (newType === 'CEFR') setScore('C1');
    else if (newType === 'SAT') setScore('1400');
    else if (newType === 'Olimpiada') setScore('1');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === 'string') {
          setImagePath(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePath('');
    setFileName('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);

    if (isNameInvalid || isScoreInvalid || isSubjectInvalid) {
      return;
    }

    let subScores: CertificateItem['subScores'] = undefined;
    if (type === 'IELTS') {
      subScores = { listening, reading, writing, speaking };
    } else if (type === 'SAT') {
      subScores = { math, ebrw };
    }

    const certData = {
      ...(initialItem?.id ? { id: initialItem.id } : {}),
      name: name.trim(),
      grade: parseInt(grade, 10),
      type,
      score: type === 'IELTS' ? parseFloat(score).toFixed(1) : score,
      subject: type === 'Olimpiada' ? subject.trim() : undefined,
      level: type === 'Olimpiada' ? level : undefined,
      year: parseInt(year, 10),
      date: date.trim() || `${year}-yil`,
      consent,
      featured,
      fileName: fileName || `${name.toLowerCase().replace(/\s+/g, '_')}_${type.toLowerCase()}.jpg`,
      imagePath: imagePath || undefined,
      teacher: teacher.trim() || undefined,
      isNew: true,
      subScores
    };

    onSave(certData);
  };

  // Live preview item
  const previewItem: CertificateItem = {
    id: initialItem?.id || 999,
    name: name || "O'quvchi Ismi",
    grade: parseInt(grade, 10) || 10,
    type,
    score: score || '7.5',
    subject,
    level,
    year: parseInt(year, 10) || 2026,
    date,
    consent,
    featured,
    fileName,
    imagePath,
    teacher,
    subScores: type === 'IELTS' ? { listening, reading, writing, speaking } : type === 'SAT' ? { math, ebrw } : undefined
  };

  const previewColors = TYPE_COLORS[type];
  const previewDocTitle = getDocTitle(type, language);
  const previewScoreText = formatScore(previewItem, language);
  const previewDisplayName = formatDisplayName(previewItem, language);
  const previewDetail = formatDetail(previewItem, language);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white underline mb-1 block cursor-pointer"
          >
            {t.backToSite}
          </button>
          <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
            {isEditing ? t.tableColActions + ' / ' + t.addCertBtn : t.addCertBtn}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.adminDesc}
          </p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Inputs (7 Cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          {/* Section 1: Student Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2">
              1. {t.tableColStudent}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  {t.studentNameLabel}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masalan, Aziza Karimova"
                  className={`w-full min-h-[46px] px-3.5 rounded-xl border text-sm font-medium focus:ring-2 focus:ring-[#13294B] dark:focus:ring-amber-400 focus:outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 ${
                    tried && isNameInvalid ? 'border-red-500 bg-red-50 dark:bg-red-950/30' : 'border-slate-300 dark:border-slate-700'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  {t.tableColGrade} *
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full min-h-[46px] px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-medium focus:ring-2 focus:ring-[#13294B] dark:focus:ring-amber-400 focus:outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  <option value="5">5{t.gradeSuffix}</option>
                  <option value="6">6{t.gradeSuffix}</option>
                  <option value="7">7{t.gradeSuffix}</option>
                  <option value="8">8{t.gradeSuffix}</option>
                  <option value="9">9{t.gradeSuffix}</option>
                  <option value="10">10{t.gradeSuffix}</option>
                  <option value="11">11{t.gradeSuffix}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                {t.mentor} (ixtiyoriy)
              </label>
              <input
                type="text"
                value={teacher}
                onChange={(e) => setTeacher(e.target.value)}
                placeholder="Masalan, Mr. John Miller"
                className="w-full min-h-[46px] px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-medium focus:ring-2 focus:ring-[#13294B] dark:focus:ring-amber-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Section 2: Certificate Type & Scores */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2">
              2. {t.tableColScore}
            </h3>

            {/* Type selector buttons */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 block">
                {t.filterTypeLabel} *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['IELTS', 'CEFR', 'SAT', 'Olimpiada'] as CertificateType[]).map((tCode) => {
                  const isCurrent = type === tCode;
                  const cColor = TYPE_COLORS[tCode];
                  return (
                    <button
                      key={tCode}
                      type="button"
                      onClick={() => handleTypeSelect(tCode)}
                      className={`min-h-[48px] rounded-xl font-extrabold text-sm border-2 transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-white dark:bg-slate-800 shadow-md'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      style={{
                        borderColor: isCurrent ? cColor.primary : undefined,
                        color: isCurrent ? cColor.primary : undefined
                      }}
                    >
                      {tCode}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic fields based on type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              {type === 'IELTS' && (
                <>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                      Overall (0.0 — 9.0) *
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="1.0"
                      max="9.0"
                      value={score}
                      onChange={(e) => setScore(e.target.value)}
                      placeholder="7.5"
                      className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                      Listening
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="1.0"
                      max="9.0"
                      value={listening}
                      onChange={(e) => setListening(e.target.value)}
                      placeholder="8.0"
                      className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                      Reading
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="1.0"
                      max="9.0"
                      value={reading}
                      onChange={(e) => setReading(e.target.value)}
                      placeholder="7.5"
                      className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                      Writing & Speaking
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        step="0.5"
                        min="1.0"
                        max="9.0"
                        value={writing}
                        onChange={(e) => setWriting(e.target.value)}
                        placeholder="W: 7.0"
                        className="w-full min-h-[44px] px-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-center"
                      />
                      <input
                        type="number"
                        step="0.5"
                        min="1.0"
                        max="9.0"
                        value={speaking}
                        onChange={(e) => setSpeaking(e.target.value)}
                        placeholder="S: 7.5"
                        className="w-full min-h-[44px] px-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-center"
                      />
                    </div>
                  </div>
                </>
              )}

              {type === 'CEFR' && (
                <>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                      CEFR *
                    </label>
                    <select
                      value={score}
                      onChange={(e) => setScore(e.target.value)}
                      className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    >
                      <option value="C2">C2 (Mastery)</option>
                      <option value="C1">C1 (Proficiency)</option>
                      <option value="B2">B2 (Vantage)</option>
                      <option value="B1">B1 (Threshold)</option>
                      <option value="A2">A2 (Waystage)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                      Til
                    </label>
                    <input
                      type="text"
                      disabled
                      value="Ingliz tili (Milliy sertifikat)"
                      className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-slate-100 dark:bg-slate-800/80 text-slate-500 font-medium"
                    />
                  </div>
                </>
              )}

              {type === 'SAT' && (
                <>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                      Total (400 — 1600) *
                    </label>
                    <input
                      type="number"
                      step="10"
                      min="400"
                      max="1600"
                      value={score}
                      onChange={(e) => setScore(e.target.value)}
                      placeholder="1450"
                      className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">Math</label>
                      <input
                        type="number"
                        step="10"
                        min="200"
                        max="800"
                        value={math}
                        onChange={(e) => setMath(e.target.value)}
                        placeholder="780"
                        className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">EBRW</label>
                      <input
                        type="number"
                        step="10"
                        min="200"
                        max="800"
                        value={ebrw}
                        onChange={(e) => setEbrw(e.target.value)}
                        placeholder="670"
                        className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>
                </>
              )}

              {type === 'Olimpiada' && (
                <>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                      O'rin *
                    </label>
                    <select
                      value={score}
                      onChange={(e) => setScore(e.target.value)}
                      className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    >
                      <option value="1">1-o'rin</option>
                      <option value="2">2-o'rin</option>
                      <option value="3">3-o'rin</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                      Fan *
                    </label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Masalan, Matematika"
                      className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                      Bosqich *
                    </label>
                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value as OlympiadLevel)}
                      className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    >
                      <option value="tuman">Tuman (Shahar)</option>
                      <option value="shahar">Toshkent shahar</option>
                      <option value="viloyat">Viloyat</option>
                      <option value="respublika">Respublika</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            {/* Year & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  {t.tableColYear} *
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full min-h-[46px] px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-medium bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  <option value="2026">2026{t.yearSuffix}</option>
                  <option value="2025">2025{t.yearSuffix}</option>
                  <option value="2024">2024{t.yearSuffix}</option>
                  <option value="2023">2023{t.yearSuffix}</option>
                  <option value="2022">2022{t.yearSuffix}</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  {t.examDate}
                </label>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="Fevral, 2026"
                  className="w-full min-h-[46px] px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-medium"
                />
              </div>
            </div>

            {/* File Upload Box */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                Sertifikat rasmi / fayli *
              </label>
              {imagePath ? (
                <div className="rounded-2xl border-2 border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/20 p-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-16 h-16 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 overflow-hidden shrink-0 flex items-center justify-center p-1 shadow-xs">
                      <img src={imagePath} alt="Yuklangan sertifikat" className="w-full h-full object-contain rounded" />
                    </div>
                    <div className="text-xs overflow-hidden">
                      <p className="font-extrabold text-slate-900 dark:text-white truncate">
                        {fileName || "Sertifikat rasmi"}
                      </p>
                      <p className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Rasm muvaffaqiyatli yuklandi
                      </p>
                      <label className="text-blue-600 dark:text-amber-400 hover:underline font-bold text-[11px] cursor-pointer mt-1 inline-block">
                        Boshqa rasm yuklash
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer shrink-0"
                    title="Rasmni o'chirish"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#13294B] dark:hover:border-amber-400 rounded-2xl p-4.5 flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100/80 cursor-pointer transition-colors group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0 group-hover:scale-105 transition-transform">
                    <Upload className="w-6 h-6 text-[#13294B] dark:text-amber-400" />
                  </div>
                  <div className="text-xs space-y-0.5">
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      Haqiqiy sertifikat rasmini (JPG / PNG / WebP) tanlang
                    </p>
                    <p className="text-slate-500 dark:text-slate-400">
                      Faylni kompyuterdan tanlang — Saytda asl nusxasi ko'rinadi
                    </p>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Section 3: Publishing Toggles */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2">
              3. {t.tableColFeatured} / {t.parentConsent}
            </h3>

            <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded border-slate-300 text-[#13294B] focus:ring-[#13294B] accent-[#13294B]"
              />
              <div className="text-xs space-y-0.5">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  {t.parentConsent}
                </span>
                <span className="text-slate-500 dark:text-slate-400 block">
                  {t.privacyProtected}
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded border-slate-300 text-[#13294B] focus:ring-[#13294B] accent-[#13294B]"
              />
              <div className="text-xs space-y-0.5">
                <span className="font-bold text-slate-800 dark:text-slate-200 block flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  {t.tableColFeatured}
                </span>
                <span className="text-slate-500 dark:text-slate-400 block">
                  {t.kpiFeaturedSub}
                </span>
              </div>
            </label>
          </div>

          {/* Form Submit & Cancel */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-bold text-sm transition-colors cursor-pointer"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-8 py-3 rounded-xl bg-[#13294B] dark:bg-amber-400 hover:bg-[#0B1A33] dark:hover:bg-amber-300 text-white dark:text-slate-950 font-extrabold text-sm transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <FileCheck className="w-4 h-4 text-amber-300 dark:text-slate-950" />
              <span>Saqlash</span>
            </button>
          </div>
        </form>

        {/* Live Preview Card (5 Cols) */}
        <div className="lg:col-span-5 space-y-3 sticky top-24">
          <div className="flex items-center gap-1.5 text-xs font-extrabold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
            <Eye className="w-4 h-4 text-[#CF9E2E]" />
            <span>Natijalar sahifasida shunday ko'rinadi:</span>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg flex flex-col pointer-events-none">
            <div className="relative aspect-[4/3] bg-slate-100 dark:bg-[#0B1A33] p-2.5 sm:p-3 flex items-center justify-center overflow-hidden">
              {imagePath ? (
                /* Real Uploaded Certificate Image Preview */
                <div className="w-full h-full bg-white rounded-lg border border-slate-200 dark:border-slate-700 p-1 flex items-center justify-center shadow-md relative overflow-hidden">
                  <img
                    src={imagePath}
                    alt={previewDisplayName}
                    className="w-full h-full object-contain"
                  />
                  {/* Overlay badge with score and student name on bottom */}
                  <div className="absolute bottom-1.5 inset-x-1.5 px-2 py-1 bg-black/80 backdrop-blur-xs rounded flex items-center justify-between text-white text-[10px] font-mono shadow-xs">
                    <span className="font-bold truncate max-w-[130px]">{previewDisplayName}</span>
                    <span className="font-extrabold text-amber-400 bg-black/50 px-1.5 py-0.5 rounded">{previewScoreText}</span>
                  </div>
                  <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Sertifikat yuklandi
                  </div>
                </div>
              ) : (
                /* Stylized Sheet Fallback when no image uploaded */
                <div className="w-full h-full bg-[#FFFDF7] dark:bg-[#151D2A] rounded-lg border border-[#E8DFC8] dark:border-slate-700 p-3.5 flex flex-col justify-between shadow-md">
                  <div className="flex items-center justify-between border-b border-[#ECE6D6] dark:border-slate-700/60 pb-1.5">
                    <span
                      className="text-[9px] font-extrabold tracking-wider truncate"
                      style={{ color: previewColors.primary }}
                    >
                      {previewDocTitle}
                    </span>
                    <span className="text-[8px] font-mono text-slate-400">
                      {previewItem.year}
                    </span>
                  </div>

                  <div className="my-auto py-1 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">
                        {t.resultLabel}
                      </span>
                      <div
                        className="font-display text-2xl font-extrabold"
                        style={{ color: previewColors.primary }}
                      >
                        {previewScoreText}
                      </div>
                    </div>

                    <div
                      className="w-10 h-10 rounded-full border-2 border-dashed flex flex-col items-center justify-center p-1 text-center"
                      style={{ borderColor: previewColors.primary, color: previewColors.primary }}
                    >
                      <Award className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[8px] text-slate-400 border-t border-[#ECE6D6] dark:border-slate-700/60 pt-1 font-mono">
                    <span>Smart Start</span>
                    <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5" /> {t.official}
                    </span>
                  </div>
                </div>
              )}

              {featured && (
                <span className="absolute top-3 right-3 bg-[#13294B] text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm">
                  {t.featuredBadge}
                </span>
              )}
            </div>

            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span
                  className="text-xs font-bold px-2.5 py-0.5 rounded-full uppercase"
                  style={{
                    backgroundColor: previewColors.badgeBg,
                    color: previewColors.badgeText
                  }}
                >
                  {previewItem.type}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {previewItem.year}{t.yearSuffix}
                </span>
              </div>

              <h4 className="font-bold text-base text-slate-900 dark:text-white">
                {previewDisplayName}
              </h4>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                {previewItem.grade}{t.gradeSuffix} · {previewDetail}
              </p>

              {!consent && (
                <span className="inline-block text-[10px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/60">
                  {t.privacyProtected}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
