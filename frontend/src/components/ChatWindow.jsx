import React, { useState } from "react";
import { sendMessage } from "../api/chatApi.js";

export default function ChatWindow({ character }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
  if (!input.trim()) return;

  const userText = input;
  setInput("");

  // 1️⃣ Add user message immediately
  setMessages(prev => [
    ...prev,
    { sender: "usuario", text: userText }
  ]);

  try {
    // 2️⃣ Get AI reply
    const res = await sendMessage(character.toLowerCase(), userText);

    // 3️⃣ Add AI message AFTER response
    setMessages(prev => [
      ...prev,
      { sender: character, text: res }
    ]);
  } catch (err) {
    console.error(err);
    setMessages(prev => [
      ...prev,
      { sender: "system", text: "Error getting response from server." }
    ]);
  }
};


  return (
    <div className="flex flex-col border rounded-lg p-4 bg-white shadow">
      <div className="flex-1 overflow-y-scroll h-96 mb-4 space-y-2">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-2 rounded-lg max-w-xs ${
              m.sender === "usuario" ? "self-end bg-primary text-white" : "self-start bg-accent text-gray-800"
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Escribe tu mensaje..."
        />
        <button
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-accent transition"
          onClick={handleSend}
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
