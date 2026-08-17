# Estructura de Base de Datos y Filtrado de Contenedores

Este documento explica en detalle el modelo de datos de los puntos de acopio en Supabase/PostgreSQL, cómo se relacionan con los valores `true`/`false` de los archivos CSV originales y cómo se realizan las consultas y filtraciones.

---

## 💡 1. Del CSV Plano a la Base de Datos Relacional

En los archivos CSV originales (`Miraflores`, `San Borja`, `San Isidro`), cada punto de acopio contenía 9 columnas booleanas de contenedores:
`Contenedor_Papel`, `Contenedor_Carton`, `Contenedor_Plastico`, `Contenedor_Vidrio`, `Contenedor_Metales`, `Contenedor_Aceite`, `Contenedor_Pilas_y_Accesorios`, `Contenedor_electrodomesticos_medianos`, `Contenedor_medicinas`.

En el desarrollo de software y bases de datos relacionales (SQL), tener múltiples columnas booleanas directamente en la tabla principal de una entidad se considera un **anti-patrón (desnormalización inflexible)**. 

Por esta razón, la base de datos de **EcoVision AI** utiliza un modelo **Normalizado Muchos a Muchos (Many-to-Many)** estructurado en 3 tablas:

```
+-------------------+       +--------------------+       +-------------------+
| collection_points |       |  point_materials   |       |     materials     |
+-------------------+       +--------------------+       +-------------------+
| id (UUID) PK      |<----->| point_id (UUID) FK |<----->| id (UUID) PK      |
| name              |       | material_id (UUID) |       | code (TEXT)       |
| address           |       +--------------------+       | name (TEXT)       |
| latitude          |                                    | points_per_kg     |
| longitude         |                                    | icon_name         |
| opening_hours     |                                    | color_code        |
| is_active         |                                    +-------------------+
+-------------------+
```

---

## 🔍 2. ¿Dónde se guardaron los valores `TRUE` del CSV?

En el archivo de semilla SQL (`supabase/seed_collection_points.sql`), los valores `TRUE` del CSV se convierten automáticamente en relaciones en la tabla intermedia **`point_materials`**.

### Ejemplo de cómo se guardaron:

Si en el CSV original el "Punto de acopio - Mariano Odicio" tenía:
- `Contenedor_Papel = true`
- `Contenedor_Carton = true`
- `Contenedor_Plastico = true`
- `Contenedor_Vidrio = true`
- `Contenedor_Metales = true`
- `Contenedor_Aceite = false`
- `Contenedor_Pilas_y_Accesorios = false`
- `Contenedor_electrodomesticos_medianos = false`
- `Contenedor_medicinas = false`

En el SQL **NO se guardan los `FALSE`** (ahorrando espacio de almacenamiento). En su lugar, **solo se insertan los `TRUE`** vinculando la tabla `point_materials`:

```sql
-- En supabase/seed_collection_points.sql (Líneas 251-255):
INSERT INTO public.point_materials (point_id, material_id)
SELECT cp.id, m.id
FROM public.collection_points cp, public.materials m
WHERE cp.name = 'Punto de acopio - Mariano Odicio' 
  AND m.code IN ('papel', 'carton', 'plastico', 'vidrio', 'metales');
```

---

## 🎯 3. ¿Cómo se realizan las filtraciones en la Base de Datos?

Con esta arquitectura, filtrar puntos por tipo de material es más rápido, eficiente y flexible.

### Método A: Consulta SQL Directa con JOIN
```sql
SELECT cp.*
FROM public.collection_points cp
JOIN public.point_materials pm ON cp.id = pm.point_id
JOIN public.materials m ON pm.material_id = m.id
WHERE m.code = 'plastico' AND cp.is_active = true;
```

### Método B: Usando la función RPC Geoespacial PostGIS (`find_nearby_points`)
En la migración `0003_find_nearby_points.sql`, la base de datos incluye la función `find_nearby_points` que filtra por ubicación y por código de material:

