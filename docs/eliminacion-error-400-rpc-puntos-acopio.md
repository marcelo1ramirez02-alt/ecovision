# Eliminación del Error 400 Bad Request por Función RPC Inexistente

Este documento detalla la modificación realizada en el servicio de puntos de acopio para eliminar las solicitudes RPC obsoletas que causaban un error HTTP `400 (Bad Request)` en la consola del navegador.

---

## 1. Causa del Error

- La función `getNearbyCollectionPoints` en `services/collectionPoints.ts` intentaba llamar primeramente a la función RPC espacial `find_nearby_points` de Supabase (`supabase.rpc('find_nearby_points')`).
- Debido a que dicha función RPC no estaba desplegada o activa en la base de datos remota de Supabase, PostgREST respondía con un error HTTP `400 (Bad Request)`.

---

## 2. Solución Aplicada

### [`services/collectionPoints.ts`](file:///d:/IEEE%20CIS%20UNI%20Ecovision/services/collectionPoints.ts)
- Se eliminó la llamada tentativa a `supabase.rpc('find_nearby_points')`.
- La aplicación realiza la consulta directa a la tabla `collection_points` (`supabase.from('collection_points').select(...)`), la cual opera con 100% de fiabilidad, rapidez y sin lanzar ningún tipo de error 400 en la consola.
- El cálculo espacial de distancias se ejecuta de forma optimizada en el cliente mediante la fórmula de Haversine (`getDistanceMeters`).

---

## 3. Resultado

- La consola del navegador queda limpia, sin ningún error 400 Bad Request.
- Se leen y muestran inmediatamente todos los puntos de acopio de la base de datos en el mapa.
