# 📱 Configuración de Expo y EAS Build — EcoVision AI

Este documento detalla la configuración del archivo `app.config.ts`, las políticas de permisos mínimos y la guía paso a paso para gestionar las credenciales de producción utilizando **EAS Secrets** (Expo Application Services) sin exponer claves en el control de versiones (Git).

---

## ⚙️ 1. Configuración de Versiones y Permisos (`app.config.ts`)

Se han ajustado las propiedades nativas de compilación en [app.config.ts](file:///d:/IEEE%20CIS%20UNI%20Ecovision/app.config.ts) para cumplir con los estándares de publicación de Google Play Store y Apple App Store.

### A. Versiones y Códigos de Compilación
*   **iOS (`buildNumber`):** Se definió el valor `"1"` en `ios.buildNumber`. Este código identifica de forma única la compilación de la versión actual (`1.0.0`) y debe incrementarse secuencialmente en cada subida a TestFlight/App Store.
*   **Android (`versionCode`):** Se definió el valor `1` en `android.versionCode`. Google Play exige que cada nuevo binario (.aab) subido a la consola tenga un código de versión estrictamente mayor al anterior.

### B. Permisos Mínimos
Para pasar las revisiones de las tiendas y respetar la privacidad del usuario, la aplicación solicita estrictamente solo los permisos que utiliza:
*   `CAMERA`: Utilizado para la captura y escaneo inteligente de residuos con la cámara del dispositivo.
*   `ACCESS_FINE_LOCATION` / `ACCESS_COARSE_LOCATION`: Utilizados para geolocalizar al usuario y mostrarle los puntos de acopio más cercanos en el mapa interactivo.
*   `POST_NOTIFICATIONS`: Utilizado para enviar alertas de eco-puntos y recordatorios ecológicos.

---

## 🔒 2. Configuración de EAS Secrets

Las credenciales sensibles de producción de EcoVision AI (como las claves de Supabase, Cloudinary, Mapbox y Sentry) no deben guardarse en archivos `.env` locales ni subirse al repositorio Git. En su lugar, se inyectan dinámicamente en el servidor de compilación de EAS mediante **EAS Secrets**.

### Lista de Variables Requeridas en EAS:

| Variable | Tipo | Descripción | Scope |
| :--- | :--- | :--- | :--- |
| `EXPO_PUBLIC_SUPABASE_URL` | Público | URL del backend de Supabase en producción | Client App |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Público | Clave anónima pública de Supabase | Client App |
| `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME` | Público | Nombre del Cloud en Cloudinary | Client App |
| `EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Público | Preset de carga firmado de Cloudinary | Client App |
| `EXPO_PUBLIC_MAPBOX_KEY` | Público | Clave de acceso pública de Mapbox (restringida) | Client App |
| `EXPO_PUBLIC_SENTRY_DSN` | Público | DSN de Sentry para reporte de errores | Client App |
| `EXPO_PUBLIC_MAPBOX_DOWNLOAD_TOKEN` | Privado | Token privado de Mapbox para descargar el SDK nativo | Build Time |

### 🛠️ Cómo agregar las variables a EAS:

#### Opción A: Desde el panel web de Expo (Recomendado)
1. Ve a [Expo Dashboard](https://expo.dev/) e inicia sesión.
2. Selecciona tu proyecto **ecovision**.
3. En la barra lateral izquierda, navega a **Project Settings** > **Credentials**.
4. Busca la pestaña **Secrets** y haz clic en **Create secret**.
5. Rellena el **Name** (ej: `EXPO_PUBLIC_SUPABASE_URL`) y el **Value** (ej: `https://onmypacggdhglyuyntcp.supabase.co`).
6. Repite el proceso para cada una de las variables de la tabla superior.

#### Opción B: Desde la terminal usando EAS CLI
Asegúrate de estar autenticado en tu terminal (`npx eas login`) y ejecuta el siguiente comando para cada secreto:
```bash
eas secret:create --name EXPO_PUBLIC_SUPABASE_URL --value "https://tu-url-de-supabase" --type string --scope project
eas secret:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "tu-anon-key" --type string --scope project
eas secret:create --name EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME --value "tu-cloud-name" --type string --scope project
eas secret:create --name EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET --value "tu-upload-preset" --type string --scope project
eas secret:create --name EXPO_PUBLIC_MAPBOX_KEY --value "tu-public-mapbox-key" --type string --scope project
eas secret:create --name EXPO_PUBLIC_SENTRY_DSN --value "tu-sentry-dsn" --type string --scope project
eas secret:create --name EXPO_PUBLIC_MAPBOX_DOWNLOAD_TOKEN --value "sk.tu-download-token" --type string --scope project
```

---

## 🚀 3. Compilación de Producción

Una vez configuradas las variables en EAS Secrets, puedes compilar los binarios de producción listos para su publicación:

*   **Compilar para Android e iOS en simultáneo:**
    ```bash
    eas build --platform all --profile production
    ```
*   **Compilar únicamente para Android (.aab):**
    ```bash
    eas build --platform android --profile production
    ```
*   **Compilar únicamente para iOS (.ipa):**
    ```bash
    eas build --platform ios --profile production
    ```

El comando generará un enlace al panel de compilación de Expo donde podrás monitorizar el progreso y, al finalizar, descargar los binarios oficiales firmados.
