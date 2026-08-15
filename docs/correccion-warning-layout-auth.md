# Corrección del Warning de Layout en (auth)

Este documento detalla la implementación realizada para solucionar el warning generado por Expo Router sobre la ruta `(auth)`.

## Descripción del Problema
Al iniciar la aplicación, se presentaba el siguiente warning/error en la consola:
```
[Layout children]: No route named "(auth)" exists in nested children: 
(6) ['_sitemap', '+not-found', '(auth)/login', '(auth)/register', '(tabs)', 'recognition/[id]']
```

### Causa
En Expo Router, cuando se define un grupo de rutas en el layout principal (ej. `<Stack.Screen name="(auth)" />` en `app/_layout.tsx`), el framework espera encontrar un archivo de layout (`_layout.tsx`) dentro de dicho grupo para considerarlo un nodo de navegación válido.

Dado que la carpeta `app/(auth)` contenía únicamente `login.tsx` y `register.tsx` sin un `_layout.tsx` propio, Expo Router exponía `(auth)/login` y `(auth)/register` como rutas individuales directamente bajo la raíz, provocando que la pantalla `(auth)` declarada en el Stack del layout principal no fuera encontrada.

## Cambios Realizados

Se creó el archivo layout para el grupo de autenticación:

### 1. [NUEVO] `app/(auth)/_layout.tsx`
[Ver archivo](../../app/(auth)/_layout.tsx)

```tsx
import React from 'react';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F8FAFC' },
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
```

## Verificación y Resultados
Con esta adición, Expo Router agrupa correctamente las pantallas bajo la ruta `(auth)`, lo que:
1. Resuelve completamente el warning `No route named "(auth)" exists`.
2. Permite que la redirección mediante `router.replace('/(auth)/login')` funcione correctamente sin inconsistencias en el árbol de navegación.
