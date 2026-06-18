// components/core/Toast.tsx
import React from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
}

export const Toast = ({ message, type = 'success' }: ToastProps) => {
  // Rangni turiga qarab tanlaymiz
  const bgColor = type === 'success' ? 'bg-green-600' : 'bg-red-600';

  return (
    <div className={`fixed bottom-5 right-5 ${bgColor} text-white px-6 py-4 rounded-xl shadow-2xl z-[9999] flex items-center transition-all duration-300 animate-fade-in`}>
      <span className="font-semibold">{message}</span>
    </div>
  );
};