import React from 'react';
import { Modal, View, Text, StyleSheet, StyleSheet as RNStyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../ui/Button';

interface TrainingConsentModalProps {
  visible: boolean;
  onConsent: (consent: boolean) => void;
  onClose: () => void;
}

export const TrainingConsentModal: React.FC<TrainingConsentModalProps> = ({
  visible,
  onConsent,
  onClose,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <BlurView intensity={30} tint="light" style={RNStyleSheet.absoluteFill} />
        <View style={styles.modalContent}>
          <View style={styles.iconContainer}>
            <Ionicons name="leaf-outline" size={32} color="#059669" />
          </View>
          <Text style={styles.title}>Contribuye al Dataset Ecológico</Text>
          <Text style={styles.description}>
            ¿Deseas permitir que las imágenes de tus residuos anonimizadas sean utilizadas para
            entrenar y mejorar los modelos de inteligencia artificial de EcoVision AI?
          </Text>

          <View style={styles.bulletPoints}>
            <View style={styles.bulletRow}>
              <Ionicons name="checkmark-circle-outline" size={16} color="#059669" style={styles.bulletIcon} />
              <Text style={styles.bulletText}>Tu identidad permanece protegida y anonimizada.</Text>
            </View>
            <View style={styles.bulletRow}>
              <Ionicons name="checkmark-circle-outline" size={16} color="#059669" style={styles.bulletIcon} />
              <Text style={styles.bulletText}>Ayudas a mejorar la precisión en la detección de reciclaje.</Text>
            </View>
            <View style={styles.bulletRow}>
              <Ionicons name="checkmark-circle-outline" size={16} color="#059669" style={styles.bulletIcon} />
              <Text style={styles.bulletText}>Puedes cambiar tu preferencia en cualquier momento.</Text>
            </View>
          </View>

          <Button
            title="Sí, Acepto Contribuir"
            variant="primary"
            onPress={() => {
              onConsent(true);
              onClose();
            }}
            style={styles.actionBtn}
          />

          <Button
            title="No por ahora"
            variant="outline"
            onPress={() => {
              onConsent(false);
              onClose();
            }}
            style={styles.actionBtn}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    color: '#475569',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  bulletPoints: {
    alignSelf: 'stretch',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 4,
  },
  bulletIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  bulletText: {
    color: '#334155',
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  actionBtn: {
    width: '100%',
    marginTop: 8,
  },
});

