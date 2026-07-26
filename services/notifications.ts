import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from './supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const registerForPushNotificationsAsync = async (): Promise<string | null> => {
  let token: string | null = null;

  if (Platform.OS === 'web') {
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Failed to get push token for push notification!');
    return null;
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync();
    token = tokenData.data;

    // Save token to Supabase table
    const { data: { user } } = await supabase.auth.getUser();
    if (user && token) {
      await supabase.from('push_tokens').upsert(
        {
          user_id: user.id,
          expo_push_token: token,
          device_type: Platform.OS,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'expo_push_token' }
      );
    }
  } catch (error) {
    console.error('Error fetching Expo Push Token:', error);
  }

  return token;
};
