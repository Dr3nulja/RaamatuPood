"use client";

import React from "react";

export default function SearchBar() {
  return (
    <div className="w-full max-w-xl">
      <input
        type="text"
        placeholder="Поиск книг..."
        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
}
