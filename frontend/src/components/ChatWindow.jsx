import React, { useState, useRef, useEffect } from "react";
import { sendMessage } from "../api/chatApi.js";

export default function ChatWindow({ character }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userText = input;
    setInput("");

    setMessages(prev => [...prev, { sender: "usuario", text: userText }]);

    try {
      const res = await sendMessage(character.toLowerCase(), userText);
      setMessages(prev => [...prev, { sender: character, text: res }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: "system", text: "Error getting response." }]);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col border rounded-lg p-2 sm:p-4 bg-white shadow h-[70vh] sm:h-80 md:h-96">
      
      <div className="flex-1 overflow-y-auto mb-2 sm:mb-4 space-y-2 min-h-0">
        {messages.map((m, i) => {
          const isUser = m.sender === "usuario";
          return (
            <div key={i} className={`w-full flex ${isUser ? "justify-end" : "justify-start"}`}>
              <div className={`p-3 rounded-lg break-words text-xl sm:text-lg max-w-xs md:max-w-md lg:max-w-lg ${
                isUser ? "bg-primary text-white" : "bg-accent text-gray-800"
              }`}>
                {m.text}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          className="flex-1 p-4 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-xl sm:text-base"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Escribe tu mensaje..."
          onKeyDown={e => e.key === "Enter" && handleSend()}
        />
        <button
          className="bg-primary text-white px-6 sm:px-4 py-4 sm:py-3 rounded-lg hover:bg-accent transition text-xl sm:text-base font-bold"
          onClick={handleSend}
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
