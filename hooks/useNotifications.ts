import { useState, useEffect } from 'react';
import { registerForPushNotificationsAsync } from '../services/notifications';

export const useNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        setExpoPushToken(token);
      }
    });
  }, []);

  return {
    expoPushToken,
  };
};
