import React from 'react';
import { Modal, View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { RecognitionResult, RecognitionRecord } from '../../types/recognition';
import { Button } from '../ui/Button';

interface WasteResultModalProps {
  visible: boolean;
  result: RecognitionResult | null;
  record?: RecognitionRecord | null;
  imageUri?: string | null;
  onClose: () => void;
  onFindPoints?: () => void;
}

export const WasteResultModal: React.FC<WasteResultModalProps> = ({
  visible,
  result,
  record,
  imageUri,
  onClose,
  onFindPoints,
}) => {
  if (!result) return null;

  const displayImage = imageUri || record?.image_url;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {displayImage && (
              <Image source={{ uri: displayImage }} style={styles.resultImage} />
            )}

            <View style={styles.header}>
              <Text style={styles.materialTitle}>{result.material_name}</Text>
              <View
                style={[
                  styles.recyclableBadge,
                  { backgroundColor: result.recyclable ? '#10B981' : '#EF4444' },
                ]}
              >
                <Text style={styles.badgeText}>
                  {result.recyclable ? 'Reciclable' : 'No Reciclable'}
                </Text>
              </View>
            </View>

            <View style={styles.pointsEarnedBox}>
              <Text style={styles.pointsNumber}>+{result.eco_points}</Text>
              <Text style={styles.pointsLabel}>Eco-Puntos Ganados 🌟</Text>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Nivel de Confianza IA</Text>
              <Text style={styles.confidenceText}>
                {Math.round((result.confidence || 0.9) * 100)}%
              </Text>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Instrucciones de Disposición</Text>
              <Text style={styles.instructionsText}>
                {result.disposal_instructions}
              </Text>
            </View>
          </ScrollView>

          <View style={styles.actions}>
            {result.recyclable && onFindPoints && (
              <Button
                title="📍 Buscar Puntos Cercanos"
                variant="secondary"
                onPress={() => {
                  onClose();
                  onFindPoints();
                }}
                style={styles.actionBtn}
              />
            )}
            <Button title="Entendido" variant="primary" onPress={onClose} style={styles.actionBtn} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    padding: 20,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  resultImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: 16,
    resizeMode: 'cover',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  materialTitle: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '700',
    flex: 1,
  },
  recyclableBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  pointsEarnedBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  pointsNumber: {
    color: '#34D399',
    fontSize: 28,
    fontWeight: '800',
  },
  pointsLabel: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 2,
  },
  infoSection: {
    marginTop: 12,
  },
  sectionTitle: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  confidenceText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
  },
  instructionsText: {
    color: '#CBD5E1',
    fontSize: 15,
    lineHeight: 22,
  },
  actions: {
    gap: 10,
    marginTop: 12,
  },
  actionBtn: {
    width: '100%',
  },
});
