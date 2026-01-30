import React from "react";

export default function CharacterSelector({ setCharacter }) {
  return (
    <div className="flex justify-center gap-4">
      <button
        onClick={() => setCharacter("Eva")}
        className="bg-primary text-white px-6 py-2 rounded-lg shadow hover:bg-accent transition"
      >
        Eva
      </button>
      <button
        onClick={() => setCharacter("Gideon")}
        className="bg-primary text-white px-6 py-2 rounded-lg shadow hover:bg-accent transition"
      >
        Gideon
      </button>
    </div>
  );
}
