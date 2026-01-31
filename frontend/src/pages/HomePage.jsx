import React from "react";
import CharacterSelector from "../components/CharacterSelector.jsx";

export default function HomePage({ setCharacter }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-gradient-to-br from-gray-900 via-red-900 to-black relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-950/40 via-transparent to-black/50 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(179,58,58,0.15),transparent_50%)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(179,58,58,0.1),transparent_50%)] pointer-events-none"></div>
      
      <div className="max-w-6xl w-full space-y-10 md:space-y-16 animate-fade-in relative z-10">
        <div className="text-center space-y-6">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-title text-white text-center drop-shadow-2xl leading-tight">
            Bienvenido a la
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-red-500 to-primary mt-3 animate-pulse">
              Experiencia Crossfire
            </span>
          </h1>
          <div className="w-32 h-1.5 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto shadow-lg shadow-primary/50"></div>
          <div className="text-white/70 text-lg md:text-xl italic">Sumérgete en una historia de pasión y amor</div>
        </div>

        <div className="bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 md:p-12 lg:p-16 shadow-2xl border-2 border-white/30 space-y-10 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="space-y-6 relative z-10">
            <p className="text-lg md:text-xl lg:text-2xl text-white/95 leading-relaxed font-medium">
              Sumérgete en el intenso mundo de la saga <span className="text-primary font-bold text-2xl md:text-3xl">Crossfire</span> de <span className="font-semibold">Sylvia Day</span>. 
              Esta app interactiva te permite vivir la historia de una forma nueva: conversando con <span className="text-primary font-semibold">Eva Tramell</span> y <span className="text-primary font-semibold">Gideon Cross</span> mediante IA.
            </p>
            <p className="text-lg md:text-xl lg:text-2xl text-white/90 leading-relaxed">
              A lo largo de cinco libros, la serie explora su relación apasionada y compleja mientras enfrentan amor, traumas y crecimiento personal en Nueva York, 
              demostrando que el amor puede ser tan <span className="text-primary font-semibold">difícil</span> como <span className="text-primary font-semibold">sanador</span>.
            </p>
          </div>

          <div className="bg-gradient-to-br from-black/40 to-black/20 rounded-2xl p-8 border-2 border-white/20 shadow-xl relative z-10">
            <h3 className="text-2xl md:text-3xl lg:text-4xl text-primary font-title mb-6 text-center">
              <span className="text-4xl">📚</span>
              <div className="mt-2">Orden de lectura</div>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white/90">
              {[
                "Bared to You",
                "Reflected in You", 
                "Entwined with You",
                "Captivated by You",
                "One with You"
              ].map((book, idx) => (
                <div key={idx} className="flex items-center space-x-3 bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                  <span className="text-primary font-bold text-xl md:text-2xl w-8">{idx + 1}.</span>
                  <span className="text-base md:text-lg font-medium">{book}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-lg md:text-xl lg:text-2xl text-white/85 italic text-center border-t-2 border-white/20 pt-8 relative z-10 font-serif">
            "Aquí no solo lees la historia… también puedes hablar con sus protagonistas y descubrir más sobre su mundo, una conversación a la vez."
          </p>

          <div className="space-y-6 pt-6 relative z-10">
            <p className="text-2xl md:text-3xl lg:text-4xl text-white font-bold text-center">
              Selecciona un personaje para hablar:
            </p>
            <CharacterSelector setCharacter={setCharacter} />
          </div>
        </div>
      </div>
    </div>
  );
}
