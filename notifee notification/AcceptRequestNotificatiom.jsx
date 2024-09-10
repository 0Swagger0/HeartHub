import React from "react";
import notifee, { AndroidImportance } from "@notifee/react-native";
import user from "../src/images/user.png";

const AcceptRequestNotificatiom = async (notification) => {
  // Create a channel (required for Android)
  const profile = notification.data.profile;
  const channelId = await notifee.createChannel({
    id: "Accept request",
    name: "Accept request channel",
    importance: AndroidImportance.HIGH,
    vibration: false,
  });

  // Display a notification
  notifee.displayNotification({
    title: notification.data.title,
    body: notification.data.body,
    subtitle: notification.data.title,
    android: {
      showTimestamp: true,
      circularLargeIcon: true,
      largeIcon: profile == "" ? user : profile,
      channelId,
      smallIcon: "ic_launcher",
    },
  });
};

export default AcceptRequestNotificatiom;
