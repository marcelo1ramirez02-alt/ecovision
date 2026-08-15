import React from 'react';
import { Modal, View, Text, StyleSheet, ScrollView, Image, StyleSheet as RNStyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
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
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <BlurView intensity={30} tint="light" style={RNStyleSheet.absoluteFill} />
        <View style={styles.modalContent}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
              <Ionicons name="trophy-outline" size={24} color="#059669" style={styles.pointsIcon} />
              <Text style={styles.pointsNumber}>+{result.eco_points}</Text>
              <Text style={styles.pointsLabel}>Eco-Puntos Ganados</Text>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Nivel de Confianza IA</Text>
              <View style={styles.confidenceRow}>
                <Ionicons name="analytics-outline" size={16} color="#475569" style={styles.infoIcon} />
                <Text style={styles.confidenceText}>
                  {Math.round((result.confidence || 0.9) * 100)}%
                </Text>
              </View>
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
                title="Buscar Puntos Cercanos"
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
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  resultImage: {
    width: '100%',
    height: 220,
    borderRadius: 20,
    marginBottom: 20,
    resizeMode: 'cover',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  materialTitle: {
    color: '#0F172A',
    fontSize: 22,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
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
    backgroundColor: '#ECFDF5',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  pointsIcon: {
    marginBottom: 4,
  },
  pointsNumber: {
    color: '#059669',
    fontSize: 32,
    fontWeight: '850',
  },
  pointsLabel: {
    color: '#047857',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  infoSection: {
    marginTop: 16,
  },
  sectionTitle: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: 6,
  },
  confidenceText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '600',
  },
  instructionsText: {
    color: '#334155',
    fontSize: 15,
    lineHeight: 22,
  },
  actions: {
    gap: 12,
    marginTop: 16,
  },
  actionBtn: {
    width: '100%',
  },
});

