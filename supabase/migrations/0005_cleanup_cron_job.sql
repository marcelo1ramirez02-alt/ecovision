-- Migration 0005: Schedule daily Cloudinary storage cleanup cron job

-- Enable pg_cron and pg_net extensions if they are not already active
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Safely unschedule if it already exists to avoid duplicate schedules
SELECT cron.unschedule('cleanup-old-images-daily')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'cleanup-old-images-daily'
);

-- Schedule the cleanup function to run every day at midnight (00:00 UTC)
-- Note: Replace 'onmypacggdhglyuyntcp' with your production project reference if different,
-- and 'YOUR_SUPABASE_SERVICE_ROLE_KEY' with your project's service_role secret key in production.
SELECT cron.schedule(
  'cleanup-old-images-daily',
  '0 0 * * *',
  $$
  SELECT net.http_post(
    url := 'https://onmypacggdhglyuyntcp.supabase.co/functions/v1/cleanup-old-images',
    headers := '{
      "Content-Type": "application/json",
      "Authorization": "Bearer YOUR_SUPABASE_SERVICE_ROLE_KEY"
    }'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
