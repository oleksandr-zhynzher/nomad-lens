import type { IconType } from "@features/indicator-catalog/constants";

export interface IndicatorCardProps {
  readonly Icon: IconType;
  readonly name: string;
  readonly description: string;
  readonly source: string;
  readonly weight: string;
}

export function IndicatorCard({ Icon, name, description, source, weight }: IndicatorCardProps) {
  return (
    <div className="flex flex-1 flex-col gap-3.5 rounded-md border border-[#1E1E20] bg-[#141416] p-6">
      {/* Header row: icon + title */}
      <div className="flex items-center gap-3">
        <Icon size={20} color="#8F5A3C" />
        <span className="text-base font-bold text-[#E8E9EB]">{name}</span>
      </div>

      {/* Description */}
      <div className="text-[13px] leading-[1.6] text-[#8A8A8A]">{description}</div>

      {/* Footer row: source badge + weight */}
      <div className="mt-auto flex items-center gap-2">
        <span className="rounded-[4px] border border-[#252525] bg-[#1A1A1A] px-2 py-[3px] text-[10px] text-[#8F5A3C]">
          {source}
        </span>
        <span className="text-[11px] text-[#3A3A3A]">{weight}</span>
      </div>
    </div>
  );
}
