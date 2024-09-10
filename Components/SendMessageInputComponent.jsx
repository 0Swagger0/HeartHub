import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ToastAndroid,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import Lottie from "lottie-react-native";
import { getDatabase, onValue, push, ref, update } from "firebase/database";
import moment from "moment";
import { App } from "../Firebase";
import Icon from "react-native-vector-icons/MaterialIcons";
import Animated, { SlideInDown, SlideInRight } from "react-native-reanimated";

export default function SendMessageInputComponent({
  userName,
  uid,
  currentUserUid,
  currentUserImageUrl,
  currentUserName,
  imageUrl,
  roomId,
  username,
  currentusername,
  currentUserToken,
  otherUserToken,
  isReplying,
  setIsReplying,
  ReplyData,
  OffSetPositionValue,
}) {
  const [otherUid, setOtherUid] = useState("");
  const [messageForSend, setMessageForSend] = useState("");
  const [isTyping, setisTyping] = useState(false);

  // ref

  const [isBlock, setCheckIsUserBlock] = useState("");
  const [isCurrentUserBlocked, setIsCurrentUserBlocked] = useState("");

  const database = getDatabase(App);
  const time = moment().valueOf();

  // message count variable
  const [messageCountValue, setMessageCountValue] = useState(0);
  const [isUserInYourChatScreen, setIsUserInYourChatScreen] = useState();

  const [LastMessageID, setLastMessageID] = useState("");

  // create current user chat list
  const sendCurrentUserChatListData = {
    type: "user",
    userName: userName,
    username: username,
    profileUrl: imageUrl,
    roomId: roomId,
    time: time,
    lastMessage: messageForSend,
    sendBy: currentUserUid,
    receiveBy: uid,
    isTyping: false,
    uid: uid,
    userToken: otherUserToken,
  };

  // create other user chat list

  const sendOtherUserChatListData = {
    type: "user",
    userName: currentUserName,
    username: currentusername,
    profileUrl: currentUserImageUrl,
    time: time,
    roomId: roomId,
    lastMessage: messageForSend,
    sendBy: currentUserUid,
    receiveBy: uid,
    isTyping: false,
    uid: currentUserUid,
    userToken: currentUserToken,
  };

  const messageData = {
    message: messageForSend,
    sendBy: currentUserUid,
    receiveBy: uid,
    time: sendCurrentUserChatListData.time,
    messageType: "text",
    imageUrl: currentUserImageUrl,
  };

  const ReplyMessageData = {
    message: messageForSend,
    sendBy: currentUserUid,
    receiveBy: uid,
    time: sendCurrentUserChatListData.time,
    messageType: "text",
    imageUrl: currentUserImageUrl,
    replyMessage: ReplyData.message,
    replyTo: ReplyData.sendBy,
    reply: true,
    yPosition: OffSetPositionValue == null ? 0 : OffSetPositionValue,
  };

  //check typing status
  useEffect(() => {
    const userInfoRef = ref(
      database,
      "chatList/" + currentUserUid + "/" + uid + "/"
    );
    onValue(userInfoRef, (snapshort) => {
      const typingStatus = snapshort.child("isTyping").val();
      if (typingStatus) {
        if (typingStatus == "true") {
          setisTyping(true);
        } else {
          setisTyping(false);
        }
      }
    });
    checkUserIsBlock();
    checkOtherIsBlockedCurrentUser();
    loadOtherUserInfo();
    checkUserIsYourScreen();
  }, [currentUserUid]);

  // message count load
  useEffect(() => {
    const loadMessageCountRef = ref(
      database,
      "chatList/" + uid + "/" + currentUserUid
    );
    onValue(loadMessageCountRef, (snapshort) => {
      setMessageCountValue(0);
      const messageCount = snapshort.child("messageCount").val();
      if (messageCount) {
        setMessageCountValue(messageCount);
      }
    });
  }, [createMessageList]);
  // message count load

  // user in your screen
  function checkUserIsYourScreen() {
    const checkUserIsYourScreenRef = ref(
      database,
      "chatList/" + currentUserUid + "/" + uid
    );
    onValue(checkUserIsYourScreenRef, (snapshort) => {
      const isYourScreen = snapshort.child("inYourChatScreen").val();
      if (isYourScreen != null) {
        if (isYourScreen == true) {
          setIsUserInYourChatScreen(true);
        } else {
          setIsUserInYourChatScreen(false);
        }
      }
    });
  }

  // load other user information
  function loadOtherUserInfo() {
    const loadOthertUserInfoRef = ref(database, "users/" + uid + "/");
    onValue(loadOthertUserInfoRef, (snapshort) => {
      const otherUid = snapshort.child("uid").val();
      if (uid) {
        setOtherUid(otherUid);
      }
    });
  }

  // // check user is block
  function checkUserIsBlock() {
    const isUserBlockRef = ref(
      database,
      "users/" + currentUserUid + "/" + "friends/" + uid
    );
    onValue(isUserBlockRef, (snapshort) => {
      const checkBlock = snapshort.child("Block").val();
      if (checkBlock) {
        setCheckIsUserBlock(checkBlock);
      }
    });
  }

  // //check is other user blocked current user
  function checkOtherIsBlockedCurrentUser() {
    const checkCurrentUserBlockRef = ref(
      database,
      "users/" + uid + "/" + "friends/" + currentUserUid
    );
    onValue(checkCurrentUserBlockRef, (snapshort) => {
      const isBlock = snapshort.child("Block").val();
      if (isBlock) {
        setIsCurrentUserBlocked(isBlock);
      }
    });
  }

  // create user is typing
  useEffect(() => {
    if (otherUid) {
      const userIsTyping = ref(
        database,
        "chatList/" + otherUid + "/" + currentUserUid + "/"
      );
      if (messageForSend != "") {
        update(userIsTyping, { isTyping: "true" });
      } else if (messageForSend == "") {
        update(userIsTyping, { isTyping: "false" });
      }
    }
  }, [messageForSend]);

  // send message to user
  function createMessageList() {
    // user replying
    if (isReplying) {
      const createReplyMessagelistRef = push(
        ref(database, "messageList/" + roomId + "/")
      );
      const key = createReplyMessagelistRef.key;
      ReplyMessageData.messageId = key;
      setMessageForSend("");
      setIsReplying(false);
      update(createReplyMessagelistRef, ReplyMessageData);
      // send push notification
      updateChatList();
      sendChatingNotification();
      updateMessageCountInChatList();

      // normal message
    } else {
      const createmessagelistRef = push(
        ref(database, "messageList/" + roomId + "/")
      );
      const key = createmessagelistRef.key;
      messageData.messageId = key;
      setMessageForSend("");
      update(createmessagelistRef, messageData);
      // send push notification
      updateChatList();
      sendChatingNotification();
      updateMessageCountInChatList();
    }
  }

  // update message count in chat list
  function updateMessageCountInChatList() {
    if (isUserInYourChatScreen == false) {
      const updateMessageCountRef = ref(
        database,
        "chatList/" + uid + "/" + currentUserUid
      );

      update(updateMessageCountRef, {
        messageCount: messageCountValue + 1,
      });
    }
  }

  // update chatList

  function updateChatList() {
    const createChatListRef = ref(
      database,
      "chatList/" + currentUserUid + "/" + uid + "/"
    );
    update(createChatListRef, sendCurrentUserChatListData).then(() => {
      // create chatlist in other user
      const createOtherChatListRef = ref(
        database,
        "chatList/" + uid + "/" + currentUserUid + "/"
      );
      update(createOtherChatListRef, sendOtherUserChatListData).then(() => {
        // create message child in database
      });
    });
  }

  // send firebase notification
  function sendChatingNotification() {
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
        message: messageForSend,
        profileUrl: currentUserImageUrl,
        username: currentusername,
        userName: currentUserName,
        currentUserName: userName,
        sendBy: currentUserUid,
        receiveBy: uid,
        uid: currentUserUid,
        roomId: roomId,
        otherUsername: username,
        otherProfile: imageUrl,
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

    fetch("https://fcm.googleapis.com/fcm/send", requestOptions)
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => console.log("error", error));
  }

  function unBlockUser() {
    const unBlockRef = ref(
      database,
      "users/" + currentUserUid + "/" + "friends/" + uid
    );
    update(unBlockRef, { Block: false }).then(() => {
      ToastAndroid.show("You unblock " + userName, ToastAndroid.SHORT);
    });
  }
  // send firebase notification

  // close reply
  function closeReplyBox() {
    setIsReplying(false);
  }

  return (
    <View className="flex-col">
      <Animated.View
        style={{
          backgroundColor: "#ffff",
          marginLeft: 25,
          borderRadius: 5,
          width: "50%",
        }}
      >
        {isTyping == true ? (
          <Animated.View entering={SlideInRight} className="flex-row ml-3">
            <Text
              style={{
                fontFamily: "Comfortaa_bolt",
                fontSize: 8,
                color: "gray",
              }}
            >
              {userName}is typing
            </Text>

            <Lottie
              style={{
                height: 20,
                width: 10,
                marginLeft: -1,
              }}
              autoPlay={true}
              source={require("../Animation/lf30_editor_9m49dmzm.json")}
            />
          </Animated.View>
        ) : null}
      </Animated.View>

      {isReplying == true ? (
        <Animated.View
          entering={SlideInDown}
          style={{
            backgroundColor: "#ffff",
            padding: 5,
            marginRight: 15,
            marginLeft: 15,
            marginTop: 5,
            marginBottom: 2,
            flexDirection: "column",
            borderRadius: 7,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            {ReplyData.sendBy == currentUserUid ? (
              <Text
                style={{
                  fontWeight: "bold",
                  color: "#DC143C",
                  fontSize: 12,
                  margin: 5,
                }}
              >
                Reply yourself
              </Text>
            ) : (
              <Text
                style={{
                  fontWeight: "bold",
                  color: "#DC143C",
                  fontSize: 10,
                  margin: 5,
                }}
              >
                Reply to {userName}
              </Text>
            )}
            <TouchableOpacity
              onPress={closeReplyBox}
              style={{ alignSelf: "center", margin: 5 }}
            >
              <Icon name="close" size={15} color="#DC143C" />
            </TouchableOpacity>
          </View>
          <View
            style={{
              backgroundColor: "#DC143C",
              padding: 7,
              borderRadius: 10,
              margin: 3,
            }}
          >
            <Text
              numberOfLines={3}
              style={{
                fontFamily: "Comfortaa_bolt",
                fontSize: 12,
                color: "white",
              }}
            >
              {ReplyData.message}
            </Text>
          </View>
        </Animated.View>
      ) : null}

      {/* input for sending message */}
      {isBlock == true ? (
        <View className="flex-col items-center">
          <TouchableOpacity
            style={{
              width: 300,
              borderRadius: 5,
              height: 35,
              marginTop: 10,
              marginBottom: 10,
              padding: 2,
              alignSelf: "center",
              justifyContent: "center",
              backgroundColor: "#DC143C",
            }}
            onPress={unBlockUser}
          >
            <Text className="text-white text-sm font-bold text-center">
              You blocked {userName}Tab to unblock
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          {isCurrentUserBlocked === true ? (
            <View style={{ backgroundColor: "#DC143C", padding: 5 }}>
              <Text className="text-white text-sm p-1">
                {userName}was blocked you, you cannot send messages
              </Text>
            </View>
          ) : (
            <View
              style={{
                flexDirection: "row",
                marginBottom: 7,
                marginLeft: 7,
                marginRight: 7,
                marginTop: 1,
                alignSelf: "center",
              }}
            >
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  padding: 10,
                  borderWidth: 1,
                  borderRadius: 50,
                  backgroundColor: "#ffff",
                  borderColor: "#DC143C",
                  flex: 1,
                  marginRight: 5,
                }}
              >
                <TextInput
                  multiline
                  value={messageForSend}
                  style={{
                    fontFamily: "Comfortaa_bolt",
                    width: 250,
                    fontSize: 13,
                    paddingRight: 10,
                    paddingLeft: 15,
                    maxHeight: 80,
                  }}
                  placeholder={"Message to " + userName}
                  onChangeText={(text) => setMessageForSend(text)}
                />
              </View>

              <TouchableOpacity
                style={[
                  messageForSend.trim() == "" || messageForSend.endsWith(" ")
                    ? style.backgroundGray
                    : style.backgroundRed,
                ]}
                onPress={createMessageList}
                disabled={
                  messageForSend.trim() == "" || messageForSend.endsWith(" ")
                    ? true
                    : false
                }
              >
                <Text
                  style={{
                    fontFamily: "Comfortaa_bolt",
                    fontSize: 15,
                    color: "white",
                  }}
                >
                  send
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const style = StyleSheet.create({
  backgroundGray: {
    backgroundColor: "#d3d3d3",
    borderRadius: 30,
    height: 55,
    alignSelf: "center",
    padding: 15,
    justifyContent: "center",
  },
  backgroundRed: {
    backgroundColor: "#DC143C",
    borderRadius: 30,
    height: 55,
    alignSelf: "center",
    justifyContent: "center",
    padding: 15,
  },
  backgroundImage: {
    height: "100%",
    width: "100%",
    flexDirection: "column",
  },
  lottie: {
    width: 100,
    height: 100,
  },
});
