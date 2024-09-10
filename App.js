import { Text, View } from "react-native";
import React, { useCallback } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Screens
import Login from "./Screen/Login";
import Details from "./Screen/Details";
import HomeChat from "./Screen/HomeChat";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import FindUser from "./Screen/FindUser";
import ChatScreen from "./Screen/ChatScreen";
import Request from "./Screen/Request";
import ToolbarMenu from "./Components/ToolbarMenu";
import Profile from "./Screen/Profile";
import AllFriend from "./Screen/AllFriend";
import SplashScreen from "react-native-splash-screen";
import CreateGroup from "./Screen/CreateGroup";
import AddFriendsToCreateGroup from "./Screen/AddFriendsToCreateGroup";
import GroupChatScreen from "./Screen/GroupChatScreen";
import Settings from "./Screen/Settings";
import AddFriendsToGroup from "./Screen/AddFriendsToGroup";

function MainApp() {
  // navigation  variable
  const stack = createNativeStackNavigator();

  // load fonts
  const [fontsLoaded] = useFonts({
    Billabong: require("./src/fonts/Billabong.ttf"),
    Comfortaa: require("./src/fonts/Comfortaa.ttf"),
    Comfortaa_bolt: require("./src/fonts/Comfortaa_bolt.ttf"),
  });

  useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <stack.Navigator>
        {/* chat home screen */}
        <stack.Screen
          options={{
            animation: "slide_from_right",
            statusBarColor: "#DC143C",
            statusBarStyle: "light",
            header: () => (
              <View>
                <SafeAreaView>
                  <View
                    style={{
                      alignItems: "center",
                      backgroundColor: "#DC143C",
                      paddingTop: 5,
                      flexDirection: "row",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Billabong",
                        fontSize: 35,
                        marginLeft: 15,
                        color: "#fff",
                      }}
                    >
                      HeartHub
                    </Text>

                    <ToolbarMenu />
                  </View>
                </SafeAreaView>
              </View>
            ),
          }}
          name="HomeChat"
          component={HomeChat}
        />

        <stack.Screen
          options={{
            headerShown: false,
            statusBarTranslucent: true,
          }}
          name="Login"
          component={Login}
        />
        <stack.Screen
          options={{
            animation: "slide_from_right",
            headerShown: false,
            statusBarTranslucent: true,
          }}
          name="Details"
          component={Details}
        />

        {/* find user */}
        <stack.Screen
          options={{
            animation: "slide_from_right",
            statusBarColor: "#DC143C",
            statusBarStyle: "light",
            headerShown: false,
          }}
          name="FindUser"
          component={FindUser}
        />

        {/* user chat screen */}
        <stack.Screen
          options={{
            animation: "slide_from_right",
            statusBarColor: "#DC143C",
            statusBarStyle: "light",
            headerShown: false,
          }}
          name="ChatScreen"
          component={ChatScreen}
        />

        {/* request screen */}
        {/* user chat screen */}
        <stack.Screen
          options={{
            animation: "slide_from_right",
            statusBarColor: "#DC143C",
            statusBarStyle: "light",
            headerShown: false,
          }}
          name="Request"
          component={Request}
        />

        {/* profile */}
        <stack.Screen
          options={{
            animation: "slide_from_right",
            statusBarColor: "#DC143C",
            statusBarStyle: "light",
            headerShown: false,
          }}
          name="Profile"
          component={Profile}
        />

        {/* all friend */}
        <stack.Screen
          options={{
            animation: "slide_from_bottom",
            statusBarColor: "#DC143C",
            statusBarStyle: "light",
            headerShown: false,
          }}
          name="AllFriend"
          component={AllFriend}
        />

        {/* create group chat screen */}
        <stack.Screen
          options={{
            animation: "slide_from_bottom",
            statusBarColor: "#DC143C",
            statusBarStyle: "light",
            headerShown: false,
          }}
          name="CreateGroup"
          component={CreateGroup}
        />

        {/* add friend to group chat screen */}
        <stack.Screen
          options={{
            animation: "slide_from_bottom",
            statusBarColor: "#DC143C",
            statusBarStyle: "light",
            headerShown: false,
          }}
          name="AddFriendsToCreateGroup"
          component={AddFriendsToCreateGroup}
        />
        {/* add friend to group chat screen */}
        <stack.Screen
          options={{
            animation: "slide_from_right",
            statusBarColor: "#DC143C",
            statusBarStyle: "light",
            headerShown: false,
          }}
          name="GroupChatScreen"
          component={GroupChatScreen}
        />

        {/* settings screen */}
        <stack.Screen
          options={{
            animation: "slide_from_right",
            statusBarColor: "#DC143C",
            statusBarStyle: "light",
            headerShown: false,
          }}
          name="Settings"
          component={Settings}
        />

        {/* add friend screen */}
        <stack.Screen
          options={{
            animation: "slide_from_right",
            statusBarColor: "#DC143C",
            statusBarStyle: "light",
            headerShown: false,
          }}
          name="AddFriendsToGroup"
          component={AddFriendsToGroup}
        />
      </stack.Navigator>
    </NavigationContainer>
  );
}

export default MainApp;
export const navigationRef = React.createRef();
