import { supabase } from './supabase';
import { RecognitionRecord, RecognitionResult } from '../types/recognition';

export interface ClassifyWasteResponse {
  success: boolean;
  record: RecognitionRecord | null;
  classification: RecognitionResult;
}

export const classifyWasteImage = async (
  imageUrl: string,
  trainingConsent: boolean = false
): Promise<ClassifyWasteResponse> => {
  const { data, error } = await supabase.functions.invoke('classify-waste', {
    body: {
      imageUrl,
      trainingConsent,
    },
  });

  if (error) {
    throw new Error(`Waste classification failed: ${error.message}`);
  }

  return data as ClassifyWasteResponse;
};

export const getUserRecognitionHistory = async (): Promise<RecognitionRecord[]> => {
  const { data, error } = await supabase
    .from('recognition_records')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Error fetching history: ${error.message}`);
  }

  return data as RecognitionRecord[];
};

export const getRecognitionRecordById = async (
  id: string
): Promise<RecognitionRecord | null> => {
  const { data, error } = await supabase
    .from('recognition_records')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Error fetching record details: ${error.message}`);
  }

  return data as RecognitionRecord;
};
