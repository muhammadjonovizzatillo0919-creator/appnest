// components/core/Loading.tsx
import React from 'react';

export const Loading = () => {
  return (
    <div className="flex justify-center items-center py-10 w-full h-full">
      <div className="flex flex-col items-center">
        {/* Aylanuvchi spinner */}
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
        
        {/* Yuklanmoqda yozuvi */}
        <span className="mt-4 text-gray-500 font-medium animate-pulse">
          Ma'lumotlar yuklanmoqda...
        </span>
      </div>
    </div>
  );
};