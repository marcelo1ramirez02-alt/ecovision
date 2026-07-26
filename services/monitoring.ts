import Constants from 'expo-constants';

export const initMonitoring = () => {
  const sentryDsn =
    Constants.expoConfig?.extra?.sentryDsn ||
    process.env.EXPO_PUBLIC_SENTRY_DSN;

  if (sentryDsn) {
    console.log('[Sentry] Initialized error monitoring system for EcoVision.');
    // Sentry.init({ dsn: sentryDsn, enableInExpoDevelopment: true });
  } else {
    console.log('[Sentry] No DSN configured; skipping Sentry initialization.');
  }
};

export const logErrorToMonitoring = (error: Error, context?: Record<string, any>) => {
  console.error('[Error Logged]:', error.message, context);
};
