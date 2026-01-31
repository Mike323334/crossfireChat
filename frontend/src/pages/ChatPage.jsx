import React, { useState, useEffect, useRef } from "react";
import ChatWindow from "../components/ChatWindow.jsx";
import styles from "../styles/ChatPage.module.css";

export default function ChatPage({ character, setCharacter }) {
  const chatRef = useRef(null);
  const titleRef = useRef(null);
  const [chatBounds, setChatBounds] = useState(null);
  const [titleBounds, setTitleBounds] = useState(null);
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

  // Observe chat bounds and title bounds
  useEffect(() => {
    if (!chatRef.current || !titleRef.current) return;
    const updateBounds = () => {
      setChatBounds(chatRef.current.getBoundingClientRect());
      setTitleBounds(titleRef.current.getBoundingClientRect());
    };
    updateBounds();

    const observer = new ResizeObserver(updateBounds);
    observer.observe(chatRef.current);
    if (titleRef.current) observer.observe(titleRef.current);
    window.addEventListener("resize", updateBounds);
    window.addEventListener("scroll", updateBounds);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateBounds);
      window.removeEventListener("scroll", updateBounds);
    };
  }, []);

  // Position bubbles and make them move slowly
  useEffect(() => {
    if (!phrases.length || !chatBounds || !titleBounds) return;

    const windowW = window.innerWidth;
    const windowH = window.innerHeight;
    
    // Chat bounds with generous padding to avoid overlap
    const chatPadding = 50;
    const chatLeft = chatBounds.left - chatPadding;
    const chatRight = chatBounds.right + chatPadding;
    const chatTop = chatBounds.top - chatPadding;
    const chatBottom = chatBounds.bottom + chatPadding;
    
    // Title bounds with padding
    const titleBottom = titleBounds.bottom + 20;

    const newBubbles = [];
    const positions = [];

    // Generate initial positions around the chat window
    phrases.forEach((_, index) => {
      let position;
      let tries = 0;
      const maxTries = 300;

      do {
        // Distribute bubbles evenly around the chat
        const zone = index % 4; // 4 zones: top, right, bottom, left
        let left, top;

        switch (zone) {
          case 0: // Top area - above chat but below title
            left = GAP + Math.random() * (windowW - PHRASE_W - GAP * 2);
            const topAreaHeight = Math.max(50, chatTop - titleBottom - GAP);
            top = titleBottom + GAP + Math.random() * topAreaHeight;
            break;
          case 1: // Right area - to the right of chat
            const rightAreaWidth = Math.max(50, windowW - chatRight - GAP);
            left = chatRight + Math.random() * rightAreaWidth;
            top = titleBottom + GAP + Math.random() * (windowH - titleBottom - PHRASE_H - GAP);
            break;
          case 2: // Bottom area - below chat
            left = GAP + Math.random() * (windowW - PHRASE_W - GAP * 2);
            const bottomAreaHeight = Math.max(50, windowH - chatBottom - GAP);
            top = chatBottom + Math.random() * bottomAreaHeight;
            break;
          case 3: // Left area - to the left of chat
            const leftAreaWidth = Math.max(50, chatLeft - GAP - PHRASE_W);
            left = GAP + Math.random() * leftAreaWidth;
            top = titleBottom + GAP + Math.random() * (windowH - titleBottom - PHRASE_H - GAP);
            break;
        }

        // Ensure within bounds
        left = Math.max(GAP, Math.min(left, windowW - PHRASE_W - GAP));
        top = Math.max(titleBottom + GAP, Math.min(top, windowH - PHRASE_H - GAP));

        position = { 
          left, 
          top,
          vx: (Math.random() - 0.5) * 0.008, // Very slow movement
          vy: (Math.random() - 0.5) * 0.008
        };

        tries++;
      } while (
        (isOverlappingChat(position, chatBounds) || 
         isOverlappingTitle(position, titleBounds) ||
         positions.some(p => isTooClose(p, position))) && 
        tries < maxTries
      );

      if (tries < maxTries) {
        positions.push(position);
        newBubbles.push(position);
      }
    });

    setBubbles(newBubbles);

    // Animate bubbles slowly
    let animFrame;
    let lastTime = performance.now();

    const animate = (currentTime) => {
      const deltaTime = Math.min((currentTime - lastTime) / 16, 2);
      lastTime = currentTime;

      setBubbles(prev => {
        const updated = prev.map((b) => {
          let { top, left, vx, vy } = b;
          
          // Update position with very slow velocity
          left += vx * deltaTime * 0.3; // Slow down by 70%
          top += vy * deltaTime * 0.3;

          const maxX = window.innerWidth - PHRASE_W - GAP;
          const maxY = window.innerHeight - PHRASE_H - GAP;
          const minY = titleBounds ? titleBounds.bottom + GAP : GAP;

          // Bounce off edges with damping
          if (left < GAP) {
            left = GAP;
            vx = Math.abs(vx) * 0.8;
          } else if (left > maxX) {
            left = maxX;
            vx = -Math.abs(vx) * 0.8;
          }

          if (top < minY) {
            top = minY;
            vy = Math.abs(vy) * 0.8;
          } else if (top > maxY) {
            top = maxY;
            vy = -Math.abs(vy) * 0.8;
          }

          // Check if overlapping with chat or title
          if (isOverlappingChat({ left, top }, chatBounds) || 
              isOverlappingTitle({ left, top }, titleBounds)) {
            // Reverse direction
            vx = -vx;
            vy = -vy;
          }

          return { top, left, vx, vy };
        });

        return updated;
      });

      animFrame = requestAnimationFrame(animate);
    };

    animate(performance.now());

    return () => cancelAnimationFrame(animFrame);
  }, [phrases, chatBounds, titleBounds]);

  const isTooClose = (a, b) => {
    const center1 = { x: a.left + PHRASE_W / 2, y: a.top + PHRASE_H / 2 };
    const center2 = { x: b.left + PHRASE_W / 2, y: b.top + PHRASE_H / 2 };
    const dx = center2.x - center1.x;
    const dy = center2.y - center1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < MIN_DISTANCE;
  };

  const isOverlappingChat = (bubble, chatBounds) => {
    if (!chatBounds) return false;
    const buffer = 50; // Extra padding around chat to ensure visibility
    return !(
      bubble.left + PHRASE_W + buffer < chatBounds.left ||
      bubble.left > chatBounds.right + buffer ||
      bubble.top + PHRASE_H + buffer < chatBounds.top ||
      bubble.top > chatBounds.bottom + buffer
    );
  };

  const isOverlappingTitle = (bubble, titleBounds) => {
    if (!titleBounds) return false;
    const buffer = 20; // Padding around title
    return !(
      bubble.left + PHRASE_W + buffer < titleBounds.left ||
      bubble.left > titleBounds.right + buffer ||
      bubble.top + PHRASE_H + buffer < titleBounds.top ||
      bubble.top > titleBounds.bottom + buffer
    );
  };

  return (
    <div className="w-full h-screen relative flex flex-col overflow-hidden bg-gradient-to-br from-gray-900 via-red-900 to-black">
      {/* Animated background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-950/30 via-transparent to-black/40 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(179,58,58,0.1),transparent_50%)] pointer-events-none"></div>

      {/* TITLE - Centered */}
      <div ref={titleRef} className="relative p-5 md:p-7 flex items-center justify-center border-b border-white/20 backdrop-blur-md bg-gradient-to-r from-black/40 via-black/30 to-black/40 shadow-2xl">
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

      {/* SLOWLY MOVING BUBBLES AROUND CHAT */}
      {bubbles.map((b, i) => (
        <div
          key={i}
          className={styles.floatingPhrase}
          style={{ 
            position: 'fixed',
            left: `${b.left}px`,
            top: `${b.top}px`,
            transform: 'translateZ(0)'
          }}
        >
          <div className={styles.phraseBubble}>{phrases[i]}</div>
        </div>
      ))}
    </div>
  );
}
