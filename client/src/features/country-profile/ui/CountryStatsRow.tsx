import type { ReactNode } from "react";
import { Building, MapPin, TrendingUp, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { regionKey } from "@core/utils";

interface CountryStatsRowProps {
  readonly finalScore: number | null;
  readonly rank: number | null;
  readonly population: number;
  readonly capital: string;
  readonly region: string;
}

function StatCard({ children }: { readonly children: ReactNode }) {
  return (
    <div className="flex flex-1 items-center justify-center gap-2.5 rounded-lg border border-[#1E1E1E] bg-[#111111] px-[18px] py-[14px]">
      {children}
    </div>
  );
}

export function CountryStatsRow({
  finalScore,
  rank,
  population,
  capital,
  region,
}: CountryStatsRowProps) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-2 gap-3 bg-bg py-6 md:flex md:items-center">
      <StatCard>
        <TrendingUp size={14} color="#8F5A3C" />
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[22px] font-bold text-[#C2956A]">
            {finalScore != null ? finalScore.toFixed(1) : "—"}
          </span>
          <span className="font-mono text-xs text-[#808080]">#{rank}</span>
        </div>
      </StatCard>
      <StatCard>
        <Users size={14} color="#5B8FA8" />
        <span className="font-mono text-[22px] font-bold text-[#E8E9EB]">
          {(population / 1_000_000).toFixed(1)}M
        </span>
      </StatCard>
      <StatCard>
        <Building size={14} color="#7A9B6B" />
        <span className="font-mono text-[18px] font-bold text-[#E8E9EB]">{capital}</span>
      </StatCard>
      <StatCard>
        <MapPin size={14} color="#C2956A" />
        <span className="font-mono text-[18px] font-bold text-[#E8E9EB]">
          {t(`regions.${regionKey(region)}`)}
        </span>
      </StatCard>
    </div>
  );
}
