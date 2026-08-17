# Sincronización de Ubicaciones con Base de Datos y Eliminación de JSON Estático

Este documento describe la actualización implementada para sincronizar dinámicamente los puntos de acopio (viñetas) directamente desde la base de datos de Supabase y eliminar por completo los datos estáticos de prueba (JSON/mock estático).

---

## 1. Resumen de Cambios

- **Eliminación de Datos Estáticos (JSON Mock):** Se eliminó la función `getDefaultPoints` y los objetos mock estáticos (`sample-1`, `sample-2`, `sample-3`) del hook `useCollectionPoints.ts`.
- **Sincronización Directa con la Base de Datos:** Se implementó una consulta robusta en el servicio `services/collectionPoints.ts` que obtiene los puntos directamente desde Supabase (`collection_points` y función RPC PostGIS `find_nearby_points`).
- **Mapeo Inteligente de Materiales:** Se agregó soporte para derivar los materiales aceptados tanto de la tabla de unión `point_materials` como de las columnas booleanas de contenedores (`contenedor_papel`, `contenedor_plastico`, `contenedor_vidrio`, etc.) creadas en las migraciones de la base de datos.
- **Visualización Completa en el Mapa:** Se ampliaron los límites de búsqueda por defecto a 50 km y se ajustó el encuadre dinámico (`fitBounds`) en `components/map/Map.web.tsx` y `components/map/Map.native.tsx` para posicionar y enmarcar adecuadamente todas las viñetas reales de la base de datos.

---

## 2. Archivos Modificados

### A. `services/collectionPoints.ts`
- Se implementó la función de cálculo de distancia espacial `getDistanceMeters` mediante la fórmula de Haversine.
- Se configuró la derivación automática de materiales (`deriveMaterialsFromPoint`) que mapea las banderas booleanas de la tabla `collection_points` cuando la relación en `point_materials` no está vinculada.
- Se estructuró una estrategia de consulta resiliente:
  1. Llama primero a la función RPC PostGIS `find_nearby_points`.
  2. Si la función RPC falla o no retorna datos por rango, consulta directamente a la tabla `collection_points` unida con `point_materials` y `materials`.
- Se añadieron filtros por código de material y ordenamiento por distancia ascendente respecto a la ubicación GPS del usuario.

### B. `hooks/useCollectionPoints.ts`
- **Descarte del JSON Estático:** Se borró la función `getDefaultPoints`.
- Si la consulta a la base de datos no retorna puntos o arroja un error, el hook responde con un arreglo vacío `[]` y registra el error formalmente en el estado `error`.
- Se incrementó el radio predeterminado de búsqueda a 50,000 metros (50 km) para incluir los puntos de acopio de la base de datos registrados en toda la ciudad.

### C. `app/(tabs)/map.tsx`
- Se vinculó el estado de carga `pointsLoading` al indicador general de la pantalla para evitar saltos visuales durante la carga de las viñetas desde Supabase.
- Se actualizó el llamado a `useCollectionPoints` utilizando un radio amplio (50 km) para sincronizar todos los puntos de la zona.

### D. `components/map/Map.web.tsx` y `components/map/Map.native.tsx`
- Se ajustó la función de encuadre `fitMapBounds` para calcular los límites de la cámara considerando la totalidad de las viñetas devueltas por la base de datos.
- Se garantiza la colocación precisa de los marcadores en las coordenadas `[longitude, latitude]` leídas de Supabase.

---

## 3. Verificación Realizada

- **Verificación de Tipado estático (TypeScript):** Se ejecutó `npx tsc --noEmit` confirmando 0 errores en la compilación.
- **Comprobación de la Base de Datos:** Los datos se obtienen en tiempo real desde la tabla `collection_points` en Supabase y sus viñetas correspondientes se renderizan adecuadamente en el mapa.
