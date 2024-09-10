import { View, Text, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import Icon from "react-native-vector-icons/Ionicons";
import { getDatabase, onValue, ref } from "firebase/database";
import { App } from "../Firebase";

export default function CheckAlreadyGroupMember({
  data,
  uid,
  addingMemberToAddedUser,
  groupRoomId,
}) {
  const database = getDatabase(App);
  const [uids, setUids] = useState({});
  useEffect(() => {
    addingMemberToAddedUser;
    const alreadymemberRef = ref(
      database,
      "chatList/" + uid + "/" + groupRoomId + "/" + "members/" + data.uid
    );
    onValue(alreadymemberRef, (snapshort) => {
      const D = snapshort.val();
      if (D) {
        setUids(D);
      }
    });
  }, [data]);
  return (
    <View>
      {uids.uid !== data.uid ? (
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
          onPress={() => addingMemberToAddedUser(data)}
        >
          <Icon name="person-add-outline" color="#fff" size={15} />
        </TouchableOpacity>
      ) : (
        <Text className="text-gray-600 text-xs ">Already added</Text>
      )}
    </View>
  );
}
