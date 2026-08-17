# Remoción del Campo `is_active` en Puntos de Acopio

Este documento detalla los cambios realizados para eliminar la dependencia del atributo y campo `is_active` en la estructura de puntos de acopio, considerando que todos los puntos de acopio están activos por definición en el sistema.

---

## 1. Justificación

Dado que todos los puntos de acopio registrados en el sistema están activos de manera permanente, el campo `is_active` resultaba innecesario y causaba incompatibilidades con la estructura existente en Supabase.

---

## 2. Modificaciones Realizadas

### A. [`types/collectionPoint.ts`](file:///d:/IEEE%20CIS%20UNI%20Ecovision/types/collectionPoint.ts)
- Se marcó `is_active` como atributo opcional (`is_active?: boolean;`) en la interfaz TypeScript `CollectionPoint`.

### B. [`services/collectionPoints.ts`](file:///d:/IEEE%20CIS%20UNI%20Ecovision/services/collectionPoints.ts)
- Se removió cualquier asignación o filtro estricto por `is_active` tanto en el mapeo de la función RPC como en la consulta directa a la tabla `collection_points`.

### C. [`supabase/functions/manage-collection-points/index.ts`](file:///d:/IEEE%20CIS%20UNI%20Ecovision/supabase/functions/manage-collection-points/index.ts)
- Se eliminó `is_active` de la inserción de nuevos puntos de acopio en la Edge Function de administración.

### D. [`supabase/migrations/0003_find_nearby_points.sql`](file:///d:/IEEE%20CIS%20UNI%20Ecovision/supabase/migrations/0003_find_nearby_points.sql)
- Se actualizó la función PostGIS RPC retirando la cláusula `WHERE cp.is_active = true`.

---

## 3. Verificación

- Todos los puntos de acopio de la base de datos se obtienen sin ningún filtro de estado.
- Se eliminaron completamente las fallas `400 Bad Request` por columna no encontrada en PostgREST.
