export interface MatchingResult {
  score: number;
  reasons: string[];
  compatibility: {
    researchArea: number;
    skills: number;
    availability: number;
    preferences: number;
  };
}

export interface AIAnalysis {
  summary: string;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
}
