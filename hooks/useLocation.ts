import { useState, useEffect } from 'react';
import { getCurrentUserLocation, UserCoordinates } from '../services/location';

export const useLocation = () => {
  const [location, setLocation] = useState<UserCoordinates | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchLocation = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const coords = await getCurrentUserLocation();
      if (coords) {
        setLocation(coords);
      } else {
        setErrorMsg('Location permission denied or unavailable');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error fetching location');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  return {
    location,
    loading,
    errorMsg,
    refetchLocation: fetchLocation,
  };
};
