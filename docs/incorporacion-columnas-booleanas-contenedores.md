# Incorporación de Columnas Booleanas de Contenedores a la Tabla `collection_points`

Este documento detalla la modificación realizada en el esquema de la base de datos y en los scripts de migración/semilla para incluir directamente las 9 columnas booleanas de contenedores en la tabla `collection_points`.

---

## 📋 Descripción del Cambio

Para atender el requerimiento explícito de visualizar y consultar directamente los valores `true`/`false` de cada tipo de contenedor dentro de la tabla `collection_points` en Supabase (tal como vienen estructurados en los archivos CSV), se agregaron las siguientes 9 columnas booleanas:

1. `contenedor_papel` (`BOOLEAN DEFAULT false`)
2. `contenedor_carton` (`BOOLEAN DEFAULT false`)
3. `contenedor_plastico` (`BOOLEAN DEFAULT false`)
4. `contenedor_vidrio` (`BOOLEAN DEFAULT false`)
5. `contenedor_metales` (`BOOLEAN DEFAULT false`)
6. `contenedor_aceite` (`BOOLEAN DEFAULT false`)
7. `contenedor_pilas_y_accesorios` (`BOOLEAN DEFAULT false`)
8. `contenedor_electrodomesticos_medianos` (`BOOLEAN DEFAULT false`)
9. `contenedor_medicinas` (`BOOLEAN DEFAULT false`)

---

## 🛠️ Archivos Modificados

### 1. Migración SQL `supabase/migrations/0006_add_container_boolean_columns.sql`
Se creó una nueva migración para alterar la tabla existente `collection_points` agregando las 9 columnas booleanas con valor por defecto `false`.

### 2. Esquema Inicial `supabase/migrations/0001_init_schema.sql`
Se actualizó la definición del `CREATE TABLE IF NOT EXISTS public.collection_points` para incluir estas 9 columnas desde el inicio en nuevas instancias de base de datos.

### 3. Script de Generación `utils/upload-points.js`
Se modificó el script Node.js para:
- Extraer los valores booleanos (`true`/`false`) de cada fila de los CSV para los 9 tipos de contenedores.
- Incluir las 9 columnas en la sentencia `INSERT INTO public.collection_points (... VALUES ...)` del archivo SQL autogenerado.
- Incluir las 9 columnas en la inserción directa mediante el cliente `@supabase/supabase-js`.

### 4. Archivo Semilla `supabase/seed_collection_points.sql`
Se regeneró automáticamente el script SQL. Ahora cada sentencia `INSERT INTO public.collection_points` especifica explícitamente los valores `true` o `false` para los 9 tipos de contenedores por cada uno de los 48 puntos de acopio de Lima (Miraflores, San Borja y San Isidro).

---

## 🚀 Cómo Aplicar los Cambios en Supabase

1. Abre tu **Dashboard de Supabase** -> Ve al **SQL Editor**.
2. Copia y pega el contenido actualizado de [seed_collection_points.sql](../../supabase/seed_collection_points.sql).
3. Haz clic en **Run**.
4. ¡Listo! Al abrir la tabla `collection_points` en el **Table Editor** de Supabase, verás las 9 columnas booleanas con sus respectivos valores `true` y `false` para cada punto de acopio.
