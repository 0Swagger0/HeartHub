import React from "react";
import notifee, {
  AndroidImportance,
  AndroidStyle,
} from "@notifee/react-native";
export default async function ShowAdminNotification(notification) {
  // Create a channel (required for Android)
  const channelId = await notifee.createChannel({
    id: "admin",
    name: "admin Channel",
    importance: AndroidImportance.HIGH,
    vibration: false,
    sound: "friend",
  });

  await notifee.displayNotification({
    title: notification.data.title,
    body: notification.data.text,
    subtitle: "admin",
    data: { notification },
    android: {
      sound: "friend",
      channelId,
      showTimestamp: true,
      smallIcon: "ic_launcher",
      color: "#DC143C",
      pressAction: {
        id: "default",
      },

      style: {
        type: AndroidStyle.BIGTEXT,
        title: notification.data.title,
        text: notification.data.text,
      },
    },
  });
}
