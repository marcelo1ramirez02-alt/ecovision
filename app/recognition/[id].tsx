import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getRecognitionRecordById } from '../../services/recognition';
import { RecognitionRecord } from '../../types/recognition';
import { Card } from '../../components/ui/Card';

export default function RecognitionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [record, setRecord] = useState<RecognitionRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getRecognitionRecordById(id)
        .then((data) => setRecord(data))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  if (!record) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>No se encontró el registro de reconocimiento.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Image source={{ uri: record.image_url }} style={styles.mainImage} />

      <View style={styles.headerRow}>
        <Text style={styles.title}>{record.material_name}</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View
            style={[
              styles.badge,
              { backgroundColor: record.recyclable ? '#10B981' : '#EF4444' },
            ]}
          >
            <Text style={styles.badgeText}>
              {record.recyclable ? 'Reciclable' : 'No Reciclable'}
            </Text>
          </View>

          {record.recyclable && (
            <View
              style={[
                styles.badge,
                {
                  backgroundColor:
                    record.status === 'completado' ? '#D1FAE5' : '#FEF3C7',
                },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  {
                    color:
                      record.status === 'completado' ? '#047857' : '#D97706',
                  },
                ]}
              >
                {record.status === 'completado' ? 'Completado ✓' : 'En proceso ⏳'}
              </Text>
            </View>
          )}
        </View>
      </View>

      <Card style={styles.pointsEarnedCard}>
        <Ionicons name="trophy-outline" size={20} color="#059669" style={styles.pointsIcon} />
        <Text style={styles.pointsEarnedText}>+{record.eco_points_earned} Eco-Puntos Ganados</Text>
      </Card>

      <Card style={styles.infoCard}>
        <Text style={styles.sectionLabel}>Estado de Reciclaje</Text>
        <Text style={styles.sectionValue}>
          {record.status === 'completado'
            ? 'Completado (Residuo depositado en el contenedor)'
            : record.recyclable
            ? 'En proceso (Pendiente de depósito en punto de acopio)'
            : 'No aplicable'}
        </Text>

        <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Código de Material</Text>
        <Text style={styles.sectionValue}>{record.material_code}</Text>

        <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Confianza de IA Gemini</Text>
        <Text style={styles.sectionValue}>
          {Math.round((record.confidence || 0.9) * 100)}%
        </Text>

        <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Consentimiento de Dataset</Text>
        <Text style={styles.sectionValue}>
          {record.training_consent ? 'Sí (Contribución activa)' : 'No (Uso exclusivo)'}
        </Text>

        <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Instrucciones de Disposición</Text>
        <Text style={styles.instructionsText}>
          {record.disposal_instructions || 'Siga las normas de su municipalidad local.'}
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#64748B',
    fontSize: 16,
  },
  mainImage: {
    width: '100%',
    height: 250,
    borderRadius: 24,
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#0F172A',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    flex: 1,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  pointsEarnedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 20,
  },
  pointsIcon: {
    marginRight: 8,
  },
  pointsEarnedText: {
    color: '#059669',
    fontSize: 15,
    fontWeight: '700',
  },
  infoCard: {
    marginBottom: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
  },
  sectionLabel: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionValue: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 2,
  },
  instructionsText: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 4,
  },
});

