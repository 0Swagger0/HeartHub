import { View, Text, TouchableOpacity, ToastAndroid } from "react-native";
import React from "react";
import AntDesign from "react-native-vector-icons/AntDesign";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Auth } from "../Firebase";

export default function Settings({ navigation }) {
  // user log out
  function userLogOut() {
    signOut(Auth).then(() => {
      ToastAndroid.show("log out", ToastAndroid.SHORT);
      navigation.replace("Login");
    });
  }

  return (
    <View className="flex-col justify-center">
      <Text
        style={{
          fontFamily: "Comfortaa_bolt",
          fontSize: 13,
          margin: 10,
          color: "gray",
        }}
      >
        settings
      </Text>
      <TouchableOpacity
        style={{
          marginLeft: 15,
          marginTop: 10,
          padding: 5,
          flexDirection: "column",
        }}
        onPress={userLogOut}
      >
        <View className="flex-row items-center">
          <AntDesign name="logout" size={30} color="#DC143C" />
          <Text
            style={{
              fontFamily: "Comfortaa_bolt",
              fontSize: 15,
              marginLeft: 20,
              color: "gray",
            }}
          >
            Log out
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}
