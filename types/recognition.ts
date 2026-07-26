export interface RecognitionResult {
  material_code: string;
  material_name: string;
  confidence: number;
  recyclable: boolean;
  eco_points: number;
  disposal_instructions: string;
}

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
  anonymized_at?: string | null;
  created_at: string;
}

export interface ClassifyWastePayload {
  imageUrl: string;
  trainingConsent?: boolean;
}
