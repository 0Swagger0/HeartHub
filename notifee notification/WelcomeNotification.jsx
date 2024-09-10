import React from "react";
import notifee, { AndroidImportance } from "@notifee/react-native";
export default async function WelcomeNotification() {
  // Create a channel (required for Android)
  const channelId = await notifee.createChannel({
    id: "welcome",
    name: "welcome Channel",
    importance: AndroidImportance.HIGH,
    vibration: false,
    sound: "friend",
  });

  await notifee.displayNotification({
    title: '<p style="color: #DC143C;"><b>Welcome</span></p></b></p> &#128576;',
    subtitle: "&#129395;",
    body: '<p style="color: #ffffff; background-color: #DC143C"><i>chat with your friends</i></p> &#127881;!',
    android: {
      channelId,
      color: "#4caf50",
    },
  });
}
