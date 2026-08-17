# Soporte para la Nueva Estructura e Inserción de Puntos de Acopio (San Borja y San Isidro)

Este documento detalla la compatibilidad implementada para la nueva estructura de tabla `collection_points` recién cargada a Supabase, que contiene la inserción masiva de los puntos de acopio de San Borja y San Isidro.

---

## 1. Estructura de Tabla Procesada

La tabla `collection_points` fue configurada con la siguiente arquitectura SQL:
- `id`: Clave primaria de tipo `SERIAL` (entero secuencial).
- `name`: Nombre descriptivo del punto.
- `address`: Dirección textual (opcional/nullable).
- `latitude` / `longitude`: Coordenadas en formato `DECIMAL(10,6)`.
- 9 Columnas Booleanas de Contenedores (`contenedor_papel`, `contenedor_carton`, `contenedor_plastico`, `contenedor_vidrio`, `contenedor_metales`, `contenedor_aceite`, `contenedor_pilas_y_accesorios`, `contenedor_electrodomesticos_medianos`, `contenedor_medicinas`).
- `opening_hours`: Texto (nullable).

---

## 2. Ajustes Realizados en el Código

### A. [`types/collectionPoint.ts`](file:///d:/IEEE%20CIS%20UNI%20Ecovision/types/collectionPoint.ts)
- Se actualizó la interfaz `CollectionPoint` para soportar `id: string | number` y `address?: string | null`, garantizando tipado estricto con claves primarias `SERIAL`.

### B. [`services/collectionPoints.ts`](file:///d:/IEEE%20CIS%20UNI%20Ecovision/services/collectionPoints.ts)
- Se perfeccionó el mapeo dinámico de materiales (`deriveMaterialsFromPoint`):
  - Procesa adecuadamente las 9 banderas booleanas presentes en los registros de San Borja (`contenedor_papel`, `contenedor_carton`, `contenedor_plastico`, `contenedor_metales`).
  - Para los registros cuyo valor booleano en las 9 columnas sea `FALSE` (como en San Isidro), se genera automáticamente una etiqueta por defecto `Reciclaje General` (`#10B981`) para su correcta representación visual en la interfaz.

---

## 3. Resultado

- Los puntos de acopio de San Borja y San Isidro se leen correctamente desde la base de datos de Supabase.
- Se muestran con sus viñetas correspondientes y badges de materiales en el mapa interactivo.
