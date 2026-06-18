'use client';
import React, { useState } from 'react';

export const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  const toggle = () => {
    setIsDark(!isDark);
    // Biz 'dark' klassi o'rniga 'dark-mode' klassini ishlatamiz
    document.body.classList.toggle('dark-mode');
  };

  return (
    <button 
      onClick={toggle}
      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
};