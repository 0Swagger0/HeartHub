import React, { useEffect } from "react";
import moment from "moment";
import { getDatabase, push, ref, update } from "firebase/database";
import { App } from "../Firebase";

const UpdateChating = (data, input) => {
  const database = getDatabase(App);
  const time = moment().valueOf();
  const roomId = data.roomId;
  const message = input;
  const otherUid = data.sendBy;
  const currentUserUid = data.receiveBy;
  const otherusername = data.username;
  const otheruserprofile = data.profileUrl;
  const currentuserprofile = data.otherProfile;
  const currentusername = data.otherUsername;
  const currentUserToken = data.otherUserToken;
  const otherUserToken = data.currentUserToken;
  const otherUserName = data.currentUserName;
  const currentUserName = data.userName;
  // message data
  const messageData = {
    message: message,
    sendBy: currentUserUid,
    receiveBy: otherUid,
    time: time,
    messageType: "text",
    imageUrl: currentuserprofile,
  };

  const createmessagelistRef = push(
    ref(database, "messageList/" + roomId + "/")
  );
  const key = createmessagelistRef.key;
  messageData.messageId = key;
  update(createmessagelistRef, messageData).then(() => {
    sendNotificationToUser();
  });

  // sending notification to user
  function sendNotificationToUser() {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append(
      "Authorization",
      "key=AAAAVakCcv8:APA91bG8VT4gWX8UFCsrwZU7b6YaqMSIRteITOgTvbBMEqhXAvcg_2eqCUPm7Sq6aP5uznn2B5DUhmQsNJEn-sfqYdzqBvc_zTDI4t0oHGdGGXlfMLBqAS3aDQDdNV7wd84wk-SCF9dF"
    );

    var raw = JSON.stringify({
      data: {
        type: "chating",
        screen: "ChatScreen",
        message: message,
        profileUrl: currentuserprofile,
        username: currentusername,
        userName: otherUserName,
        currentUserName: currentUserName,
        sendBy: currentUserUid,
        receiveBy: otherUid,
        roomId: roomId,
        uid: currentUserUid,
        otherUsername: otherusername,
        otherProfile: otheruserprofile,
        userToken: currentUserToken,
        currentUserToken: currentUserToken,
        otherUserToken: otherUserToken,
      },
      android: {
        priority: "high",
      },
      priority: 10,
      to: otherUserToken,
    });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch("https://fcm.googleapis.com/fcm/send", requestOptions);
  }
};

export default UpdateChating;
