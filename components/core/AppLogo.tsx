// components/core/AppLogo.tsx
interface AppLogoProps {
  className?: string;
  /** Logo matnini ko'rsatish */
  showText?: boolean;
  /** Matn rangi — odatda `text-current` bilan merosxo'rlik oladi */
  textClassName?: string;
}

export const AppLogo = ({
  className = "",
  showText = true,
  textClassName = "text-current",
}: AppLogoProps) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logotipning blokli shakli (CSS orqali chizilgan — fayl kerak emas) */}
      <span className="relative block h-8 w-8 shrink-0" aria-hidden="true">
        <span className="absolute left-2 top-0 h-4 w-4 rounded-sm bg-[#0057FF]" />
        <span className="absolute left-0 top-3 h-4 w-4 rounded-sm bg-[#00D287]" />
        <span className="absolute left-4 top-3 h-4 w-4 rounded-sm bg-blue-800" />
      </span>
      {showText && (
        <span className={`text-xl font-bold tracking-tight ${textClassName}`}>AppNest</span>
      )}
    </div>
  );
};
