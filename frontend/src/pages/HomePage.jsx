import React from "react";
import CharacterSelector from "../components/CharacterSelector.jsx";

export default function HomePage({ setCharacter }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-gradient-to-br from-gray-900 via-red-900 to-black">
      <div className="max-w-5xl w-full space-y-8 md:space-y-12 animate-fade-in">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-title text-white text-center drop-shadow-2xl">
            Bienvenido a la
            <span className="block text-primary mt-2">Experiencia Crossfire</span>
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto"></div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-10 lg:p-12 shadow-2xl border border-white/20 space-y-8">
          <div className="space-y-4">
            <p className="text-base md:text-lg lg:text-xl text-white/90 leading-relaxed">
              Sumérgete en el intenso mundo de la saga <span className="text-primary font-semibold">Crossfire</span> de Sylvia Day. 
              Esta app interactiva te permite vivir la historia de una forma nueva: conversando con Eva Tramell y Gideon Cross mediante IA.
            </p>
            <p className="text-base md:text-lg lg:text-xl text-white/90 leading-relaxed">
              A lo largo de cinco libros, la serie explora su relación apasionada y compleja mientras enfrentan amor, traumas y crecimiento personal en Nueva York, 
              demostrando que el amor puede ser tan difícil como sanador.
            </p>
          </div>

          <div className="bg-black/20 rounded-xl p-6 border border-white/10">
            <h3 className="text-xl md:text-2xl text-primary font-title mb-4 text-center">📚 Orden de lectura</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-white/80">
              <div className="flex items-center space-x-2">
                <span className="text-primary font-bold">1.</span>
                <span>Bared to You</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-primary font-bold">2.</span>
                <span>Reflected in You</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-primary font-bold">3.</span>
                <span>Entwined with You</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-primary font-bold">4.</span>
                <span>Captivated by You</span>
              </div>
              <div className="flex items-center space-x-2 md:col-span-2 justify-center">
                <span className="text-primary font-bold">5.</span>
                <span>One with You</span>
              </div>
            </div>
          </div>

          <p className="text-base md:text-lg text-white/80 italic text-center border-t border-white/10 pt-6">
            Aquí no solo lees la historia… también puedes hablar con sus protagonistas y descubrir más sobre su mundo, una conversación a la vez.
          </p>

          <div className="space-y-4 pt-4">
            <p className="text-xl md:text-2xl text-white font-semibold text-center">Selecciona un personaje para hablar:</p>
            <CharacterSelector setCharacter={setCharacter} />
          </div>
        </div>
      </div>
    </div>
  );
}
