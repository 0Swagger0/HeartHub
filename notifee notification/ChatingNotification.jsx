import notifee, {
  AndroidImportance,
  AndroidStyle,
} from "@notifee/react-native";
import user from "../src/images/user.png";

async function ChatingNotification(notification) {
  const message = notification.data.message;
  const username = notification.data.username;
  const otherUsername = notification.data.otherUsername;
  const notificationId = notification.data.roomId;
  const profile = notification.data.profileUrl;
  const otherProfile = notification.data.otherProfile;
  const userIcon =
    "https://firebasestorage.googleapis.com/v0/b/jindagi-16073.appspot.com/o/app%20images%2FuserIconPlaceHolder%2Fuser.png?alt=media&token=1fc9ee0c-967f-4051-a3e1-a796a475f479";

  // Request permissions (required for iOS)
  await notifee.requestPermission();

  // Create a channel (required for Android)
  const channelId = await notifee.createChannel({
    id: "chating",
    name: "chating Channel",
    importance: AndroidImportance.HIGH,
    vibration: true,
    sound: "friend",
  });

  await notifee.displayNotification({
    title: username,
    body: message,
    id: notificationId,
    data: { notification },
    subtitle: username,
    android: {
      sound: "friend",
      channelId,
      smallIcon: "ic_launcher",
      circularLargeIcon: true,
      showTimestamp: true,
      color: "#DC143C",
      style: {
        type: AndroidStyle.MESSAGING,
        title: username,
        person: {
          name: "You",
          icon: otherProfile == "" ? userIcon : otherProfile,
        },
        messages: [
          {
            text: message,
            timestamp: Date.now(), // Now
            person: {
              name: username,
              icon: profile == "" ? userIcon : profile,
            },
          },
        ],
      },
      pressAction: {
        id: "default",
      },
      actions: [
        {
          title: "Reply",
          pressAction: {
            id: "reply",
          },
          input: {
            placeholder: "Reply",
          },
        },
      ],
    },
  });
}
export default ChatingNotification;
