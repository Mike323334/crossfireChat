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

  // Initialize bubbles with random positions and velocities
  useEffect(() => {
    if (!phrases.length) return;
    const newBubbles = [];
    const windowW = window.innerWidth;
    const windowH = window.innerHeight;

    phrases.forEach(() => {
      let box;
      let tries = 0;
      do {
        box = {
          left: GAP + Math.random() * (windowW - PHRASE_W - GAP * 2),
          top: GAP + Math.random() * (windowH - PHRASE_H - GAP * 2),
          dx: (Math.random() - 0.5) * 0.3, // slow movement
          dy: (Math.random() - 0.5) * 0.3
        };
        tries++;
      } while (newBubbles.some(b => isOverlapping(b, box)) && tries < 200);
      newBubbles.push(box);
    });

    setBubbles(newBubbles);

    let animFrame;

    const animate = () => {
      setBubbles(prev => {
        const updated = prev.map((b, i) => {
          let { top, left, dx, dy } = b;
          top += dy;
          left += dx;

          // Bounce off window edges
          if (left < GAP) dx = Math.abs(dx);
          if (left + PHRASE_W > window.innerWidth - GAP) dx = -Math.abs(dx);
          if (top < GAP) dy = Math.abs(dy);
          if (top + PHRASE_H > window.innerHeight - GAP) dy = -Math.abs(dy);

          return { top, left, dx, dy };
        });

        // Check collisions between bubbles
        for (let i = 0; i < updated.length; i++) {
          for (let j = i + 1; j < updated.length; j++) {
            if (isOverlapping(updated[i], updated[j])) {
              // Simple bounce: invert directions
              [updated[i].dx, updated[j].dx] = [-updated[i].dx, -updated[j].dx];
              [updated[i].dy, updated[j].dy] = [-updated[i].dy, -updated[j].dy];
            }
          }
        }

        return updated;
      });

      animFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animFrame);
  }, [phrases]);

  const isOverlapping = (a, b) => {
    const buffer = 10;
    return !(
      a.left + PHRASE_W + buffer < b.left ||
      a.left > b.left + PHRASE_W + buffer ||
      a.top + PHRASE_H + buffer < b.top ||
      a.top > b.top + PHRASE_H + buffer
    );
  };

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
