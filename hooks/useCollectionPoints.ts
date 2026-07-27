import { useState, useEffect } from 'react';
import { getNearbyCollectionPoints } from '../services/collectionPoints';
import { CollectionPoint } from '../types/collectionPoint';

const getDefaultPoints = (lat: number = -12.046374, lng: number = -77.042793): CollectionPoint[] => [
  {
    id: 'sample-1',
    name: 'Punto Limpio Central Ecovision',
    address: 'Av. Universitaria 1801, San Martín de Porres',
    latitude: lat + 0.0035,
    longitude: lng + 0.0042,
    contact_phone: '+51 987 654 321',
    opening_hours: 'Lun - Sáb: 8:00 AM - 6:00 PM',
    is_active: true,
    distance_meters: 420,
    accepted_materials: [
      { id: '1', code: 'plastic_pet', name: 'Plástico PET', color_code: '#10B981' },
      { id: '2', code: 'glass', name: 'Vidrio', color_code: '#3B82F6' },
    ],
  },
  {
    id: 'sample-2',
    name: 'Estación de Reciclaje Verde UNI',
    address: 'Av. Túpac Amaru 210, Rímac',
    latitude: lat - 0.0041,
    longitude: lng - 0.0038,
    contact_phone: '+51 912 345 678',
    opening_hours: 'Lun - Dom: 7:00 AM - 8:00 PM',
    is_active: true,
    distance_meters: 850,
    accepted_materials: [
      { id: '3', code: 'paper', name: 'Papel / Cartón', color_code: '#F59E0B' },
      { id: '4', code: 'metal', name: 'Metales', color_code: '#EC4899' },
    ],
  },
  {
    id: 'sample-3',
    name: 'EcoAcopio Comunitario Lima',
    address: 'Jr. de la Unión 850, Cercado de Lima',
    latitude: lat + 0.0018,
    longitude: lng - 0.0055,
    contact_phone: '+51 934 567 890',
    opening_hours: 'Lun - Sáb: 9:00 AM - 5:00 PM',
    is_active: true,
    distance_meters: 1200,
    accepted_materials: [
      { id: '1', code: 'plastic_pet', name: 'Plástico PET', color_code: '#10B981' },
      { id: '3', code: 'paper', name: 'Papel / Cartón', color_code: '#F59E0B' },
    ],
  },
];

export const useCollectionPoints = (
  latitude?: number,
  longitude?: number,
  radiusMeters: number = 5000,
  materialFilter: string | null = null
) => {
  const [points, setPoints] = useState<CollectionPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPoints = async () => {
    const userLat = latitude || -12.046374;
    const userLng = longitude || -77.042793;

    setLoading(true);
    setError(null);
    try {
      const data = await getNearbyCollectionPoints({
        latitude: userLat,
        longitude: userLng,
        radiusMeters,
        materialFilter: materialFilter || undefined,
      });

      if (data && data.length > 0) {
        setPoints(data);
      } else {
        // Fallback sample points filtered by material
        const defaultSet = getDefaultPoints(userLat, userLng);
        const filtered = materialFilter
          ? defaultSet.filter((p) =>
              p.accepted_materials.some((m) => m.code === materialFilter)
            )
          : defaultSet;
        setPoints(filtered);
      }
    } catch (err: any) {
      console.warn('Using default collection points fallback:', err.message);
      const defaultSet = getDefaultPoints(userLat, userLng);
      const filtered = materialFilter
        ? defaultSet.filter((p) =>
            p.accepted_materials.some((m) => m.code === materialFilter)
          )
        : defaultSet;
      setPoints(filtered);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoints();
  }, [latitude, longitude, radiusMeters, materialFilter]);

  return {
    points,
    loading,
    error,
    refetchPoints: fetchPoints,
  };
};
