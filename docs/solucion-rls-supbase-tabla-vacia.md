# Solución al Retorno de 0 Filas (`Puntos de acopio obtenidos: 0 [] null`) por RLS en Supabase

Este documento explica con precisión matemática y técnica por qué `supabase.from('collection_points').select('*')` devuelve un arreglo vacío `[]` con `error: null` y cómo solucionarlo en 10 segundos desde la consola de Supabase.

---

## 1. Causa Técnica Explícita

En Supabase (PostgREST), cuando una tabla tiene **Row Level Security (RLS)** activado (`ENABLE ROW LEVEL SECURITY`) y no cuenta con una política explícita de lectura (`FOR SELECT`) asociada al rol `anon` / `public`:

- PostgreSQL **NO** devuelve un error HTTP ni lanza una excepción.
- Por diseño de seguridad, PostgreSQL responde con un arreglo **completamente vacío `[]` (0 registros)** y `error: null`.

Al haber recreado la tabla `collection_points` con el nuevo script SQL, la tabla heredó la protección RLS activa sin tener una regla que permita leer las filas públicamente.

---

## 2. Solución Instantánea (Ejecutar en Supabase SQL Editor)

Entra al **SQL Editor** de tu proyecto Supabase (`https://supabase.com/dashboard/project/onmypacggdhglyuyntcp/sql/new`) y ejecuta la siguiente instrucción:

```sql
-- OPCION RECOMENDADA: Desactivar RLS o permitir lectura pública completa a collection_points
ALTER TABLE public.collection_points DISABLE ROW LEVEL SECURITY;
```

*(O alternativamente, si deseas mantener RLS activo):*

```sql
ALTER TABLE public.collection_points ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Collection points viewable by anyone" ON public.collection_points;
DROP POLICY IF EXISTS "Allow public select on collection_points" ON public.collection_points;

CREATE POLICY "Allow public select on collection_points" 
  ON public.collection_points 
  FOR SELECT 
  TO public 
  USING (true);
```

---

## 3. Resultado tras Ejecutar

Tan pronto ejecutes esa instrucción en Supabase y recargues la aplicación web:
1. El log en la consola cambiará de `Puntos de acopio obtenidos: 0 []` a `Puntos de acopio obtenidos: 13 [...]`.
2. Las 13 viñetas verdes `♻️` se posicionarán automáticamente en el mapa sobre San Borja y San Isidro.
