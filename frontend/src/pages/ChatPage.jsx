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
  const MIN_DISTANCE = 170;

  // 💬 Eva phrases (softer emotional tone)
  const evaPhrases = [
    "La oscuridad que nos rodea es profunda, pero nuestra amor es más fuerte, más intenso, y más apasionado.",
    "When I'm with you, everything feels quieter… like the world fades away.",
    "Mi corazón late con fuerza cuando estoy cerca de él, como si supiera que mi vida está a punto de cambiar para siempre.",
    "I’m not perfect, but what I feel is real.",
    "Me duele amarte, pero no puedo evitarlo, eres adictivo, eres mi veneno y mi antídoto",
    "Maybe we’re both still figuring things out… together."
  ];

  // 💬 Gideon phrases
  const gideonPhrases = [
    "My entire existence has been defined by my need for you, Eva. You're the reason I breathe, the reason I live.",
    "Eres la única persona que ha logrado hacer que me sienta vivo...",
    "La pasión que arde dentro de mí es difícil de controlar cuando estoy cerca de ti, Eva.",
    "Eva, mi amor, tu presencia me hace sentir vivo...",
    "I want you, Eva. I want all of you. My love for you is a force of nature.",
    "Give yourself to me, Eva. Let go of your fears and doubts."
  ];

  // 🧠 Phrase map per character (scalable)
  const characterPhrases = {
    Gideon: gideonPhrases,
    Eva: evaPhrases
  };

  const phrases = characterPhrases[character] || [];

  // Observe chat box size & movement
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

  // Compute safe zones around chat
  const getSafeZones = () => {
    if (!chatBounds) return [];

    return [
      // TOP
      {
        x: GAP,
        y: GAP,
        w: window.innerWidth - GAP * 2,
        h: chatBounds.top - GAP * 2
      },
      // BOTTOM
      {
        x: GAP,
        y: chatBounds.bottom + GAP,
        w: window.innerWidth - GAP * 2,
        h: window.innerHeight - chatBounds.bottom - GAP * 2
      },
      // LEFT
      {
        x: GAP,
        y: chatBounds.top,
        w: chatBounds.left - GAP * 2,
        h: chatBounds.height
      },
      // RIGHT
      {
        x: chatBounds.right + GAP,
        y: chatBounds.top,
        w: window.innerWidth - chatBounds.right - GAP * 2,
        h: chatBounds.height
      }
    ].filter(z => z.w > PHRASE_W && z.h > PHRASE_H);
  };

  const getRandomPosition = (existingPositions) => {
    const zones = getSafeZones();
    if (!zones.length) return { top: 50, left: 50 };

    let tries = 0;

    while (tries < 100) {
      const zone = zones[Math.floor(Math.random() * zones.length)];

      const left = zone.x + Math.random() * (zone.w - PHRASE_W);
      const top = zone.y + Math.random() * (zone.h - PHRASE_H);

      const tooClose = existingPositions.some(pos =>
        Math.abs(pos.top - top) < MIN_DISTANCE &&
        Math.abs(pos.left - left) < MIN_DISTANCE
      );

      if (!tooClose) return { top, left };
      tries++;
    }

    return { top: zones[0].y, left: zones[0].x };
  };

  // Initial placement
  useEffect(() => {
    if (!phrases.length || !chatBounds) return;

    const newPositions = [];
    phrases.forEach(() => {
      newPositions.push(getRandomPosition(newPositions));
    });
    setPhrasePositions(newPositions);
  }, [character, chatBounds]);

  // Floating movement (reposition every 7s)
  useEffect(() => {
    if (!phrases.length || !chatBounds) return;

    const interval = setInterval(() => {
      setPhrasePositions(prev => {
        const updated = [];
        prev.forEach(() => updated.push(getRandomPosition(updated)));
        return updated;
      });
    }, 7000);

    return () => clearInterval(interval);
  }, [character, chatBounds]);

  return (
    <div className="w-full max-w-2xl p-6 relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-title text-primary">
          Chateando con {character}
        </h2>
        <button
          onClick={() => setCharacter(null)}
          className="text-gray-600 hover:text-primary"
        >
          Volver
        </button>
      </div>

      <div ref={chatRef} className="relative z-20">
        <ChatWindow character={character} />
      </div>

      {phrases.length > 0 &&
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
