import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ToastAndroid,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { App, Auth } from "../Firebase";
import { getDatabase, onValue, ref, remove, update } from "firebase/database";

import moment from "moment/moment";
import { useNavigation } from "@react-navigation/native";
import AnimatedLoader from "react-native-animated-loader";
import RBSheet from "react-native-raw-bottom-sheet";
import { Badge } from "@rneui/base";
import user from "../src/images/user.png";

function ChatSection() {
  const [uid, setUId] = useState();
  const database = getDatabase(App);
  const navigation = useNavigation();
  const bottomRef = useRef(null);

  // variable
  const [receveUserDetails, setReceiveUserDetails] = useState([]);
  const [progress, setProgress] = useState(true);
  const [checkIsGroupOrNot, setCheckIsGroupOrNot] = useState(false);
  const [longPressUserData, setLongPressUserData] = useState([]);

  // user variable
  const [username, setUsername] = useState("");
  const [usertoken, setusertoken] = useState("");

  useEffect(() => {
    onAuthStateChanged(Auth, (user) => {
      if (user) {
        setUId(user.uid);
      }
    });
    loadReacentChat();
    loadCurrentUserInformation();
  }, [uid]);

  // load current user information
  function loadCurrentUserInformation() {
    const loadCurrentUserInfoRef = ref(database, "users/" + uid + "/");
    onValue(loadCurrentUserInfoRef, (snapshort) => {
      const username = snapshort.child("username").val();
      const token = snapshort.child("userToken").val();
      if (username) {
        setUsername(username);
        setusertoken(token);
      }
    });
  }

  // load recent chats
  function loadReacentChat() {
    const chatRef = ref(database, "chatList/" + uid);
    onValue(chatRef, (snapshot) => {
      setReceiveUserDetails([]);
      const data = snapshot.val();
      if (data) {
        Object.values(data).forEach((chatData) => {
          if (chatData.lastMessage || chatData.type == "group") {
            setReceiveUserDetails((old) => [...old, chatData]);
            setProgress(false);
          }
        });
      } else {
        setProgress(false);
      }
    });
  }
  // navigate to chat screen
  function nevigateToChatScreen(data) {
    navigation.navigate("ChatScreen", { data: data });
    updateMessageCountTo_0(data);
    userIsOnYourScreen(data);
  }

  // // update message count to 0
  function updateMessageCountTo_0(data) {
    const updateMesageCountRef = ref(
      database,
      "chatList/" + uid + "/" + data.uid
    );
    update(updateMesageCountRef, { messageCount: 0 });
  }
  // user in yout chat screen
  function userIsOnYourScreen(data) {
    const userInYourScreenRef = ref(
      database,
      "chatList/" + data.uid + "/" + uid
    );
    update(userInYourScreenRef, { inYourChatScreen: true });
  }

  // navigate to chat screen
  function nevigateToGroupChatScreen(
    groupRoomId,
    uid,
    imageUrl,
    groupName,
    tagline,
    memberInfo
  ) {
    navigation.navigate("GroupChatScreen", {
      groupRoomId: groupRoomId,
      uid: uid,
      imageUrl: imageUrl,
      groupName: groupName,
      tagline: tagline,
    });
    updateGroupMessageCount_0(groupRoomId);
    updateUserIsOnGroupChatScreen(memberInfo, groupRoomId);
  }

  // update user is on group chat screen
  function updateGroupMessageCount_0(groupRoomId) {
    const updateGroupMessageCountRef = ref(
      database,
      "chatList/" + uid + "/" + groupRoomId
    );
    update(updateGroupMessageCountRef, {
      messageCount: 0,
    });
  }

  // update message count to 0
  function updateUserIsOnGroupChatScreen(memberInfo, groupRoomId) {
    Object.values(memberInfo).map((data) => {
      const updateGroupMemberDetailsToScreenRef = ref(
        database,
        "chatList/" + data.uid + "/" + groupRoomId + "/" + "members/" + uid
      );

      update(updateGroupMemberDetailsToScreenRef, {
        inGroupChatScreen: true,
      });
    });
  }

  // show bottom sheet
  function showBottomSheet(data) {
    setLongPressUserData(data);
    if (data.type == "user") {
      setCheckIsGroupOrNot(false);
      bottomRef.current.open();
    } else {
      setCheckIsGroupOrNot(true);
      bottomRef.current.open();
    }
  }

  // delete chat from database
  function deleteChat() {
    if (longPressUserData.type == "user") {
      Alert.alert(
        "",
        "do you want to delete the chats of " + longPressUserData.username,
        [
          {
            text: "delete",
            onPress: () => {
              const deleteChatFromDatabaseRef = ref(
                database,
                "chatList/" + uid + "/" + longPressUserData.uid
              );
              remove(deleteChatFromDatabaseRef).then(() => {
                ToastAndroid.show("chats deleted", ToastAndroid.SHORT);
                bottomRef.current.close();
              });
            },
          },
          {
            text: "cancel",
            style: "cancel",
          },
        ]
      );
    } else {
      Alert.alert(
        "",
        "do you want to delete the chats of " + longPressUserData.groupName,

        [
          {
            text: "delete",
            onPress: () => {
              const deleteChatFromDatabaseRef = ref(
                database,
                "chatList/" + uid + "/" + longPressUserData.groupRoomId
              );
              remove(deleteChatFromDatabaseRef).then(() => {
                ToastAndroid.show("chats deleted", ToastAndroid.SHORT);
                bottomRef.current.close();
              });
            },
          },
          {
            text: "cancel",
            style: "cancel",
          },
        ]
      );
    }
  }

  // if group exist then exit the group
  function exitGroup() {
    Alert.alert(
      "",
      "you want to exit the group " + longPressUserData.groupName,

      [
        {
          text: "exit",
          onPress: () => {
            const deleteChatFromDatabaseRef = ref(
              database,
              "chatList/" + uid + "/" + longPressUserData.groupRoomId
            );
            remove(deleteChatFromDatabaseRef).then(() => {
              ToastAndroid.show("chats deleted", ToastAndroid.SHORT);
              bottomRef.current.close();
              removeUserToGroupMemberList();
            });
          },
        },
        {
          text: "cancel",
          style: "cancel",
        },
      ]
    );
  }

  function removeUserToGroupMemberList() {
    Object.values(longPressUserData.members).map((data) => {
      const removeUserFromGroupMemberList = ref(
        database,
        "chatList/" +
          data.uid +
          "/" +
          longPressUserData.groupRoomId +
          "/" +
          "members/" +
          uid
      );
      remove(removeUserFromGroupMemberList);
      if (data.userToken !== usertoken) {
        sendNotificationTheUserLeftTheGroup(data.userToken);
      }
    });
  }

  //  sending notification to all group member the user left the group
  function sendNotificationTheUserLeftTheGroup(tokens) {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append(
      "Authorization",
      "key=AAAAVakCcv8:APA91bG8VT4gWX8UFCsrwZU7b6YaqMSIRteITOgTvbBMEqhXAvcg_2eqCUPm7Sq6aP5uznn2B5DUhmQsNJEn-sfqYdzqBvc_zTDI4t0oHGdGGXlfMLBqAS3aDQDdNV7wd84wk-SCF9dF"
    );

    var raw = JSON.stringify({
      data: {
        type: "group left by self",
        body: username + " has left the group",
        title: longPressUserData.groupName,
        groupProfile: longPressUserData.imageUrl,
      },
      android: {
        priority: "high",
      },
      priority: 10,
      to: tokens,
    });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch("https://fcm.googleapis.com/fcm/send", requestOptions);
  }

  return (
    <View>
      <View className="flex-col p-2 justify-center">
        <AnimatedLoader
          visible={progress}
          overlayColor="rgba(255,255,255,0.75)"
          source={require("../Animation/heart.json")}
          animationStyle={styles.lottie}
          speed={1}
        >
          <Text className="text-sm">Loading</Text>
        </AnimatedLoader>

        <View>
          {receveUserDetails == "" ? (
            <View className="items-center mt-28">
              <Text
                style={{
                  fontFamily: "Comfortaa",
                  fontSize: 13,
                  marginLeft: 5,
                }}
              >
                No Conversation Found
              </Text>
            </View>
          ) : (
            <View>
              <ScrollView>
                {receveUserDetails.map((data, index) => {
                  const date = moment(data.time, "x").format(
                    "DD MMM YYYY hh:mm a"
                  );
                  if (data.type == "user") {
                    return (
                      <View className="flex-col" key={index}>
                        <TouchableOpacity
                          activeOpacity={1}
                          onPress={() => nevigateToChatScreen(data)}
                          onLongPress={() => showBottomSheet(data)}
                        >
                          <View className="flex-col mt-2 rounded-lg bg-white pt-1 pr-3 pl-3 pb-5">
                            {/* time */}

                            <Text
                              style={{
                                fontSize: 10,
                                color: "#D3D3D3",
                                marginTop: 2,
                                alignSelf: "flex-end",
                                fontWeight: "bold",
                              }}
                            >
                              {date}
                            </Text>

                            {/* user image */}
                            <View className="flex-row">
                              {data.profileUrl == "" ? (
                                <Image
                                  source={user}
                                  style={{
                                    height: 55,
                                    width: 55,
                                    borderRadius: 40,
                                    borderWidth: 1,
                                    borderColor: "#DC143C",
                                  }}
                                />
                              ) : (
                                <Image
                                  source={{ uri: data.profileUrl }}
                                  style={{
                                    height: 55,
                                    width: 55,
                                    borderRadius: 40,
                                    borderWidth: 1,
                                    borderColor: "#DC143C",
                                  }}
                                />
                              )}

                              {/* name and message */}
                              <View className="flex-col p-1 ml-2">
                                <View className="flex-row justify-between w-56">
                                  <Text
                                    style={{
                                      fontFamily: "Comfortaa_bolt",
                                      fontSize: 13,
                                      color: "gray",
                                    }}
                                  >
                                    {data.userName}
                                  </Text>

                                  {data.messageCount >= 1 ? (
                                    <Badge
                                      value={data.messageCount}
                                      containerStyle={styles.badgestyle}
                                      badgeStyle={{
                                        backgroundColor: "#DC143C",
                                      }}
                                    />
                                  ) : null}
                                </View>

                                {/* message */}
                                {data.sendBy == uid ? (
                                  <Text
                                    numberOfLines={1}
                                    style={{
                                      fontFamily: "Comfortaa",
                                      fontSize: 11,
                                      maxWidth: 250,
                                      marginTop: 7,
                                      alignSelf: "flex-start",
                                    }}
                                  >
                                    {"You : " + data.lastMessage}
                                  </Text>
                                ) : (
                                  <View className="flex-row">
                                    <Text
                                      numberOfLines={1}
                                      style={{
                                        fontSize: 12,
                                        marginTop: 7,
                                        maxWidth: 250,
                                        fontWeight: "bold",
                                      }}
                                    >
                                      {data.userName + " : "}
                                    </Text>

                                    <Text
                                      numberOfLines={1}
                                      style={{
                                        fontFamily: "Comfortaa_bolt",
                                        fontSize: 11,
                                        maxWidth: 250,
                                        marginTop: 7,
                                      }}
                                    >
                                      {data.lastMessage}
                                    </Text>
                                  </View>
                                )}
                              </View>
                            </View>
                          </View>
                        </TouchableOpacity>
                      </View>
                    );
                  }

                  if (data.type == "group") {
                    return (
                      <View className="flex-col" key={index}>
                        <TouchableOpacity
                          activeOpacity={1}
                          onPress={() =>
                            nevigateToGroupChatScreen(
                              data.groupRoomId,
                              uid,
                              data.imageUrl,
                              data.groupName,
                              data.groupTagline,
                              data.members
                            )
                          }
                          onLongPress={() => showBottomSheet(data)}
                        >
                          <View className="flex-col mt-2 rounded-lg bg-white pt-1 pr-3 pl-3 pb-5">
                            <View className="flex-row flex-1 justify-between">
                              <Text className="text-gray-400 text-xs">
                                Group
                              </Text>
                              {/* time */}
                              {data.time ? (
                                <Text
                                  style={{
                                    fontSize: 10,
                                    color: "#D3D3D3",
                                    alignSelf: "flex-end",
                                    fontWeight: "bold",
                                  }}
                                >
                                  {date}
                                </Text>
                              ) : null}
                            </View>
                            {/* user image */}
                            <View className="flex-row mt-1">
                              <Image
                                source={{ uri: data.imageUrl }}
                                style={{
                                  height: 55,
                                  width: 55,
                                  borderRadius: 40,
                                  borderWidth: 1,
                                  borderColor: "#DC143C",
                                }}
                              />

                              {/* name and message */}

                              <View className="flex-col p-1 ml-2">
                                <View className="flex-row justify-between w-56">
                                  <Text
                                    style={{
                                      fontFamily: "Comfortaa_bolt",
                                      fontSize: 13,
                                      color: "gray",
                                    }}
                                  >
                                    {data.groupName}
                                  </Text>

                                  {data.messageCount >= 1 ? (
                                    <Badge
                                      value={data.messageCount}
                                      containerStyle={styles.badgestyle}
                                      badgeStyle={{
                                        backgroundColor: "#DC143C",
                                      }}
                                    />
                                  ) : null}
                                </View>

                                {/* message */}
                                {data.sendBy == uid ? (
                                  <Text
                                    numberOfLines={1}
                                    style={{
                                      fontFamily: "Comfortaa",
                                      fontSize: 11,
                                      maxWidth: 240,
                                      marginTop: 7,
                                    }}
                                  >
                                    {"You : " + data.groupLastMessage}
                                  </Text>
                                ) : (
                                  <View className="flex-row justify-between">
                                    {data.lastMessageUsername ? (
                                      <Text
                                        numberOfLines={1}
                                        style={{
                                          fontSize: 12,
                                          marginTop: 7,
                                          maxWidth: 250,
                                          fontWeight: "bold",
                                        }}
                                      >
                                        {data.lastMessageUsername + " : "}
                                      </Text>
                                    ) : (
                                      <Text className="text-gray-400 text-xs mt-2">
                                        group created by you
                                      </Text>
                                    )}

                                    <Text
                                      numberOfLines={1}
                                      style={{
                                        fontFamily: "Comfortaa_bolt",
                                        fontSize: 11,
                                        maxWidth: 250,
                                        marginTop: 7,
                                      }}
                                    >
                                      {data.groupLastMessage}
                                    </Text>
                                  </View>
                                )}
                              </View>
                            </View>
                          </View>
                        </TouchableOpacity>
                      </View>
                    );
                  }
                })}
              </ScrollView>
            </View>
          )}
        </View>

        {/* bottom sheet */}
        <RBSheet
          ref={bottomRef}
          height={checkIsGroupOrNot == true ? 110 : 80}
          closeOnDragDown={true}
          customStyles={{
            container: {
              borderTopRightRadius: 20,
              borderTopLeftRadius: 20,
            },
          }}
        >
          <View className="flex-col justify-center">
            <TouchableOpacity onPress={deleteChat} style={{ margin: 5 }}>
              <Text className="text-base text-gray-700 font-serif ml-3">
                Delete chat
              </Text>
            </TouchableOpacity>
            {checkIsGroupOrNot == true ? (
              <TouchableOpacity onPress={exitGroup} style={{ margin: 5 }}>
                <Text className="text-base text-gray-700 font-serif ml-3">
                  Exit group
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </RBSheet>
      </View>
    </View>
  );
}

export default ChatSection;

const styles = StyleSheet.create({
  lottie: {
    width: 100,
    height: 100,
  },
  badgestyle: {
    color: "#DC143C",
    alignSelf: "flex-end",
  },
});
