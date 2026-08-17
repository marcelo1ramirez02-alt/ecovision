-- Migration 0008: Add Status & Collection Point Fields to Recognition Records

ALTER TABLE public.recognition_records
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'en_proceso',
  ADD COLUMN IF NOT EXISTS collection_point_id TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ DEFAULT NULL;

-- Policy to allow authenticated users to update their own recognition records (e.g. marking as completed)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'recognition_records' 
      AND policyname = 'Users can update their own recognition records'
  ) THEN
    CREATE POLICY "Users can update their own recognition records"
      ON public.recognition_records FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
