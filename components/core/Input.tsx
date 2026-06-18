// components/core/Input.tsx
import React from 'react';

interface InputProps {
  label?: string;          // ? belgisi label ixtiyoriy ekanligini bildiradi
  placeholder?: string;
  onChange?: (e: any) => void;
  value?: string;
  type?: string;
  className?: string;
}

export const Input = ({ 
  label, 
  placeholder, 
  onChange, 
  value, 
  type = "text", 
  className = "" 
}: InputProps) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};