# Corrección de Error en Migración de Cron Job (pg_cron)

Este documento detalla la solución implementada para corregir el error surgido al aplicar las migraciones de base de datos de Supabase en producción.

## Descripción del Problema

Al ejecutar el comando `npx supabase db push` para aplicar las migraciones en la base de datos remota, el proceso fallaba al procesar la migración `0005_cleanup_cron_job.sql` con el siguiente error:

```bash
Applying migration 0005_cleanup_cron_job.sql...
ERROR: must be owner of relation job (SQLSTATE 42501)
At statement: 4
COMMENT ON COLUMN cron.job.jobname IS 'Daily cron job to delete old and non-consented images from Cloudinary storage'
```

### Causa del Error

El error `SQLSTATE 42501 (must be owner of relation job)` ocurre porque la migración intentaba ejecutar una sentencia `COMMENT ON COLUMN` sobre la tabla `cron.job`. Esta tabla es parte de la extensión del sistema `pg_cron` y su propiedad (owner) pertenece a un rol de superusuario del sistema (como `supabase_admin`), no al rol utilizado por la CLI de Supabase para aplicar migraciones (`postgres` o similar). Por lo tanto, el motor de PostgreSQL deniega los privilegios para modificar o documentar columnas en tablas que no pertenecen al rol ejecutor.

Además, añadir un comentario descriptivo en una columna propia del sistema (`cron.job.jobname`) alteraría la metadata de la extensión a nivel global, lo cual es innecesario para el funcionamiento del cron job.

## Cambios Realizados

Se modificó el archivo de migración para remover la sentencia de comentario que causaba el fallo de privilegios:

### 1. [MODIFICADO] `supabase/migrations/0005_cleanup_cron_job.sql`
[Ver archivo](../../supabase/migrations/0005_cleanup_cron_job.sql)

Se eliminó la línea final que intentaba comentar la columna del sistema:

```diff
- COMMENT ON COLUMN cron.job.jobname IS 'Daily cron job to delete old and non-consented images from Cloudinary storage';
```

## Verificación y Resultados

Se ejecutó nuevamente la migración en la base de datos remota mediante el CLI:

```bash
npx supabase db push
```

**Resultado obtenido:**
```bash
Initialising login role...
Connecting to remote database...
Applying migration 0005_cleanup_cron_job.sql...
{"upToDate":false,"dryRun":false,"migrations":["0005_cleanup_cron_job.sql"],"seeds":[],"roles":[],"message":"Finished supabase db push."}
```

La migración se aplicó exitosamente, confirmando que la programación del cron job `cleanup-old-images-daily` en `pg_cron` está activa y configurada correctamente en el entorno de producción sin generar problemas de permisos.
