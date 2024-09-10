import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ToastAndroid,
  ImageBackground,
  Clipboard,
  BackHandler,
  AppState,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { ref, update } from "firebase/database";
import { getDatabase, onValue } from "firebase/database";
import { App, Auth, storeRef } from "../Firebase";
import Octicons from "react-native-vector-icons/Octicons";
import { onAuthStateChanged } from "firebase/auth";
import Entypo from "react-native-vector-icons/Entypo";
import Feather from "react-native-vector-icons/Feather";
import RBSheet from "react-native-raw-bottom-sheet";
import AnimatedLoader from "react-native-animated-loader";
import uuid from "react-native-uuid";
import SendMessageInputComponent from "../Components/SendMessageInputComponent";
import ChatListComponent from "../Components/ChatListComponent";
import * as ImagePicker from "expo-image-picker/src/ImagePicker";
import { getDownloadURL, getStorage, uploadBytes } from "firebase/storage";
import user from "../src/images/user.png";
import { FlatList } from "react-native-gesture-handler";
import NetInfo from "@react-native-community/netinfo";

export default function ChatScreen({ route }) {
  //user detail
  const uid = route.params.data.uid;
  const userName = route.params.data.userName;
  const imageUrl = route.params.data.profileUrl;
  const username = route.params.data.username;
  const otherUserToken = route.params.data.userToken;
  const roomId = route.params.data.roomId;

  const database = getDatabase(App);
  const storage = getStorage(App);
  const bottomRef = useRef(null);
  const ReplyBottomRef = useRef(null);

  //details state
  const [status, setStatus] = useState("");
  const [chatData, setChatData] = useState([]);
  const [progress, setProgress] = useState(true);
  const [roomIdCheck, setRoomIdCheck] = useState("");
  //current user details
  const [currentUserImageUrl, setcurrentUserImageUrl] = useState("");
  const [currentUserName, setcurrentUserName] = useState("");
  const [currentUserToken, setcurrentUserToken] = useState("");
  //current user uid
  const [currentUserUid, setCurrentUserUid] = useState("");
  const [currentusername, setcurrentusername] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const pathUID = uuid.v4();
  const [backgroundImage, setBackGroundImage] = useState("");
  const [backgroundImagePath, setBackGroundImagePath] = useState("");

  // reply state
  const [ReplyData, SetReplyData] = useState({});
  const [OffSetPositionValue, setOffSetPositionValue] = useState();
  const appState = useRef(AppState.currentState);

  const ShowBottomSheetData = [
    "Block " + userName,
    "Change background",
    "Change chat theme",
  ];
  // scroll view scroll
  let scrollRef;

  // onback pressed
  // and make user that the user left the curent user chat screen
  function backActionHandler() {
    if (currentUserUid != null) {
      const updateIsUserInYourScreenRef = ref(
        database,
        "chatList/" + uid + "/" + currentUserUid
      );
      if (currentUserUid) {
        update(updateIsUserInYourScreenRef, { inYourChatScreen: false });
      }
    }
  }

  // connection check
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected == false) {
        backActionHandler();
        ToastAndroid.show("No internet connection", ToastAndroid.SHORT);
      } else {
        userIsOnYourScreen();
      }
    });

    return () => unsubscribe();
  }, []);

  // user in yout chat screen ake true from background state
  function userIsOnYourScreen() {
    if (currentUserUid != null) {
      const userInYourScreenRef = ref(
        database,
        "chatList/" + uid + "/" + currentUserUid
      );
      if (currentUserUid) {
        update(userInYourScreenRef, { inYourChatScreen: true });
      }
    }
  }

  // check activity background active ?
  const handleAppStateChange = (nextAppState) => {
    appState.current = nextAppState;
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === "active"
    ) {
      userIsOnYourScreen();
    }
    if (appState.current == "active") {
      userIsOnYourScreen();
    } else if (appState.current == "background") {
      backActionHandler();
      if (currentUserUid != "") {
        typingStopewhenUserExitApp();
      }
    }
  };

  // typing false when user exit to app
  function typingStopewhenUserExitApp() {
    if (currentUserUid != "") {
      const userIsTyping = ref(
        database,
        "chatList/" + uid + "/" + currentUserUid
      );

      if (currentUserUid != "") {
        update(userIsTyping, { isTyping: "false" });
      }
    }
  }

  // on back pressed useEffect

  useEffect(() => {
    // Add event listener for hardware back button press on Android
    BackHandler.addEventListener("hardwareBackPress", backActionHandler);
    AppState.addEventListener("change", handleAppStateChange);

    return () =>
      // clear/remove event listener
      BackHandler.removeEventListener("hardwareBackPress", backActionHandler);
  }, [currentUserUid]);

  // thinks load useEffect
  useEffect(() => {
    onAuthStateChanged(Auth, (user) => {
      if (user) {
        setCurrentUserUid(user.uid);
      }
    });

    loadCurrentUserInfo();
    getStatusOfUser();
    loadBackgroudImage();
    if (roomId != null) {
      loadMessages();
    } else {
      loadMessageWithRoomId();
    }
  }, [currentUserUid]);

  function ReplyingFunction(message) {
    OpenReplyingBottomSheet(message);
  }

  // load current user information
  function loadCurrentUserInfo() {
    const loadCurrentUserInfoRef = ref(
      database,
      "users/" + currentUserUid + "/"
    );
    onValue(loadCurrentUserInfoRef, (snapshort) => {
      const userName = snapshort.child("userName").val();
      const profile = snapshort.child("profileUrl").val();
      const username = snapshort.child("username").val();

      if (profile) {
        setcurrentUserImageUrl(profile);
      }
      if (username) {
        setcurrentusername(username);
      }
      if (userName) {
        setcurrentUserName(userName);
      }

      //getting current user token
      const usertoken = snapshort.child("userToken").val();
      if (usertoken) {
        setcurrentUserToken(usertoken);
      }
    });
  }

  // load background image
  function loadBackgroudImage() {
    const loadBackgroudImageRef = ref(
      database,
      "users/" + currentUserUid + "/"
    );
    onValue(loadBackgroudImageRef, (snapshort) => {
      const backgroudImageUrl = snapshort.child("backgroundChatImageUrl").val();
      const backgroudImagePath = snapshort
        .child("backgroundChatImagePath")
        .val();
      if (backgroudImageUrl != null) {
        setBackGroundImage(backgroudImageUrl);
      }
      if (backgroudImagePath != null) {
        setBackGroundImagePath(backgroudImagePath);
      }
    });
  }

  //  check user status
  function getStatusOfUser() {
    const loadCurrentUserInfoRef = ref(database, "users/" + uid + "/");
    onValue(loadCurrentUserInfoRef, (snapshort) => {
      const status = snapshort.child("status").val();
      if (status) {
        setStatus(status);
      }
    });
  }

  // load messages with room id if room id wass null
  function loadMessageWithRoomId() {
    const gettingRoomIdRef = ref(
      database,
      "chatList/" + currentUserUid + "/" + uid
    );
    onValue(gettingRoomIdRef, (snapshort) => {
      const roomIdFeatch = snapshort.child("roomId").val();
      if (roomIdFeatch != null) {
        setRoomIdCheck(roomIdFeatch);
        const messageLodRef = ref(database, "messageList/" + roomIdFeatch);
        onValue(messageLodRef, (snapshort) => {
          setChatData([]);
          const messageData = snapshort.val();
          if (messageData != null) {
            Object.values(messageData).map((data) => {
              if (data.message) {
                setChatData((old) => [...old, data]);
              }
            });
            setProgress(false);
          } else {
            setProgress(false);
          }
        });
      }
    });
  }

  //load messages
  function loadMessages() {
    const messageLodRef = ref(database, "messageList/" + roomId);
    onValue(messageLodRef, (snapshort) => {
      setChatData([]);
      const messageData = snapshort.val();
      if (messageData != null) {
        Object.values(messageData).map((data) => {
          if (data.message) {
            setChatData((old) => [...old, data]);
          }
        });
        setProgress(false);
      } else {
        setProgress(false);
      }
    });
  }
  function ShowBottomSheet() {
    bottomRef.current.open();
  }

  // bottom sheet action
  function bottomSheetActions(data) {
    if (data === "Block " + userName) {
      blockUserInFriendsList();
    } else if (data === "Change background") {
      if (backgroundImage != null) {
        changeBackgroundChatImage(backgroundImagePath);
      } else {
        changeBackgroundChatImage(pathUID);
      }
    } else if (data === "Change chat theme") {
      changingTheChatingtheme();
    }
  }

  function blockUserInFriendsList() {
    Alert.alert(
      "Do you wan't to block " + userName,
      "This user will blocked temporary from your friend list untill you ublock",
      [
        {
          text: "block",
          onPress: () => {
            const blockUserRef = ref(
              database,
              "users/" + currentUserUid + "/" + "friends/" + uid + "/"
            );
            update(blockUserRef, { Block: true }).then(() => {
              ToastAndroid.show(
                "user " + userName + " was block",
                ToastAndroid.SHORT
              );
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

  async function changeBackgroundChatImage(path) {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      // Convert URI to a Blob via XHTML request, and actually upload it to the network
      const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
          resolve(xhr.response);
        };
        xhr.onerror = function () {
          reject(new TypeError("Network request failed"));
        };
        xhr.responseType = "blob";
        xhr.open("GET", result.assets[0].uri, true);
        xhr.send(null);
        console.log("work");
      });

      const storageRef = storeRef(
        storage,
        "backgroudImage" + "/" + currentUserUid + "/" + path + ".jpeg"
      );

      uploadBytes(storageRef, blob).then(() => {
        getDownloadURL(storageRef).then((uri) => {
          if (uri) {
            backgroundImageChildCreate(uri, path);
          }
        });
      });
    }
  }

  // create child in database name of backgroud chat image
  function backgroundImageChildCreate(uri, path) {
    const creatBackGroundImageRef = ref(
      database,
      "users/" + currentUserUid + "/"
    );
    update(creatBackGroundImageRef, {
      backgroundChatImageUrl: uri,
      backgroundChatImagePath: path,
    }).then(() => {
      Alert.alert("", "background image changed");
      bottomRef.current.close();
    });
  }

  // chhangin the chating theme
  function changingTheChatingtheme() {
    Alert.alert(
      "From developer",
      "Hey there, i'm swagger a small developer i'm wokring hard to make this app more ui friendly as well as improve the features 😊"
    );
    bottomRef.current.close();
  }

  function OpenReplyingBottomSheet(message) {
    ReplyBottomRef.current.open();
    SetReplyData(message);
  }

  // reyling to user
  function ReplyingToUser() {
    setIsReplying(true);
    ReplyBottomRef.current.close();
  }

  // message copy
  function MessageCopy() {
    Clipboard.setString(ReplyData.message);
    ToastAndroid.show("message copy", ToastAndroid.SHORT);
    ReplyBottomRef.current.close();
  }

  // set message reply position
  function setYPosition(yPosition) {
    scrollRef.scrollToOffset({ animated: true, offset: yPosition });
  }

  return (
    <View className="flex-col flex-1">
      <AnimatedLoader
        visible={progress}
        overlayColor="rgba(255,255,255,0.75)"
        source={require("../Animation/heart.json")}
        animationStyle={style.lottie}
        speed={1}
      >
        <Text className="text-xs">Loading chats...</Text>
      </AnimatedLoader>

      {/* chat layout */}
      <View
        style={{
          backgroundColor: "#DC143C",
          justifyContent: "space-around",
        }}
      >
        <View className="flex-row justify-between items-center">
          <View className="flex-row p-2 ml-3 ">
            {imageUrl == "" ? (
              <Image
                source={user}
                style={{
                  height: 50,
                  width: 50,
                  borderWidth: 1,
                  borderRadius: 40,
                  borderColor: "#D3D3D3",
                }}
              />
            ) : (
              <Image
                source={{ uri: imageUrl ? imageUrl : null }}
                style={{
                  height: 50,
                  width: 50,
                  borderWidth: 1,
                  borderRadius: 40,
                  borderColor: "#D3D3D3",
                }}
              />
            )}

            <View className="flex-cols">
              <Text
                style={{
                  fontFamily: "Comfortaa_bolt",
                  fontSize: 15,
                  marginLeft: 7,
                  color: "white",
                }}
              >
                {userName}
              </Text>
              {status == "offline" ? (
                <Text
                  style={{
                    fontFamily: "Comfortaa_bolt",
                    fontSize: 12,
                    marginLeft: 7,
                    marginTop: 1,
                    color: "white",
                  }}
                >
                  {status}
                </Text>
              ) : (
                <View className="flex-row ml-2">
                  <Octicons
                    style={{ marginTop: 4 }}
                    name="dot-fill"
                    color="#00cc00"
                    size={15}
                  />
                  <Text
                    style={{
                      fontFamily: "Comfortaa_bolt",
                      fontSize: 12,
                      marginLeft: 1.5,
                      color: "white",
                    }}
                  >
                    {status}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <TouchableOpacity
            style={{ marginRight: 20 }}
            onPress={ShowBottomSheet}
          >
            <Entypo name="dots-three-vertical" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* chat section */}
      <View style={{ flexGrow: 1, flexDirection: "column" }}>
        <ImageBackground
          source={{ uri: backgroundImage != "" ? backgroundImage : imageUrl }}
          style={{ flex: 1 }}
        >
          {/* flatlist for render messages */}

          <FlatList
            data={chatData}
            maxToRenderPerBatch={10}
            ref={(ref) => (scrollRef = ref)}
            onContentSizeChange={() => {
              scrollRef.scrollToEnd({ animated: true });
            }}
            onScroll={(event) => {
              setOffSetPositionValue(event.nativeEvent.contentOffset.y);
            }}
            renderItem={({ item, index }) => {
              if (item.message) {
                return (
                  <ChatListComponent
                    item={item}
                    index={index}
                    roomId={roomId == null ? roomIdCheck : roomId}
                    ReplyingFunction={ReplyingFunction}
                    userName={userName}
                    setYPosition={setYPosition}
                  />
                );
              }
            }}
          />
          {/* flatlist for render messages */}

          {/* input component */}
          <SendMessageInputComponent
            userName={userName}
            uid={uid}
            currentUserUid={currentUserUid}
            currentUserImageUrl={currentUserImageUrl}
            currentUserName={currentUserName}
            imageUrl={imageUrl}
            roomId={roomId == null ? roomIdCheck : roomId}
            currentusername={currentusername}
            username={username}
            currentUserToken={currentUserToken}
            otherUserToken={otherUserToken}
            isReplying={isReplying}
            setIsReplying={setIsReplying}
            ReplyData={ReplyData}
            OffSetPositionValue={OffSetPositionValue}
            status={status}
          />
        </ImageBackground>
      </View>

      {/* bottom sheet */}
      <RBSheet
        ref={bottomRef}
        height={180}
        closeOnDragDown={true}
        customStyles={{
          container: {
            borderTopRightRadius: 20,
            borderTopLeftRadius: 20,
          },
        }}
      >
        <View className="flex-col">
          <View className="mt-2">
            {ShowBottomSheetData.map((data, index) => {
              return (
                <View className="mt-2" key={index}>
                  <TouchableOpacity
                    key={index}
                    onPress={() => bottomSheetActions(data)}
                  >
                    <Text
                      style={{
                        fontFamily: "Comfortaa_bolt",
                        fontSize: 17,
                        marginLeft: 10,
                        marginRight: 10,
                      }}
                    >
                      {data}
                    </Text>
                  </TouchableOpacity>
                  <View
                    style={{
                      borderBottomColor: "#D3D3D3",
                      borderBottomWidth: 0.5,
                      marginLeft: 10,
                      marginRight: 10,
                      marginTop: 10,
                    }}
                  />
                </View>
              );
            })}
          </View>
        </View>
      </RBSheet>

      <RBSheet
        ref={ReplyBottomRef}
        height={120}
        closeOnDragDown={true}
        customStyles={{
          container: {
            borderTopRightRadius: 20,
            borderTopLeftRadius: 20,
          },
        }}
      >
        <View className="flex-col">
          <TouchableOpacity
            style={{ marginLeft: 15, marginTop: 10, flexDirection: "column" }}
            onPress={ReplyingToUser}
          >
            <View className="flex-row items-center mb-1 ml-1">
              <Entypo name="reply" color="#DC143C" size={15} />
              <Text
                style={{
                  fontFamily: "Comfortaa_bolt",
                  fontSize: 14,
                  marginLeft: 10,
                  color: "gray",
                }}
              >
                Reply
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ marginLeft: 15, marginTop: 10, flexDirection: "column" }}
            onPress={MessageCopy}
          >
            <View className="flex-row items-center ml-1">
              <Feather name="copy" color="#DC143C" size={15} />
              <Text
                style={{
                  fontFamily: "Comfortaa_bolt",
                  fontSize: 14,
                  marginLeft: 10,
                  color: "gray",
                }}
              >
                Copy
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </RBSheet>
    </View>
  );
}

const style = StyleSheet.create({
  lottie: {
    width: 100,
    height: 100,
  },
});
