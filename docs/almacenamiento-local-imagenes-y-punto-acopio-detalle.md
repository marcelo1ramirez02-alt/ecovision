# Almacenamiento Local de Imágenes de Cámara y Localización de Puntos de Acopio en Detalle

## 1. Descripción de la Funcionalidad

Para optimizar la experiencia de usuario y mejorar el rendimiento de la aplicación sin sobrecargar la base de datos remota con almacenamiento de archivos, se han implementado las siguientes mejoras:

1. **Guardado Local de Imágenes Capturadas por la Cámara**:
   - Cada foto tomada con la cámara para escaneo y clasificación con Gemini AI se almacena en el almacenamiento persistente del dispositivo (`AsyncStorage`).
   - Se asocia de manera unívoca la imagen en formato URI/Base64 con el `id` del registro (`recognition_records.id`).
   - Al consultar el historial (`/history`) o abrir la pantalla de detalle del escaneo (`/recognition/[id]`), si la base de datos no contiene una URL remota (`image_url` nula o vacía), la aplicación recupera y despliega de forma transparente la imagen local guardada en la caché del dispositivo.

2. **Gestión y Limpieza de Caché en el Perfil**:
   - En la sección **Perfil** (`app/(tabs)/profile.tsx`), se agregó el bloque **Almacenamiento Local de Imágenes**.
   - Muestra dinámicamente la cantidad de imágenes en caché y el espacio total consumido en MB/KB.
   - Ofrece el botón **Limpiar** con un diálogo de confirmación que elimina el caché local y actualiza los indicadores en tiempo real.

3. **Ubicación del Punto de Acopio más Cercano por Material**:
   - En la pantalla de descripción/detalle del material (`app/recognition/[id].tsx`), se calcula en tiempo real la ubicación del usuario mediante GPS y se buscan los puntos de acopio disponibles en la base de datos.
   - El sistema filtra los contenedores según el código o nombre del material escaneado (`plastic_pet`, `glass`, `paper`, etc.) y muestra el punto de acopio activo más cercano, indicando su nombre, dirección, distancia exacta en metros y un botón **Ver en el Mapa** para dirigir al usuario a la vista interactiva del mapa (`/(tabs)/map`).

---

## 2. Archivos Modificados y Creados

- `[NUEVO]` **`utils/imageCache.ts`**:
  - Módulo encargado de gestionar el ciclo de vida de la caché local de imágenes mediante `AsyncStorage` (`saveCachedImage`, `getCachedImage`, `getCacheInfo`, `clearImageCache`).

- `[MODIFICADO]` **`services/recognition.ts`**:
  - Se actualizaron las funciones `getUserRecognitionHistory` y `getRecognitionRecordById` para inyectar automáticamente la imagen de la caché local cuando la respuesta de la BD no posea `image_url`.

- `[MODIFICADO]` **`hooks/useRecognition.ts`**:
  - Se actualizó la función `processWasteImage` para invocar a `saveCachedImage` e integrar inmediatamente el URI capturado al registro en el estado.

- `[MODIFICADO]` **`app/recognition/[id].tsx`**:
  - Integración de carga de ubicación del usuario y llamada a `getNearbyCollectionPoints` filtrando por `material_code`/`material_name`.
  - Renderizado de la tarjeta del **Punto de Acopio más Cercano** con distancia, dirección y navegación directa al mapa.

- `[MODIFICADO]` **`app/(tabs)/profile.tsx`**:
  - Adición de la tarjeta de gestión de espacio en almacenamiento local de imágenes con estadísticas de uso y acción de eliminación de caché.

- `[NUEVO]` **`docs/almacenamiento-local-imagenes-y-punto-acopio-detalle.md`**:
  - Documento con la explicación y auditoría de la implementación realizada.
