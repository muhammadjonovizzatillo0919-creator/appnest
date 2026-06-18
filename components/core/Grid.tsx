import React from 'react';

export const Grid = ({ children, cols = 3 }: { children: React.ReactNode, cols?: number }) => {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  }[cols] || "grid-cols-3";

  return (
    <div className={`grid gap-6 ${gridCols}`}>
      {children}
    </div>
  );
};