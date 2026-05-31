import { regionKey, scoreColourClass } from "@core/utils";
import type { RegionStats } from "@features/compare/constants";
import { RegionPill } from "@features/compare/ui";
import { useTranslation } from "react-i18next";

import { RegionIcon } from "./RegionIcon";

interface RegionCardListProps {
  readonly regionStats: RegionStats[];
  readonly enabled: Set<string>;
  readonly onToggle: (name: string) => void;
}

export function RegionCardList({ regionStats, enabled, onToggle }: RegionCardListProps) {
  const { t } = useTranslation();
  return (
    <div className="flex [scrollbar-width:thin] gap-3 overflow-x-auto pb-2">
      {regionStats.map((r) => {
        const active = enabled.has(r.name);
        return (
          <div key={r.name} className="w-[148px] shrink-0 md:w-[180px]">
            <button
              onClick={() => {
                onToggle(r.name);
              }}
              className={`flex w-full cursor-pointer flex-col items-center gap-3 rounded-lg bg-transparent p-4 transition-all ${active ? "border border-[#2E2E30] opacity-100" : "border border-[#1C1C1C] opacity-45"}`}
            >
              <RegionIcon name={r.name} active={active} color={r.color} />
              <span
                className={`text-center text-[15px] font-semibold ${active ? "text-on-surface" : "text-dimmer"}`}
              >
                {t(`regions.${regionKey(r.name)}`)}
              </span>
              <span
                className={`[font-family:Oswald,_sans-serif] text-[32px] leading-none font-bold ${active ? scoreColourClass(r.overall, "text") : "text-[#757575]"}`}
              >
                {r.overall.toFixed(1)}
              </span>
              <RegionPill label={`${r.count} countries`} dimmed={!active} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
