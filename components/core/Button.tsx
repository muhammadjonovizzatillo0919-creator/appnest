import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  onClick?: () => void;
}

export const Button = ({ children, variant = "primary", onClick }: ButtonProps) => {
  const base = "px-6 py-2 rounded-lg font-medium transition-all duration-300";
  const variants = {
    primary: "bg-[#0057FF] text-white hover:bg-blue-700",
    secondary: "bg-[#00D287] text-white hover:bg-green-600",
  };

  return (
    <button onClick={onClick} className={`${base} ${variants[variant]}`}>
      {children}
    </button>
  );
};