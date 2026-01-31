import React, { useState, useEffect, useRef } from "react";
import ChatWindow from "../components/ChatWindow.jsx";
import styles from "../styles/ChatPage.module.css";

export default function ChatPage({ character, setCharacter }) {
  const chatRef = useRef(null);
  const [chatBounds, setChatBounds] = useState(null);
  const [phrasePositions, setPhrasePositions] = useState([]);

  const PHRASE_W = 260;
  const PHRASE_H = 110;
  const GAP = 40;

  const evaPhrases = [
    "La oscuridad que nos rodea es profunda, pero nuestro amor es más fuerte.",
    "When I'm with you, everything feels quieter…",
    "Mi corazón late con fuerza cuando estoy cerca de él.",
    "I’m not perfect, but what I feel is real.",
    "Me duele amarte, pero no puedo evitarlo.",
    "Maybe we’re both still figuring things out… together."
  ];

  const gideonPhrases = [
    "I'd rather not think about the past.",
    "Mi vida con Gideon es un torbellino de pasión y peligro.",
    "What's on your mind?",
    "Eres la única que ha podido calmar la tormenta dentro de mí.",
    "You're the reason I breathe.",
    "Eres la única persona que me hace sentir vivo."
  ];

  const characterPhrases = { Gideon: gideonPhrases, Eva: evaPhrases };
  const phrases = characterPhrases[character] || [];

  useEffect(() => {
    if (!chatRef.current) return;

    const updateBounds = () => {
      setChatBounds(chatRef.current.getBoundingClientRect());
    };

    updateBounds();

    const resizeObserver = new ResizeObserver(updateBounds);
    resizeObserver.observe(chatRef.current);

    window.addEventListener("resize", updateBounds);
    window.addEventListener("scroll", updateBounds);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateBounds);
      window.removeEventListener("scroll", updateBounds);
    };
  }, []);

  const getSafeZones = () => {
    if (!chatBounds) return [];

    return [
      { x: GAP, y: GAP, w: window.innerWidth - GAP * 2, h: chatBounds.top - GAP * 2 },
      { x: GAP, y: chatBounds.bottom + GAP, w: window.innerWidth - GAP * 2, h: window.innerHeight - chatBounds.bottom - GAP * 2 }
    ].filter(z => z.w > PHRASE_W && z.h > PHRASE_H);
  };

  const isOverlapping = (a, b) => {
    return !(
      a.left + PHRASE_W + GAP < b.left ||
      a.left > b.left + PHRASE_W + GAP ||
      a.top + PHRASE_H + GAP < b.top ||
      a.top > b.top + PHRASE_H + GAP
    );
  };

  const getRandomPosition = (existing) => {
    const zones = getSafeZones();
    if (!zones.length) return { top: 50, left: 50 };

    let tries = 0;
    while (tries < 100) {
      const zone = zones[Math.floor(Math.random() * zones.length)];
      const left = zone.x + Math.random() * (zone.w - PHRASE_W);
      const top = zone.y + Math.random() * (zone.h - PHRASE_H);
      const box = { top, left };

      if (!existing.some(p => isOverlapping(p, box))) return box;
      tries++;
    }

    return { top: zones[0].y, left: zones[0].x };
  };

  useEffect(() => {
    if (!phrases.length || !chatBounds) return;
    const newPositions = [];
    phrases.forEach(() => newPositions.push(getRandomPosition(newPositions)));
    setPhrasePositions(newPositions);
  }, [character, chatBounds]);

  return (
    <div className="w-full max-w-4xl mx-auto p-0 sm:p-4 md:p-6 relative h-screen sm:min-h-screen flex flex-col overflow-hidden">
      
      <div className="flex justify-between items-center mb-0 sm:mb-4 p-2 sm:p-0">
        <h2 className="text-xl sm:text-xl md:text-2xl font-title text-primary">
          Chateando con {character}
        </h2>
        <button onClick={() => setCharacter(null)} className="text-base">Volver</button>
      </div>

      {/* CENTER CHAT ONLY ON MOBILE */}
      <div className="flex-1 flex items-center justify-center sm:block">
        <div ref={chatRef} className="relative z-20 w-full max-w-md sm:max-w-none">
          <ChatWindow character={character} />
        </div>
      </div>

      {/* FLOATING PHRASES */}
      {phrases.length > 0 && window.innerWidth >= 768 &&
        phrasePositions.map((pos, i) => (
          <div
            key={i}
            className={styles.floatingPhrase}
            style={{ top: pos.top + "px", left: pos.left + "px" }}
          >
            <div className={styles.phraseBubble}>{phrases[i]}</div>
          </div>
        ))}
    </div>
  );
}
