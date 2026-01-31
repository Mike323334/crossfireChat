import React from "react";

export default function CharacterSelector({ setCharacter }) {
  return (
    <div className="flex justify-center gap-6">
      <button
        onClick={() => setCharacter("Eva")}
        className="bg-gradient-to-r from-primary to-red-600 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold text-lg"
      >
        💃 Eva
      </button>
      <button
        onClick={() => setCharacter("Gideon")}
        className="bg-gradient-to-r from-primary to-red-600 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold text-lg"
      >
        👔 Gideon
      </button>
    </div>
  );
}
