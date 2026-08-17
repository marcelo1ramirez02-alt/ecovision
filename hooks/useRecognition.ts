import { useState } from 'react';
import { uploadImageToCloudinary } from '../services/cloudinary';
import { classifyWasteImage, getUserRecognitionHistory, updateRecognitionRecordStatus } from '../services/recognition';
import { useRecognitionStore } from '../stores/recognitionStore';
import { useAuthStore } from '../stores/authStore';

export const useRecognition = () => {
  const {
    currentCaptureUri,
    latestResult,
    latestRecord,
    history,
    isAnalyzing,
    setCaptureUri,
    setLatestResult,
    setHistory,
    setIsAnalyzing,
    updateRecordStatusInStore,
    reset,
  } = useRecognitionStore();

  const trainingConsent = useAuthStore((state) => state.trainingConsent);
  const fetchProfile = useAuthStore((state) => state.fetchProfile);
  const [error, setError] = useState<string | null>(null);

  const processWasteImage = async (imageUri: string, consentOverride?: boolean) => {
    setIsAnalyzing(true);
    setError(null);
    setCaptureUri(imageUri);

    try {
      // 1. Upload to Cloudinary via signed Edge Function request
      const cloudinaryResult = await uploadImageToCloudinary(imageUri);

      // 2. Classify via Gemini Edge Function
      const consent = consentOverride !== undefined ? consentOverride : trainingConsent;
      const response = await classifyWasteImage(cloudinaryResult.secure_url, consent);

      if (response.success && response.classification) {
        setLatestResult(response.classification, response.record);
        // Refresh eco-points on profile
        await fetchProfile();
        return response.classification;
      } else {
        throw new Error('Classification result was empty');
      }
    } catch (err: any) {
      const msg = err.message || 'Error processing image';
      setError(msg);
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadHistory = async () => {
    try {
      const records = await getUserRecognitionHistory();
      setHistory(records);
    } catch (err: any) {
      console.error('Error loading history:', err);
    }
  };

  const confirmDisposal = async (recordId: string, collectionPointId?: string) => {
    try {
      await updateRecognitionRecordStatus(recordId, 'completado', collectionPointId);
      updateRecordStatusInStore(recordId, 'completado', collectionPointId);
      await fetchProfile();
      return true;
    } catch (err: any) {
      console.error('Error confirming disposal:', err);
      setError(err.message || 'Error al confirmar depósito');
      return false;
    }
  };

  return {
    currentCaptureUri,
    latestResult,
    latestRecord,
    history,
    isAnalyzing,
    error,
    processWasteImage,
    loadHistory,
    confirmDisposal,
    reset,
  };
};
