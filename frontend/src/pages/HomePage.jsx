import React from "react";
import CharacterSelector from "../components/CharacterSelector.jsx";

export default function HomePage({ setCharacter }) {
  return (
    <div className="text-center space-y-6 p-6">
      <h1 className="text-4xl font-title text-primary">Bienvenido a la Experiencia Crossfire</h1>
     
      <p className="text-lg text-white">

Sumérgete en el intenso mundo de la saga Crossfire de Sylvia Day. Esta app interactiva te permite vivir la historia de una forma nueva: conversando con Eva Tramell y Gideon Cross mediante IA.

A lo largo de cinco libros, la serie explora su relación apasionada y compleja mientras enfrentan amor, traumas y crecimiento personal en Nueva York, demostrando que el amor puede ser tan difícil como sanador.<br></br> <br></br>

📚 Orden de lectura <br></br>

Bared to You <br></br>

Reflected in You <br></br>

Entwined with You <br></br>

Captivated by You <br></br>

One with You <br></br> <br></br>

Aquí no solo lees la historia… también puedes hablar con sus protagonistas y descubrir más sobre su mundo, una conversación a la vez.</p>
       <p className="text-lg text-white">Selecciona un personaje para hablar:</p>
      <CharacterSelector setCharacter={setCharacter} />
    </div>
  );
}
