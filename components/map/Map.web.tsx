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
      link.id = 'mapbox-gl-css';
      link.rel = 'stylesheet';
      link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
      document.head.appendChild(link);
    }

    // 2. Load Mapbox GL JS dynamically if not present
    const loadMapboxGL = async () => {
      if ((window as any).mapboxgl) return (window as any).mapboxgl;

      return new Promise((resolve) => {
        if (document.getElementById('mapbox-gl-js')) {
          const interval = setInterval(() => {
            if ((window as any).mapboxgl) {
              clearInterval(interval);
              resolve((window as any).mapboxgl);
            }
          }, 100);
          return;
        }

        const script = document.createElement('script');
        script.id = 'mapbox-gl-js';
        script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
        script.onload = () => resolve((window as any).mapboxgl);
        document.body.appendChild(script);
      });
    };

    loadMapboxGL().then((mapboxgl: any) => {
      if (!mapContainerRef.current) return;

      mapboxgl.accessToken = mapboxToken;

      if (!mapInstanceRef.current) {
        // Initialize official Mapbox GL Vector Map
        const map = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: 'mapbox://styles/mapbox/dark-v11', // Mapbox Dark theme
          center: [userLongitude, userLatitude],
          zoom: 14,
          attributionControl: false,
        });

        // Add Mapbox Navigation Controls
        map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');

        map.on('load', () => {
          setLoading(false);
        });

        mapInstanceRef.current = map;
      } else {
        mapInstanceRef.current.easeTo({
          center: [userLongitude, userLatitude],
          zoom: 14,
        });
      }

      const map = mapInstanceRef.current;

      // Clear previous markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      // Add User Location Pulse Marker (Mapbox GL style)
      const userEl = document.createElement('div');
      userEl.innerHTML = `
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

      const userMarker = new mapboxgl.Marker({ element: userEl })
        .setLngLat([userLongitude, userLatitude])
        .addTo(map);
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

        // Balloon Callout Popup HTML (Globo)
        const balloonPopupHtml = `
          <div style="
            font-family: system-ui, -apple-system, sans-serif;
            background: #0F172A; color: #F8FAFC;
            padding: 12px; border-radius: 16px;
            border: 1.5px solid #10B981;
            box-shadow: 0 10px 25px rgba(0,0,0,0.5);
            min-width: 200px;
          ">
            <div style="display:flex; align-items:center; gap:6px; margin-bottom:6px;">
              <span style="font-size:16px;">♻️</span>
              <strong style="font-size:13px; color:#F8FAFC;">${point.name}</strong>
            </div>
            <div style="font-size:11px; color:#94A3B8; margin-bottom:6px; line-height: 1.4;">
              📍 ${point.address}
            </div>
            ${point.distance_meters
            ? `<div style="font-size:10px; font-weight:700; color:#34D399; margin-bottom:6px;">📏 ${Math.round(
              point.distance_meters
            )}m de distancia</div>`
            : ''
          }
            <div style="display:flex; flex-wrap:wrap; gap:4px; margin-top:6px;">
              ${materialsBadges}
            </div>
          </div>
        `;

        const el = document.createElement('div');
        el.innerHTML = `
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

        // Action when Mapbox GL marker clicked
        el.addEventListener('click', () => {
          if (onSelectPoint) onSelectPoint(point);
        });

        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: false,
          className: 'custom-mapbox-balloon-popup',
        }).setHTML(balloonPopupHtml);

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([point.longitude, point.latitude])
          .setPopup(popup)
          .addTo(map);

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
    paddingBottom: 80, // Leaves vertical space so Mapbox navigation controls don't overlap under floating tab bar
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MapComponent;
