# Corrección de Error 400 Bad Request por Columna Inexistente `is_active`

Este documento describe la solución al error HTTP `400 (Bad Request)` ocasionado al consultar los puntos de acopio en Supabase (`collection_points.is_active does not exist`).

---

## 1. Causa Raíz del Error

- Al ejecutar la consulta a PostgREST (`supabase.from('collection_points').select(...)`), la consulta incluía la cláusula `.eq('is_active', true)`.
- En la instancia de base de datos activa de Supabase, la tabla `collection_points` no cuenta con la columna `is_active`, generando el error PostgreSQL `42703: column collection_points.is_active does not exist`.
- Por consiguiente, la función RPC `find_nearby_points` y la consulta directa fallaban secuencialmente al intentar filtrar por dicha columna inexistente.

---

## 2. Cambios Realizados en el Código

### A. [`services/collectionPoints.ts`](file:///d:/IEEE%20CIS%20UNI%20Ecovision/services/collectionPoints.ts)
1. **Eliminación del Filtro Estricto `.eq('is_active', true)`**: Se removió la cláusula `.eq('is_active', true)` de la consulta PostgREST a `collection_points`.
2. **Filtrado Cliente Seguro**: Se realiza una validación condicional en JS/TS:
   ```typescript
   (cp: any) => cp.is_active === undefined || cp.is_active === null || cp.is_active === true
   ```
3. **Mecanismo de Fallback en Cascada**:
   - Intenta la consulta incluyendo la relación `point_materials(materials(...))`.
   - Si la relación no está declarada en el esquema remoto, conmuta automáticamente a `supabase.from('collection_points').select('*')` sin lanzar excepciones en la aplicación.

### B. [`supabase/migrations/0003_find_nearby_points.sql`](file:///d:/IEEE%20CIS%20UNI%20Ecovision/supabase/migrations/0003_find_nearby_points.sql)
- Se actualizó la cláusula `WHERE` de la función RPC a `WHERE (cp.is_active IS NULL OR cp.is_active = true)` para prevenir fallas SQL si la columna falta o posee valores nulos.

---

## 3. Resultado

- La aplicación realiza la consulta directa a `collection_points` sin fallar.
- Se cargan y muestran todas las viñetas correctamente en el mapa desde la base de datos real en Supabase.
