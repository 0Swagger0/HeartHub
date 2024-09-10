import { getDatabase, ref, remove, update } from "firebase/database";
import React from "react";
import { ToastAndroid } from "react-native";
import { App } from "../Firebase";

function FrienRequestAccept(data) {
  const database = getDatabase(App);

  // other user information
  const AddFriendRef = ref(
    database,
    "users/" + data.otherUid + "/" + "friends/" + data.currentUid
  );
  update(AddFriendRef, {
    username: data.username,
    userName: data.userName,
    userHobbies: data.userHobbies == "" ? "" : data.userHobbies,
    uid: data.currentUid,
    profileUrl: data.profile == "" ? "" : data.profile,
    userBio: data.userBio == "" ? "" : data.userBio,
    phoneNumber: data.phoneNumber,
    userToken: data.currentUserToken,
  }).then(() => {
    // remove child from request list
    const removeUserRef = ref(
      database,
      "users/" + data.otherUid + "/" + "request/" + data.currentUid
    );
    remove(removeUserRef).then(() => {
      sendAutoRequestToOtheruser(data);
    });
  });

  // accept request function
  function sendAutoRequestToOtheruser(data) {
    // current user information
    const AddFriendRef = ref(
      database,
      "users/" + data.currentUid + "/" + "friends/" + data.otherUid
    );
    update(AddFriendRef, {
      username: data.otherUsername,
      userName: data.otherUserName,
      userHobbies: data.otherHobbies == "" ? "" : data.otherHobbies,
      uid: data.otherUid,
      profileUrl: data.otherProfile == "" ? "" : data.otherProfile,
      userBio: data.otherBio == "" ? "" : data.otherBio,
      phoneNumber: data.otherPhonenumber,
      userToken: data.otherUserToken,
    }).then(() => {
      ToastAndroid.show(
        data.username + " is now your friend",
        ToastAndroid.SHORT
      );
      sendNotificationToUser(data);
    });
  }

  // sending notification to user
  function sendNotificationToUser(data) {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append(
      "Authorization",
      "key=AAAAVakCcv8:APA91bG8VT4gWX8UFCsrwZU7b6YaqMSIRteITOgTvbBMEqhXAvcg_2eqCUPm7Sq6aP5uznn2B5DUhmQsNJEn-sfqYdzqBvc_zTDI4t0oHGdGGXlfMLBqAS3aDQDdNV7wd84wk-SCF9dF"
    );

    var raw = JSON.stringify({
      data: {
        type: "accept request",
        title: data.otherUsername,
        body: data.otherUsername + " Accept your friend request",
        profile: data.otherProfile,
      },
      android: {
        priority: "high",
      },
      priority: 10,
      to: data.currentUserToken,
    });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch("https://fcm.googleapis.com/fcm/send", requestOptions);
  }
}

export default FrienRequestAccept;
