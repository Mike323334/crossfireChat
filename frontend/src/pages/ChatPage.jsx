import React, { useState, useEffect, useRef } from "react";
import ChatWindow from "../components/ChatWindow.jsx";
import styles from "../styles/ChatPage.module.css";

export default function ChatPage({ character, setCharacter }) {
  const chatRef = useRef(null);
  const [chatBounds, setChatBounds] = useState(null);
  const PHRASE_W = 260;
  const PHRASE_H = 110;
  const GAP = 20;
  const MIN_DISTANCE = PHRASE_W + 30; // Minimum distance between bubbles

  const evaPhrases = [
    "La oscuridad que nos rodea es profunda, pero nuestro amor es más fuerte.",
    "When I'm with you, everything feels quieter…",
    "Mi corazón late con fuerza cuando estoy cerca de él.",
    "I'm not perfect, but what I feel is real.",
    "Me duele amarte, pero no puedo evitarlo.",
    "Maybe we're both still figuring things out… together."
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

    // Generate bubbles with proper spacing
    phrases.forEach(() => {
      let box;
      let tries = 0;
      do {
        box = {
          left: GAP + Math.random() * (windowW - PHRASE_W - GAP * 2),
          top: GAP + Math.random() * (windowH - PHRASE_H - GAP * 2),
          dx: (Math.random() - 0.5) * 0.12, // Very slow, gentle movement
          dy: (Math.random() - 0.5) * 0.12,
          vx: (Math.random() - 0.5) * 0.12, // Very slow velocity for gentle floating
          vy: (Math.random() - 0.5) * 0.12
        };
        tries++;
      } while (
        newBubbles.some(b => isTooClose(b, box)) && 
        tries < 500
      );
      newBubbles.push(box);
    });

    setBubbles(newBubbles);

    let animFrame;
    let lastTime = performance.now();

    const animate = (currentTime) => {
      const deltaTime = Math.min((currentTime - lastTime) / 16, 2); // Cap delta for stability
      lastTime = currentTime;

      setBubbles(prev => {
        const updated = prev.map((b) => {
          let { top, left, dx, dy, vx = dx, vy = dy } = b;
          
          // Update position with velocity
          left += vx * deltaTime;
          top += vy * deltaTime;

          const maxX = window.innerWidth - PHRASE_W - GAP;
          const maxY = window.innerHeight - PHRASE_H - GAP;

          // Natural bounce off edges with damping
          if (left < GAP) {
            left = GAP;
            vx = Math.abs(vx) * 0.9; // Damping for natural bounce
          } else if (left > maxX) {
            left = maxX;
            vx = -Math.abs(vx) * 0.9;
          }

          if (top < GAP) {
            top = GAP;
            vy = Math.abs(vy) * 0.9;
          } else if (top > maxY) {
            top = maxY;
            vy = -Math.abs(vy) * 0.9;
          }

          return { top, left, dx, dy, vx, vy };
        });

        // Improved collision detection and resolution
        for (let i = 0; i < updated.length; i++) {
          for (let j = i + 1; j < updated.length; j++) {
            if (isOverlapping(updated[i], updated[j])) {
              // Calculate centers
              const center1 = {
                x: updated[i].left + PHRASE_W / 2,
                y: updated[i].top + PHRASE_H / 2
              };
              const center2 = {
                x: updated[j].left + PHRASE_W / 2,
                y: updated[j].top + PHRASE_H / 2
              };

              // Calculate distance and direction
              const dx = center2.x - center1.x;
              const dy = center2.y - center1.y;
              const distance = Math.sqrt(dx * dx + dy * dy) || 1;

              // Normalize direction
              const nx = dx / distance;
              const ny = dy / distance;

              // Separate bubbles
              const separation = (PHRASE_W + 20 - distance) / 2;
              updated[i].left -= nx * separation;
              updated[i].top -= ny * separation;
              updated[j].left += nx * separation;
              updated[j].top += ny * separation;

              // Bounce with natural physics
              const relativeVx = updated[j].vx - updated[i].vx;
              const relativeVy = updated[j].vy - updated[i].vy;
              const dotProduct = relativeVx * nx + relativeVy * ny;

              if (dotProduct < 0) {
                const bounce = 0.8; // Bounce coefficient
                updated[i].vx += nx * dotProduct * bounce;
                updated[i].vy += ny * dotProduct * bounce;
                updated[j].vx -= nx * dotProduct * bounce;
                updated[j].vy -= ny * dotProduct * bounce;
              }
            }
          }
        }

        return updated;
      });

      animFrame = requestAnimationFrame(animate);
    };

    animate(performance.now());

    return () => cancelAnimationFrame(animFrame);
  }, [phrases]);

  const isTooClose = (a, b) => {
    const center1 = { x: a.left + PHRASE_W / 2, y: a.top + PHRASE_H / 2 };
    const center2 = { x: b.left + PHRASE_W / 2, y: b.top + PHRASE_H / 2 };
    const dx = center2.x - center1.x;
    const dy = center2.y - center1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < MIN_DISTANCE;
  };

  const isOverlapping = (a, b) => {
    const buffer = 5;
    return !(
      a.left + PHRASE_W + buffer < b.left ||
      a.left > b.left + PHRASE_W + buffer ||
      a.top + PHRASE_H + buffer < b.top ||
      a.top > b.top + PHRASE_H + buffer
    );
  };

  return (
    <div className="w-full h-screen relative flex flex-col overflow-hidden bg-gradient-to-br from-gray-900 via-red-900 to-black">
      {/* Animated background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-950/30 via-transparent to-black/40 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(179,58,58,0.1),transparent_50%)] pointer-events-none"></div>

      {/* TITLE - Centered */}
      <div className="relative p-5 md:p-7 flex items-center justify-center border-b border-white/20 backdrop-blur-md bg-gradient-to-r from-black/40 via-black/30 to-black/40 shadow-2xl">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-title text-white text-center drop-shadow-2xl">
          Chateando con <span className="text-primary font-bold bg-gradient-to-r from-primary to-red-500 bg-clip-text text-transparent">{character}</span>
        </h2>
        <button 
          onClick={() => setCharacter(null)} 
          className="absolute right-5 md:right-8 top-1/2 -translate-y-1/2 bg-gradient-to-r from-white/15 to-white/10 hover:from-white/25 hover:to-white/15 text-white px-5 py-3 rounded-xl backdrop-blur-md transition-all duration-300 hover:scale-110 border border-white/30 shadow-lg hover:shadow-xl font-semibold"
        >
          ← Volver
        </button>
      </div>

      {/* CENTER CHAT */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-6 relative z-10">
        <div ref={chatRef} className="relative z-20 w-full max-w-3xl">
          <ChatWindow character={character} />
        </div>
      </div>

      {/* FLOATING BUBBLES */}
      {bubbles.map((b, i) => (
        <div
          key={i}
          className={styles.floatingPhrase}
          style={{ 
            transform: `translate(${b.left}px, ${b.top}px)`,
            top: 0,
            left: 0
          }}
        >
          <div className={styles.phraseBubble}>{phrases[i]}</div>
        </div>
      ))}
    </div>
  );
}
