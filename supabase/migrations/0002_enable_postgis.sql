-- Migration 0002: Enable PostGIS Extension and Spatial Column for Collection Points

-- 1. Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;

-- 2. Add PostGIS geography column (SRID 4326 for global WGS84 lat/lng coordinates)
ALTER TABLE public.collection_points 
ADD COLUMN IF NOT EXISTS location GEOGRAPHY(POINT, 4326);

-- 3. Populate existing coordinates into the geography column
UPDATE public.collection_points
SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
WHERE location IS NULL AND latitude IS NOT NULL AND longitude IS NOT NULL;

-- 4. Create trigger to automatically maintain geography column on INSERT or UPDATE
CREATE OR REPLACE FUNCTION public.update_collection_point_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_update_collection_point_location
  BEFORE INSERT OR UPDATE OF latitude, longitude ON public.collection_points
  FOR EACH ROW EXECUTE FUNCTION public.update_collection_point_location();

-- 5. Create Spatial GIST Index for ultra-fast spatial querying
CREATE INDEX IF NOT EXISTS idx_collection_points_location 
ON public.collection_points USING GIST (location);
