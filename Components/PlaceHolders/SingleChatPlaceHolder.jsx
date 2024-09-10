import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ToastAndroid,
  Animated,
} from "react-native";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { getDatabase, onValue, ref, remove } from "firebase/database";
import { Auth, App } from "../../Firebase";
import { onAuthStateChanged } from "firebase/auth";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import moment from "moment";
import user from "../../src/images/user.png";

export default function SingleChatPlaceHolder({
  item,
  index,
  roomId,
  MakeReplying,
  userName,
  setYposition,
}) {
  const database = getDatabase(App);
  const [currentUserUid, setCurrentUserUid] = useState("");
  const time = moment(item.time, "x").format("DD MMM YYYY hh:mm a");

  useEffect(() => {
    onAuthStateChanged(Auth, (user) => {
      if (user) {
        setCurrentUserUid(user.uid);
      }
    });
  }, [currentUserUid]);

  // delete chat from chat screen
  const deleteChat = (messageId) => {
    return (
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          marginRight: 5,
          marginLeft: 3,
        }}
      >
        <TouchableOpacity
          style={{
            backgroundColor: "#DC143C",
            borderRadius: 30,
            padding: 5,
          }}
          onPress={() => deleteChatFromUserDatabase(messageId)}
        >
          <MaterialIcons name="delete" size={30} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

  // chat delete from user database
  function deleteChatFromUserDatabase(messageId) {
    const messageDeleteRef = ref(
      database,
      "messageList/" + roomId + "/" + messageId
    );
    remove(messageDeleteRef).then(() => {
      ToastAndroid.showWithGravity(
        "Message deleted",
        ToastAndroid.SHORT,
        ToastAndroid.CENTER
      );
    });
  }

  function MessageReplying(message) {
    MakeReplying(message);
  }

  // set flatlist position
  function setYtoMessagePosition(position) {
    setYposition(position);
  }

  return (
    <View key={index} style={{ marginTop: 0.9, marginBottom: 0.9 }}>
      <View className="flex-col">
        {item.sendBy == currentUserUid ? (
          // sender message

          <GestureHandlerRootView>
            <Swipeable renderRightActions={() => deleteChat(item.messageId)}>
              {/* user replying  */}
              <TouchableOpacity onLongPress={() => MessageReplying(item)}>
                {item.reply == true ? (
                  <View
                    style={{
                      maxWidth: 250,
                      backgroundColor: "#DC143C",
                      padding: 5,
                      flexDirection: "row",
                      alignSelf: "flex-end",
                      marginRight: 5,
                      borderRadius: 10,
                    }}
                  >
                    <View className="flex-col">
                      {item.replyTo == item.receiveBy ? (
                        <Text className="text-white text-xs m-1 font-bold">
                          Reply to {userName}
                        </Text>
                      ) : (
                        <Text className="text-white text-xs m-1 font-bold">
                          Your message
                        </Text>
                      )}
                      <View
                        style={{
                          backgroundColor: "#ffff",
                          borderRadius: 7,
                          padding: 5,
                          marginLeft: 1,
                          marginRight: 10,
                          maxHeight: 100,
                        }}
                      >
                        <TouchableOpacity
                          onPress={() => {
                            setYtoMessagePosition(item.yPosition);
                          }}
                        >
                          <Text
                            style={{
                              maxWidth: 250,
                              fontFamily: "Comfortaa_bolt",
                              fontSize: 12,
                              color: "gray",
                            }}
                          >
                            {item.replyMessage}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <Text
                        style={{
                          maxWidth: 250,
                          fontFamily: "Comfortaa_bolt",
                          fontSize: 12,
                          color: "white",
                          margin: 2,
                        }}
                      >
                        {item.message}
                      </Text>

                      {/* time */}

                      <Text
                        style={{
                          fontFamily: "Comfortaa_bolt",
                          fontSize: 8,
                          marginTop: 2,
                          maxWidth: 250,
                          color: "white",
                          alignSelf: "flex-end",
                        }}
                      >
                        {time}
                      </Text>
                    </View>
                  </View>
                ) : (
                  // normal messages
                  <View
                    style={{
                      maxWidth: 250,
                      backgroundColor: "#DC143C",
                      padding: 5,
                      flexDirection: "row",
                      alignSelf: "flex-end",
                      marginRight: 5,
                      borderRadius: 10,
                    }}
                  >
                    <View className="flex-col p-1">
                      <Text
                        style={{
                          maxWidth: 250,
                          fontFamily: "Comfortaa_bolt",
                          fontSize: 12,
                          color: "white",
                        }}
                      >
                        {item.message}
                      </Text>
                      {/* time */}
                      <Text
                        style={{
                          fontFamily: "Comfortaa_bolt",
                          fontSize: 8,
                          marginTop: 2,
                          maxWidth: 250,
                          color: "white",
                          alignSelf: "flex-end",
                        }}
                      >
                        {time}
                      </Text>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            </Swipeable>
          </GestureHandlerRootView>
        ) : (
          // reciever message

          <TouchableOpacity onLongPress={() => MessageReplying(item)}>
            <View className="flex-row">
              <View
                style={{
                  borderRadius: 20,
                  borderColor: "#DC143C",
                  borderWidth: 1,
                  marginLeft: 2,
                  alignSelf: "flex-start",
                }}
              >
                {item.imageUrl == "" ? (
                  <Image
                    source={user}
                    style={{
                      height: 35,
                      width: 35,
                      borderRadius: 20,
                    }}
                  />
                ) : (
                  <Image
                    source={{ uri: item.imageUrl ? item.imageUrl : null }}
                    style={{
                      height: 35,
                      width: 35,
                      borderRadius: 20,
                    }}
                  />
                )}
              </View>

              {item.reply == true ? (
                <View
                  style={{
                    maxWidth: 250,
                    backgroundColor: "#ffff",
                    padding: 5,
                    flexDirection: "row",
                    alignSelf: "flex-end",
                    marginRight: 5,
                    borderRadius: 10,
                    borderColor: "#DC143C",
                    borderWidth: 1,
                  }}
                >
                  <View className="flex-col">
                    {item.replyTo == item.sendBy ? (
                      <Text className="text-gray-600 text-xs m-1 font-bold">
                        Reply to {userName}
                      </Text>
                    ) : (
                      <Text className="text-gray-500 text-xs m-1 font-bold">
                        Your message
                      </Text>
                    )}
                    <View
                      style={{
                        backgroundColor: "#DC143C",
                        borderRadius: 7,
                        padding: 5,
                        marginLeft: 1,
                        marginRight: 10,
                        maxHeight: 100,
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => {
                          setYtoMessagePosition(item.yPosition);
                        }}
                      >
                        <Text
                          style={{
                            maxWidth: 250,
                            fontFamily: "Comfortaa_bolt",
                            fontSize: 12,
                            color: "white",
                          }}
                        >
                          {item.replyMessage}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <Text
                      style={{
                        maxWidth: 250,
                        fontFamily: "Comfortaa_bolt",
                        fontSize: 12,
                        margin: 2,
                      }}
                    >
                      {item.message}
                    </Text>

                    {/* time */}

                    <Text
                      style={{
                        fontFamily: "Comfortaa_bolt",
                        fontSize: 8,
                        marginTop: 2,
                        maxWidth: 250,
                        color: "white",
                        alignSelf: "flex-end",
                      }}
                    >
                      {time}
                    </Text>
                  </View>
                </View>
              ) : (
                <View
                  style={{
                    maxWidth: 250,
                    backgroundColor: "white",
                    padding: 5,
                    flexDirection: "row",
                    alignSelf: "flex-start",
                    marginLeft: 3,
                    borderRadius: 10,
                    borderColor: "#DC143C",
                    borderWidth: 1,
                  }}
                >
                  <View className="flex-col p-1">
                    <Text
                      style={{
                        maxWidth: 250,
                        fontFamily: "Comfortaa_bolt",
                        fontSize: 12,
                      }}
                    >
                      {item.message}
                    </Text>
                    {/* time */}
                    <Text
                      style={{
                        fontFamily: "Comfortaa_bolt",
                        fontSize: 8,
                        marginTop: 2,
                        maxWidth: 250,
                        color: "gray",
                        alignSelf: "flex-start",
                      }}
                    >
                      {time}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
