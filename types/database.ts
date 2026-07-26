export type UserRole = 'user' | 'admin' | 'collector';

export interface Profile {
  id: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
  role: UserRole;
  eco_points: number;
  created_at: string;
  updated_at: string;
}

export interface Material {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  points_per_kg: number;
  icon_name?: string | null;
  color_code?: string | null;
  created_at: string;
}

export interface PointMaterial {
  point_id: string;
  material_id: string;
}

export interface PushToken {
  id: string;
  user_id: string;
  expo_push_token: string;
  device_type?: string | null;
  updated_at: string;
}
