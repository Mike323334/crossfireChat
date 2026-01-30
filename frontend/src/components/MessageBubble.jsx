import React from "react";

export default function MessageBubble({ sender, text }) {
  return (
    <div className={sender === "usuario" ? "user-msg" : "char-msg"}>
      {text}
    </div>
  );
}
