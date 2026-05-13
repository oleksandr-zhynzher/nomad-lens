import type { ComponentType, SVGProps } from "react";

type IconType = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

export interface BudgetCategoryCardProps {
  readonly Icon: IconType;
  readonly name: string;
  readonly description: string;
  readonly source: string;
  readonly methodology: string;
  readonly color: string;
  readonly accentBorderClassName: string;
  readonly accentTextClassName: string;
}

export function BudgetCategoryCard({
  Icon,
  name,
  description,
  source,
  methodology,
  color,
  accentBorderClassName,
  accentTextClassName,
}: BudgetCategoryCardProps) {
  return (
    <div className="flex flex-1 flex-col gap-3.5 rounded-md border border-[#1E1E20] bg-[#141416] p-6">
      {/* Header row: icon + title */}
      <div className="flex items-center gap-3">
        <Icon size={20} color={color} />
        <span className="text-base font-bold text-[#E8E9EB]">{name}</span>
      </div>

      {/* Description */}
      <div className="text-[13px] leading-[1.6] text-[#8A8A8A]">{description}</div>

      {/* Methodology */}
      <div
        className={`border-l-2 pl-2.5 text-xs leading-[1.5] text-[#808080] ${accentBorderClassName}`}
      >
        {methodology}
      </div>

      {/* Footer: source badge */}
      <div className="mt-auto flex items-center gap-2">
        <span
          className={`rounded-[4px] border border-[#252525] bg-[#1A1A1A] px-2 py-[3px] text-[10px] ${accentTextClassName}`}
        >
          {source}
        </span>
      </div>
    </div>
  );
}
