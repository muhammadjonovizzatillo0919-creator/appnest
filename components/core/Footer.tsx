import React from "react";

export const Footer = () => {
  return (
    <footer className="mt-auto w-full border-t border-slate-200 bg-white py-8 dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          &copy; {new Date().getFullYear()} AppNest. Barcha huquqlar himoyalangan.
        </p>
        <div className="mt-2 flex justify-center gap-4 text-sm">
          <span className="cursor-pointer text-[#0057FF] transition hover:underline dark:text-blue-400">
            Privacy Policy
          </span>
          <span className="cursor-pointer text-[#0057FF] transition hover:underline dark:text-blue-400">
            Terms of Service
          </span>
        </div>
      </div>
    </footer>
  );
};
