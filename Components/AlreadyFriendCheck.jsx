import { View, Text, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import Icon from "react-native-vector-icons/Ionicons";
import { getDatabase, onValue, ref } from "firebase/database";
import { App } from "../Firebase";

export default function AlreadyFriendCheck({ data, uid, sendrequestToUser }) {
  const database = getDatabase(App);
  const [uids, setUids] = useState({});
  const [requestedCheck, setRequestedCheck] = useState(false);
  useEffect(() => {
    const alreadyFriendRef = ref(
      database,
      "users/" + uid + "/" + "friends/" + data.uid
    );
    onValue(alreadyFriendRef, (snapshort) => {
      const D = snapshort.val();
      if (D) {
        setUids(D);
      }
    });
  }, [data]);

  return (
    <View>
      {uids.uid !== data.uid ? (
        <View
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
        >
          {requestedCheck == false ? (
            <TouchableOpacity
              onPress={() => {
                sendrequestToUser(data);
                setRequestedCheck(true);
              }}
            >
              <Icon name="person-add-outline" color="#fff" size={15} />
            </TouchableOpacity>
          ) : (
            <Text className="text-white text-xs">Requested+</Text>
          )}
        </View>
      ) : (
        <View
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
        >
          <Text className="text-white text-sm">Friend</Text>
        </View>
      )}
    </View>
  );
}
