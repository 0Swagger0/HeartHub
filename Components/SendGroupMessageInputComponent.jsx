import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { getDatabase, onValue, push, ref, update } from "firebase/database";
import moment from "moment";
import { App } from "../Firebase";
import Icon from "react-native-vector-icons/MaterialIcons";
import Animated, { SlideInDown } from "react-native-reanimated";
import Lottie from "lottie-react-native";

export default function SendGroupMessageInputComponent({
  groupName,
  groupImageUrl,
  currentUserUid,
  currentUserImageUrl,
  groupRoomId,
  currentusername,
  groupMemberDetails,
  updateAddedUserChatList,
  groupmemnerstokens,
  groupTagline,
  currentusertoken,
  isReplying,
  GroupReplyData,
  setIsReplying,
  YforMessagePosition,
}) {
  const [messageForSend, setMessageForSend] = useState("");

  const database = getDatabase(App);
  const time = moment().valueOf();
  const [isTyping, setIsTyping] = useState([]);

  useEffect(() => {
    updateUserToken();
  }, []);

  // create group chat list
  const createGroupChatList = {
    groupName: groupName,
    imageUrl: groupImageUrl,
    groupTagline: groupTagline,
    groupRoomId: groupRoomId,
    groupLastMessage: messageForSend,
    time: time,
    sendBy: currentUserUid,
    lastMessageUsername: currentusername,
    type: "group",
  };

  // send messages in group chat
  const sendGroupMessages = {
    message: messageForSend,
    time: time,
    sendBy: currentUserUid,
    username: currentusername,
    profileUrl: currentUserImageUrl,
    messageType: "text",
  };

  // group message replying
  const GroupReplyMessageData = {
    message: messageForSend,
    time: time,
    sendBy: currentUserUid,
    username: currentusername,
    profileUrl: currentUserImageUrl,
    messageType: "text",
    replyMessage: GroupReplyData.message,
    replyTo: GroupReplyData.sendBy,
    GroupReply: true,
    replyToUsername: GroupReplyData.username,
    yPosition: YforMessagePosition,
  };

  // upate usetoken
  function updateUserToken() {
    const checkUserTokenCurrentRef = ref(
      database,
      "chatList/" +
        currentUserUid +
        "/" +
        groupRoomId +
        "/" +
        "members/" +
        currentUserUid
    );
    onValue(checkUserTokenCurrentRef, (snapshort) => {
      snapshort.forEach((data) => {
        const uid = data.child("uid").val();
        const token = data.child("userToken").val();
        if (uid == currentUserUid) {
          if (token !== currentusertoken) {
            updateToken();
          }
        }
      });
    });
  }

  // update user token
  function updateToken() {
    Object.values(groupMemberDetails).map((data) => {
      const updateTokenRef = ref(
        database,
        "chatList/" +
          data.uid +
          "/" +
          groupRoomId +
          "/" +
          "members/" +
          currentUserUid
      );
      update(updateTokenRef, { userToken: currentusertoken });
    });
  }

  // // make is typing
  // useEffect(() => {
  //   const makeIstyping = () => {
  //     Object.values(groupMemberDetails).map((data) => {
  //       const userIsTyping = ref(
  //         database,
  //         "chatList/" +
  //           data.uid +
  //           "/" +
  //           groupRoomId +
  //           "/" +
  //           "members/" +
  //           currentUserUid
  //       );
  //       if (messageForSend != "") {
  //         update(userIsTyping, { isTyping: "true" });
  //       } else if (messageForSend == "") {
  //         update(userIsTyping, { isTyping: "false" });
  //       }
  //     });
  //   };
  //   makeIstyping();
  // }, [messageForSend]);

  // check user is typing
  // function checkUserIsTyping() {
  //   const checkIsTypingRef = ref(
  //     database,
  //     "chatList/" + currentUserUid + "/" + groupRoomId + "/" + "members/"
  //   );
  //   onValue(checkIsTypingRef, (snapshort) => {
  //     setIsTyping([]);
  //     snapshort.forEach((data) => {
  //       const isTypingUserInfo = data.val();
  //       if (isTypingUserInfo) {
  //         setIsTyping((old) => [...old, isTypingUserInfo]);
  //       }
  //     });
  //   });
  // }

  // create group message list
  function createGroupMessageList() {
    setIsReplying(false);
    if (isReplying) {
      const createReplyGroupMessageListRef = push(
        ref(database, "groupMessageList/" + groupRoomId + "/")
      );
      GroupReplyMessageData.messageId = createReplyGroupMessageListRef.key;
      update(createReplyGroupMessageListRef, GroupReplyMessageData).then(() => {
        updateOtherGroupMemberChatList();
      });
    } else {
      const createGroupMessageListRef = push(
        ref(database, "groupMessageList/" + groupRoomId + "/")
      );
      sendGroupMessages.messageId = createGroupMessageListRef.key;
      update(createGroupMessageListRef, sendGroupMessages).then(() => {
        updateOtherGroupMemberChatList();
      });
    }
    setMessageForSend("");
  }

  // send messages to group
  function updateOtherGroupMemberChatList() {
    Object.values(groupMemberDetails).map((data) => {
      const updateChatListToOtherRef = ref(
        database,
        "chatList/" + data.uid + "/" + groupRoomId
      );
      update(updateChatListToOtherRef, createGroupChatList).then(() => {
        // update member infomation
        const updatememberInformationRef = ref(
          database,
          "chatList/" + data.uid + "/" + groupRoomId + "/" + "members/"
        );
        update(updatememberInformationRef, updateAddedUserChatList).then(
          () => {}
        );
      });
      sendGroupMessageNotification(data);
    });
  }

  // send group messages notification
  function sendGroupMessageNotification(data) {
    const tokens = data.userToken;
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
        groupTagline: groupTagline,
        message: messageForSend,
        groupImage: groupImageUrl,
        username: currentusername,
        currentusertoken: currentusertoken,
        currentUserImageUrl: currentUserImageUrl,
        groupRoomId: groupRoomId,
        memberTokens: groupmemnerstokens,
      },

      android: {
        priority: "high",
      },
      priority: 10,
      to: [tokens].toString(),
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

  /// close group message reply box
  function CloseGroupMessageReplyBox() {
    setIsReplying(false);
  }

  return (
    <View className="flex-col">
      {/* <View className="flex-col bg-white">
        {isTyping.map((data, index) => {
          if (data.isTyping == "true" && data.username != currentusername) {
            return (
              <View key={index} className="flex-row m-1">
                <Text
                  style={{
                    fontFamily: "Comfortaa_bolt",
                    fontSize: 8,
                    color: "gray",
                  }}
                >
                  {data.username}is typing
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
              </View>
            );
          }
        })}
      </View> */}
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
            {GroupReplyData.sendBy == currentUserUid ? (
              <Text
                style={{
                  fontWeight: "bold",
                  color: "#DC143C",
                  fontSize: 10,
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
                Reply to {GroupReplyData.username}
              </Text>
            )}
            <TouchableOpacity
              onPress={CloseGroupMessageReplyBox}
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
              {GroupReplyData.message}
            </Text>
          </View>
        </Animated.View>
      ) : null}

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
            placeholder="type somthing..."
            onChangeText={(text) => setMessageForSend(text)}
          />
        </View>

        <TouchableOpacity
          style={[
            messageForSend.trim() == "" || messageForSend.endsWith(" ")
              ? style.backgroundGray
              : style.backgroundRed,
          ]}
          onPress={createGroupMessageList}
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
