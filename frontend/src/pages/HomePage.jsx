import React from "react";
import CharacterSelector from "../components/CharacterSelector.jsx";

export default function HomePage({ setCharacter }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-4xl w-full space-y-8 animate-fade-in">
        <h1 className="text-5xl font-title text-primary text-center drop-shadow-lg">
          Bienvenido a la Experiencia Crossfire
        </h1>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 shadow-2xl border border-white/20">
          <p className="text-lg text-white leading-relaxed mb-6">
            Sumérgete en el intenso mundo de la saga Crossfire de Sylvia Day. Esta app interactiva te permite vivir la historia de una forma nueva: conversando con Eva Tramell y Gideon Cross mediante IA.
            <br /><br />
            A lo largo de cinco libros, la serie explora su relación apasionada y compleja mientras enfrentan amor, traumas y crecimiento personal en Nueva York, demostrando que el amor puede ser tan difícil como sanador.
            <br /><br />
            📚 Orden de lectura <br />
            Bared to You <br />
            Reflected in You <br />
            Entwined with You <br />
            Captivated by You <br />
            One with You <br /><br />
            Aquí no solo lees la historia… también puedes hablar con sus protagonistas y descubrir más sobre su mundo, una conversación a la vez.
          </p>
          <p className="text-xl text-white font-semibold text-center">Selecciona un personaje para hablar:</p>
          <div className="mt-6">
            <CharacterSelector setCharacter={setCharacter} />
          </div>
        </div>
      </div>
    </div>
  );
}
