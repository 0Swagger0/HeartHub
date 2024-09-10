import React from "react";
import notifee, { AndroidImportance } from "@notifee/react-native";

export default async function AddedToGroupNotification(notification) {
  // Create a channel (required for Android)
  const channelId = await notifee.createChannel({
    id: "added to group",
    name: "added to group channel",
    importance: AndroidImportance.HIGH,
    vibration: true,
  });

  // Display a notification
  notifee.displayNotification({
    title: notification.data.title,
    body: notification.data.body,
    subtitle: notification.data.groupName,
    data: { notification },
    android: {
      circularLargeIcon: true,
      largeIcon: notification.data.groupImageUrl,
      channelId,
      importance: AndroidImportance.HIGH,
      smallIcon: "ic_launcher",

      pressAction: {
        launchActivity: "default",
        id: "default",
      },
    },
  });
}
