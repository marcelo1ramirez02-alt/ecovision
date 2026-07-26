import * as Location from 'expo-location';

export interface UserCoordinates {
  latitude: number;
  longitude: number;
}

export const requestLocationPermissions = async (): Promise<boolean> => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
};

export const getCurrentUserLocation = async (): Promise<UserCoordinates | null> => {
  const hasPermission = await requestLocationPermissions();
  if (!hasPermission) {
    return null;
  }

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
};
