import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import Constants from 'expo-constants';
import { CollectionPoint } from '../../types/collectionPoint';

const mapboxToken =
  Constants.expoConfig?.extra?.mapboxToken ||
  process.env.MAPBOX_ACCESS_TOKEN ||
  process.env.EXPO_PUBLIC_MAPBOX_KEY ||
  '';

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
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Load Leaflet CSS dynamically if not present
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Load Leaflet JS dynamically if not present
    const loadLeaflet = async () => {
      if ((window as any).L) return (window as any).L;

      return new Promise((resolve) => {
        if (document.getElementById('leaflet-js')) {
          const interval = setInterval(() => {
            if ((window as any).L) {
              clearInterval(interval);
              resolve((window as any).L);
            }
          }, 100);
          return;
        }

        const script = document.createElement('script');
        script.id = 'leaflet-js';
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => resolve((window as any).L);
        document.body.appendChild(script);
      });
    };

    loadLeaflet().then((L: any) => {
      if (!mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        // Initialize Leaflet map
        const map = L.map(mapContainerRef.current, {
          center: [userLatitude, userLongitude],
          zoom: 14,
          zoomControl: false,
        });

        // Configure Mapbox dark style tiles API using the env MAPBOX_ACCESS_TOKEN
        const mapboxTileUrl = `https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`;

        L.tileLayer(mapboxTileUrl, {
          attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
          maxZoom: 20,
          tileSize: 512,
          zoomOffset: -1,
        }).addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        mapInstanceRef.current = map;
        setLoading(false);
      } else {
        mapInstanceRef.current.setView([userLatitude, userLongitude], 14);
      }

      const map = mapInstanceRef.current;

      // Clear previous markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      // Add User Location Pulse Marker
      const userHtml = `
        <div style="
          width: 22px; height: 22px;
          background: rgba(56, 189, 248, 0.35);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 12px rgba(56, 189, 248, 0.8);
          animation: pulse 2s infinite;
        ">
          <div style="
            width: 12px; height: 12px;
            background: #38BDF8;
            border: 2.5px solid #FFFFFF;
            border-radius: 50%;
          "></div>
        </div>
      `;
      const userIcon = L.divIcon({
        html: userHtml,
        className: 'user-location-icon',
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });
      const userMarker = L.marker([userLatitude, userLongitude], {
        icon: userIcon,
      }).addTo(map);
      userMarker.bindTooltip('📍 Tu Ubicación Actual', { direction: 'top' });
      markersRef.current.push(userMarker);

      // Add Collection Points Markers with Balloon Callouts (Globo)
      points.forEach((point) => {
        const materialsBadges = (point.accepted_materials || [])
          .map(
            (m) =>
              `<span style="
                background: ${m.color_code || '#10B981'}20;
                color: ${m.color_code || '#10B981'};
                border: 1px solid ${m.color_code || '#10B981'}50;
                font-size: 10px; font-weight: 700;
                padding: 2px 6px; border-radius: 8px; margin-right: 4px;
              ">${m.name}</span>`
          )
          .join('');

        // Balloon Callout Tag HTML (Globo)
        const balloonPopupHtml = `
          <div style="
            font-family: system-ui, -apple-system, sans-serif;
            background: #0F172A; color: #F8FAFC;
            padding: 10px 12px; border-radius: 14px;
            border: 1.5px solid #10B981;
            box-shadow: 0 10px 25px rgba(0,0,0,0.4);
            min-width: 180px; max-width: 220px;
          ">
            <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
              <span style="font-size:16px;">♻️</span>
              <strong style="font-size:13px; color:#F8FAFC;">${point.name}</strong>
            </div>
            <div style="font-size:11px; color:#94A3B8; margin-bottom:6px;">
              📍 ${point.address}
            </div>
            ${
              point.distance_meters
                ? `<div style="font-size:10px; font-weight:700; color:#34D399; margin-bottom:6px;">📏 ${Math.round(
                    point.distance_meters
                  )}m de distancia</div>`
                : ''
            }
            <div style="display:flex; flex-wrap:wrap; gap:2px; margin-top:4px;">
              ${materialsBadges}
            </div>
          </div>
        `;

        const markerHtml = `
          <div style="
            width: 36px; height: 36px;
            background: linear-gradient(135deg, #10B981, #059669);
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            border: 2.5px solid #FFFFFF;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
            cursor: pointer;
            transition: transform 0.2s ease;
          ">
            <span style="font-size: 18px;">♻️</span>
          </div>
        `;

        const icon = L.divIcon({
          html: markerHtml,
          className: `point-marker-${point.id}`,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const marker = L.marker([point.latitude, point.longitude], { icon })
          .addTo(map)
          .bindPopup(balloonPopupHtml, {
            offset: [0, -14],
            closeButton: false,
            className: 'custom-balloon-popup',
          });

        marker.on('click', () => {
          if (onSelectPoint) onSelectPoint(point);
        });

        markersRef.current.push(marker);
      });
    });
  }, [userLatitude, userLongitude, points]);

  return (
    <View style={styles.container}>
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      />
      {loading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#10B981" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#0F172A',
    overflow: 'hidden',
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MapComponent;
