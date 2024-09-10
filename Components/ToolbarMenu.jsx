import { View, Text, TouchableOpacity, Image, Modal } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { getDatabase, onValue, ref } from "firebase/database";
import Icon from "react-native-vector-icons/Ionicons";
import { App, Auth } from "../Firebase";
import { onAuthStateChanged } from "firebase/auth";
import Entypo from "react-native-vector-icons/Entypo";
import RBSheet from "react-native-raw-bottom-sheet";
import AntDesign from "react-native-vector-icons/AntDesign";
import user from "../src/images/user.png";

export default function ToolbarMenu() {
  const nav = useNavigation();
  const bottomRef = useRef(null);
  const [uid, setUid] = useState();
  const database = getDatabase(App);
  const [imageUrl, setImageUrl] = useState("");
  const [showCreateGroupDialogBox, setShowCreateGroupDialogBox] =
    useState(false);

  useEffect(() => {
    onAuthStateChanged(Auth, (user) => {
      if (user) {
        setUid(user.uid);
        getInformation();
      }
    });
  }, [uid]);

  // get user information
  function getInformation() {
    const userRef = ref(database, "users/" + uid + "/");
    onValue(userRef, (snapshort) => {
      const image = snapshort.child("profileUrl").val();
      if (image) {
        setImageUrl(image);
      }
    });
  }

  // show bottom sheet
  function showBOttomSheet() {
    bottomRef.current.open();
  }

  // create group dialog box
  function navigateToCreateGroupScreen() {
    nav.navigate("CreateGroup", {
      uid: uid,
    });
    bottomRef.current.close();
  }

  function redirectToRequest() {
    nav.navigate("Request");
  }
  function redirectToProfile() {
    nav.navigate("Profile");
    bottomRef.current.close();
  }
  function navigateToCreateSettings() {
    nav.navigate("Settings");
    bottomRef.current.close();
  }
  return (
    <View className="flex-col">
      <View className="flex-row">
        <View
          style={{
            flexDirection: "row",
            display: "flex",
            marginRight: 15,
            alignItems: "center",
          }}
        >
          {imageUrl ? (
            <TouchableOpacity
              style={{
                borderRadius: 20,
                borderWidth: 1,
                borderColor: "#D3D3D3",
                marginRight: 5,
              }}
              onPress={redirectToProfile}
            >
              <Image
                source={{ uri: imageUrl }}
                style={{
                  height: 35,
                  width: 35,
                  borderRadius: 20,
                }}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={{
                borderRadius: 20,
                borderWidth: 1,
                borderColor: "#D3D3D3",
                marginRight: 5,
              }}
              onPress={redirectToProfile}
            >
              <Image
                source={user}
                style={{
                  height: 35,
                  width: 35,
                  borderRadius: 20,
                }}
              />
            </TouchableOpacity>
          )}
          <Icon
            style={{ marginLeft: 5, marginRight: 5 }}
            name="notifications-outline"
            size={25}
            color="#fff"
            onPress={redirectToRequest}
          />

          <Entypo
            name="dots-three-vertical"
            size={20}
            color="#fff"
            onPress={showBOttomSheet}
          />
        </View>
      </View>

      {/* bottom sheet */}
      <RBSheet
        ref={bottomRef}
        height={150}
        closeOnDragDown={true}
        customStyles={{
          container: {
            borderTopRightRadius: 20,
            borderTopLeftRadius: 20,
          },
        }}
      >
        <View className="flex-col">
          <Text
            style={{
              fontFamily: "Comfortaa_bolt",
              fontSize: 13,
              marginLeft: 20,
              color: "#D3D3D3",
            }}
          >
            Menu
          </Text>

          <TouchableOpacity
            style={{ marginLeft: 15, marginTop: 10, flexDirection: "column" }}
            onPress={navigateToCreateGroupScreen}
          >
            <View className="flex-row items-center">
              <AntDesign name="addusergroup" size={30} color="#DC143C" />
              <Text
                style={{
                  fontFamily: "Comfortaa_bolt",
                  fontSize: 15,
                  marginLeft: 20,
                  color: "gray",
                }}
              >
                Create group
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ marginLeft: 15, marginTop: 10, flexDirection: "column" }}
            onPress={navigateToCreateSettings}
          >
            <View className="flex-row items-center">
              <AntDesign name="setting" size={30} color="#DC143C" />
              <Text
                style={{
                  fontFamily: "Comfortaa_bolt",
                  fontSize: 15,
                  marginLeft: 20,
                  color: "gray",
                }}
              >
                Settings
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </RBSheet>
    </View>
  );
}
