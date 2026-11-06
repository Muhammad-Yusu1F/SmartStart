import { CertificateItem, CertificateType } from '../types';
import { INITIAL_CERTIFICATES } from '../data/initialData';

export const TYPE_COLORS: Record<CertificateType, {
  primary: string;
  badgeBg: string;
  badgeText: string;
  border: string;
  bgLight: string;
  gradient: string;
}> = {
  IELTS: {
    primary: '#B4232E',
    badgeBg: '#FEE4E2',
    badgeText: '#B4232E',
    border: '#FDA29B',
    bgLight: '#FEF3F2',
    gradient: 'from-rose-500 to-red-700'
  },
  CEFR: {
    primary: '#0F6E63',
    badgeBg: '#E6F4F2',
    badgeText: '#0F6E63',
    border: '#99D5CE',
    bgLight: '#F0F9F8',
    gradient: 'from-teal-600 to-emerald-800'
  },
  SAT: {
    primary: '#1F4FB8',
    badgeBg: '#EFF4FE',
    badgeText: '#1F4FB8',
    border: '#A4BCFD',
    bgLight: '#F5F8FF',
    gradient: 'from-blue-600 to-indigo-900'
  },
  Olimpiada: {
    primary: '#946A10',
    badgeBg: '#FEF6E7',
    badgeText: '#946A10',
    border: '#FEDF89',
    bgLight: '#FFFBF5',
    gradient: 'from-amber-500 to-yellow-700'
  }
};

export const DOC_TITLES: Record<CertificateType, string> = {
  IELTS: 'IELTS · OFFICIAL TEST REPORT FORM',
  CEFR: 'CEFR · MILLIY SERTIFIKAT TIZIMI',
  SAT: 'COLLEGE BOARD · OFFICIAL SAT REPORT',
  Olimpiada: 'RESPUBLIKA FAN OLIMPIADASI · DIPLOMI'
};

export function getDocTitle(type: CertificateType, _language?: string): string {
  return DOC_TITLES[type] || 'SERTIFIKAT';
}

const CEFR_RANKS: Record<string, number> = {
  A1: 1,
  A2: 2,
  B1: 3,
  B2: 4,
  C1: 5,
  C2: 6
};

export function getRankValue(item: CertificateItem): number {
  if (item.type === 'IELTS') return parseFloat(item.score) || 0;
  if (item.type === 'SAT') return parseInt(item.score, 10) || 0;
  if (item.type === 'CEFR') return CEFR_RANKS[item.score.toUpperCase()] || 0;
  // For olympiad: 1-o'rin is higher rank than 3-o'rin
  const place = parseInt(item.score, 10) || 4;
  return 10 - place;
}

export function formatScore(item: Pick<CertificateItem, 'type' | 'score'>, _language?: string): string {
  if (!item.score) return '—';
  if (item.type === 'Olimpiada') {
    return `${item.score}-o'rin`;
  }
  return item.score;
}

export function formatDisplayName(item: Pick<CertificateItem, 'name' | 'consent'>, _language?: string): string {
  const parts = (item.name || '').trim().split(/\s+/);
  if (!parts[0]) return "O'quvchi";
  if (item.consent || parts.length < 2) {
    return parts.join(' ');
  }
  // Privacy masked
  return `${parts[0]} ${parts[1].charAt(0)}.`;
}

export function formatDetail(item: CertificateItem, _language?: string): string {
  if (item.type === 'IELTS') {
    if (item.subScores?.listening) {
      return `L: ${item.subScores.listening} | R: ${item.subScores.reading} | W: ${item.subScores.writing} | S: ${item.subScores.speaking}`;
    }
    return `Overall ${item.score} ball`;
  }
  if (item.type === 'CEFR') {
    return `${item.score} darajali milliy til sertifikati`;
  }
  if (item.type === 'SAT') {
    if (item.subScores?.math && item.subScores?.ebrw) {
      return `Math: ${item.subScores.math} | Reading & Writing: ${item.subScores.ebrw}`;
    }
    return `Umumiy ball: ${item.score} / 1600`;
  }
  return `${item.subject || 'Fan'} — ${(item.level || 'viloyat').toUpperCase()} bosqichi`;
}

const STORAGE_KEY = 'smart_start_certificates_v1';

export function loadStoredCertificates(): CertificateItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_CERTIFICATES;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (e) {
    console.error('Failed to load certificates from localStorage:', e);
  }
  return INITIAL_CERTIFICATES;
}

export function saveStoredCertificates(items: CertificateItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save certificates to localStorage:', e);
  }
}

export function resetStoredCertificates(): CertificateItem[] {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error(e);
  }
  return INITIAL_CERTIFICATES;
}
