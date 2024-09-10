import { registerRootComponent } from "expo";
import messaging from "@react-native-firebase/messaging";
import Apps from "./App";
import RequestNotification from "./notifee notification/RequestNotification";
import ChatingNotification from "./notifee notification/ChatingNotification";
import AcceptRequestNotificatiom from "./notifee notification/AcceptRequestNotificatiom";
import AddedToGroupNotification from "./notifee notification/AddedToGroupNotification";
import GroupMessagesNotification from "./notifee notification/GroupMessagesNotification";
import ShowAdminNotification from "./notifee notification/ShowAdminNotification";
import RemoveFromGroupNotification from "./notifee notification/RemoveFromGroupNotification";
import GroupLeftBySelfNotification from "./notifee notification/GroupLeftBySelfNotification";
import notifee, { EventType } from "@notifee/react-native";
import UpdateChating from "./notifee notification/UpdateChating";
import UpdateGroupChating from "./notifee notification/UpdateGroupChating";
import FrienRequestAccept from "./notifee notification/FrienRequestAccept";
import { getDatabase, ref, update } from "firebase/database";
import { App } from "./Firebase";
import { navigationRef } from "./App";
const database = getDatabase(App);

// navigate screen from notifications
notifee.onBackgroundEvent(async ({ type, detail }) => {
  const { notification, pressAction } = detail;
  const notificationData = notification.data.notification.data;
  const otherUid = notificationData.sendBy;
  const currenuseruid = notificationData.receiveBy;
  if (type === EventType.PRESS) {
    if (notificationData.screen == "ChatScreen") {
      updateMessageCountTo_0(currenuseruid, otherUid);
      userIsOnYourScreen(currenuseruid, otherUid);
      navigateToChatScreen(notification.data.notification.data);
    } else if (notificationData.screen == "GroupChatScreen") {
      navigateToGroupChatScreen(notificationData);
    } else if (notificationData.screen == "Request") {
      navigationRef.current?.navigate("Request");
    }
  }

  // actions press
  // Check if the user pressed the "Mark as read" action
  if (type === EventType.ACTION_PRESS && pressAction.id === "accept request") {
    // Remove the notification
    await notifee.cancelNotification(notification.id);
    FrienRequestAccept(notification.data.notification.data);
  }
  if (type === EventType.ACTION_PRESS && pressAction.id === "Ignore request") {
    // Remove the notification
    // ignore reques
    await notifee.cancelNotification(notification.id);
  }

  // condition for chating
  if (type === EventType.ACTION_PRESS && pressAction.id === "reply") {
    UpdateChating(notification.data.notification.data, detail.input);
    updateMessageCountTo_0(notificationData.receiveBy);
  }

  // condition for chating
  if (type === EventType.ACTION_PRESS && pressAction.id === "group reply") {
    UpdateGroupChating(
      notification.data.notification.data,
      notification.data.currentuserdata,
      detail.input
    );
  }
});
// navigate screen from notifications
function navigateToChatScreen(data) {
  navigationRef.current?.navigate("ChatScreen", { data: data });
}

// navigate screen from notifications
function navigateToGroupChatScreen(data) {
  navigationRef.current?.navigate("GroupChatScreen", {
    groupRoomId: data.groupRoomId,
    imageUrl: data.groupImage,
    groupName: data.groupName,
    tagline: data.groupTagline,
  });
}

// user in yout chat screen ake true from background state
function userIsOnYourScreen(currenuseruid, otherUid) {
  const userInYourScreenRef = ref(
    database,
    "chatList/" + otherUid + "/" + currenuseruid
  );
  update(userInYourScreenRef, { inYourChatScreen: true });
}

// // update message count to 0
function updateMessageCountTo_0(currenuseruid, otherUid) {
  const updateMesageCountRef = ref(
    database,
    "chatList/" + currenuseruid + "/" + otherUid
  );
  update(updateMesageCountRef, { messageCount: 0 });
}

// notification receive from firebase notification point
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  if (remoteMessage.data.type === "admin") {
    ShowAdminNotification(remoteMessage);
  } else if (remoteMessage.data.type === "friend request") {
    RequestNotification(remoteMessage);
  } else if (remoteMessage.data.type === "chating") {
    ChatingNotification(remoteMessage);
  } else if (remoteMessage.data.type === "accept request") {
    AcceptRequestNotificatiom(remoteMessage);
  } else if (remoteMessage.data.type === "added to group") {
    AddedToGroupNotification(remoteMessage);
  } else if (remoteMessage.data.type === "group messages") {
    GroupMessagesNotification(remoteMessage);
  } else if (remoteMessage.data.type === "remove from group") {
    RemoveFromGroupNotification(remoteMessage);
  } else if (remoteMessage.data.type === "group left by self") {
    GroupLeftBySelfNotification(remoteMessage);
  }
});
messaging().onMessage(async (remoteMessage) => {
  if (remoteMessage.data.type === "accept request") {
    AcceptRequestNotificatiom(remoteMessage);
  } else if (remoteMessage.data.type === "added to group") {
    AddedToGroupNotification(remoteMessage);
  } else if (remoteMessage.data.type === "remove from group") {
    RemoveFromGroupNotification(remoteMessage);
  } else if (remoteMessage.data.type === "group left by self") {
    GroupLeftBySelfNotification(remoteMessage);
  }
});
// notification receive from firebase notification point

registerRootComponent(Apps);
