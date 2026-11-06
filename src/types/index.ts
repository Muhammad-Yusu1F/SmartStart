export type CertificateType = 'IELTS' | 'CEFR' | 'SAT' | 'Olimpiada';

export type OlympiadLevel = 'tuman' | 'shahar' | 'viloyat' | 'respublika';

export interface CertificateItem {
  id: number;
  name: string;
  grade: number;
  type: CertificateType;
  score: string;
  subScores?: {
    listening?: string;
    reading?: string;
    writing?: string;
    speaking?: string;
    math?: string;
    ebrw?: string;
  };
  subject?: string;
  level?: OlympiadLevel;
  year: number;
  date?: string;
  consent: boolean;
  featured: boolean;
  fileName?: string;
  imagePath?: string;
  certNumber?: string;
  teacher?: string;
  isNew?: boolean;
}

export type ActiveScreen = 'home' | 'results' | 'featured' | 'admin' | 'admin-form';

export interface FilterState {
  type: 'all' | CertificateType;
  year: 'all' | string;
  grade: 'all' | string;
  search: string;
  sort: 'new' | 'top' | 'name';
}
