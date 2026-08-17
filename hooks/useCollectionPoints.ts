import { useState, useEffect } from 'react';
import { getNearbyCollectionPoints } from '../services/collectionPoints';
import { CollectionPoint } from '../types/collectionPoint';

export const useCollectionPoints = (
  latitude?: number,
  longitude?: number,
  radiusMeters: number = 50000,
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

      setPoints(data || []);
    } catch (err: any) {
      console.error('Error fetching collection points from database:', err.message);
      setError(err.message || 'Error al obtener puntos de acopio de la base de datos');
      setPoints([]);
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

