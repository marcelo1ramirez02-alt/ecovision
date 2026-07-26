import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.icon}>🌱</Text>
          <Text style={styles.title}>Contribuye al Dataset Ecológico</Text>
          <Text style={styles.description}>
            ¿Deseas permitir que las imágenes de tus residuos anonimizadas sean utilizadas para
            entrenar y mejorar los modelos de inteligencia artificial de EcoVision AI?
          </Text>

          <View style={styles.bulletPoints}>
            <Text style={styles.bullet}>✓ Tu identidad permanece protegida y anonimizada.</Text>
            <Text style={styles.bullet}>✓ Ayudas a mejorar la precisión en la detección de reciclaje.</Text>
            <Text style={styles.bullet}>✓ Puedes cambiar tu preferencia en cualquier momento.</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  icon: {
    fontSize: 40,
    marginBottom: 12,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  bulletPoints: {
    alignSelf: 'stretch',
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  bullet: {
    color: '#34D399',
    fontSize: 13,
    marginVertical: 4,
  },
  actionBtn: {
    width: '100%',
    marginTop: 8,
  },
});
