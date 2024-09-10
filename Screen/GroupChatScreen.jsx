import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ToastAndroid,
  ImageBackground,
  Modal,
  ScrollView,
  TextInput,
  Alert,
  Clipboard,
  BackHandler,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { ref, remove, update } from "firebase/database";
import { getDatabase, onValue } from "firebase/database";
import { App, Auth, storeRef } from "../Firebase";
import RBSheet from "react-native-raw-bottom-sheet";
import AnimatedLoader from "react-native-animated-loader";
import AntDesign from "react-native-vector-icons/AntDesign";
import Icon from "react-native-vector-icons/FontAwesome5";
import GroupChatListComponent from "../Components/GroupChatListComponent";
import SendGroupMessageInputComponent from "../Components/SendGroupMessageInputComponent";
import { onAuthStateChanged } from "firebase/auth";
import { getDownloadURL, getStorage, uploadBytes } from "firebase/storage";
import * as ImagePicker from "expo-image-picker/src/ImagePicker";
import { useNavigation } from "@react-navigation/native";
import Entypo from "react-native-vector-icons/Entypo";
import Feather from "react-native-vector-icons/Feather";
import { AppState } from "react-native";
import user from "../src/images/user.png";
import { FlatList } from "react-native-gesture-handler";

export default function GroupChatScreen({ route }) {
  const groupRoomId = route.params.groupRoomId;
  const imageUrl = route.params.imageUrl;
  const groupName = route.params.groupName;
  const tagline = route.params.tagline;

  // databse variable
  const database = getDatabase(App);
  const storage = getStorage(App);
  const groupBottomRef = useRef(null);
  const navigation = useNavigation();

  //details state
  const [uid, setUid] = useState("");
  const [groupChatData, setGroupChatData] = useState([]);
  const [progress, setProgress] = useState(true);
  const [showModel, setShoeModel] = useState(false);
  const [checkIsAdmin, setCheckIsAdmin] = useState();
  //current user details
  const [currentUserImageUrl, setcurrentUserImageUrl] = useState("");
  const [currentusername, setcurrentusername] = useState("");
  const [currentusertoken, setcurrentusertoken] = useState("");

  // scroll view scroll
  let scrollRef;
  const [groupMemberDetails, setGroupMemberDetails] = useState([]);
  const [updateAddedUserChatList, setUpdateAddedUserChatList] = useState([]);
  const [groupmemnerstokens, setgroupmemnerstokens] = useState([]);

  //edit details
  const [editGroupName, setEditGroupName] = useState("");
  const [editGroupTagline, setEditGroupTagline] = useState("");

  // group variable
  const [GroupReplyData, setGroupReplyData] = useState({});
  const [isReplying, setIsReplying] = useState(false);
  const [YforMessagePosition, setYforMessagePosition] = useState();
  const [groupMessageCount, setGroupMessageCount] = useState([]);

  // ref
  const GrpupReplyBottomRef = useRef(null);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    onAuthStateChanged(Auth, (user) => {
      if (user) {
        setUid(user.uid);
      }
    });
    loadCurrentUserInfo();
    loadGroupMemberInformation();
    loadGroupMessageList();
    loadGroupmemberList();
    checkIsIamAdminOfGroup();
  }, [uid]);

  // onback pressed
  // and make user that the user left the curent user chat screen
  // function handleBackButtonClick() {
  //   groupMemberDetails.map((uids) => {
  //     const updateGroupMemberDetailsToScreenRef = ref(
  //       database,
  //       "chatList/" + uids.uid + "/" + groupRoomId + "/" + "members/" + uid
  //     );

  //     update(updateGroupMemberDetailsToScreenRef, {
  //       inGroupChatScreen: false,
  //     });
  //   });
  // }

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
    }
  };

  // check is i am admin of group
  function checkIsIamAdminOfGroup() {
    const checkAdminRef = ref(
      database,
      "chatList/" + uid + "/" + groupRoomId + "/" + "members/" + uid
    );
    onValue(checkAdminRef, (snapshort) => {
      const checkIsAdmin = snapshort.child("admin").val();
      if (checkIsAdmin) {
        setCheckIsAdmin(checkIsAdmin);
      }
    });
  }

  // load current user information
  function loadCurrentUserInfo() {
    const loadCurrentUserInfoRef = ref(database, "users/" + uid + "/");
    onValue(loadCurrentUserInfoRef, (snapshort) => {
      const profile = snapshort.child("profileUrl").val();
      const username = snapshort.child("username").val();
      const token = snapshort.child("userToken").val();

      if (username) {
        setcurrentusername(username);
      }
      if (profile) {
        setcurrentUserImageUrl(profile);
      }
      if (token) {
        setcurrentusertoken(token);
      }
    });
  }

  // load group messages chat list
  function loadGroupMessageList() {
    const loadGroupMessageref = ref(
      database,
      "groupMessageList/" + groupRoomId
    );
    onValue(loadGroupMessageref, (snapshort) => {
      setGroupChatData([]);
      const chat = snapshort.val();
      if (chat) {
        setGroupChatData(chat);
        setProgress(false);
      } else {
        setProgress(false);
      }
    });
  }

  // getting group member information
  function loadGroupMemberInformation() {
    const gettinGroupMemberInfoRef = ref(
      database,
      "chatList/" + uid + "/" + groupRoomId + "/" + "members/"
    );
    onValue(gettinGroupMemberInfoRef, (snapshort) => {
      setGroupMemberDetails([]);
      snapshort.forEach((data) => {
        const groupMemberDetails = data.val();
        const membersTokens = data.child("userToken").val();
        if (groupMemberDetails) {
          setGroupMemberDetails((old) => [...old, groupMemberDetails]);
        }
        if (membersTokens) {
          setgroupmemnerstokens((old) => [...old, membersTokens]);
        }
      });
    });
  }

  // getting group member information
  function loadGroupmemberList() {
    const loadGroupmemberListRef = ref(
      database,
      "chatList/" + uid + "/" + groupRoomId
    );
    onValue(loadGroupmemberListRef, (snapshort) => {
      setUpdateAddedUserChatList([]);
      const data = snapshort.child("members").val();

      if (data) {
        setUpdateAddedUserChatList(data);
      }
    });
  }

  // make group memeber is user in screen
  function userIsOnYourScreen() {
    groupMemberDetails.map((uids) => {
      const updateGroupMemberDetailsToScreenRef = ref(
        database,
        "chatList/" + uids.uid + "/" + groupRoomId + "/" + "members/" + uid
      );

      update(updateGroupMemberDetailsToScreenRef, {
        inGroupChatScreen: true,
      });
    });
  }

  // show bottom sheet
  function ShowBottomSheet() {
    navigation.navigate("AddFriendsToGroup", {
      groupName: groupName,
      groupRoomId: groupRoomId,
      imageUrl: imageUrl,
      currentusername: currentusername,
      memberDetails: updateAddedUserChatList,
    });
  }

  // show model
  function showmodel() {
    setShoeModel(true);
  }

  // chang group details
  function changeGroupDetails() {
    groupBottomRef.current.open();
  }

  const getFile = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }

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

    const storageRef = storeRef(storage, "groupImage" + "/" + groupRoomId);

    uploadBytes(storageRef, blob).then(() => {
      getDownloadURL(storageRef).then((uri) => {
        if (uri) {
          uploadProfile(uri);
          ToastAndroid.show("profile updated", ToastAndroid.SHORT);
        }
      });
    });
  };

  function uploadProfile(uri) {
    groupMemberDetails.map((data) => {
      const uploadRef = ref(
        database,
        "chatList/" + data.uid + "/" + groupRoomId
      );
      update(uploadRef, { imageUrl: uri });
    });
  }

  //upload edit details
  function uploadEditDetails() {
    if (editGroupName == "") {
      Alert.alert("", "group name is required");
    } else {
      updateGroupDetailsInOtherUser();
    }
  }

  // updating group member details
  function updateGroupDetailsInOtherUser() {
    groupMemberDetails.map((data) => {
      const updateRef = ref(
        database,
        "chatList/" + data.uid + "/" + groupRoomId
      );
      update(updateRef, {
        groupName: editGroupName,
        groupTagline: editGroupTagline ? editGroupTagline : "",
      });
    });

    setEditGroupName("");
    setEditGroupTagline("");
    groupBottomRef.current.close();
    ToastAndroid.show("detail updated", ToastAndroid.SHORT);
  }

  // show alert dialog for remove user form group
  function removeUserAlert(userData) {
    Alert.alert("", "do you want to remove " + userData.username, [
      {
        text: "remove",
        onPress: () => {
          const removeChalListRef = ref(
            database,
            "chatList/" + userData.uid + "/" + groupRoomId
          );
          remove(removeChalListRef).then(() => {
            sendingRemoveNotification(userData);
            removeUserFromGroup(userData);
          });
        },
      },
      {
        text: "cancel",
        style: "cancel",
      },
    ]);
  }

  // remove user from group
  function removeUserFromGroup(userData) {
    groupMemberDetails.map((data) => {
      const removeuserRef = ref(
        database,
        "chatList/" +
          data.uid +
          "/" +
          groupRoomId +
          "/" +
          "members/" +
          userData.uid
      );
      remove(removeuserRef);
    });

    ToastAndroid.show(
      " " + userData.username + " " + "was removed",
      ToastAndroid.SHORT
    );
  }

  // sending user notification
  function sendingRemoveNotification(userData) {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append(
      "Authorization",
      "key=AAAAVakCcv8:APA91bG8VT4gWX8UFCsrwZU7b6YaqMSIRteITOgTvbBMEqhXAvcg_2eqCUPm7Sq6aP5uznn2B5DUhmQsNJEn-sfqYdzqBvc_zTDI4t0oHGdGGXlfMLBqAS3aDQDdNV7wd84wk-SCF9dF"
    );

    var raw = JSON.stringify({
      data: {
        type: "remove from group",
        title: groupName,
        body: currentusername + " has remove you",
        groupProfile: imageUrl,
      },
      android: {
        priority: "high",
      },
      priority: 10,
      to: userData.userToken,
    });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch("https://fcm.googleapis.com/fcm/send", requestOptions);
  }

  // group message reply
  function GroupMessageReply(message) {
    GrpupReplyBottomRef.current.open();
    setGroupReplyData(message);
  }

  // group Reply option
  function GroupReplyOption() {
    setIsReplying(true);
    GrpupReplyBottomRef.current.close();
  }

  // group message copy
  function GroupMessageCopy() {
    Clipboard.setString(GroupReplyData.message);
    ToastAndroid.show("message copy", ToastAndroid.SHORT);
    GrpupReplyBottomRef.current.close();
  }

  // set message reply position
  function setYposition(yPosition) {
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

      {/* show model */}
      <Modal
        animationType="slide"
        visible={showModel}
        onRequestClose={() => {
          setShoeModel(!showModel);
        }}
      >
        <View className="flex-col justify-center p-2">
          <View className="flex-row justify-between">
            <Text
              style={{
                fontFamily: "Comfortaa_bolt",
                fontSize: 15,
                marginLeft: 7,
                color: "gray",
              }}
            >
              Group details
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: "#DC143C",
                padding: 10,
                width: 100,
                flexDirection: "row",
                borderRadius: 10,
                alignItems: "center",
              }}
              onPress={changeGroupDetails}
            >
              <Text className="text-white text-xs mr-2">Edit details</Text>
              <Icon name="edit" size={15} color="#fff" />
            </TouchableOpacity>
          </View>
          <Image
            source={{ uri: imageUrl ? imageUrl : null }}
            style={{
              height: 120,
              width: 120,
              borderWidth: 1,
              borderRadius: 60,
              borderColor: "#D3D3D3",
              alignSelf: "center",
            }}
          />

          <View className="flex-col justify-center mt-3 self-center">
            <View className="flex-row items-center">
              <Text className="text-xs text-gray-500">Group name : </Text>
              <Text className="text-sm text-gray-500">{groupName}</Text>
            </View>

            <View className="flex-row items-center mt-1">
              <Text className="text-xs text-gray-500">Tagline : </Text>
              <Text className="text-sm text-gray-500">{tagline}</Text>
            </View>
          </View>

          <View className="flex-col justify-center mt-5">
            <Text
              style={{
                fontFamily: "Comfortaa_bolt",
                fontSize: 12,
                marginLeft: 7,
                color: "gray",
              }}
            >
              Group members
            </Text>

            <ScrollView style={{ marginTop: 10 }}>
              {groupMemberDetails.map((data, index) => {
                return (
                  <View className="ml-2 mr-2" key={index}>
                    <View className="flex-row justify-between mt-1 p-2 bg-white rounded-lg">
                      {/* name and for search */}
                      <View className="flex-row ml-1">
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

                      <View
                        style={{
                          alignSelf: "center",
                        }}
                      >
                        {/* icon */}
                        {checkIsAdmin == true ? (
                          <View className="flex-row items-center">
                            {data.admin == true ? (
                              <Text className="text-gray-400 text-xs">
                                admin
                              </Text>
                            ) : (
                              <TouchableOpacity
                                style={{
                                  backgroundColor: "#DC143C",
                                  borderRadius: 50,
                                  alignSelf: "center",
                                  paddingRight: 15,
                                  paddingTop: 5,
                                  paddingBottom: 5,
                                  paddingLeft: 15,
                                  marginRight: 5,
                                }}
                                onPress={() => removeUserAlert(data)}
                              >
                                <Text className="text-xs text-white">
                                  remove
                                </Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        ) : (
                          <View>
                            {data.admin == true ? (
                              <Text className="text-xs text-gray-500">
                                group admin
                              </Text>
                            ) : null}
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>

          {/* {data.admin == true ? (
            <Text className="text-xs mr-2 text-gray-400">admin</Text>
          ) : null} */}

          {/* group details bottom sheet */}
          <RBSheet
            ref={groupBottomRef}
            height={500}
            closeOnDragDown={true}
            customStyles={{
              container: {
                borderTopRightRadius: 20,
                borderTopLeftRadius: 20,
              },
            }}
          >
            <View className="flex-col p-3">
              <Text
                style={{ fontFamily: "Comfortaa", fontSize: 13, margin: 5 }}
              >
                Edit group details
              </Text>

              <View className="flex-row self-center">
                <View className="flex-col w-32 m-5">
                  <Image
                    source={{ uri: imageUrl }}
                    style={{
                      height: 100,
                      width: 100,
                      borderRadius: 10,
                      borderColor: "#D3D3D3",
                    }}
                  />
                  <TouchableOpacity
                    style={{
                      padding: 7,
                      height: 40,
                      width: 40,
                      borderRadius: 20,
                      elevation: 5,
                      backgroundColor: "#fff",
                      position: "absolute",
                      alignSelf: "flex-end",
                      marginTop: -5,
                    }}
                    onPress={getFile}
                  >
                    <Icon name="camera-retro" size={25} color="#DC143C" />
                  </TouchableOpacity>
                </View>
              </View>

              <View className="flex-col mt-3 justify-between">
                <TextInput
                  placeholder="Group name"
                  value={editGroupName}
                  style={{
                    padding: 5,
                    fontFamily: "Comfortaa",
                    fontSize: 13,
                    borderBottomWidth: 1,
                    marginLeft: 20,
                    marginRight: 20,
                    borderColor: "#DC143C",
                  }}
                  onChangeText={(text) => setEditGroupName(text)}
                />
                <TextInput
                  placeholder="tagline"
                  value={editGroupTagline}
                  style={{
                    padding: 5,
                    marginTop: 7,
                    fontFamily: "Comfortaa",
                    fontSize: 13,
                    borderBottomWidth: 1,
                    marginLeft: 20,
                    marginRight: 20,
                    borderColor: "#DC143C",
                  }}
                  onChangeText={(text) => setEditGroupTagline(text)}
                />

                <View className="flex-1 flex-row mt-10">
                  <TouchableOpacity
                    style={{
                      borderRadius: 5,
                      height: 35,
                      flex: 1,
                      padding: 2,
                      marginLeft: 20,
                      marginRight: 20,
                      alignSelf: "center",
                      justifyContent: "center",
                      backgroundColor: "#DC143C",
                    }}
                    onPress={uploadEditDetails}
                  >
                    <Text className="text-white text-sm font-bold text-center">
                      update details
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </RBSheet>
        </View>
      </Modal>

      {/* chat layout */}
      <View
        style={{
          backgroundColor: "#DC143C",
          justifyContent: "space-around",
        }}
      >
        <View className="flex-row justify-between items-center">
          <TouchableOpacity onPress={showmodel}>
            <View className="flex-row p-2 ml-3 ">
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
              <View className="flex-col">
                <Text
                  style={{
                    fontFamily: "Comfortaa_bolt",
                    fontSize: 15,
                    marginLeft: 7,
                    color: "white",
                  }}
                >
                  {groupName}
                </Text>
                {tagline ? (
                  <Text
                    style={{
                      fontFamily: "Comfortaa_bolt",
                      fontSize: 12,
                      marginLeft: 7,
                      marginTop: 3,
                      color: "white",
                    }}
                  >
                    {tagline}
                  </Text>
                ) : null}
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ marginRight: 20 }}
            onPress={ShowBottomSheet}
          >
            <AntDesign name="addusergroup" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* chat section */}
      <View style={{ flexGrow: 1, flexDirection: "column" }}>
        <ImageBackground
          source={{ uri: imageUrl ? imageUrl : null }}
          style={{ flex: 1 }}
        >
          {/* flatlist for render messages */}

          <FlatList
            data={Object.values(groupChatData)}
            maxToRenderPerBatch={10}
            ref={(ref) => (scrollRef = ref)}
            estimatedItemSize={88}
            onScroll={(event) => {
              setYforMessagePosition(event.nativeEvent.contentOffset.y);
            }}
            onContentSizeChange={() =>
              scrollRef.scrollToEnd({ animated: true })
            }
            renderItem={({ item, index }) => {
              return (
                <GroupChatListComponent
                  data={item}
                  index={index}
                  groupRoomId={groupRoomId}
                  currentUserUid={uid}
                  GroupMessageReply={GroupMessageReply}
                  setYposition={setYposition}
                />
              );
            }}
          />

          {/* flatlist for render messages */}

          <SendGroupMessageInputComponent
            groupName={groupName}
            groupImageUrl={imageUrl}
            currentUserUid={uid}
            currentUserImageUrl={currentUserImageUrl}
            groupRoomId={groupRoomId}
            currentusername={currentusername}
            groupMemberDetails={groupMemberDetails}
            updateAddedUserChatList={updateAddedUserChatList}
            groupmemnerstokens={groupmemnerstokens}
            groupTagline={tagline}
            currentusertoken={currentusertoken}
            setIsReplying={setIsReplying}
            isReplying={isReplying}
            GroupReplyData={GroupReplyData}
            YforMessagePosition={YforMessagePosition}
          />
        </ImageBackground>
      </View>

      {/* group message reply bottom sheet */}
      <RBSheet
        ref={GrpupReplyBottomRef}
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
            onPress={GroupReplyOption}
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
            onPress={GroupMessageCopy}
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
