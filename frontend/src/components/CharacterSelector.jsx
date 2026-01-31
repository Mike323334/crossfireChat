import React from "react";

export default function CharacterSelector({ setCharacter }) {
  return (
    <div className="flex justify-center gap-4 md:gap-6 flex-wrap">
      <button
        onClick={() => setCharacter("Eva")}
        className="group bg-gradient-to-r from-primary to-red-600 text-white px-8 md:px-12 py-4 md:py-5 rounded-2xl shadow-2xl hover:shadow-primary/50 hover:scale-110 transition-all duration-300 font-semibold text-lg md:text-xl border border-white/20 backdrop-blur-sm relative overflow-hidden"
      >
        <span className="relative z-10 flex items-center gap-2">
          <span className="text-2xl">💃</span>
          <span>Eva Tramell</span>
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </button>
      <button
        onClick={() => setCharacter("Gideon")}
        className="group bg-gradient-to-r from-primary to-red-600 text-white px-8 md:px-12 py-4 md:py-5 rounded-2xl shadow-2xl hover:shadow-primary/50 hover:scale-110 transition-all duration-300 font-semibold text-lg md:text-xl border border-white/20 backdrop-blur-sm relative overflow-hidden"
      >
        <span className="relative z-10 flex items-center gap-2">
          <span className="text-2xl">👔</span>
          <span>Gideon Cross</span>
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </button>
    </div>
  );
}
