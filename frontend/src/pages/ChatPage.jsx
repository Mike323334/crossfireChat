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

  // 💬 EVA PHRASES
  const evaPhrases = [
    "La oscuridad que nos rodea es profunda, pero nuestro amor es más fuerte.",
    "When I'm with you, everything feels quieter…",
    "Mi corazón late con fuerza cuando estoy cerca de él.",
    "I’m not perfect, but what I feel is real.",
    "Me duele amarte, pero no puedo evitarlo.",
    "Maybe we’re both still figuring things out… together."
  ];

  // 💬 GIDEON PHRASES
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

  // Observe chat position
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

  // Zones where phrases can appear
  const getSafeZones = () => {
    if (!chatBounds) return [];
    const isDesktop = window.innerWidth >= 768;

    const zones = [
      { x: GAP, y: GAP, w: window.innerWidth - GAP * 2, h: chatBounds.top - GAP * 2 },
      { x: GAP, y: chatBounds.bottom + GAP, w: window.innerWidth - GAP * 2, h: window.innerHeight - chatBounds.bottom - GAP * 2 }
    ];

    if (isDesktop) {
      zones.push(
        { x: GAP, y: chatBounds.top, w: chatBounds.left - GAP * 2, h: chatBounds.height },
        { x: chatBounds.right + GAP, y: chatBounds.top, w: window.innerWidth - chatBounds.right - GAP * 2, h: chatBounds.height }
      );
    }

    return zones.filter(z => z.w > PHRASE_W && z.h > PHRASE_H);
  };

  // True rectangle collision detection
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
    while (tries < 120) {
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
    <div className="w-full h-screen relative overflow-hidden flex flex-col">

      {/* TITLE */}
      <div className="relative p-3">
        <h2 className="text-xl md:text-2xl font-title text-primary text-center">
          Chateando con {character}
        </h2>
        <button onClick={() => setCharacter(null)} className="absolute right-4 top-3">
          Volver
        </button>
      </div>

      {/* CENTER CHAT */}
      <div className="flex-1 flex items-center justify-center">
        <div ref={chatRef} className="relative z-20 w-full max-w-md">
          <ChatWindow character={character} />
        </div>
      </div>

      {/* FLOATING PHRASES */}
      {phrases.map((text, i) => (
        <div
          key={i}
          className={styles.floatingPhrase}
          style={{ top: phrasePositions[i]?.top, left: phrasePositions[i]?.left }}
        >
          <div className={styles.phraseBubble}>{text}</div>
        </div>
      ))}
    </div>
  );
}
