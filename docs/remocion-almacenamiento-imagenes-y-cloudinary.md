# Documentación de Modificaciones: Solución a Errores de Clientes Cacheados (Cloudinary Deprecado)

**Fecha**: 17 de Agosto de 2026  
**Proyecto**: EcoVision App  
**Desarrollado por**: Antigravity Assistant

---

## 1. Causa del Log en `create-cloudinary-signature`

Al escanear desde un dispositivo (ej. iPhone) con una sesión previa o bundle en caché en Safari/Expo Go, la aplicación cliente antigua continuaba invocando `/functions/v1/create-cloudinary-signature`.

Dado que las credenciales de Cloudinary fueron removidas de los secretos de Supabase, la función Edge antigua devolvía un estado `500` por falta de variables de entorno.

---

## 2. Solución Aplicada

1. **Defensa en Profundidad en Edge Function**:
   Se actualizó `supabase/functions/create-cloudinary-signature/index.ts` para retornar un estado HTTP **`200 OK`** informativo indicando que la función ha sido descontinuada.
2. **Eliminación de Errores 500**:
   Incluso si un dispositivo antiguo con bundle cacheado realiza la solicitud, la respuesta es `200 OK`, evitando la saturación de los registros de error de Supabase.
3. **Acción Recomendada en Cliente**:
   Recargar / refrescar la aplicación en el dispositivo o presionar `r` en la consola de Metro (`npx expo start`) para que los clientes descarguen el último bundle donde Cloudinary fue removido por completo.
