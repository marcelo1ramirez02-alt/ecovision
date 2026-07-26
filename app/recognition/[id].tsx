import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
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
        <ActivityIndicator size="large" color="#10B981" />
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Image source={{ uri: record.image_url }} style={styles.mainImage} />

      <View style={styles.headerRow}>
        <Text style={styles.title}>{record.material_name}</Text>
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
      </View>

      <Card style={styles.pointsEarnedCard}>
        <Text style={styles.pointsEarnedText}>+{record.eco_points_earned} Eco-Puntos Ganados 🌟</Text>
      </Card>

      <Card style={styles.infoCard}>
        <Text style={styles.sectionLabel}>Código de Material</Text>
        <Text style={styles.sectionValue}>{record.material_code}</Text>

        <Text style={[styles.sectionLabel, { marginTop: 12 }]}>Confianza de IA Gemini</Text>
        <Text style={styles.sectionValue}>
          {Math.round((record.confidence || 0.9) * 100)}%
        </Text>

        <Text style={[styles.sectionLabel, { marginTop: 12 }]}>Consentimiento de Dataset</Text>
        <Text style={styles.sectionValue}>
          {record.training_consent ? 'Sí (Contribución activa)' : 'No (Uso exclusivo)'}
        </Text>

        <Text style={[styles.sectionLabel, { marginTop: 12 }]}>Instrucciones de Disposición</Text>
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
    backgroundColor: '#0F172A',
  },
  content: {
    padding: 20,
  },
  center: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#94A3B8',
    fontSize: 16,
  },
  mainImage: {
    width: '100%',
    height: 250,
    borderRadius: 20,
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 24,
    fontWeight: '800',
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
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    alignItems: 'center',
    paddingVertical: 14,
    marginBottom: 16,
  },
  pointsEarnedText: {
    color: '#34D399',
    fontSize: 16,
    fontWeight: '700',
  },
  infoCard: {
    marginBottom: 20,
  },
  sectionLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  sectionValue: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 2,
  },
  instructionsText: {
    color: '#CBD5E1',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
});
