# Encuadre Dinámico de Cámara: Radio de 5 km y Alejamiento a Viñetas Cercanas

Este documento detalla la lógica implementada para el ajuste dinámico de la cámara del mapa (tanto en Web como en Nativo) según la distancia entre la ubicación del usuario y los puntos de acopio (viñetas).

---

## 1. Reglas de Negocio Implementadas

1. **Usuario cerca de Viñetas (al menos 1 viñeta dentro de un radio de 5 km):**
   - El mapa calcula un área que garantiza la visibilidad completa del radio de 5 km alrededor del usuario (`userLatitude`, `userLongitude`), sumado a todas las viñetas que se encuentren dentro de dicha distancia de 5 km.
   - El encuadre ajusta la cámara (acercándose o alejándose) para mostrar de forma íntegra ese radio de 5 km a la redonda.

2. **Usuario fuera de alcance de Viñetas (sin viñetas dentro del radio de 5 km):**
   - Si no existe ninguna viñeta a menos de 5 km del usuario, la cámara se aleja progresiva y automáticamente hasta incluir y visibilizar la viñeta más cercana (y el resto de viñetas disponibles en la base de datos).

3. **Límite de Zoom Máximo:**
   - Se mantiene un zoom máximo de `15` para evitar sobre-acercamiento cuando el usuario está extremadamente cerca de una viñeta.

---

## 2. Implementación Técnica

Se creó la función de cálculo geográfico `calculateMapBounds` basada en fórmulas trigonométricas de grado y distancia Haversine:

```typescript
const calculateMapBounds = (
  userLat: number,
  userLng: number,
  pointsList: CollectionPoint[]
) => {
  const pointsWithin5Km = pointsList.filter(
    (p) => getDistanceKm(userLat, userLng, p.latitude, p.longitude) <= 5
  );

  // Desplazamiento aproximado para 5 km en grados de latitud/longitud
  const latDelta = 5 / 111.32;
  const lngDelta = 5 / (111.32 * Math.cos((userLat * Math.PI) / 180));

  let minLat = userLat - latDelta;
  let maxLat = userLat + latDelta;
  let minLng = userLng - lngDelta;
  let maxLng = userLng + lngDelta;

  if (pointsWithin5Km.length > 0) {
    // Caso 1: Hay viñetas a <= 5 km -> Encuadra el radio de 5 km alrededor del usuario + viñetas cercanas
    pointsWithin5Km.forEach((p) => {
      minLat = Math.min(minLat, p.latitude);
      maxLat = Math.max(maxLat, p.latitude);
      minLng = Math.min(minLng, p.longitude);
      maxLng = Math.max(maxLng, p.longitude);
    });
  } else if (pointsList.length > 0) {
    // Caso 2: No hay viñetas a <= 5 km -> Se aleja desde la ubicación del usuario para visibilizar la viñeta más cercana y disponibles
    minLat = userLat;
    maxLat = userLat;
    minLng = userLng;
    maxLng = userLng;
    pointsList.forEach((p) => {
      minLat = Math.min(minLat, p.latitude);
      maxLat = Math.max(maxLat, p.latitude);
      minLng = Math.min(minLng, p.longitude);
      maxLng = Math.max(maxLng, p.longitude);
    });
  }

  return {
    sw: [minLng, minLat] as [number, number],
    ne: [maxLng, maxLat] as [number, number],
  };
};
```

---

## 3. Componentes Modificados

- [`components/map/Map.web.tsx`](file:///d:/IEEE%20CIS%20UNI%20Ecovision/components/map/Map.web.tsx): Actualizada la función `fitMapBounds` de Mapbox GL JS para calcular los bordes `sw` y `ne` usando `calculateMapBounds` y aplicar `targetMap.fitBounds(bounds, { duration: 1000, maxZoom: 15 })`.
- [`components/map/Map.native.tsx`](file:///d:/IEEE%20CIS%20UNI%20Ecovision/components/map/Map.native.tsx): Aplicado el objeto de límites `boundsProp` a `<MapboxGL.Camera>` en la versión React Native Nativa.

---

## 4. Resultados y Verificación

- Si el usuario se ubica en un lugar con viñetas cercanas, el mapa encuadra el área de 5 km a la redonda sin ocultar ninguna viñeta cercana.
- Si la ubicación del usuario no posee viñetas en 5 km a la redonda, el mapa realiza una transición fluida alejando la pantalla hasta encuadrar la viñeta más cercana.
