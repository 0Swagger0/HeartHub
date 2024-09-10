import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  AppState,
  ToastAndroid,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { getDatabase, onValue, ref, update } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import { Auth, App } from "../Firebase";
import Icon from "react-native-vector-icons/FontAwesome5";
import Octicons from "react-native-vector-icons/Octicons";
import Lottie from "lottie-react-native";
import ChatSection from "../Components/ChatSection";
import { useNavigation } from "@react-navigation/native";
import { useNetInfo } from "@react-native-community/netinfo";
import messaging from "@react-native-firebase/messaging";
import user from "../src/images/user.png";

export default function HomeChat() {
  const [uid, setUId] = useState();
  const database = getDatabase(App);
  const [onlineUser, setOnlineUser] = useState([]);

  //activity check
  const appState = useRef(AppState.currentState);
  const navigation = useNavigation();
  const netInfo = useNetInfo();

  useEffect(() => {
    onAuthStateChanged(Auth, (user) => {
      if (user) {
        setUId(user.uid);

        if (uid) {
          //make online
          const userOnlineRef = ref(database, "users/" + uid + "/");
          update(userOnlineRef, { status: "online" });
        }
        const check = ref(database, "users/" + user.uid + "/");
        onValue(check, (snapshort) => {
          const name = snapshort.child("userName").val();
          const image = snapshort.child("profileUrl").val();
          const username = snapshort.child("username").val();
          if (name == null || image == null || username == null) {
            navigation.navigate("Details");
          }
        });
      } else {
        navigation.replace("Login");
      }
      AppState.addEventListener("change", handleAppStateChange);
      return () => {
        AppState.removeEventListener("change", handleAppStateChange);
      };
    });

    checkUserOfflineEitherOnline();
    gettingOnlineUser();
    checkInternet();
    gettigPermissionForNotification();
  }, [uid]);

  // check internet
  function checkInternet() {
    if (netInfo.isConnected === false) {
      ToastAndroid.showWithGravity(
        "No internet connection",
        ToastAndroid.SHORT,
        ToastAndroid.TOP
      );
      userOffline();
    } else {
      userOnline();
    }
  }

  // getting notification permission
  async function gettigPermissionForNotification() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log("Authorization status:", authStatus);
    }

    messaging()
      .getToken()
      .then((token) => {
        if (uid) {
          const tokenRef = ref(database, "users/" + uid);
          update(tokenRef, { userToken: token }).then(() => {
            // updating token from friend list
            const updateTokenForFriendListRef = ref(
              database,
              "users/" + uid + "/" + "friends/"
            );
            onValue(updateTokenForFriendListRef, (snapshort) => {
              snapshort.forEach((data) => {
                const uids = data.child("uid").val();
                if (uids) {
                  // update token from friend list
                  const updateTokenFromFriendRef = ref(
                    database,
                    "users/" + uids + "/" + "friends/" + uid
                  );
                  update(updateTokenFromFriendRef, {
                    userToken: token,
                  });
                }
              });
            });
          });
        }
      });
  }

  // getting online users
  const gettingOnlineUser = () => {
    const onlineRef = ref(database, "chatList/" + uid);
    onValue(onlineRef, (snapshort) => {
      setOnlineUser([]);
      snapshort.forEach((data) => {
        const onlineListData = data.val();
        const status = data.child("status").val();
        const username = data.child("username").val();
        if (status === "online" && username) {
          setOnlineUser((old) => [...old, onlineListData]);
        }
      });
    });
  };

  // check activity background active ?
  const handleAppStateChange = (nextAppState) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === "active"
    ) {
      userOnline();
    }
    appState.current = nextAppState;

    if (appState.current == "active") {
      userOnline();
    } else if (appState.current == "background") {
      userOffline();
    }
  };

  // make user online
  const userOnline = () => {
    if (uid) {
      const userOnlineRef = ref(database, "users/" + uid + "/");
      update(userOnlineRef, { status: "online" });
    }
  };

  // make user offline
  const userOffline = () => {
    if (uid) {
      const userOfflineRef = ref(database, "users/" + uid + "/");
      update(userOfflineRef, { status: "offline" });
    }
  };

  const checkUserOfflineEitherOnline = () => {
    const friendRef = ref(database, "users/" + uid + "/" + "friends/");
    onValue(friendRef, (snapshort) => {
      const data = snapshort.val();
      if (data) {
        Object.values(data).map((detail) => {
          createOnlineStatusInChatLis(detail.uid);
        });
      }
    });
  };

  const createOnlineStatusInChatLis = (UID) => {
    const createOnlineRef = ref(database, "users/" + uid + "/");
    onValue(createOnlineRef, (snapshort) => {
      const status = snapshort.child("status").val();
      if (status === "online") {
        if (UID != null) {
          const createOnlineRef = ref(database, "chatList/" + UID + "/" + uid);
          update(createOnlineRef, {
            status: "online",
          });
        }
      } else if (status === "offline") {
        if (UID != null) {
          const createOfflineRef = ref(database, "chatList/" + UID + "/" + uid);
          update(createOfflineRef, {
            status: "offline",
          });
        }
      }
    });
  };

  function gotoFindUser() {
    navigation.navigate("FindUser");
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

  return (
    <SafeAreaView>
      <ScrollView
        overScrollMode="never"
        scrollToOverflowEnabled={true}
        showsHorizontalScrollIndicator={false}
      >
        <View className="flex-col p-2">
          <Text
            style={{ fontFamily: "Comfortaa", fontSize: 15, marginLeft: 5 }}
          >
            Online
          </Text>

          <View className="flex-row h-24">
            <ScrollView
              horizontal={true}
              style={{ margin: 5 }}
              overScrollMode="never"
              showsHorizontalScrollIndicator={false}
            >
              <TouchableOpacity
                style={{
                  borderRadius: 50,
                  borderWidth: 1,
                  height: 65,
                  padding: 20,
                  borderColor: "#D3D3D3",
                }}
                onPress={gotoFindUser}
              >
                <Icon name="user-plus" size={20} color="#DC143C" />
              </TouchableOpacity>

              {/* render user friends */}
              {onlineUser.map((data, index) => {
                return (
                  <View key={index} className="flex-row">
                    <View className="flex-col items-center ml-1">
                      <TouchableOpacity
                        style={{
                          borderRadius: 50,
                          borderWidth: 1,
                          padding: 3,
                          marginLeft: 5,
                          borderColor: "#DC143C",
                        }}
                        onPress={() => {
                          navigation.navigate("ChatScreen", {
                            data: data,
                          });
                          userIsOnYourScreen(data.uid);
                          updateMessageCountTo_0(data.uid);
                        }}
                      >
                        <Octicons
                          style={{
                            position: "absolute",
                            alignSelf: "flex-end",
                            marginTop: 5,
                          }}
                          name="dot-fill"
                          color="#00cc00"
                          size={17}
                        />
                        {data.profileUrl == "" ? (
                          <Image
                            source={user}
                            style={{ height: 57, width: 57, borderRadius: 30 }}
                          />
                        ) : (
                          <Image
                            source={{
                              uri: data.profileUrl,
                            }}
                            style={{ height: 57, width: 57, borderRadius: 30 }}
                          />
                        )}
                      </TouchableOpacity>

                      <Text
                        style={{
                          fontFamily: "Comfortaa_bolt",
                          fontSize: 10,
                          marginTop: 1,
                        }}
                      >
                        {data.username}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>

          {/* message saction */}
          <View className="flex-col mt-1">
            <View className="flex-row justify-between items-center">
              <Text
                style={{ fontFamily: "Comfortaa", fontSize: 20, marginLeft: 5 }}
              >
                Messages
              </Text>

              <View
                style={{
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: "#DC143C",
                  marginRight: 10,
                  flexDirection: "column",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Lottie
                  style={{ height: 50 }}
                  autoPlay
                  loop
                  source={require("../Animation/lf30_editor_2yz0cvvk.json")}
                />
                <Text
                  style={{
                    position: "absolute",
                    fontFamily: "Comfortaa_bolt",
                    fontSize: 17,
                    marginLeft: 5,
                  }}
                  onPress={() => navigation.navigate("AllFriend")}
                >
                  friends
                </Text>
              </View>
            </View>
          </View>

          {/* chat section  */}

          <ChatSection />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
