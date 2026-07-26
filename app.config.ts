import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const isDev = process.env.APP_ENV !== 'production';

  return {
    ...config,
    name: isDev ? 'EcoVision AI (Dev)' : 'EcoVision AI',
    slug: 'ecovision',
    owner: 'hobbits',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'dark',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#0F172A',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: isDev ? 'com.ecovision.ai.dev' : 'com.ecovision.ai',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#0F172A',
      },
      package: isDev ? 'com.ecovision.ai.dev' : 'com.ecovision.ai',
      permissions: [
        'CAMERA',
        'ACCESS_FINE_LOCATION',
        'ACCESS_COARSE_LOCATION',
        'POST_NOTIFICATIONS',
      ],
    },
    web: {
      favicon: './assets/favicon.png',
      bundler: 'metro',
    },
    plugins: [
      'expo-router',
      [
        'expo-camera',
        {
          cameraPermission: 'Allow EcoVision to access camera to identify recyclable waste.',
        },
      ],
      [
        'expo-location',
        {
          locationAlwaysAndWhenInUsePermission: 'Allow EcoVision to access your location to find nearby collection points.',
        },
      ],
      [
        '@rnmapbox/maps',
        {
          RNMapboxMapsDownloadToken: process.env.EXPO_PUBLIC_MAPBOX_DOWNLOAD_TOKEN || '',
        },
      ],
    ],
    extra: {
      eas: {
        projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID,
      },
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      mapboxToken: process.env.MAPBOX_ACCESS_TOKEN || process.env.EXPO_PUBLIC_MAPBOX_KEY,
      cloudinaryCloudName: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME,
      cloudinaryUploadPreset: process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
      sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
      appEnv: process.env.APP_ENV || 'development',
    },
  };
};
