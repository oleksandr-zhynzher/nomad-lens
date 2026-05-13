import { X } from "lucide-react";
import { RegionPill } from "@features/compare/ui";

interface Props {
  flagUrl: string;
  countryName: string;
  onRemove: () => void;
  onNavigate?: () => void;
  regionLabel: string;
  nameSuffix?: React.ReactNode;
  children?: React.ReactNode;
}

export function ComparisonSlotCard({
  flagUrl,
  countryName,
  onRemove,
  onNavigate,
  regionLabel,
  nameSuffix,
  children,
}: Props) {
  return (
    <div
      onClick={onNavigate}
      onKeyDown={
        onNavigate
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onNavigate();
              }
            }
          : undefined
      }
      role={onNavigate ? "link" : undefined}
      tabIndex={onNavigate ? 0 : undefined}
      className={onNavigate ? "cursor-pointer" : ""}
    >
      <div className="relative rounded-lg p-4 flex flex-col items-center gap-3 bg-surface border border-[#2E2E30] h-full">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute top-3 right-3 flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity text-white text-[11px]"
        >
          <X size={14} />
        </button>

        <img src={flagUrl} alt={countryName} className="rounded-full object-cover w-9 h-9" />

        <div className="flex items-center justify-center gap-1.5">
          <span className="text-[15px] font-semibold text-on-surface text-center">
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
