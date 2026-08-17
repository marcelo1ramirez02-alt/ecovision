# Documentación de Modificaciones: Mapeo de Materiales Escaneados y Puntos de Acopio Cercanos

**Fecha**: 17 de Agosto de 2026  
**Proyecto**: EcoVision App  
**Desarrollado por**: Antigravity Assistant

---

## 1. Causa del Problema

Al escanear un residuo como **"Papel"**, el clasificador de IA genera un `material_code` (ej. `"paper"` o `"papel"`) o un `material_name` (`"Papel"`).

En la base de datos Supabase, los contenedores se registran mediante columnas booleanas (`contenedor_papel`, `contenedor_plastico`, etc.). La función de mapeo previa realizaba una comparación estricta de igualdad entre el valor filtrado y la clave interna del objeto, haciendo que búsquedas con `"paper"` o `"Papel"` fallaran en matchear con `contenedor_papel`.

---

## 2. Solución Implementada

1. **Mapeo con Alias Bilingües (`aliases`) en `services/collectionPoints.ts`**:
   Se enriqueció la constante `CONTAINER_MATERIALS` para incluir sinónimos y códigos en español e inglés:
   - `contenedor_papel` -> `aliases: ['papel', 'paper']`
   - `contenedor_carton` -> `aliases: ['carton', 'cartón', 'cardboard']`
   - `contenedor_plastico` -> `aliases: ['plastico', 'plástico', 'plastic', 'plastic_pet', 'pet']`
   - `contenedor_vidrio` -> `aliases: ['vidrio', 'glass']`
   - `contenedor_metales` -> `aliases: ['metales', 'metal', 'aluminum', 'aluminio']`
   - `contenedor_aceite` -> `aliases: ['aceite', 'oil']`
   - `contenedor_pilas_y_accesorios` -> `aliases: ['pilas', 'batteries', 'battery']`
   - `contenedor_electrodomesticos_medianos` -> `aliases: ['electrodomesticos', 'electronic', 'appliances']`
   - `contenedor_medicinas` -> `aliases: ['medicinas', 'medical', 'medicine']`

2. **Lógica de Coincidencia Flexible**:
   Al consultar `getNearbyCollectionPoints({ materialFilter })`, el filtro compara el código, el nombre y la lista de alias, asegurando que tanto `"paper"` como `"Papel"` identifiquen los puntos con `contenedor_papel = true`.

3. **Fallback a Puntos Cercanos Generales**:
   En `app/(tabs)/history.tsx`, si no se encuentra un punto exclusivo para ese filtro, se consulta automáticamente el punto de acopio general más cercano para evitar que la interfaz quede en estado sin resultados.
