import { RegionPill } from "@features/compare/ui";
import { X } from "lucide-react";

interface ComparisonSlotCardProps {
  readonly flagUrl: string;
  readonly countryName: string;
  readonly onRemove: () => void;
  readonly onNavigate?: () => void;
  readonly regionLabel: string;
  readonly nameSuffix?: React.ReactNode;
  readonly children?: React.ReactNode;
}

export function ComparisonSlotCard({
  flagUrl,
  countryName,
  onRemove,
  onNavigate,
  regionLabel,
  nameSuffix,
  children,
}: ComparisonSlotCardProps) {
  return (
    <div
      {...(onNavigate
        ? {
            onClick: onNavigate,
            onKeyDown: (e: React.KeyboardEvent) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onNavigate();
              }
            },
            role: "link" as const,
            tabIndex: 0,
          }
        : {})}
      className={onNavigate ? "cursor-pointer" : ""}
    >
      <div className="relative flex h-full flex-col items-center gap-3 rounded-lg border border-[#2E2E30] bg-surface p-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute top-3 right-3 flex items-center gap-1 text-[11px] text-white opacity-60 transition-opacity hover:opacity-100"
        >
          <X size={14} />
        </button>

        <img src={flagUrl} alt={countryName} className="h-9 w-9 rounded-full object-cover" />

        <div className="flex items-center justify-center gap-1.5">
          <span className="text-center text-[15px] font-semibold text-on-surface">
            {countryName}
          </span>
          {nameSuffix}
        </div>

        {children}

        <RegionPill label={regionLabel} />
      </div>
    </div>
  );
}
