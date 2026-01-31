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
    <div className="flex flex-col border-2 border-white/30 rounded-3xl p-5 md:p-7 bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-xl shadow-2xl h-[65vh] md:h-[70vh] relative overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-red-900/10 pointer-events-none rounded-3xl"></div>
      
      <div className="flex-1 overflow-y-auto space-y-4 mb-5 scrollbar-hide pr-3 relative z-10">
        {messages.length === 0 && (
          <div className="text-center text-white/80 italic py-12 space-y-2">
            <div className="text-4xl mb-3">💬</div>
            <div className="text-lg md:text-xl font-semibold">Comienza la conversación con</div>
            <div className="text-2xl md:text-3xl text-primary font-bold">{character}</div>
            <div className="text-sm text-white/60 mt-4">Las burbujas flotan suavemente alrededor...</div>
          </div>
        )}
        {messages.map((m, i) => {
          const isUser = m.sender === "usuario";
          return (
            <div key={i} className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}>
              <div className={`p-4 md:p-5 rounded-2xl max-w-xs md:max-w-lg shadow-xl border-2 ${
                isUser 
                  ? "bg-gradient-to-br from-primary via-red-600 to-red-700 text-white border-red-400/30" 
                  : "bg-gradient-to-br from-white/95 to-white/85 text-gray-800 border-white/40 backdrop-blur-sm"
              }`}>
                <div className={`text-xs md:text-sm font-bold mb-2 ${isUser ? "text-white/90" : "text-primary"}`}>
                  {isUser ? "👤 Tú" : `💬 ${character}`}
                </div>
                <div className={`text-sm md:text-base leading-relaxed ${isUser ? "text-white" : "text-gray-800"}`}>
                  {m.text}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-3 pt-4 border-t-2 border-white/30 relative z-10">
        <input
          className="flex-1 p-4 md:p-5 border-2 border-white/40 rounded-2xl bg-gradient-to-r from-white/25 to-white/15 backdrop-blur-md text-white placeholder-white/70 focus:outline-none focus:ring-4 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-lg text-base md:text-lg font-medium"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Escribe un mensaje..."
          onKeyDown={e => e.key === "Enter" && handleSend()}
        />
        <button
          className="bg-gradient-to-r from-primary via-red-600 to-red-700 text-white px-8 md:px-10 py-4 md:py-5 rounded-2xl font-bold text-base md:text-lg hover:shadow-2xl hover:scale-110 transition-all duration-300 border-2 border-white/30 shadow-xl hover:from-red-600 hover:to-primary"
          onClick={handleSend}
        >
          Enviar ✉️
        </button>
      </div>
    </div>
  );
}
