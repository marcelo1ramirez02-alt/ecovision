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
import { Ionicons } from '@expo/vector-icons';
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
    50000,
    materialFilter
  );

  const materialFilters = [
    { code: null, label: 'Todos' },
    { code: 'papel', label: 'Papel' },
    { code: 'carton', label: 'Cartón' },
    { code: 'plastico', label: 'Plástico' },
    { code: 'vidrio', label: 'Vidrio' },
    { code: 'metales', label: 'Metales' },
    { code: 'aceite', label: 'Aceite' },
    { code: 'pilas', label: 'Pilas' },
    { code: 'electrodomesticos', label: 'Electrodomésticos' },
    { code: 'medicinas', label: 'Medicinas' },
  ];


  return (
    <SafeAreaView style={styles.safeContainer} edges={['top']}>
      {/* Top Header Section */}
      <View style={styles.topHeader}>
        <View style={styles.headerTitleRow}>
          <View style={styles.titleWithIcon}>
            <Ionicons name="map-outline" size={20} color="#059669" style={styles.headerIcon} />
            <Text style={styles.headerTitle}>Puntos de Acopio</Text>
          </View>
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
        {locationLoading || pointsLoading ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color="#059669" />
            <Text style={styles.loadingText}>Obteniendo mapa y puntos de la base de datos...</Text>
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
            activeOpacity={0.8}
          >
            <Ionicons name="close-circle-outline" size={16} color="#0F172A" style={styles.closeIcon} />
            <Text style={styles.closeDrawerText}>Cerrar Detalle</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    zIndex: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 6,
  },
  headerTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  liveText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '700',
  },
  headerSubtext: {
    color: '#475569',
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
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipSelected: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  filterChipText: {
    color: '#475569',
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
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    color: '#475569',
    marginTop: 10,
    fontSize: 14,
  },
  bottomDrawer: {
    position: 'absolute',
    bottom: 80,
    left: '5%',
    right: '5%',
    width: '90%',
    maxWidth: 450,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#059669',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
  },
  closeDrawerBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
  },
  closeIcon: {
    marginRight: 6,
  },
  closeDrawerText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
  },
});

