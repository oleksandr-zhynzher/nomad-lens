import { X } from "lucide-react";
import { RegionPill } from "./RegionPill";

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
      style={{ cursor: onNavigate ? "pointer" : undefined }}
    >
      <div
        className="relative rounded-lg p-4 flex flex-col items-center gap-3"
        style={{ backgroundColor: "#1A1A1C", border: "1px solid #2E2E30", height: "100%" }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute top-3 right-3 flex items-center gap-1 transition-opacity hover:opacity-100"
          style={{
            opacity: 0.6,
            color: "#FFFFFF",
            fontFamily: "Inter, sans-serif",
            fontSize: "11px",
          }}
        >
          <X size={14} />
        </button>

        <img src={flagUrl} alt={countryName} className="rounded-full object-cover w-9 h-9" />

        <div className="flex items-center justify-center gap-1.5">
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "15px",
              fontWeight: 600,
              color: "#E8E9EB",
              textAlign: "center",
            }}
          >
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
