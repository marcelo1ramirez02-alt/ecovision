import { supabase } from './supabase';
import { CollectionPoint, NearbyQueryParams } from '../types/collectionPoint';

/**
 * Direct spatial query calling the PostGIS RPC function 'find_nearby_points'
 */
export const getNearbyCollectionPoints = async (
  params: NearbyQueryParams
): Promise<CollectionPoint[]> => {
  const { latitude, longitude, radiusMeters = 5000, materialFilter = null } = params;

  const { data, error } = await supabase.rpc('find_nearby_points', {
    user_lat: latitude,
    user_lng: longitude,
    radius_meters: radiusMeters,
    material_filter: materialFilter,
  });

  if (error) {
    console.error('RPC find_nearby_points error:', error);
    throw new Error(`Failed to fetch nearby points: ${error.message}`);
  }

  return (data || []).map((item: any) => ({
    id: item.id,
    name: item.name,
    address: item.address,
    latitude: item.latitude,
    longitude: item.longitude,
    contact_phone: item.contact_phone,
    opening_hours: item.opening_hours,
    is_active: true,
    distance_meters: item.distance_meters,
    accepted_materials: item.accepted_materials || [],
  }));
};

/**
 * Admin action to create/update points via manage-collection-points Edge Function
 */
export const manageCollectionPointAdmin = async (
  action: 'create' | 'update' | 'delete',
  payload: { pointData?: Partial<CollectionPoint>; pointId?: string; materialIds?: string[] }
) => {
  const { data, error } = await supabase.functions.invoke('manage-collection-points', {
    body: {
      action,
      ...payload,
    },
  });

  if (error) {
    throw new Error(`Admin manage point failed: ${error.message}`);
  }

  return data;
};
