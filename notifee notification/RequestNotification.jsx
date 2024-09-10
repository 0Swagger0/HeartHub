import React from "react";
import notifee, { AndroidImportance } from "@notifee/react-native";
import user from "../src/images/user.png";

async function RequestNotification(notification) {
  // friend request notifee custom notification
  // // Request permissions (required for iOS)
  await notifee.requestPermission();
  const profile = notification.data.profile;

  // Create a channel (required for Android)
  const channelId = await notifee.createChannel({
    id: "Friend request",
    name: "Friend request channel",
    importance: AndroidImportance.HIGH,
    vibration: true,
    sound: "friend",
  });

  // Display a notification
  notifee.displayNotification({
    title: notification.data.title,
    body: notification.data.body,
    data: { notification },
    subtitle: notification.data.title,

    android: {
      sound: "friend",
      circularLargeIcon: true,
      largeIcon: profile == "" ? user : profile,
      channelId,
      smallIcon: "ic_launcher",
      actions: [
        {
          title: "Accept",
          forground: true,
          pressAction: {
            id: "accept request",
          },
        },
        {
          title: "Ignore",
          forground: true,
          pressAction: {
            id: "Ignore request",
          },
        },
      ],
    },
  });
}

export default RequestNotification;
