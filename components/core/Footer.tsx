import React from "react";

interface FooterProps {
  /** Vizual quruvchi uchun вЂ” ko'rsatiladigan matn */
  text?: string;
}

export const Footer = ({ text }: FooterProps) => {
  return (
    <footer className="w-full border-t border-slate-200 bg-white py-8 dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {text ?? `В© ${new Date().getFullYear()} AppNest. Barcha huquqlar himoyalangan.`}
        </p>
        <div className="mt-2 flex justify-center gap-4 text-sm">
          <span className="cursor-pointer text-brand transition hover:underline dark:text-blue-400">
            Privacy Policy
          </span>
          <span className="cursor-pointer text-brand transition hover:underline dark:text-blue-400">
            Terms of Service
          </span>
        </div>
      </div>
    </footer>
  );
};
