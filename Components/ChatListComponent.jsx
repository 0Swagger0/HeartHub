import { View } from "react-native";
import React, { memo } from "react";

import SingleChatPlaceHolder from "./PlaceHolders/SingleChatPlaceHolder";

function ChatListComponent({
  item,
  index,
  roomId,
  ReplyingFunction,
  userName,
  setYPosition,
}) {
  function MakeReplying(message) {
    ReplyingFunction(message);
  }

  function setYposition(position) {
    setYPosition(position);
  }

  return (
    <SingleChatPlaceHolder
      item={item}
      index={index}
      roomId={roomId}
      MakeReplying={MakeReplying}
      userName={userName}
      setYposition={setYposition}
    />
  );
}

export default memo(ChatListComponent);
