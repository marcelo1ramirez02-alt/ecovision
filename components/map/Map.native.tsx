import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import Constants from 'expo-constants';
import { CollectionPoint } from '../../types/collectionPoint';

const mapboxToken =
  Constants.expoConfig?.extra?.mapboxToken ||
  process.env.MAPBOX_ACCESS_TOKEN ||
  process.env.EXPO_PUBLIC_MAPBOX_KEY ||
  '';

MapboxGL.setAccessToken(mapboxToken);

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
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <MapboxGL.MapView style={styles.map} styleURL={MapboxGL.StyleURL.Dark}>
        <MapboxGL.Camera
          zoomLevel={14}
          centerCoordinate={[userLongitude, userLatitude]}
          animationMode="flyTo"
          animationDuration={1000}
        />

        {/* User Location Marker */}
        <MapboxGL.PointAnnotation
          id="user-location"
          coordinate={[userLongitude, userLatitude]}
        >
          <View style={styles.userMarkerContainer}>
            <View style={styles.userMarkerPulse} />
            <View style={styles.userMarkerDot} />
          </View>
        </MapboxGL.PointAnnotation>

        {/* Collection Points Markers with Balloon Callouts (Globo) */}
        {points.map((point) => {
          const isSelected = selectedPointId === point.id;

          return (
            <MapboxGL.PointAnnotation
              key={point.id}
              id={`point-${point.id}`}
              coordinate={[point.longitude, point.latitude]}
              onSelected={() => {
                setSelectedPointId(point.id);
                if (onSelectPoint) onSelectPoint(point);
              }}
              onDeselected={() => setSelectedPointId(null)}
            >
              <View style={styles.markerWrapper}>
                {/* Balloon Callout Tag (Globo) */}
                {isSelected && (
                  <View style={styles.balloonTag}>
                    <Text style={styles.balloonTitle}>♻️ {point.name}</Text>
                    <Text style={styles.balloonAddress} numberOfLines={1}>
                      {point.address}
                    </Text>
                    {point.distance_meters && (
                      <Text style={styles.balloonDistance}>
                        📏 {Math.round(point.distance_meters)}m de distancia
                      </Text>
                    )}
                    <View style={styles.balloonArrow} />
                  </View>
                )}

                {/* Marker Icon */}
                <View style={styles.pointMarker}>
                  <Text style={styles.markerEmoji}>♻️</Text>
                </View>
              </View>
            </MapboxGL.PointAnnotation>
          );
        })}
      </MapboxGL.MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 80,
  },
  map: {
    flex: 1,
  },
  userMarkerContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userMarkerPulse: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(56, 189, 248, 0.4)',
  },
  userMarkerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#38BDF8',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  markerWrapper: {
    alignItems: 'center',
  },
  balloonTag: {
    backgroundColor: '#0F172A',
    borderColor: '#10B981',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 6,
    maxWidth: 180,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  balloonTitle: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
  },
  balloonAddress: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 2,
  },
  balloonDistance: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  balloonArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#10B981',
    marginTop: 4,
  },
  pointMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  markerEmoji: {
    fontSize: 16,
  },
});

export default MapComponent;
