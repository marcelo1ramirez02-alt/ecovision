import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
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
    { code: null, label: 'Todos' },
    { code: 'plastic_pet', label: 'Plástico' },
    { code: 'glass', label: 'Vidrio' },
    { code: 'paper', label: 'Papel/Cartón' },
    { code: 'metal', label: 'Metal' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        {locationLoading ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={styles.loadingText}>Obteniendo tu ubicación...</Text>
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

      {/* Material Filter Chips */}
      <View style={styles.filterBar}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={materialFilters}
          keyExtractor={(item) => item.label}
          renderItem={({ item }) => {
            const isSelected = materialFilter === item.code;
            return (
              <TouchableOpacity
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

      {/* Selected Point Bottom Drawer */}
      {selectedPoint && (
        <View style={styles.bottomDrawer}>
          <PointCard point={selectedPoint} />
          <TouchableOpacity
            style={styles.closeDrawerBtn}
            onPress={() => setSelectedPoint(null)}
          >
            <Text style={styles.closeDrawerText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  mapContainer: {
    flex: 1,
  },
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94A3B8',
    marginTop: 10,
    fontSize: 14,
  },
  filterBar: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
  },
  filterChip: {
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  filterChipSelected: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  filterChipText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  filterChipTextSelected: {
    color: '#FFFFFF',
  },
  bottomDrawer: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  closeDrawerBtn: {
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 4,
  },
  closeDrawerText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
});
