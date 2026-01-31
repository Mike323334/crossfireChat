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
    <div className="flex flex-col border rounded-lg p-2 sm:p-4 bg-white shadow h-screen sm:h-80 md:h-96">
      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto mb-2 sm:mb-4 space-y-2 min-h-0">
        {messages.map((m, i) => {
          const isUser = m.sender === "usuario";

          return (
            <div
              key={i}
              className={`w-full flex ${isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`p-2 sm:p-3 rounded-lg break-words text-sm sm:text-base max-w-xs md:max-w-md lg:max-w-lg ${
                  isUser
                    ? "bg-primary text-white"
                    : "bg-accent text-gray-800"
                }`}
              >
                {m.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* INPUT AREA */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          className="flex-1 p-2 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Escribe tu mensaje..."
          onKeyDown={e => e.key === "Enter" && handleSend()}
        />
        <button
          className="bg-primary text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-accent transition whitespace-nowrap text-sm sm:text-base"
          onClick={handleSend}
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
