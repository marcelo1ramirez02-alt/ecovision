# Diagnóstico y Ajuste de Política de Seguridad (RLS) para Visualización de Viñetas

Este documento describe la verificación realizada para asegurar la visualización inmediata de los puntos de acopio (viñetas) en el mapa y la resolución de posibles bloqueos por Políticas de Seguridad a Nivel de Fila (RLS) en Supabase.

---

## 1. Causa de Viñetas Invisibles en el Mapa

Cuando la tabla `collection_points` se crea o reemplaza en Supabase sin la columna `is_active`, las políticas RLS existentes que contienen `USING (is_active = true)` bloquean silenciosamente la lectura pública de las filas, retornando `0` registros (`[]`) cuando la aplicación consulta Supabase con la clave pública anónima.

---

## 2. Script SQL Recomendado para Habilitar Lectura Pública

Para asegurar que los 13 puntos de acopio recien subidos (San Borja y San Isidro) se puedan leer públicamente por cualquier usuario desde el mapa, se debe ejecutar la siguiente sentencia en el **SQL Editor** del Dashboard de Supabase:

```sql
-- Habilitar RLS y otorgar lectura pública a la tabla collection_points
ALTER TABLE public.collection_points ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Collection points viewable by anyone" ON public.collection_points;
DROP POLICY IF EXISTS "Allow public select on collection_points" ON public.collection_points;

CREATE POLICY "Allow public select on collection_points" 
  ON public.collection_points 
  FOR SELECT 
  TO public 
  USING (true);
```

---

## 3. Cambios Implementados en la Aplicación

1. **Diagnóstico en Consola**: Se agregó un `console.log('[Ecovision Supabase] Puntos de acopio obtenidos:')` en [`services/collectionPoints.ts`](file:///d:/IEEE%20CIS%20UNI%20Ecovision/services/collectionPoints.ts) para inspeccionar la cantidad exacta de registros recuperados.
2. **Validación de Coordenadas**: Se incluyó una verificación defensiva `Number.isFinite(lat) && Number.isFinite(lng)` en [`components/map/Map.web.tsx`](file:///d:/IEEE%20CIS%20UNI%20Ecovision/components/map/Map.web.tsx) para evitar que valores nulos impidan la renderización del marcador DOM de Mapbox.
