import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { CollectionPoint } from '../../types/collectionPoint';

interface MapProps {
  userLatitude?: number;
  userLongitude?: number;
  points: CollectionPoint[];
  onSelectPoint?: (point: CollectionPoint) => void;
}

export const MapComponent: React.FC<MapProps> = ({
  userLatitude = -12.046374,
  userLongitude = -77.042793,
  points,
  onSelectPoint,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.webHeader}>
        <Text style={styles.webTitle}>🗺️ Vista de Mapa Web (Ecovision PostGIS)</Text>
        <Text style={styles.webSubtitle}>
          Ubicación actual: {userLatitude.toFixed(4)}, {userLongitude.toFixed(4)}
        </Text>
      </View>

      <ScrollView style={styles.pointsList}>
        <Text style={styles.sectionHeader}>Puntos de Acopio Cercanos ({points.length})</Text>
        {points.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={styles.pointItem}
            onPress={() => onSelectPoint && onSelectPoint(p)}
          >
            <View style={styles.iconCircle}>
              <Text style={styles.iconEmoji}>♻️</Text>
            </View>
            <View style={styles.pointInfo}>
              <Text style={styles.pointName}>{p.name}</Text>
              <Text style={styles.pointAddress}>{p.address}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 16,
  },
  webHeader: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  webTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
  webSubtitle: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 4,
  },
  pointsList: {
    flex: 1,
  },
  sectionHeader: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  pointItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconEmoji: {
    fontSize: 20,
  },
  pointInfo: {
    flex: 1,
  },
  pointName: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '600',
  },
  pointAddress: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
});

export default MapComponent;
