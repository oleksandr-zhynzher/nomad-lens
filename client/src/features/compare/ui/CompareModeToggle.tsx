import { Flag, Globe, Plane, Wallet, Palmtree } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { CompareMode } from "@features/compare/utils";

interface CompareModeToggleProps {
  readonly compareMode: CompareMode;
  readonly onCompareMode: (mode: CompareMode) => void;
}

export function CompareModeToggle({ compareMode, onCompareMode }: CompareModeToggleProps) {
  const { t } = useTranslation();
  const pill = (mode: CompareMode, icon: React.ReactNode, label: string) => (
    <button
      onClick={() => {
        onCompareMode(mode);
      }}
      className={`flex min-w-0 flex-1 basis-1/5 items-center justify-center gap-1.5 rounded px-3 py-2 text-xs transition-colors sm:px-4 sm:py-1.5 ${compareMode === mode ? "bg-accent font-medium text-white" : "bg-transparent font-normal text-dim"}`}
    >
      {icon}
      {label}
    </button>
  );
  return (
    <div className="w-full rounded-md border border-[#252525] bg-[#1A1A1A] p-1 sm:w-auto">
      <div className="flex w-full gap-1">
        {pill("countries", <Flag size={14} className="shrink-0" />, t("compare.countries"))}
        {pill("regions", <Globe size={16} className="shrink-0" />, t("compare.regions"))}
        {pill("nomadVisas", <Plane size={14} className="shrink-0" />, t("compare.nomadVisas"))}
        {pill("budget", <Wallet size={14} className="shrink-0" />, t("compare.budget", "Budget"))}
        {pill(
          "tourism",
          <Palmtree size={14} className="shrink-0" />,
          t("compare.tourism", "Tourism"),
        )}
      </div>
    </div>
  );
}
