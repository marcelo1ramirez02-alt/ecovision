# Solución a Error TypeError Mapbox (`fog.js`) y Configuración RLS de Supabase

Este documento detalla la corrección de dos aspectos críticos para la renderización fluida de los puntos de acopio (viñetas) en la versión Web:

---

## 1. Solución al TypeError de Mapbox GL JS (`fog.js`)

### Descripción del Sintoma
Al instanciar marcadores (`mapboxgl.Marker().addTo(map)`), se producía la siguiente excepción no capturada en la consola:
`Uncaught TypeError: Cannot read properties of undefined (reading 'get') at fog.js:61`

### Causa Raíz
Los marcadores HTML se estaban agregando al objeto `map` antes de que el estilo vectorial (`mapboxgl.Map` dark-v11) completase su carga inicial (`style.load`). Al intentar evaluar la opacidad de la niebla (`_queryFogOpacity`), las estructuras internas de Mapbox aún no existían.

### Modificación Aplicada en [`components/map/Map.web.tsx`](file:///d:/IEEE%20CIS%20UNI%20Ecovision/components/map/Map.web.tsx)
- Se encapsuló la renderización de marcadores dentro de la función `renderMarkers()`.
- Se añadió una verificación condicional: si el estilo no ha terminado de cargar (`map.isStyleLoaded()`), se suscribe a `map.once('style.load', renderMarkers)`.
- Se envolvieron las llamadas `marker.addTo(map)` en bloques `try/catch` defensivos.

---

## 2. Solución al Conteo de 0 Registros (`Puntos de acopio obtenidos: 0`)

### Causa Raíz
Cuando la tabla `collection_points` posee **Row Level Security (RLS)** activado en Supabase sin una política pública `SELECT USING (true)`, PostgREST bloquea la consulta anónima y devuelve silenciosamente `0` filas (`[]`).

### Sentencia SQL para Resolver en Supabase (SQL Editor)

Ejecuta el siguiente bloque SQL en el **SQL Editor** de Supabase para activar la lectura pública en la tabla `collection_points`:

```sql
-- Activar RLS y permitir lectura pública para todos los usuarios
ALTER TABLE public.collection_points ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Collection points viewable by anyone" ON public.collection_points;
DROP POLICY IF EXISTS "Allow public select on collection_points" ON public.collection_points;

CREATE POLICY "Allow public select on collection_points" 
  ON public.collection_points 
  FOR SELECT 
  TO public 
  USING (true);
```

Al ejecutar esta sentencia y refrescar la página, Supabase devolverá los 13 registros de San Borja y San Isidro, los cuales se posicionarán automáticamente como viñetas en el mapa.
