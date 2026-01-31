import React, { useState, useEffect, useRef } from "react";
import ChatWindow from "../components/ChatWindow.jsx";
import styles from "../styles/ChatPage.module.css";

export default function ChatPage({ character, setCharacter }) {
  const chatRef = useRef(null);
  const [chatBounds, setChatBounds] = useState(null);
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

  const [bubbles, setBubbles] = useState([]);

  // Observe chat bounds
  useEffect(() => {
    if (!chatRef.current) return;
    const updateBounds = () => setChatBounds(chatRef.current.getBoundingClientRect());
    updateBounds();

    const observer = new ResizeObserver(updateBounds);
    observer.observe(chatRef.current);
    window.addEventListener("resize", updateBounds);
    window.addEventListener("scroll", updateBounds);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateBounds);
      window.removeEventListener("scroll", updateBounds);
    };
  }, []);

  // Get safe zones around chat
  const getSafeZones = () => {
    if (!chatBounds) return [];
    const isDesktop = window.innerWidth >= 768;

    const zones = [
      { x: GAP, y: GAP, w: window.innerWidth - GAP * 2, h: chatBounds.top - GAP * 2 }, // TOP
      { x: GAP, y: chatBounds.bottom + GAP, w: window.innerWidth - GAP * 2, h: window.innerHeight - chatBounds.bottom - GAP * 2 } // BOTTOM
    ];

    if (isDesktop) {
      zones.push(
        { x: GAP, y: chatBounds.top, w: chatBounds.left - GAP * 2, h: chatBounds.height }, // LEFT
        { x: chatBounds.right + GAP, y: chatBounds.top, w: window.innerWidth - chatBounds.right - GAP * 2, h: chatBounds.height } // RIGHT
      );
    }

    return zones.filter(z => z.w > PHRASE_W && z.h > PHRASE_H);
  };

  // Check collision between bubbles
  const isOverlapping = (a, b) => {
    const buffer = 10;
    return !(
      a.left + PHRASE_W + buffer < b.left ||
      a.left > b.left + PHRASE_W + buffer ||
      a.top + PHRASE_H + buffer < b.top ||
      a.top > b.top + PHRASE_H + buffer
    );
  };

  // Initialize bubbles with random positions and velocities
  useEffect(() => {
    if (!phrases.length || !chatBounds) return;

    const zones = getSafeZones();
    const newBubbles = phrases.map(() => {
      let box;
      let tries = 0;
      do {
        const zone = zones[Math.floor(Math.random() * zones.length)];
        box = {
          left: zone.x + Math.random() * (zone.w - PHRASE_W),
          top: zone.y + Math.random() * (zone.h - PHRASE_H),
          dx: (Math.random() - 0.5) * 0.6,
          dy: (Math.random() - 0.5) * 0.6
        };
        tries++;
      } while (newBubbles?.some(b => isOverlapping(b, box)) && tries < 200);
      return box;
    });

    setBubbles(newBubbles);

    let animFrame;

    const animate = () => {
      setBubbles(prev =>
        prev.map((b, i) => {
          let { top, left, dx, dy } = b;
          top += dy;
          left += dx;

          const zone = zones[i % zones.length];

          // Bounce off edges
          if (left < zone.x || left + PHRASE_W > zone.x + zone.w) dx = -dx;
          if (top < zone.y || top + PHRASE_H > zone.y + zone.h) dy = -dy;

          // Keep inside zone
          top = Math.max(zone.y, Math.min(zone.y + zone.h - PHRASE_H, top));
          left = Math.max(zone.x, Math.min(zone.x + zone.w - PHRASE_W, left));

          return { top, left, dx, dy };
        })
      );
      animFrame = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animFrame);
  }, [phrases, chatBounds]);

  return (
    <div className="w-full h-screen relative flex flex-col overflow-hidden">

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

      {/* FLOATING BUBBLES */}
      {bubbles.map((b, i) => (
        <div
          key={i}
          className={styles.floatingPhrase}
          style={{ top: b.top, left: b.left }}
        >
          <div className={styles.phraseBubble}>{phrases[i]}</div>
        </div>
      ))}
    </div>
  );
}
