import React from 'react';

export const Footer = () => {
  return (
    <footer className="w-full bg-white border-t border-gray-200 mt-20 py-8">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <p className="text-gray-500 text-sm">
          © 2026 AppNest. Barcha huquqlar himoyalangan.
        </p>
        <div className="flex justify-center gap-4 mt-2">
          <span className="text-blue-600 text-sm cursor-pointer hover:underline">Privacy Policy</span>
          <span className="text-blue-600 text-sm cursor-pointer hover:underline">Terms of Service</span>
        </div>
      </div>
    </footer>
  );
};