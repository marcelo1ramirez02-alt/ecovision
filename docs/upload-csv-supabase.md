# Carga de Puntos de Acopio desde CSV a Supabase

Este documento detalla la solución implementada para procesar los tres archivos CSV de puntos de acopio (Miraflores, San Borja y San Isidro), normalizar sus geolocalizaciones e integrarlos con Supabase y el mapa de Mapbox.

---

## 📋 Descripción y Contexto

Se requería cargar la base de datos de geolocalización y ubicaciones en Supabase para que sean consumidas por la aplicación móvil y web mediante Mapbox. Los datos de entrada consisten en tres archivos CSV:
1. `Puntos de acopio - Miraflores - Hoja 1.csv`
2. `Puntos de Acopio San borja - Hoja 1.csv`
3. `Puntos de acopio - San Isidro - Hoja 1.csv`

### 🔧 Algoritmo de Normalización de Coordenadas
Las coordenadas de latitud y longitud en los archivos CSV originales no tenían punto decimal (ej: `-1212184995486730` y `-7702385600363900`). El script de procesamiento implementa una limpieza que:
- Remueve todo carácter no numérico excepto el signo menos (`-`).
- Inyecta el punto decimal exactamente después de los dos primeros dígitos de la latitud y longitud (quedando como `-12.12184995486730` y `-77.02385600363900`), garantizando la precisión geográfica en Lima.

### ♻️ Catálogo Estricto de Materiales (9 Categorías)
De acuerdo con las instrucciones de mantener estrictamente las categorías presentes en los CSV, se definió e insertó un catálogo limpio de **9 materiales oficiales** mapeados de la siguiente forma:

1. `papel` (Contenedor_Papel)
2. `carton` (Contenedor_Carton)
3. `plastico` (Contenedor_Plastico)
4. `vidrio` (Contenedor_Vidrio)
5. `metales` (Contenedor_Metales)
6. `aceite` (Contenedor_Aceite)
7. `pilas` (Contenedor_Pilas_y_Accesorios)
8. `electrodomesticos` (Contenedor_electrodomesticos_medianos)
9. `medicinas` (Contenedor_medicinas / Contenedor_Medicinas)

### ⏰ Horarios de Atención
El script detecta la columna `opening_hours` presente en el CSV de Miraflores para almacenar los horarios multilínea característicos de los centros de salud, casas del adulto mayor y complejos deportivos del Estado, y los hace visibles en el modal/tarjeta informativa del punto de acopio.

---

## 🛠️ Cambios Realizados

### 1. Script de Utilidad de Carga (`utils/upload-points.js`)
[Ver Script](../../utils/upload-points.js)
Un script robusto en Node.js que:
- Lee de forma segura los tres archivos CSV usando un parser RFC 4180 que tolera nuevas líneas dentro de los campos citados.
- Realiza el parseo e inyección del punto decimal en las coordenadas.
- Mapea las columnas booleanas a los códigos del catálogo y genera el archivo SQL consolidado.
- Si detecta `SUPABASE_SERVICE_ROLE_KEY` en el archivo `.env`, realiza la subida directa a la base de datos remota mediante el cliente de Supabase JS, desactivando conflictos.

### 2. Script SQL de Semilla (`supabase/seed_collection_points.sql`)
[Ver Script de Semilla](../../supabase/seed_collection_points.sql)
Un archivo SQL autogenerado que contiene la transacción completa para:
- Limpiar e insertar en cascada las tablas `collection_points` y `point_materials`.
- Registrar los 9 materiales oficiales con sus colores y estilos de íconos correspondientes.
- Cargar los 48 puntos de acopio de los 3 distritos con su respectivo enlace de materiales admitidos.

### 3. Filtros del Mapa de Mapbox (`app/(tabs)/map.tsx`)
[Ver Pantalla de Mapa](../../app/(tabs)/map.tsx)
Se actualizó la barra superior de selección rápida de filtros en la pantalla del mapa móvil/web para incluir exactamente los chips de las 9 categorías reales de los CSV:
- Papel (`papel`)
- Cartón (`carton`)
- Plástico (`plastico`)
- Vidrio (`vidrio`)
- Metales (`metales`)
- Aceite (`aceite`)
- Pilas (`pilas`)
- Electrodomésticos (`electrodomesticos`)
- Medicinas (`medicinas`)

---

## 🚀 Instrucciones para Cargar los Datos en Supabase

### Opción A: SQL Editor (Recomendado y Seguro)
Dado que RLS (Row Level Security) protege la base de datos de modificaciones públicas, la forma más rápida y segura de cargar los datos sin modificar variables de entorno locales es:

1. Abre el archivo autogenerado [seed_collection_points.sql](../../supabase/seed_collection_points.sql) y copia todo su contenido.
2. Ve al **Dashboard de Supabase** -> Entra en tu Proyecto -> Ve a la pestaña **SQL Editor**.
3. Crea una nueva consulta ("New Query"), pega el código y haz clic en **Run**.
4. ¡Listo! Los 48 puntos y sus relaciones de materiales se insertarán instantáneamente de manera limpia y sin duplicados.

### Opción B: Ejecución Programática Directa
Si deseas ejecutar la carga mediante consola:

1. Abre tu archivo `.env` local e introduce la clave secreta `service_role` de tu proyecto Supabase:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=tu_clave_secreta_service_role
   ```
2. Ejecuta el script con Node:
   ```bash
   node utils/upload-points.js
   ```
3. El script se conectará a la base de datos de tu Supabase cloud y subirá la información omitiendo las reglas RLS gracias a la clave de servicio.
