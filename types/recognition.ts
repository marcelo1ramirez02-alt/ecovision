export interface RecognitionResult {
  material_code: string;
  material_name: string;
  confidence: number;
  recyclable: boolean;
  eco_points: number;
  disposal_instructions: string;
}

export type RecognitionStatus = 'en_proceso' | 'completado' | 'cancelado';

export interface RecognitionRecord {
  id: string;
  user_id?: string | null;
  image_url: string;
  cloudinary_public_id?: string | null;
  material_code: string;
  material_name: string;
  confidence: number;
  recyclable: boolean;
  eco_points_earned: number;
  disposal_instructions?: string | null;
  raw_gemini_response?: any;
  training_consent: boolean;
  status?: RecognitionStatus;
  collection_point_id?: string | null;
  completed_at?: string | null;
  anonymized_at?: string | null;
  created_at: string;
}

export interface ClassifyWastePayload {
  imageUrl: string;
  trainingConsent?: boolean;
}
