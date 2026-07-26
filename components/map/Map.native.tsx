import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
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

        {/* Collection Points Markers */}
        {points.map((point) => (
          <MapboxGL.PointAnnotation
            key={point.id}
            id={`point-${point.id}`}
            coordinate={[point.longitude, point.latitude]}
            onSelected={() => onSelectPoint && onSelectPoint(point)}
          >
            <View style={styles.pointMarker}>
              <Text style={styles.markerEmoji}>♻️</Text>
            </View>
          </MapboxGL.PointAnnotation>
        ))}
      </MapboxGL.MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
