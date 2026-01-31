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
    } catch {
      setMessages(prev => [...prev, { sender: "system", text: "Error getting response." }]);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col border border-white/20 rounded-2xl p-4 md:p-6 bg-white/10 backdrop-blur-md shadow-2xl h-[65vh] md:h-[70vh]">
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 scrollbar-hide pr-2">
        {messages.length === 0 && (
          <div className="text-center text-white/70 italic py-8">
            Comienza la conversación con {character}...
          </div>
        )}
        {messages.map((m, i) => {
          const isUser = m.sender === "usuario";
          return (
            <div key={i} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
              <div className={`p-4 rounded-2xl max-w-xs md:max-w-md shadow-lg ${
                isUser 
                  ? "bg-gradient-to-br from-primary to-red-700 text-white" 
                  : "bg-white/90 text-gray-800 backdrop-blur-sm"
              }`}>
                <div className="text-sm font-semibold mb-1 opacity-80">
                  {isUser ? "Tú" : character}
                </div>
                <div className="text-sm md:text-base leading-relaxed">{m.text}</div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-3 pt-3 border-t border-white/20">
        <input
          className="flex-1 p-3 md:p-4 border border-white/30 rounded-xl bg-white/20 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Escribe un mensaje..."
          onKeyDown={e => e.key === "Enter" && handleSend()}
        />
        <button
          className="bg-gradient-to-r from-primary to-red-700 text-white px-6 md:px-8 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 border border-white/20"
          onClick={handleSend}
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
