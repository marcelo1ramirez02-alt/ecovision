# 🚀 Guía y Checklist para Despliegue en Producción — EcoVision AI

**Fecha:** 2026-08-15  
**Estado:** Propuesta / Recomendaciones  
**Proyecto:** EcoVision AI  

Esta guía contiene la lista de verificación (checklist) y las recomendaciones técnicas para migrar la aplicación de EcoVision AI desde el entorno de desarrollo local a los entornos de producción en producción real (tiendas de aplicaciones y servidores en la nube).

---

## 📋 Resumen del Checklist

1. [ ] **Backend y Base de Datos (Supabase)**: Habilitar RLS estricto, índices de rendimiento y backups automáticos.
2. [x] **Seguridad de APIs**: Restringir API Keys de Google Gemini, Mapbox y Cloudinary (Ver [Guía de Seguridad de APIs](file:///d:/IEEE%20CIS%20UNI%20Ecovision/docs/seguridad-apis.md)).
3. [ ] **Monitoreo de Errores**: Integrar y activar Sentry de forma nativa en la app.
4. [x] **Configuración de Expo & EAS**: Ajustar variables de entorno en producción y configurar certificados de firma (Ver [Guía de Configuración de Expo y EAS](file:///d:/IEEE%20CIS%20UNI%20Ecovision/docs/configuracion-expo-eas.md)).
5. [ ] **Políticas y Consentimiento**: Crear la página pública de Políticas de Privacidad y cumplir con la GDPR/LGPD.
6. [ ] **Publicación en Tiendas**: Preparar assets de marca y optimizar permisos de Android/iOS.

---

## 1. Backend y Base de Datos (Supabase) 🗄️

Dado que Supabase actúa como el Backend-as-a-Service (BaaS) del proyecto, es crítico aplicar medidas de seguridad y escalabilidad antes del lanzamiento:

### A. Políticas de Seguridad (RLS)
*   **Verificar RLS habilitado:** Asegurar que todas las tablas de producción tengan Row Level Security (RLS) activo (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`).
*   **Políticas de inserción y lectura:**
    *   La tabla `profiles` debe permitir lectura a usuarios autenticados pero edición únicamente al propietario (`auth.uid() = id`).
    *   La tabla `recognition_records` debe restringir la lectura del historial únicamente a su respectivo usuario (`auth.uid() = user_id`).
*   **Edge Functions seguras:**
    *   Verificar que la función `classify-waste` valide correctamente el JWT del usuario de Supabase mediante `supabase.auth.getUser(token)` (ya implementado en código).
    *   **IMPORTANTE:** Nunca desactivar la verificación de tokens de autorización en Edge Functions públicas.

### B. Rendimiento y Base de Datos
*   **Índices Espaciales GIST:** El índice `idx_collection_points_location` sobre el campo `location` (PostGIS geography) es crucial para búsquedas rápidos con `ST_DWithin`. Verificar que se haya ejecutado en producción.
*   **Plan de Facturación:** Migrar la base de datos de producción de Supabase al plan **Pro** o superior para evitar que el proyecto sea pausado automáticamente después de 1 semana de inactividad (característica del plan gratuito).
*   **Backups Automáticos:** Programar backups diarios y habilitar Point-in-Time Recovery (PITR) en Supabase para poder restaurar la base de datos a un segundo específico en caso de incidentes.

---

## 2. Seguridad y Límites de APIs de Terceros (Completado) 🔐

Evita cobros excesivos por uso malintencionado restringiendo los tokens de acceso y configurando alertas de facturación. Consulta los pasos prácticos para consolas externas en la [Guía de Seguridad de APIs](file:///d:/IEEE%20CIS%20UNI%20Ecovision/docs/seguridad-apis.md).

### Resumen de Implementación en Código:
*   **Google Gemini API:** La clave `GEMINI_API_KEY` se mantiene puramente en el backend (Edge Function secrets) y el cliente accede a ella mediante invocación autenticada a `classify-waste`.
*   **Cloudinary Uploads Seguros:** La Edge Function `create-cloudinary-signature` fue modificada para verificar el JWT del usuario de Supabase, bloqueando la generación de firmas a clientes no autenticados.
*   **Limpieza de almacenamiento:** Se desarrolló la Edge Function `cleanup-old-images` junto con el cron job `cleanup-old-images-daily` (migración `0005_cleanup_cron_job.sql`) para depurar de Cloudinary imágenes sin consentimiento de más de 7 días o cualquier imagen de más de 30 días de antigüedad.
*   **Mapbox:** Se documentaron los pasos para restringir el token público a `com.ecovision.ai` y proteger el token de descarga privado mediante EAS Secrets.

---

## 3. Monitoreo de Errores y Crash Reporting (Sentry) 📊

Para identificar fallos y excepciones en tiempo real en los dispositivos de los usuarios:

1.  **Instalar el SDK Oficial:**
    Instalar el cliente oficial de Sentry para Expo:
    ```bash
    npx expo install @sentry/react-native
    ```
2.  **Configurar el DSN de Producción:**
    Activar Sentry en `services/monitoring.ts` descomentando la línea de inicialización:
    ```typescript
    import * as Sentry from '@sentry/react-native';

    Sentry.init({
      dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
      enableInExpoDevelopment: false, // Desactivar en desarrollo local
      debug: false,
    });
    ```
3.  **Subida de Source Maps:** Configurar el plugin de Sentry en `app.config.ts` para subir automáticamente los Source Maps de JS durante el proceso de EAS Build, permitiendo ver las líneas exactas de error en TypeScript en el panel de control de Sentry.

---

## 4. Configuración de Expo y EAS Build (Completado) 📱

Expo Application Services (EAS) permite compilar binarios nativos para Android (.apk/.aab) e iOS (.ipa) en la nube. Consulta la guía detallada de variables y comandos en la [Guía de Configuración de Expo y EAS](file:///d:/IEEE%20CIS%20UNI%20Ecovision/docs/configuracion-expo-eas.md).

### Resumen de Implementación en Código:
*   **Versiones y Builds:** Se configuró el archivo `app.config.ts` inyectando `versionCode: 1` para Android y `buildNumber: "1"` para iOS.
*   **Permisos mínimos:** Se verificó que los permisos en `app.config.ts` estuvieran limitados a `CAMERA`, `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION` y `POST_NOTIFICATIONS`.

---

## 5. Políticas de Privacidad y Consentimiento de IA ⚖️

Debido a que EcoVision AI utiliza la cámara del dispositivo, geolocalización e introduce un sistema de consentimiento de imágenes para entrenamiento de modelos IA, es obligatorio cumplir con regulaciones internacionales y locales:

*   **Página web de Políticas de Privacidad:** Es obligatorio proveer una URL con las políticas de privacidad detalladas del proyecto. Debe describir de forma clara:
    1.  Qué imágenes se capturan y para qué se procesan (clasificación instantánea).
    2.  Qué ocurre si el usuario otorga su consentimiento para entrenamiento (las imágenes se anonimizan y se disocian de su cuenta).
    3.  Cómo solicitar la eliminación total de sus datos.
*   **Flujo de Borrado de Cuenta:** Cumplir con las políticas de Apple que exigen un botón visible dentro de la app para "Eliminar Cuenta". Al presionarse, se debe gatillar la función RPC `anonymize_user_recognition_records(target_user_id)` para anonimizar los escaneos consentidos y borrar por completo el perfil de usuario.

---

## 6. Checklist de Publicación en Tiendas 🏬

### Apple App Store
1.  **Cuenta de Desarrollador:** Se necesita una cuenta activa de Apple Developer Program ($99 USD/año).
2.  **Identificadores:** Registrar el App ID `com.ecovision.ai` en Apple Developer Portal.
3.  **Certificados:** Dejar que EAS configure automáticamente las credenciales mediante el comando de inicio de sesión de Apple.
4.  **Metadata obligatoria:** Proveer capturas de pantalla del app en dispositivos de 6.5" y 5.5", descripción de la app, palabras clave e información de soporte.

### Google Play Store
1.  **Cuenta de Desarrollador:** Registrarse en Google Play Console ($25 USD pago único).
2.  **Pruebas Cerradas (Closed Testing):** Google exige pasar por una fase de pruebas cerradas con al menos 20 probadores activos durante 14 días antes de poder liberar una aplicación en la Play Store principal para cuentas nuevas de desarrollador personal.
3.  **Firma del App:** EAS generará un Keystore seguro. Asegurarse de descargar un respaldo de la clave de subida de Google Play.
