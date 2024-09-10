import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  StyleSheet,
  TextInput,
  ToastAndroid,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { getDatabase, onValue, ref, update } from "firebase/database";
import { App, Auth, storeRef } from "../Firebase";
import Icon from "react-native-vector-icons/FontAwesome5";
import { onAuthStateChanged } from "firebase/auth";
import RBSheet from "react-native-raw-bottom-sheet";
import { getDownloadURL, getStorage, uploadBytes } from "firebase/storage";
import * as ImagePicker from "expo-image-picker/src/ImagePicker";
import AnimatedLoader from "react-native-animated-loader";
import user from "../src/images/user.png";

export default function Profile() {
  const [uid, setUId] = useState();
  const database = getDatabase(App);
  const storage = getStorage(App);
  const [imageUrl, setImageUrl] = useState("");
  const [userName, setuserName] = useState("");
  const [username, setusername] = useState("");
  const [userBio, setUserBio] = useState("");
  const [userphonenumber, setuserphonenumber] = useState("");
  const [userhobbies, setuserhobbies] = useState("");
  const bottomRef = useRef(null);
  const [image, setImage] = useState();
  const [progress, setProgress] = useState(false);

  //edit details
  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editHobbies, setEditHobbies] = useState("");
  const [editBio, setEditBio] = useState("");
  const [friendsUid, setFriendsUid] = useState([]);
  const [memberUids, setMemberUids] = useState([]);
  const [GroupRoomIds, setGroupRoomIds] = useState([]);

  useEffect(() => {
    onAuthStateChanged(Auth, (user) => {
      if (user) {
        setUId(user.uid);
        getUserInformation();
      }
    });
    gettingGroupsDetails();
  }, [uid]);

  // getting group details
  function gettingGroupsDetails() {
    const gettingGroupDetailsRef = ref(database, "chatList/" + uid);
    onValue(gettingGroupDetailsRef, (snapshort) => {
      setGroupRoomIds([]);
      setMemberUids([]);
      snapshort.forEach((data) => {
        const memberDetails = data.child("members").val();
        const groupTypeCheck = data.child("type").val();
        const groupRoomIds = data.child("groupRoomId").val();
        if (groupTypeCheck == "group") {
          setGroupRoomIds((old) => [...old, groupRoomIds]);
          if (memberDetails) {
            Object.values(memberDetails).map((Data) => {
              setMemberUids((old) => [...old, Data]);
            });
          }
        }
      });
    });
  }

  const getUserInformation = () => {
    const reference = ref(database, "users" + "/" + uid + "/");
    onValue(reference, (snapshort) => {
      const profile = snapshort.child("profileUrl").val();
      const name = snapshort.child("userName").val();
      const hobbies = snapshort.child("userHobbies").val();
      const username = snapshort.child("username").val();
      const userBio = snapshort.child("userBio").val();
      const number = snapshort.child("phoneNumber").val();
      const friends = snapshort.child("friends").val();

      //check username and bio
      if (username) {
        setusername(username);
      }
      if (userBio) {
        setUserBio(userBio);
      }

      if (name) {
        setuserName(name);
      }
      if (userphonenumber) {
        setuserphonenumber(number);
      }
      if (hobbies) {
        setuserhobbies(hobbies);
      }

      if (profile) {
        setImageUrl(profile);
      } else {
        console.log("error");
      }

      // getting friends details
      if (friends) {
        Object.values(friends).map((data) => {
          setFriendsUid((old) => [...old, data.uid]);
        });
      }
    });
  };

  function changeUserDetails() {
    bottomRef.current.open();
  }

  //get file permmission
  const openFileForImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission cancelled by you");
    } else {
      getFile();
    }
  };

  const getFile = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setProgress(true);
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

    const storageRef = storeRef(storage, "usersImage" + "/" + uid + ".jpeg");

    uploadBytes(storageRef, blob).then(() => {
      getDownloadURL(storageRef).then((uri) => {
        if (uri) {
          uploadProfile(uri);
        }
      });
    });
  };

  function uploadProfile(uri) {
    if (uri) {
      const uploadRef = ref(database, "users/" + uid + "/");
      update(uploadRef, { profileUrl: uri }).then(() => {
        updateProfileInAllFriend(uri);
      });
    }
    ToastAndroid.show("profile updated", ToastAndroid.SHORT);
  }

  // update profile in all frien list
  function updateProfileInAllFriend(uri) {
    friendsUid.map((uids) => {
      const uploadRef = ref(database, "users/" + uids + "/" + "friends/" + uid);
      update(uploadRef, { profileUrl: uri }).then(() => {
        updateProfileInChatList(uri);
      });
    });
  }

  // update profile in chat list
  function updateProfileInChatList(uri) {
    setProgress(false);
    friendsUid.map((uids) => {
      const uploadRef = ref(database, "chatList/" + uids + "/" + uid);
      update(uploadRef, { profileUrl: uri });
    });

    updateUserProfileInGroups(uri);
  }

  // update user profile in group
  function updateUserProfileInGroups(uri) {
    memberUids.map((data) => {
      GroupRoomIds.map((roomIds) => {
        const updateProfileRef = ref(
          database,
          "chatList/" + data.uid + "/" + roomIds + "/" + "members/" + uid
        );
        update(updateProfileRef, { profileUrl: uri });
      });
    });
  }

  //upload edit details
  function uploadEditDetails() {
    setProgress(true);
    updateUserInformation();
  }

  //update user information
  function updateUserInformation() {
    const updateRef = ref(database, "users/" + uid + "/");
    update(updateRef, {
      userName: editName == "" ? userName : editName,
      userHobbies: editHobbies == "" ? userhobbies : editHobbies,
      username: editUsername == "" ? username : editUsername,
      userBio: editBio == "" ? userBio : editBio,
    }).then(() => {
      updateUserInformationInFriendsList();
    });
    ToastAndroid.show("profile updated succesfully", ToastAndroid.SHORT);
  }

  // update user information in friend list
  function updateUserInformationInFriendsList() {
    friendsUid.map((uids) => {
      const updateRef = ref(
        database,
        "users/" + uids + "/" + "friends/" + uid + "/"
      );
      update(updateRef, {
        userName: editName == "" ? userName : editName,
        userHobbies: editHobbies == "" ? userhobbies : editHobbies,
        username: editUsername == "" ? username : editUsername,
        userBio: editBio == "" ? userBio : editBio,
      });
      updateUserInformationInChatList();
    });
  }

  // update information in chat list
  function updateUserInformationInChatList() {
    friendsUid.map((uids) => {
      const updateInformationInChatList = ref(
        database,
        "chatList/" + uids + "/" + uid
      );
      update(updateInformationInChatList, {
        userName: editName == "" ? userName : editName,
        userHobbies: editHobbies == "" ? userhobbies : editHobbies,
        username: editUsername == "" ? username : editUsername,
        userBio: editBio == "" ? userBio : editBio,
      });
    });

    bottomRef.current.close();
    setProgress(false);
    updateUserProfileInGroups();
  }

  // update user profile in group
  function updateUserProfileInGroups() {
    memberUids.map((data) => {
      GroupRoomIds.map((roomIds) => {
        const updateInformationInGroupChatList = ref(
          database,
          "chatList/" + data.uid + "/" + roomIds + "/" + "members/" + uid
        );
        update(updateInformationInGroupChatList, {
          userName: editName == "" ? userName : editName,
          userHobbies: editHobbies == "" ? userhobbies : editHobbies,
          username: editUsername == "" ? username : editUsername,
          userBio: editBio == "" ? userBio : editBio,
        });
      });
    });
  }
  return (
    <View className="flex-col p-5">
      {/* progress spinner */}
      <AnimatedLoader
        visible={progress}
        overlayColor="rgba(255,255,255,0.75)"
        source={require("../Animation/heart.json")}
        animationStyle={styles.lottie}
        speed={1}
      >
        <Text>updating profile...</Text>
      </AnimatedLoader>

      <View className="flex-col justify-items-center">
        <Text style={{ fontFamily: "Comfortaa", fontSize: 17, marginLeft: 5 }}>
          Profile
        </Text>
        <View className="flex-col mt-5">
          {/* image */}
          <View className="flex-col w-32">
            {imageUrl == "" ? (
              <Image
                source={user}
                style={{
                  height: 100,
                  width: 100,
                  borderRadius: 10,
                  borderColor: "#D3D3D3",
                }}
              />
            ) : (
              <Image
                source={{ uri: imageUrl }}
                style={{
                  height: 100,
                  width: 100,
                  borderRadius: 10,
                  borderColor: "#D3D3D3",
                }}
              />
            )}
          </View>

          <Text
            style={{
              fontFamily: "Comfortaa",
              fontSize: 15,
              color: "#aca1a1",
              marginTop: 5,
            }}
          >
            About
          </Text>
          <View
            style={{
              marginTop: 3,
              width: 30,
              borderWidth: 0.5,
              borderColor: "#aca1a1",
            }}
          />
          {/* edit button */}
          <View className="flex-row justify-between items-center">
            <View className="flex-col">
              <View className="flex-row mt-2">
                <Text style={{ fontFamily: "Comfortaa", fontSize: 12 }}>
                  Name :{" "}
                </Text>
                <Text className="text-gray-400">{userName}</Text>
              </View>

              {/* Hobbies */}
              <View className="flex-row mt-2">
                <Text style={{ fontFamily: "Comfortaa", fontSize: 12 }}>
                  Hobbies :{" "}
                </Text>
                <Text className="text-gray-400">{userhobbies}</Text>
              </View>
              {/* username */}
              <View className="flex-row mt-2">
                <Text style={{ fontFamily: "Comfortaa", fontSize: 12 }}>
                  Username :{" "}
                </Text>
                <Text className="text-gray-400">{username}</Text>
              </View>

              {/* bio */}
              <View className="flex-row mt-2">
                <Text style={{ fontFamily: "Comfortaa", fontSize: 12 }}>
                  Bio :{" "}
                </Text>
                <Text className="text-gray-400">{userBio}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={{
                backgroundColor: "#DC143C",
                padding: 10,
                width: 100,
                flexDirection: "row",
                borderRadius: 10,
                alignItems: "center",
              }}
              onPress={changeUserDetails}
            >
              <Text className="text-white text-xs mr-2">Edit profile</Text>
              <Icon name="edit" size={15} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* bottom sheet */}
      <RBSheet
        ref={bottomRef}
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
          <Text style={{ fontFamily: "Comfortaa", fontSize: 13, margin: 5 }}>
            Edit profile
          </Text>

          <View className="flex-row self-center">
            <View className="flex-col w-32 m-5">
              {imageUrl == "" ? (
                <Image
                  source={user}
                  style={{
                    height: 100,
                    width: 100,
                    borderRadius: 10,
                    borderColor: "#D3D3D3",
                  }}
                />
              ) : (
                <Image
                  source={{ uri: imageUrl != null ? imageUrl : null }}
                  style={{
                    height: 100,
                    width: 100,
                    borderRadius: 10,
                    borderColor: "#D3D3D3",
                  }}
                />
              )}
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
                onPress={openFileForImage}
              >
                <Icon name="camera-retro" size={25} color="#DC143C" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex-col mt-3 justify-between">
            <TextInput
              placeholder="Full name"
              style={{
                padding: 5,
                fontFamily: "Comfortaa",
                fontSize: 13,
                borderBottomWidth: 1,
                marginLeft: 20,
                marginRight: 20,
                borderColor: "#DC143C",
              }}
              onChangeText={(text) => setEditName(text)}
            />
            <TextInput
              placeholder="Username"
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
              onChangeText={(text) => setEditUsername(text)}
            />
            <TextInput
              placeholder="Hobbies"
              style={{
                padding: 5,
                fontFamily: "Comfortaa",
                fontSize: 13,
                borderBottomWidth: 1,
                marginLeft: 20,
                marginTop: 7,
                marginRight: 20,
                borderColor: "#DC143C",
              }}
              onChangeText={(text) => setEditHobbies(text)}
            />

            <TextInput
              placeholder="Bio"
              style={{
                padding: 5,
                fontFamily: "Comfortaa",
                fontSize: 13,
                borderBottomWidth: 1,
                marginLeft: 20,
                marginRight: 20,
                borderColor: "#DC143C",
                marginTop: 7,
              }}
              onChangeText={(text) => setEditBio(text)}
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
                  update profile
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </RBSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  lottie: {
    width: 100,
    height: 100,
  },
});
