import { Material } from './database';

export interface CollectionPoint {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  contact_phone?: string | null;
  opening_hours?: string | null;
  is_active: boolean;
  distance_meters?: number;
  accepted_materials?: Partial<Material>[];
  created_at?: string;
  updated_at?: string;
}

export interface NearbyQueryParams {
  latitude: number;
  longitude: number;
  radiusMeters?: number;
  materialFilter?: string;
}
