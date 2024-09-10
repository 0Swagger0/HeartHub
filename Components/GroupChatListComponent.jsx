import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ToastAndroid,
} from "react-native";
import React, { useEffect, useState } from "react";
import moment from "moment";
import {
  GestureHandlerRootView,
  Swipeable,
} from "react-native-gesture-handler";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { getDatabase, ref, remove } from "firebase/database";
import { App } from "../Firebase";

import user from "../src/images/user.png";

export default function GroupChatListComponent({
  data,
  index,
  groupRoomId,
  currentUserUid,
  GroupMessageReply,
  setYposition,
}) {
  const time = moment(data.time, "x").format("DD MMM YYYY hh:mm a");
  const database = getDatabase(App);

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
          style={{ backgroundColor: "#DC143C", borderRadius: 30, padding: 3 }}
          onPress={() => deleteChatFromUserDatabase(messageId)}
        >
          <MaterialIcons name="delete" size={25} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

  // chat delete from user database
  function deleteChatFromUserDatabase(messageId) {
    const messageDeleteRef = ref(
      database,
      "groupMessageList/" + groupRoomId + "/" + messageId
    );
    remove(messageDeleteRef).then(() => {
      ToastAndroid.showWithGravity(
        "Message deleted",
        ToastAndroid.SHORT,
        ToastAndroid.CENTER
      );
    });
  }

  // replying to user in group chat
  function MessageReplying(data) {
    GroupMessageReply(data);
  }

  // set flatlist position
  function setYtoMessagePosition(position) {
    setYposition(position);
  }

  return (
    <View
      key={index}
      style={{ flexDirection: "column", marginBottom: 0.9, marginTop: 0.9 }}
    >
      <View className="flex-col">
        {data.sendBy == currentUserUid ? (
          // sender message

          <GestureHandlerRootView>
            <Swipeable renderRightActions={() => deleteChat(data.messageId)}>
              <TouchableOpacity onLongPress={() => MessageReplying(data)}>
                {/* check reply ui */}
                {data.GroupReply == true ? (
                  <View
                    style={[
                      {
                        maxWidth: 250,
                        backgroundColor: "#DC143C",
                        padding: 5,
                        flexDirection: "row",
                        alignSelf: "flex-end",
                        marginRight: 5,
                        borderRadius: 10,
                        elevation: 10,
                      },
                    ]}
                  >
                    <View className="flex-col">
                      {data.replyTo == data.sendBy ? (
                        <Text className="text-white text-xs m-1">
                          Your message
                        </Text>
                      ) : (
                        <Text className="text-white text-xs m-1">
                          Reply to {data.replyToUsername}
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
                            setYtoMessagePosition(data.yPosition);
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
                            {data.replyMessage}
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
                        {data.message}
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
                      backgroundColor: "#DC143C",
                      padding: 3,
                      flexDirection: "row",
                      alignSelf: "flex-end",
                      marginRight: 5,
                      borderRadius: 10,
                      elevation: 10,
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
                        {data.message}
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

          <TouchableOpacity onLongPress={() => MessageReplying(data)}>
            {data.GroupReply == true ? (
              <View className="flex-row">
                <View
                  style={{
                    borderRadius: 20,
                    borderColor: "#fff",
                    borderWidth: 1,
                    elevation: 10,
                    marginLeft: 2,
                    alignSelf: "flex-start",
                  }}
                >
                  {data.profileUrl == "" ? (
                    <Image
                      source={user}
                      style={{
                        height: 40,
                        width: 40,
                        borderRadius: 20,
                      }}
                    />
                  ) : (
                    <Image
                      source={{ uri: data.profileUrl ? data.profileUrl : null }}
                      style={{
                        height: 40,
                        width: 40,
                        borderRadius: 20,
                      }}
                    />
                  )}
                </View>

                <View
                  style={{
                    maxWidth: 250,
                    backgroundColor: "white",
                    padding: 5,
                    flexDirection: "column",
                    marginLeft: 3,
                    borderRadius: 10,
                    borderColor: "#DC143C",
                    borderWidth: 1,
                    elevation: 10,
                  }}
                >
                  <Text
                    style={{
                      maxWidth: 250,
                      fontWeight: "bold",
                      fontSize: 12,
                      marginBottom: 3,
                      margin: 4,
                    }}
                  >
                    {data.username + " Reply to " + data.replyToUsername}
                  </Text>

                  <View
                    style={{
                      backgroundColor: "#DC143C",
                      borderRadius: 7,
                      padding: 5,
                      marginLeft: 1,
                      marginRight: 10,
                      maxHeight: 100,
                      marginTop: 2,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        setYtoMessagePosition(data.yPosition);
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
                        {data.replyMessage}
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
                    {data.message}
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
                      marginLeft: 3,
                    }}
                  >
                    {time}
                  </Text>
                </View>
              </View>
            ) : (
              <View className="flex-row items-center">
                <View
                  style={{
                    borderRadius: 20,
                    borderColor: "#fff",
                    borderWidth: 1,
                    elevation: 10,
                    marginLeft: 2,
                  }}
                >
                  {data.profileUrl == "" ? (
                    <Image
                      source={user}
                      style={{
                        height: 40,
                        width: 40,
                        borderRadius: 20,
                      }}
                    />
                  ) : (
                    <Image
                      source={{ uri: data.profileUrl ? data.profileUrl : null }}
                      style={{
                        height: 40,
                        width: 40,
                        borderRadius: 20,
                      }}
                    />
                  )}
                </View>
                <View
                  style={{
                    maxWidth: 250,
                    backgroundColor: "white",
                    padding: 3,
                    flexDirection: "row",
                    alignSelf: "flex-start",
                    marginLeft: 3,
                    borderRadius: 10,
                    borderColor: "#DC143C",
                    borderWidth: 1,
                    elevation: 10,
                  }}
                >
                  <View className="flex-col p-1">
                    <Text
                      style={{
                        maxWidth: 250,
                        fontWeight: "bold",
                        fontSize: 12,
                      }}
                    >
                      {data.username}
                    </Text>
                    <Text
                      style={{
                        maxWidth: 250,
                        fontFamily: "Comfortaa_bolt",
                        fontSize: 12,
                      }}
                    >
                      {data.message}
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
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
