import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import Constants from 'expo-constants';
import { CollectionPoint } from '../../types/collectionPoint';

const mapboxToken =
  process.env.EXPO_PUBLIC_MAPBOX_KEY ||
  Constants.expoConfig?.extra?.mapboxToken ||
  process.env.MAPBOX_ACCESS_TOKEN ||
  '';

const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

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

    // 1. Load Mapbox GL CSS dynamically if not present
    if (!document.getElementById('mapbox-gl-css')) {
      const link = document.createElement('link');
      link.id = 'mapbox-gl-css';
      link.rel = 'stylesheet';
      link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
      document.head.appendChild(link);
    }

    // Inject custom Mapbox popup styling with responsive media queries for mobile devices
    if (!document.getElementById('mapbox-popup-custom-css')) {
      const style = document.createElement('style');
      style.id = 'mapbox-popup-custom-css';
      style.innerHTML = `
        .custom-mapbox-balloon-popup .mapboxgl-popup-content {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
          border: none !important;
        }
        .custom-mapbox-balloon-popup .mapboxgl-popup-tip {
          display: none !important;
        }

        /* Responsive Balloon Card Styles */
        .balloon-card {
          font-family: system-ui, -apple-system, sans-serif;
          background: #1E293B;
          color: #F8FAFC;
          border: 1.5px solid #10B981;
          box-shadow: 0 8px 20px rgba(0,0,0,0.5);
          border-radius: 16px;
          padding: 12px 14px;
          min-width: 190px;
          max-width: 240px;
          transition: all 0.2s ease;
        }
        .balloon-title-row {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 6px;
        }
        .balloon-title {
          font-size: 13px;
          color: #F8FAFC;
          font-weight: 700;
        }
        .balloon-address {
          font-size: 11px;
          color: #94A3B8;
          margin-bottom: 6px;
          line-height: 1.4;
        }
        .balloon-distance {
          font-size: 10px;
          font-weight: 700;
          color: #34D399;
          margin-bottom: 6px;
        }
        .balloon-badge-row {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-top: 6px;
        }
        .balloon-badge {
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 8px;
        }

        /* Mobile Viewport Breakpoint (< 480px width) */
        @media (max-width: 480px) {
          .balloon-card {
            padding: 8px 10px;
            min-width: 140px;
            max-width: 165px;
            border-radius: 12px;
            border-width: 1px;
          }
          .balloon-title {
            font-size: 11px;
          }
          .balloon-address {
            font-size: 9px;
            margin-bottom: 4px;
            line-height: 1.2;
          }
          .balloon-distance {
            font-size: 8.5px;
            margin-bottom: 4px;
          }
          .balloon-badge {
            font-size: 8px;
            padding: 1px 4px;
            border-radius: 6px;
          }
        }
      `;
      document.head.appendChild(style);
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

      const calculateMapBounds = (
        userLat: number,
        userLng: number,
        pointsList: CollectionPoint[]
      ) => {
        const pointsWithin5Km = pointsList.filter(
          (p) => getDistanceKm(userLat, userLng, p.latitude, p.longitude) <= 5
        );

        const latDelta = 5 / 111.32;
        const lngDelta = 5 / (111.32 * Math.cos((userLat * Math.PI) / 180));

        let minLat = userLat - latDelta;
        let maxLat = userLat + latDelta;
        let minLng = userLng - lngDelta;
        let maxLng = userLng + lngDelta;

        if (pointsWithin5Km.length > 0) {
          // Case 1: Points exist within 5km -> Frame 5km radius around user + all nearby points
          pointsWithin5Km.forEach((p) => {
            minLat = Math.min(minLat, p.latitude);
            maxLat = Math.max(maxLat, p.latitude);
            minLng = Math.min(minLng, p.longitude);
            maxLng = Math.max(maxLng, p.longitude);
          });
        } else if (pointsList.length > 0) {
          // Case 2: No points within 5km -> Zoom out to include user + collection points
          minLat = userLat;
          maxLat = userLat;
          minLng = userLng;
          maxLng = userLng;
          pointsList.forEach((p) => {
            minLat = Math.min(minLat, p.latitude);
            maxLat = Math.max(maxLat, p.latitude);
            minLng = Math.min(minLng, p.longitude);
            maxLng = Math.max(maxLng, p.longitude);
          });
        }

        return {
          sw: [minLng, minLat] as [number, number],
          ne: [maxLng, maxLat] as [number, number],
        };
      };

      const fitMapBounds = (targetMap: any) => {
        const { sw, ne } = calculateMapBounds(userLatitude, userLongitude, points);
        const bounds = new mapboxgl.LngLatBounds(sw, ne);
        targetMap.fitBounds(bounds, {
          padding: { top: 50, bottom: 150, left: 50, right: 50 },
          maxZoom: 15,
          duration: 1000,
        });
      };

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
          fitMapBounds(map);
        });

        mapInstanceRef.current = map;
      } else {
        fitMapBounds(mapInstanceRef.current);
      }

      const map = mapInstanceRef.current;

      const renderMarkers = () => {
        if (!map) return;

        // Clear previous markers
        markersRef.current.forEach((m) => {
          try { m.remove(); } catch (e) {}
        });
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

        try {
          const userMarker = new mapboxgl.Marker({ element: userEl })
            .setLngLat([userLongitude, userLatitude])
            .addTo(map);
          markersRef.current.push(userMarker);
        } catch (e) {
          console.warn('Could not add user marker:', e);
        }

        const isMobile = window.innerWidth < 250;

        // Add Collection Points Markers with Balloon Callouts (Globo)
        points.forEach((point) => {
          const lat = Number(point.latitude);
          const lng = Number(point.longitude);
          if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) return;

          const materialsBadges = (point.accepted_materials || [])
            .map(
              (m) =>
                `<span class="balloon-badge" style="
                  background: ${m.color_code || '#10B981'}20;
                  color: ${m.color_code || '#10B981'};
                  border: 1px solid ${m.color_code || '#10B981'}50;
                  margin-right: 4px;
                ">${m.name}</span>`
            )
            .join('');

          const balloonPopupHtml = `
            <div class="balloon-card">
              <div class="balloon-title-row">
                <span style="font-size:14px;">♻️</span>
                <strong class="balloon-title">${point.name}</strong>
              </div>
              <div class="balloon-address">
                📍 ${point.address || 'San Borja / San Isidro'}
              </div>
              ${
                point.distance_meters
                  ? `<div class="balloon-distance">📏 ${Math.round(
                      point.distance_meters
                    )}m de distancia</div>`
                  : ''
              }
              <div class="balloon-badge-row">
                ${materialsBadges}
              </div>
            </div>
          `;

          const el = document.createElement('div');
          el.className = 'collection-point-marker-pin';
          el.style.width = '36px';
          el.style.height = '36px';
          el.style.cursor = 'pointer';
          el.innerHTML = `
            <div style="
              width: 36px; height: 36px;
              background: linear-gradient(135deg, #10B981, #059669);
              border-radius: 50%;
              display: flex; align-items: center; justify-content: center;
              border: 2.5px solid #FFFFFF;
              box-shadow: 0 4px 14px rgba(16, 185, 129, 0.6);
              cursor: pointer;
              transition: transform 0.2s ease;
            ">
              <span style="font-size: 18px; line-height: 1;">♻️</span>
            </div>
          `;

          el.addEventListener('click', () => {
            if (onSelectPoint) onSelectPoint(point);
          });

          try {
            const marker = new mapboxgl.Marker({ element: el })
              .setLngLat([lng, lat]);

            if (!isMobile) {
              const popup = new mapboxgl.Popup({
                offset: 25,
                closeButton: false,
                className: 'custom-mapbox-balloon-popup',
              }).setHTML(balloonPopupHtml);
              marker.setPopup(popup);
            }

            marker.addTo(map);
            markersRef.current.push(marker);
          } catch (err) {
            console.warn('Error adding marker for point:', point.name, err);
          }
        });
      };

      const isStyleLoaded = typeof map.isStyleLoaded === 'function' ? map.isStyleLoaded() : true;
      if (isStyleLoaded) {
        renderMarkers();
      } else {
        map.once('style.load', renderMarkers);
      }
    });
  }, [userLatitude, userLongitude, points]);

  return (
    <View style={styles.container}>
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: 'calc(100% - 80px)',
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
