import React from 'react';

interface AlertProps {
  children: React.ReactNode;
  type?: 'success' | 'error';
}

export const Alert = ({ children, type = 'success' }: AlertProps) => {
  const styles = {
    success: "bg-green-100 text-green-800 border-green-200",
    error: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <div className={`p-4 rounded-xl border ${styles[type]} mb-4`}>
      {children}
    </div>
  );
};