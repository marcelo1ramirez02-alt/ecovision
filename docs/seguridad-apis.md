# 🛡️ Seguridad y Restricción de APIs — EcoVision AI

Este documento detalla las modificaciones realizadas en el código de EcoVision AI para robustecer la seguridad de las APIs de terceros y proporciona guías paso a paso para aplicar las restricciones necesarias en las consolas de administración de **Google Gemini**, **Mapbox** y **Cloudinary** para producción.

---

## 📝 Resumen de Cambios de Código Realizados

### 1. Firma Segura de Cloudinary ([create-cloudinary-signature](file:///d:/IEEE%20CIS%20UNI%20Ecovision/supabase/functions/create-cloudinary-signature/index.ts))
*   **Vulnerabilidad solucionada:** El endpoint de firma de Cloudinary era de acceso público (cualquiera podía invocarlo para obtener una firma HMAC válida para subir contenido a tu cuenta de Cloudinary).
*   **Mitigación:** Se integró la verificación de sesión de Supabase (`supabase.auth.getUser()`). Ahora, el endpoint requiere un token JWT válido enviado en la cabecera `Authorization: Bearer <JWT>`. Las peticiones sin token o con tokens inválidos se rechazan con un código `401 Unauthorized`.
*   **Flexibilidad:** Se parametrizaron las variables `uploadPreset` y `folder` para que se lean de forma dinámica desde el entorno (`CLOUDINARY_UPLOAD_PRESET` y `CLOUDINARY_FOLDER`) en lugar de estar fijas en código duro.

### 2. Limpieza de Almacenamiento Automática ([cleanup-old-images](file:///d:/IEEE%20CIS%20UNI%20Ecovision/supabase/functions/cleanup-old-images/index.ts))
*   **Nueva Función Edge:** Se creó la función `cleanup-old-images` en Supabase para evitar costos excesivos de almacenamiento en Cloudinary.
*   **Criterio de Limpieza:**
    *   Imágenes sin consentimiento del dataset (`training_consent = false`) mayores a **7 días** (se mantiene una ventana corta para permitir visualización en historial reciente).
    *   Cualquier imagen en la base de datos mayor a **30 días**.
*   **Lógica:** Invoca de manera segura a la API de eliminación de Cloudinary mediante firmas SHA-1 con la clave `CLOUDINARY_API_SECRET` y actualiza la fila de la BD limpiando `cloudinary_public_id` y reseteando `image_url` a una cadena vacía.
*   **Seguridad:** Restringida para requerir obligatoriamente la clave secreta de sistema `SUPABASE_SERVICE_ROLE_KEY` en la cabecera de autenticación.

### 3. Automatización de Cron Job ([0005_cleanup_cron_job.sql](file:///d:/IEEE%20CIS%20UNI%20Ecovision/supabase/migrations/0005_cleanup_cron_job.sql))
*   Se creó una nueva migración de base de datos que habilita la extensión `pg_cron` en Supabase.
*   Programa la ejecución de la función `cleanup-old-images` todos los días a las **00:00 UTC** mediante peticiones POST internas y seguras con la extensión `pg_net`.

---

## ⚙️ Guía de Configuración en Consolas de Proveedores

Aplica las siguientes configuraciones en las plataformas web correspondientes para asegurar las claves de producción.

### A. Google Gemini API (Google Cloud Console)
La API Key de Gemini (`GEMINI_API_KEY`) **nunca** debe estar expuesta en el código de React Native. Se gestiona de forma segura a través de la Edge Function `classify-waste`.

