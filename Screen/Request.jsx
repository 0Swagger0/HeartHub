import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicatorBase,
  ToastAndroid,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { getDatabase, onValue, ref, remove, set } from "firebase/database";
import { App, Auth } from "../Firebase";
import { onAuthStateChanged } from "firebase/auth";
import Lottie from "lottie-react-native";
import user from "../src/images/user.png";

export default function Request() {
  const database = getDatabase(App);
  const [uid, setUid] = useState();
  const [allRequest, setAllRequest] = useState([]);

  // current user detauls

  const [imageUrl, setImageUrl] = useState();
  const [userName, setuserName] = useState("");
  const [username, setusername] = useState("");
  const [userBio, setUserBio] = useState("");
  const [userphonenumber, setuserphonenumber] = useState();
  const [userhobbies, setuserhobbies] = useState("");
  const [userToken, setUserToken] = useState("");

  useEffect(() => {
    onAuthStateChanged(Auth, (user) => {
      if (user) {
        setUid(user.uid);
        loadRequest();
        getUserInformation();
      }
    });
  }, [uid]);

  // current user information
  const getUserInformation = () => {
    const reference = ref(database, "users" + "/" + uid + "/");
    onValue(reference, (snapshort) => {
      const profile = snapshort.child("profileUrl").val();
      const name = snapshort.child("userName").val();
      const hobbies = snapshort.child("userHobbies").val();
      const username = snapshort.child("username").val();
      const userBio = snapshort.child("userBio").val();
      const number = snapshort.child("phoneNumber").val();
      const token = snapshort.child("userToken").val();

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
      if (token) {
        setUserToken(token);
      }

      if (profile) {
        setImageUrl(profile);
      } else {
        console.log("error");
      }
    });
  };

  //load request
  function loadRequest() {
    const requestRef = ref(database, "users/" + uid + "/" + "request/");
    onValue(requestRef, (snapshort) => {
      setAllRequest([]);
      const data = snapshort.val();
      if (data) {
        setAllRequest(data);
      }
    });
  }

  // accepting request
  function acceptRequest(userDetails) {
    const AddFriendRef = ref(
      database,
      "users/" + uid + "/" + "friends/" + userDetails.uid
    );
    set(AddFriendRef, {
      username: userDetails.username,
      userName: userDetails.userName,
      userHobbies: userDetails.userHobbies == "" ? "" : userDetails.userHobbies,
      uid: userDetails.uid,
      profileUrl: userDetails.profileUrl == "" ? "" : userDetails.profileUrl,
      userBio: userDetails.userBio == "" ? "" : userDetails.userBio,
      phoneNumber: userDetails.phoneNumber,
      userToken: userDetails.userToken,
    }).then(() => {
      // remove child from request list
      const removeUserRef = ref(
        database,
        "users/" + uid + "/" + "request/" + userDetails.uid
      );
      remove(removeUserRef).then(() => {
        sendAutoRequestToOtheruser(userDetails);
      });
    });
  }

  // send request to other user
  function sendAutoRequestToOtheruser(userDetails) {
    const AddFriendToOtherAccountRef = ref(
      database,
      "users/" + userDetails.uid + "/" + "friends/" + uid
    );
    set(AddFriendToOtherAccountRef, {
      username: username,
      userName: userName,
      userHobbies: userhobbies == "" ? "" : userhobbies,
      uid: uid,
      profileUrl: imageUrl == "" ? "" : imageUrl,
      userBio: userBio == "" ? "" : userBio,
      phoneNumber: userphonenumber,
      userToken: userToken,
    }).then(() => {
      ToastAndroid.showWithGravity(
        userDetails.username + " is now your friend",
        ToastAndroid.SHORT,
        ToastAndroid.TOP
      );
      sendNotificationToUser(userDetails);
    });
  }

  // ignore react from user
  // accepting request
  function IgnoreRequest(userDetails) {
    const IgnoreRequestRef = ref(
      database,
      "users/" + uid + "/" + "request/" + userDetails.uid
    );
    remove(IgnoreRequestRef).then(() => {
      ToastAndroid.show("request ignore", ToastAndroid.SHORT);
    });
  }

  // sending notification to user
  function sendNotificationToUser(userDetails) {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append(
      "Authorization",
      "key=AAAAVakCcv8:APA91bG8VT4gWX8UFCsrwZU7b6YaqMSIRteITOgTvbBMEqhXAvcg_2eqCUPm7Sq6aP5uznn2B5DUhmQsNJEn-sfqYdzqBvc_zTDI4t0oHGdGGXlfMLBqAS3aDQDdNV7wd84wk-SCF9dF"
    );

    var raw = JSON.stringify({
      data: {
        type: "accept request",
        title: username,
        body: username + " Accept your friend request",
        profile: imageUrl == "" ? "" : imageUrl,
      },
      android: {
        priority: "high",
      },
      priority: 10,
      to: userDetails.userToken,
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
    <View className="flex-col p-3">
      <View className="flex-col">
        <Text
          style={{
            fontFamily: "Comfortaa",
            fontSize: 13,
            margin: 10,
          }}
        >
          Friend request
        </Text>

        {/* request list by user */}
        <ScrollView>
          {allRequest != "" ? (
            Object.values(allRequest).map((data, index) => {
              return (
                <View key={index}>
                  <View className="flex-col">
                    <View className="flex-row mt-3 p-2 bg-white rounded-lg">
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

                        <View className="flex-col p-1 ml-2 w-28">
                          <Text
                            numberOfLines={1}
                            style={{
                              fontFamily: "Comfortaa",
                              fontSize: 13,
                              fontWeight: "bold",
                            }}
                          >
                            {data.userName}
                          </Text>

                          <Text
                            numberOfLines={1}
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

                      {/* icon */}
                      <View className="flex-row">
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
                          onPress={() => acceptRequest(data)}
                        >
                          <Text className="text-white text-xs">Accept</Text>
                        </TouchableOpacity>

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
                            marginRight: 5,
                          }}
                          onPress={() => IgnoreRequest(data)}
                        >
                          <Text className="text-gray-600 text-xs">Ignore</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })
          ) : (
            <View className="flex-col">
              <View className="self-center">
                <Lottie
                  style={{
                    height: 200,
                    width: 200,
                  }}
                  autoPlay
                  loop
                  source={require("../Animation/lf30_editor_rvne26wm.json")}
                />

                <Text
                  style={{
                    fontFamily: "Comfortaa",
                    fontSize: 13,
                    alignSelf: "center",
                  }}
                >
                  No request found
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}
