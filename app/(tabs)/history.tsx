import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRecognition } from '../../hooks/useRecognition';
import { Card } from '../../components/ui/Card';

export default function HistoryScreen() {
  const { history, loadHistory } = useRecognition();
  const [refreshing, setRefreshing] = React.useState(false);
  const router = useRouter();

  useEffect(() => {
    loadHistory();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Historial de Escaneos</Text>
        <Text style={styles.headerSubtitle}>Tus registros de reconocimiento de residuos con IA</Text>

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
            <TouchableOpacity
              onPress={() => router.push(`/recognition/${item.id}`)}
              activeOpacity={0.8}
            >
              <Card style={styles.historyCard}>
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
                    <View style={styles.statusBadge}>
                      <View
                        style={[
                          styles.statusDot,
                          { backgroundColor: item.recyclable ? '#10B981' : '#EF4444' },
                        ]}
                      />
                      <Text
                        style={[
                          styles.statusText,
                          { color: item.recyclable ? '#047857' : '#B91C1C' },
                        ]}
                      >
                        {item.recyclable ? 'Reciclable' : 'No Reciclable'}
                      </Text>
                    </View>

                    {item.training_consent && (
                      <Text style={styles.consentBadge}>Contribuyente de Dataset</Text>
                    )}
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
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
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
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
    fontWeight: '850',
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
    gap: 8,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    fontWeight: '600',
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

