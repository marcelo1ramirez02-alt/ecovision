import { supabase } from './supabase';
import { RecognitionRecord, RecognitionResult } from '../types/recognition';

export interface ClassifyWasteResponse {
  success: boolean;
  record: RecognitionRecord | null;
  classification: RecognitionResult;
}

export const convertUriToBase64 = async (uri: string): Promise<string> => {
  if (uri.startsWith('data:')) {
    return uri;
  }
  const response = await fetch(uri);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(blob);
  });
};

export const classifyWasteImage = async (
  imageUri: string,
  trainingConsent: boolean = false
): Promise<ClassifyWasteResponse> => {
  const base64DataUrl = await convertUriToBase64(imageUri);

  const { data, error } = await supabase.functions.invoke('classify-waste', {
    body: {
      imageUrl: base64DataUrl,
      trainingConsent,
    },
  });

  if (error) {
    throw new Error(`Waste classification failed: ${error.message}`);
  }

  return data as ClassifyWasteResponse;
};

import { getCachedImage } from '../utils/imageCache';

export const getUserRecognitionHistory = async (): Promise<RecognitionRecord[]> => {
  const { data, error } = await supabase
    .from('recognition_records')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Error fetching history: ${error.message}`);
  }

  const records = data as RecognitionRecord[];
  
  // Enrich records with locally cached images if image_url is empty
  const enrichedRecords = await Promise.all(
    records.map(async (rec) => {
      if (!rec.image_url) {
        const cachedUri = await getCachedImage(rec.id);
        if (cachedUri) {
          return { ...rec, image_url: cachedUri };
        }
      }
      return rec;
    })
  );

  return enrichedRecords;
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

  const record = data as RecognitionRecord;
  if (record && !record.image_url) {
    const cachedUri = await getCachedImage(record.id);
    if (cachedUri) {
      record.image_url = cachedUri;
    }
  }

  return record;
};

export const updateRecognitionRecordStatus = async (
  id: string,
  status: 'en_proceso' | 'completado' | 'cancelado',
  collectionPointId?: string | null
): Promise<RecognitionRecord> => {
  const updateData: any = {
    status,
  };
  if (status === 'completado') {
    updateData.completed_at = new Date().toISOString();
  }
  if (collectionPointId) {
    updateData.collection_point_id = collectionPointId;
  }

  const { data, error } = await supabase
    .from('recognition_records')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error updating status: ${error.message}`);
  }

  return data as RecognitionRecord;
};

