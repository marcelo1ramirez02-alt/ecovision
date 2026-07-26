import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
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
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Historial de Escaneos 📜</Text>
      <Text style={styles.headerSubtitle}>Tus registros de reconocimiento de residuos</Text>

      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" />
        }
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🍃</Text>
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
                  <Text style={styles.pointsBadge}>+{item.eco_points_earned} 🌟</Text>
                </View>

                <Text style={styles.dateText}>
                  {new Date(item.created_at).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </Text>

                <View style={styles.statusRow}>
                  <Text
                    style={[
                      styles.statusText,
                      { color: item.recyclable ? '#34D399' : '#F87171' },
                    ]}
                  >
                    {item.recyclable ? '✓ Reciclable' : '✕ No Reciclable'}
                  </Text>

                  {item.training_consent && (
                    <Text style={styles.consentBadge}>Dataset Consent</Text>
                  )}
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 24,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 4,
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 30,
  },
  historyCard: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 12,
    marginRight: 14,
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
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  pointsBadge: {
    color: '#34D399',
    fontWeight: '700',
    fontSize: 13,
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
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  consentBadge: {
    color: '#38BDF8',
    fontSize: 10,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
  emptySub: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 30,
  },
});
