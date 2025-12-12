export interface Source {
  title: string;
  uri: string;
}

export interface ReportSection {
  id: string;
  title: string;
  icon: string;
  content: string;
  color: string;
}

export interface ResearchResult {
  markdown: string;
  sections: ReportSection[];
  sources: Source[];
  timestamp: number;
}

export enum AppState {
  INPUT = 'INPUT',
  LOADING = 'LOADING',
  RESULT = 'RESULT',
  ERROR = 'ERROR',
}

export interface FormData {
  country: string;
  industry: string[]; // Changed to array for multi-select
  query: string;
}

export interface HistoryItem {
  id: string;
  formData: FormData;
  result: ResearchResult;
}
