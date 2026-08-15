# Rediseño UI: Tema Claro con Acentos Naranja

**Fecha:** 2026-08-13  
**Tipo:** Cambio de diseño visual (colores)  
**Referencia:** Diseño inspirado en dashboard de Smart Home con estética limpia y moderna

---

## Resumen

Se rediseñó completamente la paleta de colores de la aplicación EcoVision AI, migrando del tema oscuro (slate/verde) a un tema claro con acentos naranja, inspirado en el diseño de referencia proporcionado.

## Paleta de Colores Nueva

| Token | Color Anterior | Color Nuevo | Uso |
|---|---|---|---|
| Background principal | `#0F172A` (dark navy) | `#F0F2F5` (soft gray) | Fondo de todas las pantallas |
| Card/Surface | `#1E293B` (dark slate) | `#FFFFFF` (white) | Tarjetas, modales, formularios |
| Card border | `#334155` (slate border) | `#E8ECF0` (light border) | Bordes de tarjetas y contenedores |
| Accent primario | `#10B981` (green) | `#F37920` (warm orange) | Botones, badges, elementos activos |
| Accent secundario | `#34D399` (light green) | `#F37920` (warm orange) | Tips, puntos, links |
| Texto primario | `#F8FAFC` (white) | `#1B2838` (dark navy) | Títulos y headings |
| Texto secundario | `#94A3B8` (gray) | `#6B7B8D` (muted gray) | Subtítulos, descripciones |
| Texto terciario | `#64748B` (dark gray) | `#8A9BB0` (soft gray) | Fechas, metadata |
| Texto body | `#CBD5E1` (light gray) | `#4A5568` (dark gray) | Texto de párrafos |
| Tab bar bg | `#1E293B` (dark slate) | `#1B2838` (dark navy) | Barra de navegación inferior |
| Tab active | `#10B981` (green) | `#F37920` (orange) | Ícono/label del tab activo |
| Tab inactive | `#64748B` (gray) | `#8A9BB0` (soft gray) | Íconos de tabs inactivos |
| Error color | `#EF4444` (red) | `#E53E3E` (red) | Errores y validaciones |
| Success color | `#10B981` (green) | `#38A169` (green) | Estado "Reciclable" |
| Danger button | `#EF4444` | `#E53E3E` | Botón cerrar sesión |

## Archivos Modificados

### Layouts y Navegación
- `app/_layout.tsx` — StatusBar oscura, fondo claro, header blanco, spinner naranja
- `app/(tabs)/_layout.tsx` — Tab bar chip: dark navy con accent naranja, labels visibles

### Pantallas (Tabs)
- `app/(tabs)/index.tsx` — Dashboard: fondo claro, tarjetas blancas, banner de puntos naranja
- `app/(tabs)/camera.tsx` — Cámara: fondo claro
- `app/(tabs)/map.tsx` — Mapa: header blanco, chips naranja, GPS badge naranja, drawer blanco
- `app/(tabs)/history.tsx` — Historial: fondo claro, texto oscuro, badges naranja
- `app/(tabs)/profile.tsx` — Perfil: avatar con borde naranja, switch naranja, role tag naranja

### Pantallas (Auth)
- `app/(auth)/login.tsx` — Login: fondo claro, card blanca, links naranja
- `app/(auth)/register.tsx` — Registro: misma estética que login

### Pantalla de Detalle
- `app/recognition/[id].tsx` — Detalle: fondo claro, card de puntos naranja, badges adaptados

### Componentes UI Base
- `components/ui/Card.tsx` — Fondo blanco, borde `#E8ECF0`, sombra suave
- `components/ui/Button.tsx` — Primary naranja, secondary navy oscuro, outline naranja
- `components/ui/Input.tsx` — Fondo `#F0F2F5`, texto oscuro, placeholder adaptado

### Componentes Funcionales
- `components/camera/CameraView.tsx` — Scan box naranja, botón captura naranja, fondo claro
- `components/recognition/WasteResultModal.tsx` — Modal blanco, caja de puntos naranja
- `components/consent/TrainingConsentModal.tsx` — Modal blanco, bullets naranja
- `components/collection-points/PointCard.tsx` — Card blanca, distancia naranja, route naranja

## Principios de Diseño Aplicados

1. **Fondo claro uniforme** (`#F0F2F5`) en todas las pantallas
2. **Tarjetas blancas** con bordes sutiles y sombras ligeras
3. **Acento naranja cálido** (`#F37920`) como color primario de interacción
4. **Texto dark navy** (`#1B2838`) para máxima legibilidad
5. **Tab bar chip** conservada como pill flotante oscura con íconos y labels
6. **Consistencia visual** completa entre todas las pantallas y modales

## Notas

- La barra de navegación mantiene su forma de **chip/pill flotante** como se solicitó
- Solo se cambiaron **colores**, la estructura y layout de cada componente permanece igual
- El `StatusBar` cambió de `light` a `dark` para adaptarse al fondo claro
