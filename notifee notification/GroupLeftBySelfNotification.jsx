import notifee, {
  AndroidImportance,
  AndroidStyle,
} from "@notifee/react-native";

export default async function GroupLeftBySelfNotification(notification) {
  // Create a channel (required for Android)
  const channelId = await notifee.createChannel({
    id: "remove from group",
    name: "remove from group Channel",
    importance: AndroidImportance.HIGH,
    vibration: false,
  });

  await notifee.displayNotification({
    title: notification.data.title,
    body: notification.data.body,
    subtitle: notification.data.groupName,
    data: { notification },

    android: {
      channelId,
      showTimestamp: true,
      smallIcon: "ic_launcher",
      color: "#DC143C",
      largeIcon: notification.data.groupProfile,
      circularLargeIcon: true,
      pressAction: {
        id: "default",
      },
      style: {
        type: AndroidStyle.BIGTEXT,
        title: notification.data.title,
        text: notification.data.body,
      },
    },
  });
}
