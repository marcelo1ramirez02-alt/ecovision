# Reparación de Renderizado de Viñetas en el Mapa

Este documento detalla la corrección del problema de visibilidad de las viñetas (marcadores ♻️) en el componente Web del mapa (`Map.web.tsx`).

---

## 1. Causa Raíz Identificada

1. **Condición Asíncrona de Carga de Estilo (`isStyleLoaded`)**:
   - Al cargar el mapa de Mapbox, la función `renderMarkers()` estaba esperando el evento `style.load` de Mapbox GL JS.
   - Sin embargo, cuando los puntos de acopio terminaban de cargarse asíncronamente desde Supabase, el estilo del mapa **ya se encontraba cargado**.
   - Debido a una evaluación sintáctica incorrecta de `map.isStyleLoaded`, la aplicación volvía a registrar el listener `map.once('style.load', renderMarkers)`. Dado que ese evento ya había ocurrido, el evento nunca se disparaba de nuevo y los marcadores nunca llegaban a agregarse al DOM.

---

## 2. Solución Aplicada

### [`components/map/Map.web.tsx`](file:///d:/IEEE%20CIS%20UNI%20Ecovision/components/map/Map.web.tsx)
- Se corrigió la evaluación del estado del estilo del mapa:
  ```typescript
  const isStyleLoaded = typeof map.isStyleLoaded === 'function' ? map.isStyleLoaded() : true;
  if (isStyleLoaded) {
    renderMarkers();
  } else {
    map.once('style.load', renderMarkers);
  }
  ```
- Si el estilo ya fue cargado, `renderMarkers()` se ejecuta **de inmediato** tan pronto llegan los datos de la base de datos de Supabase.

---

## 3. Resultado

- Las viñetas (emojis ♻️ en círculos verdes con efecto de sombra) aparecen de forma inmediata en el mapa sobre las ubicaciones exactas de San Borja y San Isidro.
