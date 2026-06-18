// components/core/AppLogo.tsx
export const AppLogo = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logotipning blokli shakli (CSS orqali chizilgan) */}
      <div className="relative w-8 h-8">
        <div className="absolute top-0 left-2 w-4 h-4 bg-blue-500 rounded-sm"></div>
        <div className="absolute top-3 left-0 w-4 h-4 bg-cyan-400 rounded-sm"></div>
        <div className="absolute top-3 left-4 w-4 h-4 bg-blue-700 rounded-sm"></div>
      </div>
      <span className="text-xl font-bold tracking-tight text-white">AppNest</span>
    </div>
  );
};