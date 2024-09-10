import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  FlatList,
  ToastAndroid,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { getDatabase, onValue, ref, set } from "firebase/database";
import { App, Auth } from "../Firebase";
import { onAuthStateChanged } from "firebase/auth";
import Icon from "react-native-vector-icons/Ionicons";
import AntDesign from "react-native-vector-icons/AntDesign";
import AlreadyFriendCheck from "../Components/AlreadyFriendCheck";
import user from "../src/images/user.png";

export default function FindUser({ navigation }) {
  const database = getDatabase(App);

  const [searchInput, setSearchInput] = useState("");
  const [allUserList, setAllUserList] = useState([]);
  const [uid, setUid] = useState();

  //variable for user jnformation
  const [imageUrl, setImageUrl] = useState("");
  const [userName, setuserName] = useState("");
  const [username, setusername] = useState("");
  const [userBio, setUserBio] = useState("");
  const [userphonenumber, setuserphonenumber] = useState("");
  const [userhobbies, setuserhobbies] = useState("");
  const [currentUserToken, setcurrentUserToken] = useState("");

  useEffect(() => {
    onAuthStateChanged(Auth, (user) => {
      if (user) {
        setUid(user.uid);
        loadUserForFriend();
        loadUseDetails();
      }
    });
  }, [uid]);

  // load user friends to add
  function loadUserForFriend() {
    const allUserRef = ref(database, "users");
    setAllUserList([]);
    onValue(allUserRef, (snapshort) => {
      const data = snapshort.val();
      if (data) {
        setAllUserList(data);
      }
    });
  }

  function loadUseDetails() {
    const userInfoRef = ref(database, "users/" + uid + "/");
    onValue(userInfoRef, (snapshort) => {
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
      if (name) {
        setuserName(name);
      }
      if (number) {
        setuserphonenumber(number);
      }
      if (hobbies) {
        setuserhobbies(hobbies);
      }
      if (userToken) {
        setcurrentUserToken(userToken);
      }

      if (profile) {
        setImageUrl(profile);
      } else {
        console.log("error");
      }
    });
  }

  //send request to user
  function sendrequestToUser(userDetails) {
    // getting other user information

    const otherUserToken = userDetails.userToken;
    const otherUid = userDetails.uid;
    const otherUsername = userDetails.username;
    const otherUserName = userDetails.userName;
    const otherHobbies = userDetails.userHobbies;
    const otherPhonenumber = userDetails.phoneNumber;
    const otherProfile = userDetails.profileUrl;
    const otherBio = userDetails.userBio;

    const AddFriendRef = ref(
      database,
      "users" + "/" + userDetails.uid + "/" + "request/" + uid + "/"
    );
    set(AddFriendRef, {
      userName: userName,
      profileUrl: imageUrl,
      userHobbies: userhobbies,
      username: username,
      userBio: userBio,
      uid: uid,
      phoneNumber: userphonenumber,
      userToken: currentUserToken,
    }).then(() => {
      ToastAndroid.showWithGravity(
        "Requested",
        ToastAndroid.SHORT,
        ToastAndroid.TOP
      );
      sendPushNotification(
        otherUserToken,
        otherUid,
        otherUsername,
        otherUserName,
        otherHobbies,
        otherPhonenumber,
        otherProfile,
        otherBio
      );
    });
  }

  // Can use this function below OR use Expo's Push Notification Tool from: https://expo.dev/notifications
  async function sendPushNotification(
    otherUserToken,
    otherUid,
    otherUsername,
    otherUserName,
    otherHobbies,
    otherPhonenumber,
    otherProfile,
    otherBio
  ) {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append(
      "Authorization",
      "key=AAAAVakCcv8:APA91bG8VT4gWX8UFCsrwZU7b6YaqMSIRteITOgTvbBMEqhXAvcg_2eqCUPm7Sq6aP5uznn2B5DUhmQsNJEn-sfqYdzqBvc_zTDI4t0oHGdGGXlfMLBqAS3aDQDdNV7wd84wk-SCF9dF"
    );

    var raw = JSON.stringify({
      data: {
        type: "friend request",
        screen: "Request",
        title: username,
        body: "New friend request from " + username,
        profile: imageUrl,
        userHobbies: userhobbies,
        userName: userName,
        username: username,
        userBio: userBio,
        currentUserToken: currentUserToken,
        currentUid: uid,
        phoneNumber: userphonenumber,
        otherUid: otherUid,
        otherUsername: otherUsername,
        otherUserName: otherUserName,
        otherHobbies: otherHobbies,
        otherPhonenumber: otherPhonenumber,
        otherProfile: otherProfile,
        otherBio: otherBio,
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

  return (
    <View className="flex-col p-5">
      {/* search bar */}
      <View className="flex-col">
        <Text
          style={{
            fontFamily: "Comfortaa",
            fontSize: 13,
          }}
        >
          Find friends
        </Text>

        {/* search bar */}

        <View
          style={{
            flexDirection: "row",
            borderWidth: 1,
            alignItems: "center",
            borderRadius: 5,
            marginTop: 15,
            borderColor: "#DC143C",
          }}
        >
          <AntDesign
            style={{ marginLeft: 5 }}
            color="#DC143C"
            size={15}
            name="search1"
          />

          <TextInput
            style={{
              padding: 5,
              flex: 1,
              fontFamily: "Comfortaa",
              fontSize: 12,
              marginLeft: 3,
              color: "#808080",
            }}
            keyboardType="default"
            placeholder="Search your friends"
            onChangeText={(text) => setSearchInput(text)}
          />
        </View>
        {searchInput != "" ? (
          <Text className="text-gray-600 text-sm m-1">Search result</Text>
        ) : null}
        <FlatList
          data={Object.values(allUserList)}
          renderItem={({ item, index }) => {
            if (searchInput === "") {
              return (
                <View key={index}>
                  <View></View>
                </View>
              );
            }

            if (item.userName != null) {
              if (
                item.userName.toLowerCase().includes(searchInput.toLowerCase())
              ) {
                return (
                  <View key={index}>
                    <View className="flex-col">
                      <View className="flex-row justify-between mt-3 p-2 bg-white rounded-lg">
                        {/* name and for search */}
                        <View className="flex-row ml-1">
                          {item.profileUrl == "" ? (
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
                              source={{ uri: item.profileUrl }}
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
                              {item.userName}
                            </Text>

                            <Text
                              style={{
                                fontSize: 12,
                                color: "#D3D3D3",
                                width: 150,
                              }}
                            >
                              {item.username}
                            </Text>
                          </View>
                        </View>

                        {item.uid == uid ? (
                          <View
                            style={{
                              alignSelf: "center",
                            }}
                          >
                            {/* icon */}
                            <TouchableOpacity
                              style={{
                                backgroundColor: "#DC143C",
                                borderRadius: 50,
                                alignSelf: "center",
                                paddingRight: 15,
                                paddingTop: 5,
                                paddingBottom: 5,
                                paddingLeft: 15,
                                flexDirection: "row",
                                marginRight: 5,
                                alignItems: "center",
                              }}
                              onPress={() => navigation.navigate("Profile")}
                            >
                              <Icon name="person" color="#fff" size={15} />
                              <Text className="text-white">Profile</Text>
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <View
                            style={{
                              alignSelf: "center",
                            }}
                          >
                            {/* icon */}
                            <AlreadyFriendCheck
                              data={item}
                              uid={uid}
                              sendrequestToUser={sendrequestToUser}
                            />
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                );
              }
            }
          }}
        />
      </View>

      <View className="flex-col m-3">
        <Text
          style={{
            fontFamily: "Comfortaa",
            fontSize: 15,
          }}
        >
          Suggetion
        </Text>

        <ScrollView>
          {Object.values(allUserList).map((data, index) => {
            if (data) {
              return (
                <View key={index}>
                  {data.username && data.userName != null ? (
                    <View className="flex-col">
                      <View className="flex-row  justify-around mt-3 p-3 bg-white rounded-lg">
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

                        {data.uid == uid ? (
                          <View
                            style={{
                              alignSelf: "center",
                            }}
                          >
                            {/* icon */}
                            <TouchableOpacity
                              style={{
                                backgroundColor: "#DC143C",
                                borderRadius: 50,
                                alignSelf: "center",
                                paddingRight: 15,
                                paddingTop: 5,
                                paddingBottom: 5,
                                paddingLeft: 15,
                                flexDirection: "row",
                                marginRight: 5,
                                alignItems: "center",
                              }}
                              onPress={() => navigation.navigate("Profile")}
                            >
                              <Icon name="person" color="#fff" size={15} />
                              <Text className="text-white">Profile</Text>
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <View
                            style={{
                              alignSelf: "center",
                            }}
                          >
                            {/* icon */}

                            <AlreadyFriendCheck
                              data={data}
                              uid={uid}
                              sendrequestToUser={sendrequestToUser}
                            />
                          </View>
                        )}
                      </View>
                    </View>
                  ) : null}
                </View>
              );
            }
          })}
        </ScrollView>
      </View>
    </View>
  );
}
