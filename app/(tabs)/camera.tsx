import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraViewComponent } from '../../components/camera/CameraView';
import { WasteResultModal } from '../../components/recognition/WasteResultModal';
import { TrainingConsentModal } from '../../components/consent/TrainingConsentModal';
import { useRecognition } from '../../hooks/useRecognition';
import { useAuth } from '../../hooks/useAuth';

export default function CameraScreen() {
  const { processWasteImage, isAnalyzing, latestResult, latestRecord, currentCaptureUri, reset } =
    useRecognition();
  const { trainingConsent, setTrainingConsent } = useAuth();
  const [showConsentModal, setShowConsentModal] = useState<boolean>(false);
  const [showResultModal, setShowResultModal] = useState<boolean>(false);
  const [pendingImageUri, setPendingImageUri] = useState<string | null>(null);
  const router = useRouter();

  const handleCapture = async (imageUri: string) => {
    // Check if user hasn't made a choice on consent yet
    setPendingImageUri(imageUri);
    runClassification(imageUri, trainingConsent);
  };

  const runClassification = async (imageUri: string, consent: boolean) => {
    try {
      await processWasteImage(imageUri, consent);
      setShowResultModal(true);
    } catch (err: any) {
      Alert.alert('Error de Clasificación', err.message || 'No se pudo analizar la imagen');
    }
  };

  return (
    <View style={styles.container}>
      <CameraViewComponent onCapture={handleCapture} isAnalyzing={isAnalyzing} />

      <TrainingConsentModal
        visible={showConsentModal}
        onConsent={(accepted) => {
          setTrainingConsent(accepted);
          if (pendingImageUri) {
            runClassification(pendingImageUri, accepted);
          }
        }}
        onClose={() => setShowConsentModal(false)}
      />

      <WasteResultModal
        visible={showResultModal}
        result={latestResult}
        record={latestRecord}
        imageUri={currentCaptureUri}
        onClose={() => {
          setShowResultModal(false);
          reset();
        }}
        onFindPoints={() => {
          setShowResultModal(false);
          reset();
          router.push('/(tabs)/map');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
});
