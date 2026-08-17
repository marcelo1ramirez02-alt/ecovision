-- Migration 0006: Add direct boolean container columns to collection_points table matching exact CSV header names

ALTER TABLE public.collection_points
  ADD COLUMN IF NOT EXISTS "Contenedor_Papel" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "Contenedor_Carton" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "Contenedor_Plastico" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "Contenedor_Vidrio" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "Contenedor_Metales" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "Contenedor_Aceite" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "Contenedor_Pilas_y_Accesorios" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "Contenedor_electrodomesticos_medianos" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "Contenedor_medicinas" BOOLEAN NOT NULL DEFAULT false;

-- Also maintain lowercase aliases if needed
ALTER TABLE public.collection_points
  ADD COLUMN IF NOT EXISTS contenedor_papel BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS contenedor_carton BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS contenedor_plastico BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS contenedor_vidrio BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS contenedor_metales BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS contenedor_aceite BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS contenedor_pilas_y_accesorios BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS contenedor_electrodomesticos_medianos BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS contenedor_medicinas BOOLEAN NOT NULL DEFAULT false;
