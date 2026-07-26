-- Migration 0004: Recognition Records Table & Training Consent Fields

CREATE TABLE IF NOT EXISTS public.recognition_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Nullable to allow anonymization
  image_url TEXT NOT NULL,
  cloudinary_public_id TEXT,
  material_code TEXT NOT NULL,
  material_name TEXT NOT NULL,
  confidence DOUBLE PRECISION NOT NULL,
  recyclable BOOLEAN NOT NULL DEFAULT true,
  eco_points_earned INT NOT NULL DEFAULT 0,
  disposal_instructions TEXT,
  raw_gemini_response JSONB,
  training_consent BOOLEAN NOT NULL DEFAULT false,
  anonymized_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.recognition_records ENABLE ROW LEVEL SECURITY;

-- Users can view their own recognition records
CREATE POLICY "Users can view their own recognition records"
  ON public.recognition_records FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Edge functions or system can insert records
CREATE POLICY "Users can insert recognition records"
  ON public.recognition_records FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- User function to anonymize data instead of deletion if training consent given
CREATE OR REPLACE FUNCTION public.anonymize_user_recognition_records(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Anonymize records with training consent
  UPDATE public.recognition_records
  SET 
    user_id = NULL,
    anonymized_at = NOW()
  WHERE user_id = target_user_id AND training_consent = true;

  -- Hard delete records without training consent
  DELETE FROM public.recognition_records
  WHERE user_id = target_user_id AND training_consent = false;
END;
$$;
