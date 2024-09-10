import React from "react";
import moment from "moment";
import { getDatabase, onValue, push, ref, update } from "firebase/database";
import { App } from "../Firebase";

export default async function UpdateGroupChating(data, currentuserdata, input) {
  const database = getDatabase(App);
  const time = moment().valueOf();
  const groupRoomId = data.groupRoomId;
  const groupImage = data.groupImage;
  const groupName = data.groupName;
  const message = input;
  const profile = currentuserdata.currentuserprofile;
  const username = currentuserdata.currentusername;
  const currentuseruid = currentuserdata.currentuseruid;
  const memberstokens = data.memberTokens;
  const currentusertoken = data.currentusertoken;

  // console.log("data =>" + " " + data);
  // console.log("current user data =>" + " " + currentuserdata);
  // console.log("input =>" + " " + input);

  // message data
  const messageData = {
    message: message,
    sendBy: currentuseruid,
    time: time,
    messageType: "text",
    profileUrl: profile,
    username: username,
  };

  const createmessagelistRef = push(
    ref(database, "groupMessageList/" + groupRoomId + "/")
  );
  const key = createmessagelistRef.key;
  messageData.messageId = key;
  update(createmessagelistRef, messageData).then(() => {
    const gettingUserToken = ref(
      database,
      "chatList/" + currentuseruid + "/" + groupRoomId + "/" + "members/"
    );
    onValue(gettingUserToken, (snapshort) => {
      snapshort.forEach((tokens) => {
        const arry = [];
        const token = tokens.child("userToken").val();
        if (token) {
          arry.push(token);
          arry.map((Tokens) => {
            sendNotificationToAllGroupMembers(Tokens);
          });
        }
      });
    });
  });

  // send notification to all group member
  function sendNotificationToAllGroupMembers(tokens) {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append(
      "Authorization",
      "key=AAAAVakCcv8:APA91bG8VT4gWX8UFCsrwZU7b6YaqMSIRteITOgTvbBMEqhXAvcg_2eqCUPm7Sq6aP5uznn2B5DUhmQsNJEn-sfqYdzqBvc_zTDI4t0oHGdGGXlfMLBqAS3aDQDdNV7wd84wk-SCF9dF"
    );

    var raw = JSON.stringify({
      data: {
        type: "group messages",
        screen: "GroupChatScreen",
        groupName: groupName,
        message: message,
        groupImage: groupImage,
        username: username,
        currentUserImageUrl: profile,
        groupRoomId: groupRoomId,
        memberTokens: memberstokens,
      },

      android: {
        priority: "high",
      },
      priority: 10,
      to: tokens == currentusertoken ? "" : tokens,
    });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch("https://fcm.googleapis.com/fcm/send", requestOptions)
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => console.log("error", error));
  }
}
