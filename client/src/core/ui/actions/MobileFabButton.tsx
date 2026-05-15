import type { ReactNode } from "react";

interface MobileFabButtonProps {
  readonly label: string;
  readonly ariaLabel?: string;
  readonly icon: ReactNode;
  readonly onClick: () => void;
}

export function MobileFabButton({ label, ariaLabel, icon, onClick }: MobileFabButtonProps) {
  return (
    <button
      type="button"
      className="fixed right-4 z-40 flex h-12 cursor-pointer items-center gap-2 rounded-full border-0 bg-accent pr-[18px] pl-4 text-sm font-semibold text-white shadow-lg md:hidden"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 20px)" }}
      onClick={onClick}
      aria-label={ariaLabel ?? label}
    >
      {icon}
      {label}
    </button>
  );
}
