import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ToastAndroid,
} from "react-native";
import React, { useEffect, useState } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import { getDatabase, onValue, ref, update } from "firebase/database";
import { App, Auth } from "../Firebase";
import { onAuthStateChanged } from "firebase/auth";
import CheckAlreadyGroupMember from "../Components/CheckAlreadyGroupMember";
import user from "../src/images/user.png";

export default function AddFriendsToGroup({ route }) {
  const groupRoomId = route.params.groupRoomId;
  const imageUrl = route.params.imageUrl;
  const groupName = route.params.groupName;
  const currentusername = route.params.currentusername;

  const [groupWholeData, setGroupWholeData] = useState([]);

  const database = getDatabase(App);

  const [uid, setUid] = useState("");

  const [allFriendsList, setAllFriendsList] = useState([]);
  const [memberUids, groupMemberuids] = useState([]);

  useEffect(() => {
    onAuthStateChanged(Auth, (user) => {
      if (user) {
        setUid(user.uid);
      }
    });
    loadCurrentUserInfo();
    loadGroupMemberInformation();
    loadWholeGroupData();
  }, [uid]);

  // load current user information
  function loadCurrentUserInfo() {
    const loadCurrentUserInfoRef = ref(database, "users/" + uid + "/");
    onValue(loadCurrentUserInfoRef, (snapshort) => {
      setAllFriendsList([]);
      const allFriends = snapshort.child("friends").val();
      if (allFriends) {
        setAllFriendsList(allFriends);
      }
    });
  }

  // load whole group data to new added user
  function loadWholeGroupData() {
    const loadGroupWholeDataRef = ref(
      database,
      "chatList/" + uid + "/" + groupRoomId
    );
    onValue(loadGroupWholeDataRef, (snapshort) => {
      const wholeGroupData = snapshort.val();
      if (wholeGroupData) {
        setGroupWholeData(wholeGroupData);
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
      groupMemberuids([]);
      snapshort.forEach((data) => {
        const uids = data.child("uid").val();

        if (uids) {
          groupMemberuids((old) => [...old, uids]);
        }
      });
    });
  }

  // adding current user To Added User
  function addingMemberToAddedUser(data) {
    const updateMemberRef = ref(
      database,
      "chatList/" + uid + "/" + groupRoomId + "/" + "members/" + data.uid
    );
    update(updateMemberRef, {
      admin: false,
      userName: data.userName,
      profileUrl: data.profileUrl == "" ? "" : data.profileUrl,
      userHobbies: data.userHobbies == "" ? "" : data.userHobbies,
      username: data.username,
      userBio: data.userBio == "" ? "" : data.userBio,
      uid: data.uid,
      phoneNumber: data.phoneNumber,
      userToken: data.userToken,
    }).then(() => {
      sendingNotificationToAddedUser(data);
      updateMemberList(data);
      ToastAndroid.show(data.username + " " + "was added", ToastAndroid.SHORT);
    });
  }

  // update member list
  function updateMemberList(data) {
    const updateGroupMemberListRef = ref(
      database,
      "chatList/" + data.uid + "/" + groupRoomId
    );
    update(updateGroupMemberListRef, groupWholeData).then(() => {
      // adding user details into group members list
      const addingAddedUserRef = ref(
        database,
        "chatList/" + data.uid + "/" + groupRoomId + "/" + "members/" + data.uid
      );
      update(addingAddedUserRef, {
        admin: false,
        userName: data.userName,
        profileUrl: data.profileUrl == "" ? "" : data.profileUrl,
        userHobbies: data.userHobbies == "" ? "" : data.userHobbies,
        username: data.username,
        userBio: data.userBio == "" ? "" : data.userBio,
        uid: data.uid,
        phoneNumber: data.phoneNumber,
        userToken: data.userToken,
      }).then(() => {
        addingNewMemberToGroupMember(data);
      });
    });
  }

  // adding new member in group memners
  function addingNewMemberToGroupMember(data) {
    memberUids.map((uids) => {
      const addingNewMemberToAllGroupMemberRef = ref(
        database,
        "chatList/" + uids + "/" + groupRoomId + "/" + "members/" + data.uid
      );
      update(addingNewMemberToAllGroupMemberRef, {
        admin: false,
        userName: data.userName,
        profileUrl: data.profileUrl == "" ? "" : data.profileUrl,
        userHobbies: data.userHobbies == "" ? "" : data.userHobbies,
        username: data.username,
        userBio: data.userBio == "" ? "" : data.userBio,
        uid: data.uid,
        phoneNumber: data.phoneNumber,
        userToken: data.userToken,
      });
    });
  }

  // sending notification to added user
  function sendingNotificationToAddedUser(data) {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append(
      "Authorization",
      "key=AAAAVakCcv8:APA91bG8VT4gWX8UFCsrwZU7b6YaqMSIRteITOgTvbBMEqhXAvcg_2eqCUPm7Sq6aP5uznn2B5DUhmQsNJEn-sfqYdzqBvc_zTDI4t0oHGdGGXlfMLBqAS3aDQDdNV7wd84wk-SCF9dF"
    );

    var raw = JSON.stringify({
      data: {
        type: "added to group",
        title: "Name of group " + groupName,
        groupName: groupName,
        body: currentusername + " was added you in group chat",
        groupImageUrl: imageUrl,
      },
      android: {
        priority: "high",
      },
      priority: 10,
      to: data.userToken,
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
    <View className="flex-col p-3">
      <Text
        style={{
          fontFamily: "Comfortaa_bolt",
          fontSize: 15,
          marginLeft: 7,
          color: "gray",
        }}
      >
        + Add friends
      </Text>

      <View className="flex-col">
        <ScrollView>
          <View className="mt-5 ">
            {Object.values(allFriendsList).map((data, index) => {
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
                        marginRight: 7,
                      }}
                    >
                      {/* icon */}
                      <CheckAlreadyGroupMember
                        data={data}
                        uid={uid}
                        addingMemberToAddedUser={addingMemberToAddedUser}
                        groupRoomId={groupRoomId}
                      />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
