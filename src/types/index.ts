export interface Observation {
  observation_id: string;
  species_name: string;
  common_name: string;
  date_observed: string;
  location: string;
  image_url: string;
  notes: string;
  ai_identification?: {
    suggestions: Array<{
      name: string;
      confidence: number;
    }>;
  };
  created_at?: any;
}

export interface Question {
  id: string;
  text: string;
  answer: string;
  timestamp: any;
}

export interface KnowledgeBaseEntry {
  id?: string;
  content: string;
  tags: string[];
}
