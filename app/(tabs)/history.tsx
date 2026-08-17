import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRecognition } from '../../hooks/useRecognition';
import { Card } from '../../components/ui/Card';
import { RecognitionRecord } from '../../types/recognition';
import { getCurrentUserLocation, UserCoordinates } from '../../services/location';
import { getNearbyCollectionPoints, CollectionPoint } from '../../services/collectionPoints';

const VIÑETA_PROXIMITY_THRESHOLD_METERS = 10;

interface HistoryCardItemProps {
  item: RecognitionRecord;
  userLocation: UserCoordinates | null;
  onConfirm: (recordId: string, pointId?: string) => Promise<boolean>;
}

function HistoryCardItem({ item, userLocation, onConfirm }: HistoryCardItemProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [loadingPoint, setLoadingPoint] = useState(false);
  const [nearestPoint, setNearestPoint] = useState<CollectionPoint | null>(null);
  const [simulatedProximity, setSimulatedProximity] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const status = item.status || 'en_proceso';
  const isRecyclable = item.recyclable;

  useEffect(() => {
    if (expanded && isRecyclable && status === 'en_proceso' && !nearestPoint) {
      fetchNearestPoint();
    }
  }, [expanded]);

  const fetchNearestPoint = async () => {
    setLoadingPoint(true);
    try {
      const loc = userLocation || (await getCurrentUserLocation());
      const points = await getNearbyCollectionPoints({
        latitude: loc?.latitude,
        longitude: loc?.longitude,
        materialFilter: item.material_code,
      });

      if (points && points.length > 0) {
        setNearestPoint(points[0]);
      }
    } catch (error) {
      console.error('Error fetching nearest collection point for card:', error);
    } finally {
      setLoadingPoint(false);
    }
  };

  const currentDistance = nearestPoint?.distance_meters;
  const isWithinViñeta =
    simulatedProximity || (currentDistance !== undefined && currentDistance <= VIÑETA_PROXIMITY_THRESHOLD_METERS);

  const handleConfirmDisposal = async () => {
    setIsConfirming(true);
    const success = await onConfirm(item.id, nearestPoint?.id);
    setIsConfirming(false);
    if (success) {
      Alert.alert(
        '¡Reciclaje Confirmado! 🎉',
        'Has depositado el residuo en la viñeta del punto de acopio y completado el proceso.'
      );
    }
  };

  return (
    <Card style={styles.historyCard}>
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.8}
        style={styles.cardHeaderPressable}
      >
        <Image source={{ uri: item.image_url }} style={styles.thumbnail} />
        <View style={styles.infoContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.materialName} numberOfLines={1}>
              {item.material_name}
            </Text>
            <Text style={styles.pointsBadge}>+{item.eco_points_earned}</Text>
          </View>

          <Text style={styles.dateText}>
            {new Date(item.created_at).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </Text>

          <View style={styles.statusRow}>
            {!isRecyclable ? (
              <View style={[styles.statusBadge, { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }]}>
                <View style={[styles.statusDot, { backgroundColor: '#EF4444' }]} />
                <Text style={[styles.statusText, { color: '#B91C1C' }]}>No Reciclable</Text>
              </View>
            ) : status === 'completado' ? (
              <View style={[styles.statusBadge, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
                <Text style={[styles.statusText, { color: '#047857' }]}>Completado ✓</Text>
              </View>
            ) : (
              <View style={[styles.statusBadge, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
                <View style={[styles.statusDot, { backgroundColor: '#F59E0B' }]} />
                <Text style={[styles.statusText, { color: '#D97706' }]}>En proceso ⏳</Text>
              </View>
            )}

            {item.training_consent && (
              <Text style={styles.consentBadge}>Contribuyente</Text>
            )}

            <Ionicons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={18}
              color="#64748B"
              style={{ marginLeft: 'auto' }}
            />
          </View>
        </View>
      </TouchableOpacity>

      {/* Expanded Dropdown Content */}
      {expanded && (
        <View style={styles.expandedContent}>
          <View style={styles.divider} />

          {/* Recyclable & En proceso Flow */}
          {isRecyclable && status === 'en_proceso' ? (
            <View style={styles.expandedDetails}>
              <Text style={styles.expandedTitle}>Punto de Acopio más Cercano</Text>

              {loadingPoint ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#059669" />
                  <Text style={styles.loadingText}>Buscando viñeta de acopio...</Text>
                </View>
              ) : nearestPoint ? (
                <View style={styles.pointInfoBox}>
                  <View style={styles.pointHeader}>
                    <Ionicons name="location-sharp" size={18} color="#059669" />
                    <Text style={styles.pointName} numberOfLines={1}>
                      {nearestPoint.name}
                    </Text>
                  </View>
                  {nearestPoint.address ? (
                    <Text style={styles.pointAddress} numberOfLines={1}>
                      {nearestPoint.address}
                    </Text>
                  ) : null}

                  {currentDistance !== undefined && (
                    <View style={styles.distanceBadgeRow}>
                      <Ionicons name="navigate-outline" size={14} color="#0369A1" />
                      <Text style={styles.distanceText}>
                        Distancia a la viñeta: {Math.round(currentDistance)} m
                      </Text>
                    </View>
                  )}
                </View>
              ) : (
                <Text style={styles.noPointText}>
                  No se encontraron puntos de acopio cercanos registrados para este material.
                </Text>
              )}

              {/* Status indicator on range */}
              <View
                style={[
                  styles.proximityStatusBox,
                  isWithinViñeta ? styles.proximitySuccess : styles.proximityWarning,
                ]}
              >
                <Ionicons
                  name={isWithinViñeta ? 'checkmark-circle' : 'alert-circle-outline'}
                  size={18}
                  color={isWithinViñeta ? '#047857' : '#D97706'}
                />
                <Text
                  style={[
                    styles.proximityStatusText,
                    { color: isWithinViñeta ? '#047857' : '#B45309' },
                  ]}
                >
                  {isWithinViñeta
                    ? '📍 ¡Estás en la viñeta del contenedor! Puedes confirmar el desecho.'
                    : `⚠️ Acércate a menos de 10m de la viñeta para confirmar. (${
                        currentDistance !== undefined ? Math.round(currentDistance) + 'm actual' : 'Buscando GPS'
                      })`}
                </Text>
              </View>

              {/* Development Simulation Switch */}
              {__DEV__ && (
                <View style={styles.devSimulationRow}>
                  <View style={styles.devTextGroup}>
                    <Text style={styles.devLabel}>Simular Proximidad a Viñeta</Text>
                    <Text style={styles.devSub}>Solo en modo desarrollo (__DEV__)</Text>
                  </View>
                  <Switch
                    value={simulatedProximity}
                    onValueChange={setSimulatedProximity}
                    trackColor={{ false: '#CBD5E1', true: '#6EE7B7' }}
                    thumbColor={simulatedProximity ? '#059669' : '#94A3B8'}
                  />
                </View>
              )}

              {/* Action Button */}
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  !isWithinViñeta || isConfirming ? styles.disabledButton : styles.activeButton,
                ]}
                disabled={!isWithinViñeta || isConfirming}
                onPress={handleConfirmDisposal}
              >
                {isConfirming ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark-done-circle-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.confirmButtonText}>
                      {isWithinViñeta ? 'Confirmar desecho en contenedor' : 'Acércate a la viñeta (<= 10m)'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            /* Non-recyclable or Completed details */
            <View style={styles.expandedDetails}>
              {status === 'completado' ? (
                <View style={styles.completedBox}>
                  <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                  <View style={{ marginLeft: 10, flex: 1 }}>
                    <Text style={styles.completedTitle}>Material Reciclado y Depositado</Text>
                    <Text style={styles.completedSub}>
                      Proceso finalizado con éxito.{' '}
                      {item.completed_at
                        ? `Confirmado el ${new Date(item.completed_at).toLocaleDateString('es-ES')}`
                        : ''}
                    </Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.nonRecyclableInfo}>
                  Este material no es reciclable. Sigue las instrucciones de disposición municipal.
                </Text>
              )}
            </View>
          )}

          {/* Link to full record view */}
          <TouchableOpacity
            style={styles.detailLink}
            onPress={() => router.push(`/recognition/${item.id}`)}
          >
            <Text style={styles.detailLinkText}>Ver detalle completo del escaneo</Text>
            <Ionicons name="arrow-forward" size={14} color="#059669" />
          </TouchableOpacity>
        </View>
      )}
    </Card>
  );
}

export default function HistoryScreen() {
  const { history, loadHistory, confirmDisposal } = useRecognition();
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState<UserCoordinates | null>(null);

  useEffect(() => {
    loadHistory();
    getCurrentUserLocation().then((loc) => setUserLocation(loc));
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    const loc = await getCurrentUserLocation();
    setUserLocation(loc);
    await loadHistory();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Historial de Escaneos</Text>
        <Text style={styles.headerSubtitle}>Tus registros de reconocimiento y estado de reciclaje</Text>

        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#059669" />
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="leaf-outline" size={32} color="#94A3B8" />
              </View>
              <Text style={styles.emptyTitle}>Aún no tienes escaneos</Text>
              <Text style={styles.emptySub}>
                Utiliza la cámara para clasificar tus residuos y sumar eco-puntos.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <HistoryCardItem
              item={item}
              userLocation={userLocation}
              onConfirm={confirmDisposal}
            />
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  headerTitle: {
    color: '#0F172A',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    color: '#475569',
    fontSize: 14,
    marginTop: 4,
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 110,
  },
  historyCard: {
    marginBottom: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
    overflow: 'hidden',
  },
  cardHeaderPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  thumbnail: {
    width: 68,
    height: 68,
    borderRadius: 12,
    marginRight: 14,
    backgroundColor: '#F1F5F9',
  },
  infoContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  materialName: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  pointsBadge: {
    color: '#059669',
    fontWeight: '800',
    fontSize: 13,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  dateText: {
    color: '#64748B',
    fontSize: 12,
    marginVertical: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  consentBadge: {
    color: '#0369A1',
    fontSize: 10,
    fontWeight: '600',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  expandedContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginBottom: 12,
  },
  expandedDetails: {
    gap: 10,
  },
  expandedTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  loadingText: {
    color: '#64748B',
    fontSize: 13,
  },
  pointInfoBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 10,
  },
  pointHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pointName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  pointAddress: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginLeft: 24,
  },
  distanceBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    marginLeft: 24,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0369A1',
  },
  noPointText: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
  },
  proximityStatusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  proximitySuccess: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  proximityWarning: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  proximityStatusText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  devSimulationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    padding: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  devTextGroup: {
    flex: 1,
    marginRight: 8,
  },
  devLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  devSub: {
    fontSize: 10,
    color: '#64748B',
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 6,
  },
  activeButton: {
    backgroundColor: '#059669',
  },
  disabledButton: {
    backgroundColor: '#94A3B8',
    opacity: 0.7,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  completedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  completedTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#047857',
  },
  completedSub: {
    fontSize: 12,
    color: '#065F46',
    marginTop: 2,
  },
  nonRecyclableInfo: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  detailLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 12,
  },
  detailLinkText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '700',
  },
  emptySub: {
    color: '#64748B',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 30,
  },
});
