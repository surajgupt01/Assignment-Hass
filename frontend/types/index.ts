export interface QuoteCitation {
  quote: string;
  timestamp: string;
  speaker: string;
  market: string;
}

export interface QuestionAnswer {
  question_id: number;
  question: string;
  answer: string;
  citations: QuoteCitation[];
}

export interface ExpertReport {
  expert_id: string;
  expert_name: string;
  role: string;
  market: string;
  answers: QuestionAnswer[];
}

export interface ThemeItem {
  topic: string;
  finding: string;
  type: 'agreement' | 'disagreement';
  citations: QuoteCitation[];
}

export interface CrossExpertSynthesis {
  agreements: ThemeItem[];
  disagreements: ThemeItem[];
}

export interface QAResponse {
  answer: string;
  citations: QuoteCitation[];
}