import React, { useState } from "react";
import notifee, {
  AndroidImportance,
  AndroidStyle,
} from "@notifee/react-native";
import { onAuthStateChanged } from "firebase/auth";
import { App, Auth } from "../Firebase";
import { getDatabase, onValue, ref } from "firebase/database";

export default async function GroupMessagesNotification(notification) {
  const database = getDatabase(App);
  const message = notification.data.message;
  const username = notification.data.username;
  const groupName = notification.data.groupName;
  const notificationId = notification.data.groupRoomId;
  const profile = notification.data.groupImage;
  const currentUserImageUrl = notification.data.currentUserImageUrl;
  let Currentuseruid;
  let Currentuserprofile;
  let Currentusername;

  const userIcon =
    "https://firebasestorage.googleapis.com/v0/b/jindagi-16073.appspot.com/o/app%20images%2FuserIconPlaceHolder%2Fuser.png?alt=media&token=1fc9ee0c-967f-4051-a3e1-a796a475f479";

  onAuthStateChanged(Auth, (user) => {
    if (user) {
      loadInformation(user.uid);
    }
  });

  // load information
  function loadInformation(uid) {
    const inforRef = ref(database, "users/" + uid + "/");
    onValue(inforRef, (snapshort) => {
      const currentuseruid = snapshort.child("uid").val();
      const currentuserprofile = snapshort.child("profileUrl").val();
      const currentusername = snapshort.child("username").val();
      if (currentuseruid) {
        Currentuseruid = currentuseruid;
        Currentusername = currentusername;
      }
      if (currentuserprofile) {
        Currentuserprofile = currentuserprofile;
      }
    });
  }

  // Create a channel (required for Android)
  const channelId = await notifee.createChannel({
    id: "group chating",
    name: "group chating Channel",
    importance: AndroidImportance.HIGH,
    vibration: true,
    sound: "friend",
  });

  await notifee.displayNotification({
    title: username,
    body: message,
    id: notificationId,
    data: {
      notification,
      currentuserdata: {
        currentuseruid: Currentuseruid,
        currentuserprofile:
          Currentuserprofile == null ? "" : Currentuserprofile,
        currentusername: Currentusername,
      },
    },
    android: {
      sound: "friend",
      channelId,
      showTimestamp: true,
      smallIcon: "ic_launcher",
      color: "#DC143C",
      largeIcon: profile,
      circularLargeIcon: true,
      pressAction: {
        id: "default",
      },
      style: {
        type: AndroidStyle.MESSAGING,
        title: groupName,
        group: true,
        person: {
          name: "You",
          icon: userIcon,
        },

        messages: [
          {
            text: message,
            timestamp: Date.now(),
            person: {
              name: username,
              icon:
                currentUserImageUrl == null ? userIcon : currentUserImageUrl,
            },
          },
        ],
      },
      actions: [
        {
          title: "Reply",
          pressAction: {
            id: "group reply",
          },
          input: {
            placeholder: "Reply",
          },
        },
      ],
    },
  });
}
