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

  const evaPhrases = [
    
    "When I'm with you, everything feels quieter…",
    "Mi corazón late con fuerza cuando estoy cerca de él.",
    "I'm not perfect, but what I feel is real.",
    "Me duele amarte, pero no puedo evitarlo.",
    
  ];

  const gideonPhrases = [
  
    "Mi vida con Gideon es un torbellino de pasión y peligro.",
    "What's on your mind?",
    "Eres la única que ha podido calmar la tormenta dentro de mí.",
    "You're the reason I breathe.",
    
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

  // Position bubbles statically around the chat window
  useEffect(() => {
    if (!phrases.length || !chatBounds || !titleBounds) return;

    const updateBubblePositions = () => {
      const windowW = window.innerWidth;
      const windowH = window.innerHeight;
      
      // Chat bounds with generous padding to avoid overlap
      const chatPadding = 50;
      const chatLeft = chatBounds.left - chatPadding;
      const chatRight = chatBounds.right + chatPadding;
      const chatTop = chatBounds.top - chatPadding;
      const chatBottom = chatBounds.bottom + chatPadding;
      
      // Title bounds with padding - ensure bubbles don't overlap title
      const titleBottom = titleBounds.bottom + 30;

      const newBubbles = [];
      const positions = [];

      // Generate static positions ONLY at the sides (left and right) of the chat window
      phrases.forEach((_, index) => {
        let position;
        let tries = 0;
        const maxTries = 100;

        do {
          // Distribute bubbles between left and right sides of chat
          const isLeft = index % 2 === 0; // Alternate between left and right
          let left, top;

          if (isLeft) {
            // Left side of chat
            const leftAreaWidth = Math.max(50, chatLeft - GAP - PHRASE_W);
            left = GAP + Math.random() * leftAreaWidth;
            // Position vertically aligned with chat (from title bottom to window bottom)
            const availableHeight = windowH - titleBottom - GAP - PHRASE_H;
            top = titleBottom + GAP + Math.random() * Math.max(50, availableHeight);
          } else {
            // Right side of chat
            const rightAreaWidth = Math.max(50, windowW - chatRight - GAP);
            left = chatRight + Math.random() * rightAreaWidth;
            // Position vertically aligned with chat (from title bottom to window bottom)
            const availableHeight = windowH - titleBottom - GAP - PHRASE_H;
            top = titleBottom + GAP + Math.random() * Math.max(50, availableHeight);
          }

          // Ensure within bounds
          left = Math.max(GAP, Math.min(left, windowW - PHRASE_W - GAP));
          top = Math.max(titleBottom + GAP, Math.min(top, windowH - PHRASE_H - GAP));

          position = { left, top };

          tries++;
        } while (
          (isOverlappingChat(position, chatBounds) || 
           isOverlappingTitle(position, titleBounds)) && 
          tries < maxTries
        );

        // Always add position, even if it overlaps with other bubbles (that's allowed)
        if (tries < maxTries) {
          newBubbles.push(position);
        }
      });

      setBubbles(newBubbles);
    };

    // Wait a bit for chat and title to render
    const timer = setTimeout(() => {
      updateBubblePositions();
    }, 150);
    
    // Don't update on resize - keep bubbles static
    // Only position once when component mounts
  }, [phrases, chatBounds, titleBounds]);


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

      {/* STATIC BUBBLES AT SIDES OF CHAT */}
      {bubbles.map((b, i) => (
        <div
          key={i}
          className={styles.floatingPhrase}
          style={{ 
            position: 'fixed',
            left: `${b.left}px`,
            top: `${b.top}px`,
            transform: 'none !important',
            animation: 'none !important',
            transition: 'none !important',
            willChange: 'auto !important'
          }}
        >
          <div className={styles.phraseBubble} style={{ animation: 'none !important', transform: 'none !important' }}>{phrases[i]}</div>
        </div>
      ))}
    </div>
  );
}
