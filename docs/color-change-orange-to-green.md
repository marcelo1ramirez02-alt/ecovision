# Cambio de Color: Naranja → Verde Reciclaje

**Fecha:** 2026-08-13  
**Tipo:** Cambio de color de acento  

---

## Resumen

Se reemplazó el color de acento naranja (`#F37920`) por un verde vibrante de reciclaje (`#22C55E`) en toda la aplicación EcoVision AI, alineando la identidad visual con la temática ecológica de la app.

## Mapeo de Colores

| Token | Color Anterior | Color Nuevo |
|---|---|---|
| Acento primario (hex) | `#F37920` (naranja) | `#22C55E` (verde reciclaje) |
| Acento primario (rgba) | `rgba(243, 121, 32, x)` | `rgba(34, 197, 94, x)` |

## Archivos Modificados

Todos los archivos que contenían el color naranja fueron actualizados:

### Layouts
- `app/_layout.tsx` — Spinner de carga
- `app/(tabs)/_layout.tsx` — Tab bar active tint

### Pantallas
- `app/(tabs)/index.tsx` — Banner de puntos, tips, sombras
- `app/(tabs)/camera.tsx` — Fondo container
- `app/(tabs)/map.tsx` — GPS badge, chips seleccionados, drawer border, loading
- `app/(tabs)/history.tsx` — RefreshControl, puntos badge, consent badge
- `app/(tabs)/profile.tsx` — Avatar border, switch track, role tag, shadow
- `app/(auth)/login.tsx` — Link text
- `app/(auth)/register.tsx` — Link text
- `app/recognition/[id].tsx` — Spinner, puntos card, texto

### Componentes
- `components/ui/Button.tsx` — Primary color, shadow, outline border/text
- `components/ui/Card.tsx` — Sin cambios (ya era blanco)
- `components/ui/Input.tsx` — Sin cambios (ya era neutro)
- `components/camera/CameraView.tsx` — Scan box border, capture button
- `components/recognition/WasteResultModal.tsx` — Points box, text
- `components/consent/TrainingConsentModal.tsx` — Bullets text
- `components/collection-points/PointCard.tsx` — Distance badge, material fallback, route text

## Color Seleccionado

**`#22C55E`** — Un verde vibrante y moderno que:
- Representa reciclaje y sostenibilidad
- Ofrece excelente contraste sobre fondos claros (`#F0F2F5`) y blancos (`#FFFFFF`)
- Se alinea con la identidad ecológica de EcoVision AI
- Mantiene legibilidad sobre el tab bar oscuro (`#1B2838`)
