import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  ToastAndroid,
  ScrollView,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { App, Auth } from "../Firebase";
import { getDatabase, onValue, ref, remove, update } from "firebase/database";
import Icon from "react-native-vector-icons/Ionicons";
import Lottie from "lottie-react-native";
import RBSheet from "react-native-raw-bottom-sheet";
import user from "../src/images/user.png";
import uuid from "react-native-uuid";
import NetInfo from "@react-native-community/netinfo";

export default function AllFriend({ navigation }) {
  const [uid, setUId] = useState();
  const database = getDatabase(App);
  const [allFriendList, setAllFriendList] = useState([]);
  const [showUserProfile, setShowUserProfile] = useState({});

  const bottomRef = useRef(null);

  useEffect(() => {
    onAuthStateChanged(Auth, (user) => {
      if (user) {
        setUId(user.uid);
        loadAllFriendList();
      }
    });
  }, [uid]);

  // connection check
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected == false) {
        const userOnlineRef = ref(database, "users/" + uid + "/");
        update(userOnlineRef, { status: "offline" });
        console.log("offline");
      } else {
        const userOnlineRef = ref(database, "users/" + uid + "/");
        update(userOnlineRef, { status: "online" });
        console.log("online");
      }
    });

    return () => unsubscribe();
  }, []);

  // load all friend list
  function loadAllFriendList() {
    const reference = ref(database, "users/" + uid + "/" + "friends/");
    onValue(reference, (snapshort) => {
      setAllFriendList([]);
      const data = snapshort.val();
      if (data) {
        Object.values(data).map((detail) => {
          setAllFriendList((old) => [...old, detail]);
        });
      }
    });
  }

  // show user profile with bottom sheet
  function showProfileWithBottomSheet(data) {
    setShowUserProfile(data);
    bottomRef.current.open();
  }

  // remove friend
  function removeFriend() {
    Alert.alert(
      "Remove " + showUserProfile.Name + " from your friend list ?",
      "The user is permonently remove from your friend list. do you want to remove",
      [
        {
          text: "remove",

          onPress: () => {
            const removeRef = ref(
              database,
              "users/" + uid + "/" + "friends/" + showUserProfile.uid
            );
            remove(removeRef).then(() => {
              ToastAndroid.showWithGravity(
                showUserProfile.Name + " Remove from friend list",
                ToastAndroid.SHORT,
                ToastAndroid.TOP
              );
              bottomRef.current.close();
            });
          },
        },

        {
          text: "cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
      ]
    );
  }

  // user in yout chat screen ake true from background state
  function userIsOnYourScreen(otherUid) {
    const userInYourScreenRef = ref(
      database,
      "chatList/" + otherUid + "/" + uid
    );
    update(userInYourScreenRef, { inYourChatScreen: true });
  }

  // // update message count to 0
  function updateMessageCountTo_0(otherUid) {
    const updateMesageCountRef = ref(
      database,
      "chatList/" + uid + "/" + otherUid
    );
    update(updateMesageCountRef, { messageCount: 0 });
  }

  // create room id
  function createRoomId(otherUserUid) {
    const RoomId = uuid.v4();
    const checkRoomIdRef = ref(
      database,
      "chatList/" + uid + "/" + otherUserUid
    );
    onValue(checkRoomIdRef, (snapshort) => {
      const roomId = snapshort.child("roomId").val();
      if (roomId == null) {
        // create room id in current user
        if (uid) {
          const createRoomIdref = ref(
            database,
            "chatList/" + uid + "/" + otherUserUid
          );
          update(createRoomIdref, { roomId: RoomId }).then(() => {
            // create room id in friends list
            createRoomIdInFriendsList(otherUserUid, RoomId);
          });
        }
      }
    });
  }

  // create room id in friends list
  function createRoomIdInFriendsList(otherUserUid, RoomId) {
    const setRoomIdRef = ref(
      database,
      "users/" + uid + "/" + "friends/" + otherUserUid
    );
    update(setRoomIdRef, { roomId: RoomId }).then(() => {
      createOtherRoomIdInFriendsList(otherUserUid, RoomId);
    });
  }

  // create other user room id in friends list
  function createOtherRoomIdInFriendsList(otherUserUid, RoomId) {
    const setRoomIdRef = ref(
      database,
      "users/" + otherUserUid + "/" + "friends/" + uid
    );
    update(setRoomIdRef, { roomId: RoomId }).then(() => {
      createRoomIdInOtherUser(otherUserUid, RoomId);
    });
  }

  // create other user room id
  function createRoomIdInOtherUser(otherUserUid, RoomId) {
    const checkOtherRoomIdRef = ref(
      database,
      "chatList/" + otherUserUid + "/" + uid
    );
    onValue(checkOtherRoomIdRef, (snapshort) => {
      const roomId = snapshort.child("roomId").val();
      if (roomId == null) {
        // create room id in current user

        if (uid) {
          const createOtherRoomIdRef = ref(
            database,
            "chatList/" + otherUserUid + "/" + uid
          );
          update(createOtherRoomIdRef, { roomId: RoomId });
        }
      }
    });
  }

  return (
    <View className="flex-col p-2">
      <View className="flex-col m-3">
        <Text style={{ fontFamily: "Comfortaa", fontSize: 15, marginLeft: 5 }}>
          All friends
        </Text>

        <ScrollView>
          {allFriendList != "" ? (
            allFriendList.map((data, index) => {
              return (
                <View key={index}>
                  <View className="flex-col mt-3 p-2 bg-white rounded-lg">
                    <View className="flex-row justify-around items-center ">
                      {/* name and for search */}

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

                      <View className="flex-col p-1 ml-2">
                        <Text
                          style={{
                            fontFamily: "Comfortaa",
                            fontSize: 13,
                            fontWeight: "bold",
                          }}
                        >
                          {data.userName}
                        </Text>

                        <Text
                          style={{
                            fontSize: 12,
                            color: "#D3D3D3",
                            width: 150,
                          }}
                        >
                          {data.username}
                        </Text>
                      </View>
                    </View>

                    {/* message saction and profile */}
                    <View
                      style={{
                        borderColor: "#d3d3d3",
                        borderBottomWidth: 0.4,
                        marginLeft: 30,
                        marginRight: 30,
                        marginTop: 10,
                      }}
                    />

                    <View className="flex-row justify-around">
                      <TouchableOpacity
                        style={{
                          borderColor: "#DC143C",
                          borderWidth: 1,
                          borderRadius: 50,
                          alignSelf: "center",
                          paddingRight: 15,
                          paddingTop: 5,
                          paddingBottom: 5,
                          paddingLeft: 15,
                          marginTop: 10,
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                        onPress={() => {
                          navigation.navigate("ChatScreen", {
                            data: data,
                          });
                          userIsOnYourScreen(data.uid);
                          updateMessageCountTo_0(data.uid);
                          createRoomId(data.uid);
                        }}
                      >
                        <Lottie
                          style={{
                            height: 100,
                            width: 40,
                            position: "absolute",
                            alignSelf: "flex-end",
                          }}
                          autoPlay
                          loop
                          source={require("../Animation/lf30_editor_jbc5ddkc.json")}
                        />

                        <Text
                          style={{
                            fontFamily: "Comfortaa_bolt",
                            fontSize: 15,
                            marginLeft: 10,
                          }}
                        >
                          message
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={{
                          backgroundColor: "#DC143C",
                          borderRadius: 50,
                          alignSelf: "center",
                          paddingRight: 15,
                          paddingTop: 5,
                          paddingBottom: 5,
                          paddingLeft: 15,
                          marginTop: 10,
                          alignItems: "center",
                          flexDirection: "row",
                        }}
                        onPress={() => showProfileWithBottomSheet(data)}
                      >
                        <Icon name="person" color="#fff" size={15} />
                        <Text
                          style={{
                            fontFamily: "Comfortaa_bolt",
                            fontSize: 15,
                            marginLeft: 10,
                            color: "#fff",
                          }}
                        >
                          Profile
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })
          ) : (
            <View>
              <View className="flex-col">
                <View className="self-center">
                  <Lottie
                    style={{
                      height: 300,
                      width: 300,
                    }}
                    autoPlay
                    loop
                    source={require("../Animation/lf30_editor_xlth8dsu.json")}
                  />

                  <Text
                    style={{
                      fontFamily: "Comfortaa",
                      fontSize: 13,
                      alignSelf: "center",
                    }}
                  >
                    You don't have any friends
                  </Text>

                  <TouchableOpacity
                    style={{
                      backgroundColor: "#DC143C",
                      borderRadius: 20,
                      alignSelf: "center",
                      paddingRight: 15,
                      paddingTop: 5,
                      paddingBottom: 5,
                      marginTop: 10,
                      paddingLeft: 15,
                    }}
                    onPress={() => navigation.navigate("FindUser")}
                  >
                    <Text
                      style={{
                        fontFamily: "Comfortaa",
                        fontSize: 13,
                        alignSelf: "center",
                        color: "#fff",
                      }}
                    >
                      Find friends
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* bottom sheet */}
        <RBSheet
          ref={bottomRef}
          height={300}
          closeOnDragDown={true}
          customStyles={{
            container: {
              borderTopRightRadius: 20,
              borderTopLeftRadius: 20,
            },
          }}
        >
          <View className="flex-col">
            <Text
              style={{
                fontFamily: "Comfortaa",
                fontSize: 13,
                marginLeft: 20,
                color: "gray",
              }}
            >
              Friend details
            </Text>
            <View className="flex-row justify-start mt-3 ml-3 mr-3">
              {showUserProfile.profileUrl == "" ? (
                <Image
                  source={user}
                  style={{
                    height: 100,
                    width: 100,
                    borderRadius: 50,
                    marginTop: 10,
                    borderColor: "#DC143C",
                    borderWidth: 1,
                    padding: 1,
                  }}
                />
              ) : (
                <Image
                  source={{ uri: showUserProfile.profileUrl }}
                  style={{
                    height: 100,
                    width: 100,
                    borderRadius: 50,
                    marginTop: 10,
                    borderColor: "#DC143C",
                    borderWidth: 1,
                    padding: 1,
                  }}
                />
              )}

              <View className="flex-col justify-evenly ml-5">
                <View className="flex-row items-center">
                  <Text className="text-gray-600 text-xs">Name :</Text>
                  <Text
                    style={{
                      fontFamily: "Comfortaa",
                      fontSize: 12,
                      marginLeft: 10,
                    }}
                  >
                    {showUserProfile.userName}
                  </Text>
                </View>

                <View className="flex-row items-center">
                  <Text className="text-gray-600 text-xs">Username :</Text>
                  <Text
                    style={{
                      fontFamily: "Comfortaa",
                      fontSize: 12,
                      marginLeft: 10,
                    }}
                  >
                    {showUserProfile.username}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-gray-600 text-xs">Hobies :</Text>
                  <Text
                    style={{
                      fontFamily: "Comfortaa",
                      fontSize: 11,
                      marginLeft: 10,
                    }}
                  >
                    {showUserProfile.userHobbies}
                  </Text>
                </View>
              </View>
            </View>

            <View
              style={{
                borderBottomWidth: 0.5,
                borderColor: "#d3d3d3",
                margin: 20,
              }}
            />

            <View className="flex-row justify-around">
              <TouchableOpacity
                style={{
                  borderColor: "#DC143C",
                  borderWidth: 1,
                  borderRadius: 50,
                  alignSelf: "center",
                  paddingRight: 15,
                  paddingTop: 5,
                  paddingBottom: 5,
                  paddingLeft: 15,
                  marginTop: 10,
                  flexDirection: "row",
                  alignItems: "center",
                }}
                onPress={() => {
                  navigation.navigate("ChatScreen", {
                    data: showUserProfile,
                  });
                  bottomRef.current.close();
                }}
              >
                <Lottie
                  style={{
                    height: 100,
                    width: 40,
                    position: "absolute",
                    alignSelf: "flex-end",
                  }}
                  autoPlay
                  loop
                  source={require("../Animation/lf30_editor_jbc5ddkc.json")}
                />

                <Text
                  style={{
                    fontFamily: "Comfortaa_bolt",
                    fontSize: 15,
                    marginLeft: 10,
                  }}
                >
                  message
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: "#DC143C",
                  borderRadius: 50,
                  alignSelf: "center",
                  paddingRight: 15,
                  paddingTop: 5,
                  paddingBottom: 5,
                  paddingLeft: 15,
                  marginTop: 10,
                  alignItems: "center",
                  flexDirection: "row",
                }}
                onPress={() => removeFriend(showUserProfile.uid)}
              >
                <Icon name="person" color="#fff" size={15} />
                <Text
                  style={{
                    fontFamily: "Comfortaa_bolt",
                    fontSize: 15,
                    marginLeft: 10,
                    color: "#fff",
                  }}
                >
                  Remove
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </RBSheet>
      </View>
    </View>
  );
}
