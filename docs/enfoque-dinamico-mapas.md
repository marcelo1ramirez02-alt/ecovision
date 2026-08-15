# Enfoque Dinámico y Auto-Zoom de Viñetas en Mapas (Web y Nativo)

Este documento detalla la implementación realizada para ajustar automáticamente el encuadre y zoom del mapa según la ubicación del usuario y los puntos de acopio (viñetas) disponibles.

## Descripción del Problema

Anteriormente, el mapa se centraba de manera rígida en la ubicación del usuario con un nivel de zoom estático (`zoom: 14`), independientemente de si había puntos de acopio cerca o lejos. Esto obligaba al usuario a interactuar manualmente para alejar o acercar el mapa para poder ver los puntos de reciclaje.

### Comportamiento Deseado Implementado

Para mejorar la experiencia del usuario y optimizar la visualización de los puntos de acopio en relación a su ubicación:
1. **Puntos cercanos (radio <= 5 km):** Si existen puntos de acopio dentro de un radio de 5 km a la redonda del usuario, el mapa ajusta sus límites (bounds) para encuadrar y mostrar la ubicación del usuario y únicamente los puntos dentro de este radio de 5 km.
2. **Sin puntos cercanos (radio > 5 km):** Si no hay ningún punto de acopio dentro del radio de 5 km, el mapa se aleja automáticamente para encuadrar la ubicación del usuario junto con **todos** los puntos de acopio disponibles en el sistema, asegurando que ninguno quede fuera de la vista inicial.
3. **Sin puntos en el sistema:** Si no hay ningún punto de acopio registrado en la aplicación, el mapa se centra por defecto en la ubicación del usuario con un zoom cómodo (`zoom: 14`).
4. **Límites de Zoom:** Se aplica un zoom máximo de `15` para evitar que el mapa se acerque excesivamente si un punto está extremadamente cerca del usuario (por ejemplo, a menos de 100 metros).

---

## Cambios Realizados

Se agregaron las funciones de cálculo de distancia de Haversine y la lógica para ajustar los encuadres de la cámara en ambas plataformas:

### 1. [MODIFICADO] Componente Web: `components/map/Map.web.tsx`
[Ver archivo](../../components/map/Map.web.tsx)

* Se definió la función auxiliar `getDistanceKm` para calcular distancias en base a coordenadas geográficas (latitud/longitud).
* Se implementó la función `fitMapBounds` para calcular dinámicamente los límites geográficos (`mapboxgl.LngLatBounds`) que encierran al usuario y los puntos de interés.
* Se vinculó esta lógica tanto en la carga inicial del mapa (`map.on('load')`) como en cada actualización de coordenadas del usuario o de los puntos disponibles.

```typescript
const fitMapBounds = (targetMap: any) => {
  const pointsWithin5Km = points.filter(p => 
    getDistanceKm(userLatitude, userLongitude, p.latitude, p.longitude) <= 5
  );
  const pointsToFit = pointsWithin5Km.length > 0 ? pointsWithin5Km : points;
  
  if (pointsToFit.length > 0) {
    const bounds = new mapboxgl.LngLatBounds();
    bounds.extend([userLongitude, userLatitude]);
    pointsToFit.forEach(p => bounds.extend([p.longitude, p.latitude]));
    targetMap.fitBounds(bounds, {
      padding: { top: 50, bottom: 150, left: 50, right: 50 },
      maxZoom: 15,
      duration: 1000
    });
  } else {
    targetMap.easeTo({
      center: [userLongitude, userLatitude],
      zoom: 14,
    });
  }
};
```

### 2. [MODIFICADO] Componente Nativo: `components/map/Map.native.tsx`
[Ver archivo](../../components/map/Map.native.tsx)

* Se portó la misma lógica al componente nativo, calculando una caja de límites geográficos (`boundsProp` con esquinas `ne` y `sw` y paddings).
* Se inyectó este límite al prop `bounds` del componente `<MapboxGL.Camera>` de forma condicional, con un fallback dinámico a `centerCoordinate` cuando no hay puntos.

```typescript
// En MapboxGL.Camera:
{...(hasPoints && boundsProp
  ? { bounds: boundsProp }
  : { centerCoordinate: [userLongitude, userLatitude], zoomLevel: 14 })}
maxZoomLevel={15}
animationMode="flyTo"
animationDuration={1000}
```

---

## Verificación y Resultados

* **Cálculo de Distancias:** Las viñetas dentro del radio de 5 km se calculan correctamente.
* **Auto-Encuadre (Web):** El mapa realiza un deslizamiento suave (`fitBounds` con `duration: 1000`) hasta encuadrar al usuario y las viñetas aplicables respetando el padding inferior para evitar que el detalle flotante del punto de acopio tape la ubicación.
* **Auto-Encuadre (Nativo):** La cámara de `@rnmapbox/maps` realiza la transición `flyTo` adaptándose a los límites calculados.
