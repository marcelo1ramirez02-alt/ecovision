import { useState, useEffect } from 'react';
import { getNearbyCollectionPoints } from '../services/collectionPoints';
import { CollectionPoint } from '../types/collectionPoint';

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
    if (!latitude || !longitude) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getNearbyCollectionPoints({
        latitude,
        longitude,
        radiusMeters,
        materialFilter: materialFilter || undefined,
      });
      setPoints(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load collection points');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (latitude && longitude) {
      fetchPoints();
    }
  }, [latitude, longitude, radiusMeters, materialFilter]);

  return {
    points,
    loading,
    error,
    refetchPoints: fetchPoints,
  };
};
