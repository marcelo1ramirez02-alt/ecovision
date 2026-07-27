import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocation } from '../../hooks/useLocation';
import { useCollectionPoints } from '../../hooks/useCollectionPoints';
import { PointCard } from '../../components/collection-points/PointCard';
import { CollectionPoint } from '../../types/collectionPoint';

// Dynamic import or switch for Native vs Web map component
import MapNative from '../../components/map/Map.native';
import MapWeb from '../../components/map/Map.web';

const MapComponent = Platform.OS === 'web' ? MapWeb : MapNative;

export default function MapScreen() {
  const { location, loading: locationLoading } = useLocation();
  const [selectedPoint, setSelectedPoint] = useState<CollectionPoint | null>(null);
  const [materialFilter, setMaterialFilter] = useState<string | null>(null);

  const { points, loading: pointsLoading } = useCollectionPoints(
    location?.latitude,
    location?.longitude,
    5000,
    materialFilter
  );

  const materialFilters = [
    { code: null, label: '🌱 Todos' },
    { code: 'plastic_pet', label: '🍾 Plástico PET' },
    { code: 'glass', label: '🫙 Vidrio' },
    { code: 'paper', label: '📦 Papel / Cartón' },
    { code: 'metal', label: '🥫 Metales' },
  ];

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top']}>
      {/* Top Header Section */}
      <View style={styles.topHeader}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>🗺️ Puntos de Acopio EcoVision</Text>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>GPS Activo</Text>
          </View>
        </View>

        <Text style={styles.headerSubtext}>
          Ubicación: {location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : 'Obteniendo GPS...'}
        </Text>

        {/* Chips Options Bar */}
        <View style={styles.filterBarContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={materialFilters}
            keyExtractor={(item) => item.label}
            contentContainerStyle={styles.filterChipsList}
            renderItem={({ item }) => {
              const isSelected = materialFilter === item.code;
              return (
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[
                    styles.filterChip,
                    isSelected && styles.filterChipSelected,
                  ]}
                  onPress={() => setMaterialFilter(item.code)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      isSelected && styles.filterChipTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>

      {/* Main Map View Area */}
      <View style={styles.mapContainer}>
        {locationLoading ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={styles.loadingText}>Obteniendo mapa y puntos cercanos...</Text>
          </View>
        ) : (
          <MapComponent
            userLatitude={location?.latitude}
            userLongitude={location?.longitude}
            points={points}
            onSelectPoint={(point) => setSelectedPoint(point)}
          />
        )}
      </View>

      {/* Selected Point Bottom Callout Drawer */}
      {selectedPoint && (
        <View style={styles.bottomDrawer}>
          <PointCard point={selectedPoint} />
          <TouchableOpacity
            style={styles.closeDrawerBtn}
            onPress={() => setSelectedPoint(null)}
          >
            <Text style={styles.closeDrawerText}>✖️ Cerrar Detalle</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  topHeader: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    zIndex: 10,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  liveText: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '700',
  },
  headerSubtext: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
    marginBottom: 10,
  },
  filterBarContainer: {
    marginTop: 2,
  },
  filterChipsList: {
    paddingRight: 16,
  },
  filterChip: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  filterChipSelected: {
    backgroundColor: '#10B981',
    borderColor: '#34D399',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  filterChipText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  filterChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  mapContainer: {
    flex: 1,
  },
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  loadingText: {
    color: '#94A3B8',
    marginTop: 10,
    fontSize: 14,
  },
  bottomDrawer: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#10B981',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  closeDrawerBtn: {
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 6,
    backgroundColor: '#334155',
    borderRadius: 12,
  },
  closeDrawerText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
  },
});
