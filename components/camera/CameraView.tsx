import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { CameraView as ExpoCameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '../ui/Button';

interface CameraViewProps {
  onCapture: (uri: string) => void;
  isAnalyzing: boolean;
}

export const CameraViewComponent: React.FC<CameraViewProps> = ({ onCapture, isAnalyzing }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const cameraRef = useRef<any>(null);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.messageText}>Necesitamos acceso a tu cámara para identificar residuos</Text>
        <Button title="Conceder Permisos" onPress={requestPermission} />
      </View>
    );
  }

  const handleTakePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (photo?.uri) {
        setPreviewUri(photo.uri);
      }
    }
  };

  const handlePickGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setPreviewUri(result.assets[0].uri);
    }
  };

  const handleConfirm = () => {
    if (previewUri) {
      onCapture(previewUri);
    }
  };

  return (
    <View style={styles.container}>
      {previewUri ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: previewUri }} style={styles.previewImage} />
          <View style={styles.previewControls}>
            <Button
              title="Re-tomar"
              variant="outline"
              onPress={() => setPreviewUri(null)}
              disabled={isAnalyzing}
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              title={isAnalyzing ? 'Analizando...' : 'Clasificar Residuo'}
              variant="primary"
              loading={isAnalyzing}
              onPress={handleConfirm}
              style={{ flex: 1, marginLeft: 8 }}
            />
          </View>
        </View>
      ) : (
        <ExpoCameraView style={styles.camera} ref={cameraRef}>
          <View style={styles.overlay}>
            <View style={styles.scanTargetBox} />
            <Text style={styles.hintText}>Apunta la cámara hacia el residuo a reciclar</Text>
          </View>

          <View style={styles.controlsRow}>
            <TouchableOpacity style={styles.galleryButton} onPress={handlePickGallery}>
              <Text style={styles.iconText}>🖼️</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.captureButton}
              onPress={handleTakePicture}
              activeOpacity={0.7}
            >
              <View style={styles.innerCaptureButton} />
            </TouchableOpacity>

            <View style={{ width: 48 }} />
          </View>
        </ExpoCameraView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  messageText: {
    color: '#F8FAFC',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanTargetBox: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#10B981',
    borderRadius: 24,
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
  hintText: {
    color: '#F8FAFC',
    marginTop: 16,
    fontSize: 14,
    fontWeight: '500',
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  controlsRow: {
    height: 100,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCaptureButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10B981',
  },
  galleryButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 22,
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  previewImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  previewControls: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#0F172A',
  },
});
