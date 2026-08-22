import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getRecognitionRecordById } from '../../services/recognition';
import { RecognitionRecord } from '../../types/recognition';
import { Card } from '../../components/ui/Card';
import { getCurrentUserLocation } from '../../services/location';
import { getNearbyCollectionPoints, CollectionPoint } from '../../services/collectionPoints';

export default function RecognitionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [record, setRecord] = useState<RecognitionRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [nearestPoint, setNearestPoint] = useState<CollectionPoint | null>(null);
  const [loadingPoint, setLoadingPoint] = useState(false);

  useEffect(() => {
    if (id) {
      getRecognitionRecordById(id)
        .then((data) => {
          setRecord(data);
          if (data && data.recyclable) {
            fetchNearestPoint(data);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const fetchNearestPoint = async (rec: RecognitionRecord) => {
    setLoadingPoint(true);
    try {
      const loc = await getCurrentUserLocation();
      const filter = rec.material_code || rec.material_name;
      let points = await getNearbyCollectionPoints({
        latitude: loc?.latitude,
        longitude: loc?.longitude,
        materialFilter: filter,
      });

      if (!points || points.length === 0) {
        const allPoints = await getNearbyCollectionPoints({
          latitude: loc?.latitude,
          longitude: loc?.longitude,
        });
        if (allPoints && allPoints.length > 0) {
          points = allPoints;
        }
      }

      if (points && points.length > 0) {
        setNearestPoint(points[0]);
      }
    } catch (err) {
      console.error('Error fetching nearest collection point in detail view:', err);
    } finally {
      setLoadingPoint(false);
    }
  };

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
      {record.image_url ? (
        <Image source={{ uri: record.image_url }} style={styles.mainImage} />
      ) : (
        <View style={[styles.mainImage, styles.fallbackHeader]}>
          <Ionicons name="leaf-outline" size={64} color="#059669" />
          <Text style={styles.fallbackHeaderText}>EcoVision IA Scan</Text>
        </View>
      )}

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

      {/* Collection Point Section */}
      {record.recyclable && (
        <Card style={styles.pointCard}>
          <View style={styles.pointHeaderRow}>
            <Ionicons name="location" size={22} color="#059669" />
            <Text style={styles.pointCardTitle}>Punto de Acopio más Cercano</Text>
          </View>

          {loadingPoint ? (
            <View style={styles.loadingPointRow}>
              <ActivityIndicator size="small" color="#059669" />
              <Text style={styles.loadingPointText}>Buscando punto de acopio cercano...</Text>
            </View>
          ) : nearestPoint ? (
            <View style={styles.pointContentBox}>
              <Text style={styles.pointName}>{nearestPoint.name}</Text>
              {nearestPoint.address ? (
                <Text style={styles.pointAddress}>{nearestPoint.address}</Text>
              ) : null}

              {nearestPoint.distance_meters !== undefined && (
                <View style={styles.distanceBadge}>
                  <Ionicons name="navigate-outline" size={14} color="#0369A1" />
                  <Text style={styles.distanceText}>
                    Distancia: {Math.round(nearestPoint.distance_meters)} m
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.mapButton}
                onPress={() => router.push('/(tabs)/map')}
                activeOpacity={0.8}
              >
                <Ionicons name="map-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.mapButtonText}>Ver en el Mapa</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.noPointText}>
              No se encontraron puntos de acopio específicos para este material en tu zona.
            </Text>
          )}
        </Card>
      )}

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
  fallbackHeader: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackHeaderText: {
    color: '#059669',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
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
  pointCard: {
    marginBottom: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  pointHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  pointCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  loadingPointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  loadingPointText: {
    color: '#64748B',
    fontSize: 13,
  },
  pointContentBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pointName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  pointAddress: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    backgroundColor: '#F0F9FF',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0369A1',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    borderRadius: 12,
    paddingVertical: 10,
    marginTop: 14,
  },
  mapButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  noPointText: {
    color: '#64748B',
    fontSize: 13,
    fontStyle: 'italic',
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


