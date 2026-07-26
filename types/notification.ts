export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
}

export interface RegisterPushTokenParams {
  userId: string;
  expoPushToken: string;
  deviceType?: string;
}
