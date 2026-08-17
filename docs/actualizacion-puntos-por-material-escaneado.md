# Actualización de Esquema: Puntos Fijos por Material Escaneado (`base_points`)

Este documento detalla la modificación realizada en la tabla `materials` para cambiar la métrica de puntuación de "Puntos por Kilogramo" a **"Puntos Fijos por Residuo/Material Escaneado" (`base_points`)**, respondiendo a la necesidad de otorgar recompensas a los usuarios sin requerir que pesen o conozcan los kilos exactos a reciclar.

---

## 📋 Descripción del Cambio

Originalmente, el esquema de `materials` calculaba puntos según el peso estimado (`points_per_kg`). Como los usuarios no conocen con exactitud el peso en kilogramos al momento de depositar o escanear sus residuos en un contenedor, se actualizó el modelo de datos para asignar un valor de **puntos fijos por entrega/escaneo (`base_points`)**.

### Tabla de Puntuación Fija por Tipo de Residuo:

| Ícono | Material | Código (`code`) | Puntos por Escaneo (`base_points`) | Color (`color_code`) |
| :---: | :--- | :--- | :---: | :--- |
| 📄 | Papel | `papel` | **10 puntos** | `#3B82F6` (Azul) |
| 📦 | Cartón | `carton` | **12 puntos** | `#F59E0B` (Ámbar) |
| 🥤 | Plástico | `plastico` | **15 puntos** | `#10B981` (Verde) |
| 🍾 | Vidrio | `vidrio` | **12 puntos** | `#6B7280` (Gris) |
| 🥫 | Metales | `metales` | **20 puntos** | `#EF4444` (Rojo) |
| 🛢️ | Aceite Usado | `aceite` | **25 puntos** | `#84CC16` (Lima) |
| 🔋 | Pilas y Accesorios | `pilas` | **30 puntos** | `#EC4899` (Rosa) |
| 📺 | Electrónicos | `electrodomesticos` | **35 puntos** | `#8B5CF6` (Púrpura) |
| 💊 | Medicinas Vencidas | `medicinas` | **15 puntos** | `#06B6D4` (Cían) |

---

## 🛠️ Archivos Modificados

### 1. Migración SQL `supabase/migrations/0007_update_material_points.sql`
- Agrega la columna `base_points INT NOT NULL DEFAULT 10` a la tabla `public.materials`.
- Actualiza los registros existentes asignando la puntuación fija oficial a cada categoría de material.

### 2. Tipos TypeScript `types/database.ts`
- Se actualizó la interfaz `Material` para incluir `base_points: number;`.

### 3. Script de Utilidad de Carga `utils/upload-points.js`
- Se actualizó la transacción SQL autogenerada para poblar la columna `base_points` junto con `points_per_kg` para mantener retrocompatibilidad.

---

## 🚀 Aplicación en Supabase

Para aplicar este cambio en tu base de datos de Supabase Cloud:
1. Abre tu **Supabase Dashboard** -> Pestaña **SQL Editor**.
2. Ejecuta la nueva migración [0007_update_material_points.sql](../../supabase/migrations/0007_update_material_points.sql).
