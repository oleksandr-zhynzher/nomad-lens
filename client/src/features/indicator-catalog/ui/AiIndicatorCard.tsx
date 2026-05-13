import type { IconType } from "@features/indicator-catalog/constants";

export interface AiIndicatorCardProps {
  readonly Icon: IconType;
  readonly name: string;
  readonly description: string;
  readonly source: string;
  readonly subIndicators: readonly string[];
}

export function AiIndicatorCard({
  Icon,
  name,
  description,
  source,
  subIndicators,
}: AiIndicatorCardProps) {
  return (
    <div className="flex flex-1 flex-col gap-3.5 rounded-md border border-[#1E1E20] bg-[#141416] p-6">
      {/* Header row: icon + title + AI badge */}
      <div className="flex items-center gap-3">
        <Icon size={20} color="#C084FC" />
        <span className="text-base font-bold text-[#E8E9EB]">{name}</span>
        <span className="rounded-[4px] bg-[rgba(192,132,252,0.12)] px-[5px] py-px text-[9px] leading-4 font-semibold tracking-[0.5px] text-[#C084FC]">
          AI
        </span>
      </div>

      {/* Description */}
      <div className="text-[13px] leading-[1.6] text-[#8A8A8A]">{description}</div>

      {/* Sub-indicators */}
      {subIndicators.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] tracking-[0.5px] text-[#808080] uppercase">
            Sub-indicators
          </span>
          <div className="flex flex-wrap gap-1.5">
            {subIndicators.map((sub) => (
              <span
                key={sub}
                className="rounded-[4px] border border-[rgba(192,132,252,0.15)] bg-[rgba(192,132,252,0.06)] px-2 py-0.5 text-[10px] text-[#C084FC]"
              >
                {sub}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {/* Footer: source badge */}
      <div className="mt-auto flex items-center gap-2">
        <span className="rounded-[4px] border border-[#252525] bg-[#1A1A1A] px-2 py-[3px] text-[10px] text-[#C084FC]">
          {source}
        </span>
        <span className="text-[11px] text-[#3A3A3A]">AI metric — off by default</span>
      </div>
    </div>
  );
}
