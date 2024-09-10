import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ToastAndroid,
} from "react-native";
import React, { useEffect, useState } from "react";
import { getDatabase, onValue, ref, update } from "firebase/database";
import { App } from "../Firebase";
import Icon from "react-native-vector-icons/Ionicons";
import NetInfo from "@react-native-community/netinfo";
import user from "..//src/images/user.png";

export default function AddFriendsToCreateGroup({ route }) {
  const groupRoomId = route.params.groupRoomId;
  const currentUserUid = route.params.currentUserUid;
  const groupName = route.params.groupName;
  const username = route.params.username;
  const groupImageUrl = route.params.groupImageUrl;
  const database = getDatabase(App);

  const [allFriendsList, setAllFriendsList] = useState([]);
  const [updateAddedUserChatList, setUpdateAddedUserChatList] = useState([]);

  useEffect(() => {
    loadCurrentUserInfo();
    loadGroupmemberList();
  }, [currentUserUid]);

  // connection check
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected == false) {
        const userOnlineRef = ref(database, "users/" + currentUserUid + "/");
        update(userOnlineRef, { status: "offline" });
      } else {
        const userOnlineRef = ref(database, "users/" + currentUserUid + "/");
        update(userOnlineRef, { status: "online" });
      }
    });

    return () => unsubscribe();
  }, []);

  // load current user information
  function loadCurrentUserInfo() {
    const loadCurrentUserInfoRef = ref(
      database,
      "users/" + currentUserUid + "/"
    );
    onValue(loadCurrentUserInfoRef, (snapshort) => {
      setAllFriendsList([]);
      const allFriends = snapshort.child("friends").val();
      if (allFriends) {
        Object.values(allFriends).map((data) => {
          setAllFriendsList((old) => [...old, data]);
        });
      }
    });
  }

  // getting group member information
  function loadGroupmemberList() {
    const loadGroupmemberListRef = ref(
      database,
      "chatList/" + currentUserUid + "/" + groupRoomId
    );
    onValue(loadGroupmemberListRef, (snapshort) => {
      setUpdateAddedUserChatList([]);
      const data = snapshort.val();
      if (data) {
        setUpdateAddedUserChatList(data);
      }
    });
  }

  // user add to group
  function userAddToGroup(data) {
    // adding self informationM
    const addUserToGroupRef = ref(
      database,
      "chatList/" +
        currentUserUid +
        "/" +
        groupRoomId +
        "/" +
        "members/" +
        data.uid +
        "/"
    );
    update(addUserToGroupRef, {
      userName: data.userName,
      profileUrl: data.profileUrl,
      userHobbies: data.userHobbies,
      username: data.username,
      userBio: data.userBio,
      uid: data.uid,
      phoneNumber: data.phoneNumber,
      userToken: data.userToken,
    }).then(() => {
      updateGroupMemberList(data);
    });
  }

  // create group in added user
  function updateGroupMemberList(data) {
    const updateGroupMemberListRef = ref(
      database,
      "chatList/" + data.uid + "/" + groupRoomId
    );
    update(updateGroupMemberListRef, updateAddedUserChatList).then(() => {
      addingMemberToAddedUser(data);
    });
  }

  // adding current user To Added User
  function addingMemberToAddedUser(DATA) {
    const gettinGroupMemberInfoRef = ref(
      database,
      "chatList/" + currentUserUid + "/" + groupRoomId + "/" + "members/"
    );
    onValue(gettinGroupMemberInfoRef, (snapshort) => {
      snapshort.forEach((data) => {
        const groupMemberUid = data.child("uid").val();
        if (groupMemberUid) {
          updateGroupMemeber(groupMemberUid, DATA);
        }
      });
    });
    ToastAndroid.show(
      DATA.username + " was added to group",
      ToastAndroid.SHORT
    );
    sendingNotificationToAddedUser(DATA);
  }

  // update members
  function updateGroupMemeber(uids, data) {
    const updateMemberRef = ref(
      database,
      "chatList/" + uids + "/" + groupRoomId + "/" + "members/" + data.uid + "/"
    );
    update(updateMemberRef, {
      userName: data.userName,
      profileUrl: data.profileUrl,
      userHobbies: data.userHobbies,
      username: data.username,
      userBio: data.userBio,
      uid: data.uid,
      phoneNumber: data.phoneNumber,
      userToken: data.userToken,
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
        body: username + " was added you in " + groupName,
        groupImageUrl: groupImageUrl,
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

    fetch("https://fcm.googleapis.com/fcm/send", requestOptions);
  }
  return (
    <View className="flex-col justify-center">
      <Text
        style={{
          fontFamily: "Comfortaa_bolt",
          fontSize: 15,
          margin: 10,
          marginLeft: 10,
        }}
      >
        Add friends in group {" " + groupName}
      </Text>

      <View className="mt-1">
        {allFriendsList.map((data, index) => {
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
                    onPress={() => userAddToGroup(data)}
                  >
                    <Icon name="person-add-outline" color="#fff" size={15} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