1.  **Restricciones de API:**
    *   Accede a [Google Cloud Console](https://console.cloud.google.com/) > **APIs y servicios** > **Credenciales**.
    *   Edita la clave de API utilizada para Gemini.
    *   Bajo **Restricciones de API**, selecciona **Restringir clave**.
    *   En la lista desplegable, marca únicamente **Generative Language API** (la API que utiliza Gemini). Guarda los cambios. Esto evita que la clave sea utilizada para consumir otros servicios costosos de Google Cloud.
2.  **Límites de Cuota (Quota Limits):**
    *   Ve a **APIs y servicios** > **Biblioteca** > busca **Generative Language API**.
    *   Haz clic en **Administrar** > pestaña **Cuotas**.
    *   Configura límites prudentes de solicitudes por minuto (RPM) y por día (RPD) según tu estimación de usuarios para evitar cobros masivos accidentales o ataques de denegación de servicio.
3.  **Alertas de Presupuesto:**
    *   Ve a **Facturación** > **Presupuestos y alertas**.
    *   Crea un presupuesto para el proyecto EcoVision.
    *   Configura alertas de correo electrónico al alcanzar el 50%, 75%, 90% y 100% del presupuesto mensual estimado (ejemplo: $10 USD).

### B. Mapbox (Mapbox Dashboard)
Mapbox requiere dos tokens: uno público (`EXPO_PUBLIC_MAPBOX_KEY`) utilizado en el mapa de la app y uno privado (`MAPBOX_DOWNLOAD_TOKEN`) para compilar dependencias.

1.  **Restricción del Token Público:**
    *   Inicia sesión en el [Panel de Mapbox](https://account.mapbox.com/).
    *   Edita tu token público actual o crea uno nuevo específico para producción.
    *   En **URL restrictions** / **Resource restrictions**:
        *   Para Android/iOS: Añade el identificador de paquete oficial de tu aplicación: `com.ecovision.ai`.
        *   Para Desarrollo/Pruebas: Puedes añadir `com.ecovision.ai.dev` y `localhost` (para la versión web).
    *   Esto bloquea el uso del token en cualquier aplicación externa que intente clonarlo.
2.  **Protección del Token de Descarga (Download Token):**
    *   El token de descarga de Mapbox (`sk.eyJ1I...`) **nunca** debe incluirse en código público o variables expuestas.
    *   Debe crearse en tu panel de Mapbox con el único permiso (scope) de `downloads:read`.
    *   Agrégalo como un secreto de EAS en la consola de Expo:
        ```bash
        eas secret:create --name EXPO_PUBLIC_MAPBOX_DOWNLOAD_TOKEN --value "sk.tu_token_de_descarga" --type string --scope project
        ```
        EAS lo inyectará de forma segura y privada únicamente durante la compilación en la nube.

### C. Cloudinary (Cloudinary Console)
Cloudinary almacena temporalmente o permanentemente las imágenes capturadas por los usuarios.

1.  **Restricción del Preset de Carga (Upload Preset):**
    *   Ve a la consola de [Cloudinary](https://cloudinary.com/) > **Settings** (Icono de engranaje) > **Upload**.
    *   Busca el upload preset utilizado (ej. `ecovision_waste_uploads` o `ecovision_dev_preset`).
    *   Asegúrate de cambiar su **Signing Mode** de *Unsigned* a **Signed**. Esto fuerza a Cloudinary a exigir una firma criptográfica HMAC (que solo puede generar tu backend de Supabase) para aceptar cargas de archivos.
2.  **Restricción de Formatos y Tamaños:**
    *   Edita el upload preset.
    *   En la sección **Validation and constraints**:
        *   **Allowed formats:** Escribe únicamente `jpg, jpeg, png, webp`. Esto bloquea la subida de scripts, PDFs u otros archivos potencialmente maliciosos.
        *   **Max file size:** Configura un límite razonable (ej. `10485760` bytes para 10 MB) para evitar saturación de ancho de banda y cobros por peso de almacenamiento.
3.  **Protección de Credenciales del Servidor:**
    *   La variable `CLOUDINARY_API_SECRET` es una clave privada. Asegúrate de que solo exista como un secreto en las Edge Functions de Supabase.

---

## 🚀 Despliegue en Producción

Sigue estos comandos para aplicar y subir los cambios a tu entorno de Supabase en producción:

### 1. Establecer variables de entorno secretas en Supabase
Ejecuta el siguiente comando para registrar las credenciales privadas en Supabase Cloud (reemplaza `tu-proyecto-ref` con el ID de tu proyecto y pon las llaves reales):
```bash
supabase secrets set CLOUDINARY_API_KEY="tu-api-key" CLOUDINARY_API_SECRET="tu-api-secret" CLOUDINARY_UPLOAD_PRESET="ecovision_waste_uploads" CLOUDINARY_FOLDER="ecovision_dataset" --project-ref tu-proyecto-ref
```

### 2. Desplegar las Edge Functions
Sube las funciones actualizadas al servidor de Supabase:
```bash
supabase functions deploy create-cloudinary-signature --project-ref tu-proyecto-ref
supabase functions deploy cleanup-old-images --project-ref tu-proyecto-ref
```

### 3. Aplicar las migraciones de Base de Datos
Empuja la migración `0005_cleanup_cron_job.sql` para programar el cron job automático de limpieza:
```bash
supabase db push --project-ref tu-proyecto-ref
```
O bien, copia el contenido de [0005_cleanup_cron_job.sql](file:///d:/IEEE%20CIS%20UNI%20Ecovision/supabase/migrations/0005_cleanup_cron_job.sql) y ejecútalo directamente en el SQL Editor del panel web de tu proyecto Supabase, reemplazando `YOUR_SUPABASE_SERVICE_ROLE_KEY` con la clave `service_role` de tu proyecto.
