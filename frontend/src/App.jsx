import React, { useState } from "react";
import HomePage from "./pages/HomePage.jsx";
import ChatPage from "./pages/ChatPage.jsx";

export default function App() {
  const [character, setCharacter] = useState(null);

  return character ? (
    <ChatPage character={character} setCharacter={setCharacter} />
  ) : (
    <HomePage setCharacter={setCharacter} />
  );
}
