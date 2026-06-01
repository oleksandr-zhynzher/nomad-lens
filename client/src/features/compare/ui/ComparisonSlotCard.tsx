import { X } from "lucide-react";
import { Link } from "react-router-dom";

import { RegionPill } from "./RegionPill";

interface ComparisonSlotCardProps {
  readonly flagUrl: string;
  readonly countryName: string;
  readonly onRemove: () => void;
  readonly removeLabel: string;
  readonly to?: string;
  readonly regionLabel: string;
  readonly nameSuffix?: React.ReactNode;
  readonly children?: React.ReactNode;
}

export function ComparisonSlotCard({
  flagUrl,
  countryName,
  onRemove,
  removeLabel,
  to,
  regionLabel,
  nameSuffix,
  children,
}: ComparisonSlotCardProps) {
  const content = (
    <>
      <img src={flagUrl} alt={countryName} className="size-9 rounded-full object-cover" />

      <div className="flex items-center justify-center gap-1.5">
        <span className="text-center text-[15px] font-semibold text-on-surface">{countryName}</span>
        {nameSuffix}
      </div>

      {children}

      <RegionPill label={regionLabel} />
    </>
  );

  return (
    <div>
      <div className="relative flex h-full flex-col items-center gap-3 rounded-lg border border-[#2E2E30] bg-surface p-4">
        {to === undefined ? (
          content
        ) : (
          <Link
            to={to}
            className="flex h-full w-full flex-col items-center gap-3 rounded no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            {content}
          </Link>
        )}
        <button
          type="button"
          aria-label={removeLabel}
          onClick={onRemove}
          className="absolute top-3 right-3 flex items-center gap-1 text-[11px] text-white opacity-60 transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <X size={14} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
