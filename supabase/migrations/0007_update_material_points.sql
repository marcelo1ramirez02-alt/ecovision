-- Migration 0007: Update materials table to use fixed points per scanned item (base_points) instead of per kilogram

ALTER TABLE public.materials 
  ADD COLUMN IF NOT EXISTS base_points INT NOT NULL DEFAULT 10;

-- Update fixed points per scanned material type
UPDATE public.materials SET base_points = 10 WHERE code = 'papel';
UPDATE public.materials SET base_points = 12 WHERE code = 'carton';
UPDATE public.materials SET base_points = 15 WHERE code = 'plastico';
UPDATE public.materials SET base_points = 12 WHERE code = 'vidrio';
UPDATE public.materials SET base_points = 20 WHERE code = 'metales';
UPDATE public.materials SET base_points = 25 WHERE code = 'aceite';
UPDATE public.materials SET base_points = 30 WHERE code = 'pilas';
UPDATE public.materials SET base_points = 35 WHERE code = 'electrodomesticos';
UPDATE public.materials SET base_points = 15 WHERE code = 'medicinas';

-- Maintain points_per_kg updated for backwards compatibility if queried
UPDATE public.materials SET points_per_kg = base_points;
