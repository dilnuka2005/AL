export interface Paper {
  id: string;
  year: number;
  subject_name: string;
  subject_code: string;
  stream: string;
  paper_link: string;
  marking_scheme_link: string;
  created_at: string;
  type?: string;
}

export interface Notice {
  id: string;
  title: string;
  body: string;
  type: 'normal' | 'important' | 'opportunity';
  created_at: string;
}

export interface ExamDate {
  id: string;
  date: string;
  details: string;
  type: 'Exam' | 'Holiday';
}

export interface AppDownload {
  id: string;
  platform: 'android' | 'pc';
  version: string;
  download_link: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'admin' | 'editor';
  approved: boolean;
  last_login?: string;
  face_descriptors?: number[][];
  email_confirmed_at?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface Subject {
  name: string;
  code: string;
  stream: string;
}

export interface SystemSettings {
    key: string;
    value: any;
}