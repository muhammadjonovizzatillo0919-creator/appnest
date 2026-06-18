import React from 'react';

export const Badge = ({ children, color = "blue" }: { children: React.ReactNode, color?: "blue" | "green" }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[color]}`}>
      {children}
    </span>
  );
};