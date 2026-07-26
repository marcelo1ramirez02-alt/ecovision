-- Migration 0003: PostGIS RPC function to search nearby collection points

CREATE OR REPLACE FUNCTION public.find_nearby_points(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_meters DOUBLE PRECISION DEFAULT 5000.0,
  material_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  contact_phone TEXT,
  opening_hours TEXT,
  distance_meters DOUBLE PRECISION,
  accepted_materials JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_point extensions.geography;
BEGIN
  -- Construct spatial geography point for the user position
  user_point := extensions.ST_SetSRID(extensions.ST_MakePoint(user_lng, user_lat), 4326)::extensions.geography;

  RETURN QUERY
  SELECT 
    cp.id,
    cp.name,
    cp.address,
    cp.latitude,
    cp.longitude,
    cp.contact_phone,
    cp.opening_hours,
    extensions.ST_Distance(cp.location, user_point) AS distance_meters,
    COALESCE(
      (
        SELECT jsonb_agg(jsonb_build_object(
          'id', m.id,
          'code', m.code,
          'name', m.name,
          'color_code', m.color_code
        ))
        FROM public.point_materials pm
        JOIN public.materials m ON m.id = pm.material_id
        WHERE pm.point_id = cp.id
      ),
      '[]'::jsonb
    ) AS accepted_materials
  FROM public.collection_points cp
  WHERE cp.is_active = true
    AND extensions.ST_DWithin(cp.location, user_point, radius_meters)
    AND (
      material_filter IS NULL 
      OR EXISTS (
        SELECT 1 
        FROM public.point_materials pm2
        JOIN public.materials m2 ON m2.id = pm2.material_id
        WHERE pm2.point_id = cp.id AND m2.code = material_filter
      )
    )
  ORDER BY distance_meters ASC;
END;
$$;
