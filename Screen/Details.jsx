import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker/src/ImagePicker";

// animation
import Lottie from "lottie-react-native";
import { getDownloadURL, getStorage, uploadBytes } from "firebase/storage";
import { getDatabase, set, ref, onValue } from "firebase/database";
import { App, Auth, storeRef } from "../Firebase";
import { onAuthStateChanged } from "firebase/auth/react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import AnimatedLoader from "react-native-animated-loader";
import WelcomeNotification from "../notifee notification/WelcomeNotification";
import messaging from "@react-native-firebase/messaging";

//image check
const UserImageCheck = ({ ImageUri }) => {
  let content;
  if (!ImageUri) {
    content = (
      <Image
        source={require("../assets/icon.png")}
        style={{ height: 100, width: 100 }}
      />
    );
  } else {
    content = (
      <Image source={{ uri: ImageUri }} style={{ height: 100, width: 100 }} />
    );
  }

  return <View>{content}</View>;
};

export default function Details({ navigation }) {
  const database = getDatabase(App);
  const storage = getStorage(App);
  const [userName, setUserName] = useState("");
  const [Username, setUsername] = useState("");
  const [uid, setUid] = useState();
  const [image, setImage] = useState();
  const [imageUrl, setImageUrl] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [progress, setProgress] = useState(false);
  const [userToken, setUserToken] = useState("");
  const [userInfoCheck, setuserIndoCheck] = useState(false);

  //get file permmission
  const GetPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required");
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
    }
  };

  //useeffect
  useEffect(() => {
    onAuthStateChanged(Auth, (user) => {
      if (user) {
        setUid(user.uid);
        setPhoneNumber(user.phoneNumber);
      }
    });
    gettingToken();
    checkUserInformation();
  }, [uid]);

  // check user details are empty
  function checkUserInformation() {
    const userInfoRef = ref(database, "users/" + uid + "/");
    onValue(userInfoRef, (snapshort) => {
      const imageUrl = snapshort.child("profileUrl").val();
      const name = snapshort.child("userName").val();
      const username = snapshort.child("username").val();
      if (imageUrl != null || name != null || username != null) {
        setuserIndoCheck(true);
      }
    });
  }

  if (userInfoCheck == true) {
    navigation.replace("HomeChat");
  }

  // getting token
  const gettingToken = async () => {
    const token = await messaging().getToken();
    setUserToken(token);
  };

  //user details
  function uploadUserDetails() {
    const empty = "";
    if (userName == "") {
      Alert.alert("Enter your name");
    } else if (Username == "") {
      Alert.alert("Username is required");
    } else {
      if (image != null) {
        uploadImage();
        setProgress(true);
      } else {
        uploadDetails(empty);
        setProgress(true);
      }
    }
  }

  const uploadImage = async () => {
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
    });

    const storageRef = storeRef(storage, "usersImage" + "/" + uid + ".jpeg");

    uploadBytes(storageRef, blob).then(() => {
      Alert.alert("", "uploaded");
      getDownloadURL(storageRef).then((uri) => {
        uploadDetails(uri);
      });
    });
  };

  //upload details
  function uploadDetails(uri) {
    const reference = ref(database, "users" + "/" + uid + "/");
    set(reference, {
      userName: userName,
      username: Username,
      profileUrl: uri,
      phoneNumber: phoneNumber,
      status: "online",
      uid: uid,
      userHobbies: "",
      userBio: "",
      userToken: userToken,
    });
    setProgress(false);
    navigation.replace("HomeChat");
    WelcomeNotification();
  }
  return (
    <View
      style={{
        height: 400,
        width: 400,
        flex: 1,
        justifyContent: "center",
        alignSelf: "center",
      }}
    >
      <Lottie
        autoPlay
        loop
        source={require("../Animation/lf30_editor_hfwrraif.json")}
      />

      <View className="justify-center m-10">
        {/* progress spinner */}
        <AnimatedLoader
          visible={progress}
          overlayColor="rgba(255,255,255,0.75)"
          source={require("../Animation/heart.json")}
          animationStyle={styles.lottie}
          speed={1}
        ></AnimatedLoader>

        <View className="rounded-lg bg-white p-3">
          <View className="flex-row p-2">
            <Text
              style={{ fontFamily: "Comfortaa", fontSize: 15, marginLeft: 5 }}
            >
              Let we know about you
            </Text>
            <View style={{ height: 50, width: 100 }}>
              <Lottie
                source={require("../Animation/heart.json")}
                autoPlay
                loop
              />
            </View>
          </View>

          {/* image */}
          <View className="p-2 flex-row">
            <UserImageCheck ImageUri={image} />
            <TouchableOpacity
              style={{
                padding: 7,
                borderRadius: 20,
                elevation: 5,
                alignSelf: "baseline",
                backgroundColor: "#fff",
              }}
              onPress={GetPermission}
            >
              <Icon name="camera-retro" size={25} color="#DC143C" />
            </TouchableOpacity>
          </View>

          {/* input view */}
          <View className="p-2 mt-2 flex-col">
            <View
              style={{
                padding: 5,
                borderWidth: 1,
                borderRadius: 5,
                width: 280,
                borderColor: "#DC143C",
                justifyContent: "center",
              }}
            >
              <TextInput
                placeholder="Enter your name"
                style={{
                  fontSize: 15,
                  color: "#808080",
                  padding: 3,
                }}
                onChangeText={(text) => setUserName(text)}
              />
            </View>
          </View>

          <View className="p-2 mt-2 flex-col">
            <View
              style={{
                padding: 5,
                borderWidth: 1,
                borderRadius: 5,
                width: 280,
                borderColor: "#DC143C",
              }}
            >
              <TextInput
                placeholder="Username"
                style={{
                  fontSize: 15,
                  color: "#808080",
                  padding: 3,
                }}
                onChangeText={(text) => setUsername(text)}
              />
            </View>

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
              onPress={uploadUserDetails}
            >
              <Text className="text-white text-sm font-bold text-center">
                Submit
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
