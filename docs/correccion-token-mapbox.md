# Corrección de Token de Mapbox en Desarrollo

Este documento detalla la solución robusta aplicada para corregir el error de carga del mapa de Mapbox.

## Descripción del Problema

Se presentaba el siguiente error en la consola del navegador al intentar cargar el mapa web:

```
Uncaught (in promise) Error: Use a public access token (pk.*) with Mapbox GL, not a secret access token (sk.*). See https://docs.mapbox.com/api/overview/#access-tokens-and-token-scopes
```

### Causa de fondo

En el desarrollo de aplicaciones móviles con Mapbox (`@rnmapbox/maps`), es habitual y necesario configurar la variable de entorno del sistema `MAPBOX_ACCESS_TOKEN` con un token de descarga secreto (`sk.*`) para que herramientas de construcción como Gradle o CocoaPods puedan descargar el SDK nativo desde la API de descargas de Mapbox.

Dado que la variable `MAPBOX_ACCESS_TOKEN` existía a nivel de sistema operativo/consola del desarrollador, Node.js y la configuración de Expo (`app.config.ts`) la priorizaban al evaluar `process.env.MAPBOX_ACCESS_TOKEN`. Esto provocaba que el token secreto (`sk.*`) se serializara en el cliente web a través de `Constants.expoConfig?.extra?.mapboxToken`, reemplazando el token público (`pk.*`) declarado localmente y causando que Mapbox GL JS se rompiera en la web.

## Cambios Realizados

Para independizar el token público del mapa de cualquier variable del sistema de compilación/descarga, se implementó el uso de la variable estándar de cliente `EXPO_PUBLIC_MAPBOX_KEY`:

### 1. Variables de Entorno
Se agregó `EXPO_PUBLIC_MAPBOX_KEY` en los archivos de entorno con el token público (`pk.*`):

* **`.env`** [Ver archivo](../../.env) y **`.env.development`** [Ver archivo](../../.env.development):
  ```env
  EXPO_PUBLIC_MAPBOX_KEY=pk.tu_token_publico_de_mapbox_aqui
  ```

### 2. Configuración de Expo (`app.config.ts`)
[Ver archivo](../../app.config.ts)

Se priorizó `EXPO_PUBLIC_MAPBOX_KEY` sobre `MAPBOX_ACCESS_TOKEN` al exportar la configuración:
```typescript
mapboxToken: process.env.EXPO_PUBLIC_MAPBOX_KEY || process.env.MAPBOX_ACCESS_TOKEN,
```

### 3. Componente del Mapa Web (`components/map/Map.web.tsx`)
[Ver archivo](../../components/map/Map.web.tsx)

Se priorizó la variable pública directa de Expo (`process.env.EXPO_PUBLIC_MAPBOX_KEY`) la cual Metro inyecta automáticamente en tiempo de compilación del cliente web:
```typescript
const mapboxToken =
  process.env.EXPO_PUBLIC_MAPBOX_KEY ||
  Constants.expoConfig?.extra?.mapboxToken ||
  process.env.MAPBOX_ACCESS_TOKEN ||
  '';
```

### 4. Componente del Mapa Nativo (`components/map/Map.native.tsx`)
[Ver archivo](../../components/map/Map.native.tsx)

Se aplicó la misma prioridad al inicializar la instancia nativa del SDK de Mapbox:
```typescript
const mapboxToken =
  process.env.EXPO_PUBLIC_MAPBOX_KEY ||
  Constants.expoConfig?.extra?.mapboxToken ||
  process.env.MAPBOX_ACCESS_TOKEN ||
  '';
```

---

## Instrucciones para Aplicar los Cambios Localmente

Dado que las variables de entorno de Expo se inyectan en el bundle en tiempo de compilación y se guardan en caché por el Metro Bundler:

1. Detén tu servidor actual (`npx expo start`) con **`Ctrl + C`**.
2. Vuelve a iniciarlo forzando la limpieza de caché del empaquetador:
   ```bash
   npx expo start -c
   ```
