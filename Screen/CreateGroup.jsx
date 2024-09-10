import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
} from "react-native";
import React, { useEffect, useState } from "react";
import Lottie from "lottie-react-native";
import * as ImagePicker from "expo-image-picker/src/ImagePicker";
import { getDownloadURL, getStorage, uploadBytes } from "firebase/storage";
import { getDatabase, set, ref, update, onValue } from "firebase/database";
import { storeRef, App } from "../Firebase";
import Icon from "react-native-vector-icons/FontAwesome5";
import uuid from "react-native-uuid";
import AnimatedLoader from "react-native-animated-loader";

//image check
const UserImageCheck = ({ ImageUri }) => {
  let content;
  if (!ImageUri) {
    content = (
      <Image
        source={require("../assets/icon.png")}
        style={{ height: 100, width: 100, borderRadius: 50 }}
      />
    );
  } else {
    content = (
      <Image
        source={{ uri: ImageUri }}
        style={{ height: 100, width: 100, borderRadius: 50 }}
      />
    );
  }

  return <View>{content}</View>;
};

export default function CreateGroup({ navigation, route }) {
  const database = getDatabase(App);
  const storage = getStorage(App);
  const [image, setImage] = useState();
  const [progress, setProgress] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupTagline, setGroupTagline] = useState("");
  const [userName, setuserName] = useState("");
  const [username, setusername] = useState("");
  const [userBio, setUserBio] = useState("");
  const [userphonenumber, setuserphonenumber] = useState("");
  const [userhobbies, setuserhobbies] = useState("");
  const [currentUserToken, setcurrentUserToken] = useState("");
  const [currentUserImageUrl, setCurrentUserImageUrl] = useState("");
  const currentUserUid = route.params.uid;

  useEffect(() => {
    loadCurrentUserInformation();
  }, [currentUserUid]);

  // laod information
  function loadCurrentUserInformation() {
    const loadInforRef = ref(database, "users/" + currentUserUid + "/");
    onValue(loadInforRef, (snapshort) => {
      const profile = snapshort.child("profileUrl").val();
      const name = snapshort.child("userName").val();
      const hobbies = snapshort.child("userHobbies").val();
      const username = snapshort.child("username").val();
      const userBio = snapshort.child("userBio").val();
      const number = snapshort.child("phoneNumber").val();
      const userToken = snapshort.child("userToken").val();

      //check username and bio
      if (username) {
        setusername(username);
      }
      if (userBio) {
        setUserBio(userBio);
      }

      if (profile) {
        setCurrentUserImageUrl(profile);
        setuserName(name);
        setuserphonenumber(number);
        setuserhobbies(hobbies);
        setcurrentUserToken(userToken);
      } else {
        console.log("error");
      }
    });
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
  };

  // create group input check
  async function checkInputForCreateGroup() {
    // group id assign
    const groupRoomId = uuid.v4().toString();
    if (!image) {
      Alert.alert("", "please select group icon");
    } else if (groupName === "") {
      Alert.alert("", "Enter group name");
    } else if (groupName.length === 4) {
      Alert.alert("", "Group name is to short");
    } else if (groupName != "") {
      setProgress(true);
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
        xhr.open("GET", image, true);
        xhr.send(null);
        console.log("work");
      });

      const storageRef = storeRef(storage, "groupImage" + "/" + groupRoomId);

      uploadBytes(storageRef, blob).then(() => {
        getDownloadURL(storageRef).then((uri) => {
          passGroupDataToAddFriendScreen(groupRoomId, uri);
        });
      });
    }
  }

  /// create group in database
  function passGroupDataToAddFriendScreen(groupRoomId, uri) {
    const createGroupRoomIdRef = ref(
      database,
      "chatList/" + currentUserUid + "/" + groupRoomId
    );
    update(createGroupRoomIdRef, {
      type: "group",
      groupRoomId: groupRoomId,
      groupName: groupName,
      imageUrl: uri,
      groupTagline: groupTagline,
    }).then(() => {
      createGroupMembers(groupRoomId, uri);
    });
  }

  //  create group members
  function createGroupMembers(groupRoomId, uri) {
    // adding self informationM
    const addMemberRef = ref(
      database,
      "chatList/" +
        currentUserUid +
        "/" +
        groupRoomId +
        "/" +
        "members/" +
        currentUserUid +
        "/"
    );
    update(addMemberRef, {
      admin: true,
      userName: userName,
      profileUrl: currentUserImageUrl,
      userHobbies: userhobbies,
      username: username,
      userBio: userBio,
      uid: currentUserUid,
      phoneNumber: userphonenumber,
      userToken: currentUserToken,
    }).then(() => {
      navigation.replace("AddFriendsToCreateGroup", {
        groupRoomId: groupRoomId,
        groupName: groupName,
        currentUserUid: currentUserUid,
        username: username,
        groupImageUrl: uri,
      });
      setProgress(false);
    });
  }
  return (
    <View className="flex-col">
      {/* progress spinner */}
      <AnimatedLoader
        visible={progress}
        overlayColor="rgba(255,255,255,0.75)"
        source={require("../Animation/heart.json")}
        animationStyle={styles.lottie}
        speed={1}
      >
        <Text>Creating group...</Text>
      </AnimatedLoader>
      <Text
        style={{
          fontFamily: "Comfortaa",
          fontSize: 15,
          margin: 15,
          color: "gray",
        }}
      >
        Create group chat
      </Text>
      <View className="flex-col justify-center items-center mt-6">
        <Lottie
          style={{ height: 120 }}
          autoPlay
          loop
          source={require("../Animation/groups.json")}
        />

        {/* image */}
        <View className="p-2 flex-row mt-3">
          <UserImageCheck ImageUri={image} />
          <TouchableOpacity
            style={{
              padding: 7,
              borderRadius: 20,
              elevation: 5,
              alignSelf: "baseline",
              backgroundColor: "#fff",
              position: "absolute",
            }}
            onPress={getFile}
          >
            <Icon name="camera-retro" size={25} color="#DC143C" />
          </TouchableOpacity>
        </View>

        {/* input */}
        <View
          style={{
            padding: 5,
            borderWidth: 1,
            borderRadius: 5,
            marginTop: 10,
            width: 280,
            borderColor: "#DC143C",
          }}
        >
          <TextInput
            placeholder="Enter group name"
            style={{
              fontSize: 14,
              color: "#808080",
              fontFamily: "Comfortaa",
              padding: 3,
            }}
            onChangeText={(text) => setGroupName(text)}
          />
          <TextInput
            placeholder="Group tagline"
            style={{
              fontSize: 14,
              marginTop: 5,
              color: "#808080",
              fontFamily: "Comfortaa",
              padding: 3,
            }}
            onChangeText={(text) => setGroupTagline(text)}
          />
        </View>

        {/* button to create group */}
        <TouchableOpacity
          style={{
            width: 280,
            borderRadius: 5,
            height: 35,
            marginTop: 20,
            padding: 2,
            alignSelf: "center",
            justifyContent: "center",
            backgroundColor: "#DC143C",
          }}
          onPress={checkInputForCreateGroup}
        >
          <Text className="text-white text-sm font-bold text-center">
            Create group
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  lottie: {
    width: 100,
    height: 100,
  },
});