```js
// Desde la aplicación cliente Supabase JS:
const { data: puntosPlastico, error } = await supabase.rpc('find_nearby_points', {
  user_lat: -12.1218,
  user_lng: -77.0238,
  radius_meters: 5000,
  material_filter: 'plastico' // Filtra solo los puntos donde el material está registrado como TRUE
});
```

### Método C: Consulta en Supabase Client
```js
const { data, error } = await supabase
  .from('collection_points')
  .select(`
    *,
    point_materials!inner(
      materials!inner(code, name)
    )
  `)
  .eq('point_materials.materials.code', 'papel');
```

---

## 🚀 4. Ventajas de esta Arquitectura

1. **Escalabilidad Sin Romper el Esquema**: Si la municipalidad decide agregar una nueva categoría (ej: `Ropa`, `Orgánicos` o `Tetrapack`), **no es necesario agregar columnas a la base de datos**. Basta con agregar una fila a la tabla `materials`.
2. **Eficiencia en Consultas**: Evita procesar columnas booleanas nulas o falsas cuando se consultan miles de puntos geográficos.
3. **Consistencia de Datos**: Evita inconsistencias de nombres entre distritos o archivos CSV.

---

## 📊 5. Vista SQL Opcional (Si deseas ver la tabla estilo CSV)

Si por razones administrativas o de reportería deseas consultar la base de datos con el formato plano exactamente igual al CSV original, puedes ejecutar esta **Vista SQL** en el SQL Editor de Supabase:

```sql
CREATE OR REPLACE VIEW public.v_collection_points_csv AS
SELECT 
  cp.id,
  cp.name,
  cp.address,
  cp.latitude,
  cp.longitude,
  EXISTS (SELECT 1 FROM public.point_materials pm JOIN public.materials m ON m.id = pm.material_id WHERE pm.point_id = cp.id AND m.code = 'papel') AS "Contenedor_Papel",
  EXISTS (SELECT 1 FROM public.point_materials pm JOIN public.materials m ON m.id = pm.material_id WHERE pm.point_id = cp.id AND m.code = 'carton') AS "Contenedor_Carton",
  EXISTS (SELECT 1 FROM public.point_materials pm JOIN public.materials m ON m.id = pm.material_id WHERE pm.point_id = cp.id AND m.code = 'plastico') AS "Contenedor_Plastico",
  EXISTS (SELECT 1 FROM public.point_materials pm JOIN public.materials m ON m.id = pm.material_id WHERE pm.point_id = cp.id AND m.code = 'vidrio') AS "Contenedor_Vidrio",
  EXISTS (SELECT 1 FROM public.point_materials pm JOIN public.materials m ON m.id = pm.material_id WHERE pm.point_id = cp.id AND m.code = 'metales') AS "Contenedor_Metales",
  EXISTS (SELECT 1 FROM public.point_materials pm JOIN public.materials m ON m.id = pm.material_id WHERE pm.point_id = cp.id AND m.code = 'aceite') AS "Contenedor_Aceite",
  EXISTS (SELECT 1 FROM public.point_materials pm JOIN public.materials m ON m.id = pm.material_id WHERE pm.point_id = cp.id AND m.code = 'pilas') AS "Contenedor_Pilas_y_Accesorios",
  EXISTS (SELECT 1 FROM public.point_materials pm JOIN public.materials m ON m.id = pm.material_id WHERE pm.point_id = cp.id AND m.code = 'electrodomesticos') AS "Contenedor_electrodomesticos_medianos",
  EXISTS (SELECT 1 FROM public.point_materials pm JOIN public.materials m ON m.id = pm.material_id WHERE pm.point_id = cp.id AND m.code = 'medicinas') AS "Contenedor_medicinas",
  cp.opening_hours,
  cp.is_active
FROM public.collection_points cp;
```
