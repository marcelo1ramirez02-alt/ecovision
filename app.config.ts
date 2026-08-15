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
      buildNumber: '1',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#0F172A',
      },
      package: isDev ? 'com.ecovision.ai.dev' : 'com.ecovision.ai',
      versionCode: 1,
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
        projectId: '86993bac-9d9c-43b2-912f-ded3842a3882',
      },
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      mapboxToken: process.env.EXPO_PUBLIC_MAPBOX_KEY || process.env.MAPBOX_ACCESS_TOKEN,
      cloudinaryCloudName: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME,
      cloudinaryUploadPreset: process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
      sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
      appEnv: process.env.APP_ENV || 'development',
    },
  };
};
