import { useTranslation } from "react-i18next";

interface TourismTotalCardProps {
  readonly totalDaily: number;
}

export function TourismTotalCard({ totalDaily }: TourismTotalCardProps) {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-[102px] flex-col justify-between rounded-[10px] border border-[#2B313A] bg-[#0C0F13] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-[8px] border border-[#3C4F3F] bg-[#161A20] font-mono text-xs font-bold text-[#58C26D]">
          Σ
        </span>
        <span className="font-mono text-[17px] leading-none font-bold text-[#58C26D]">
          ${totalDaily}
        </span>
      </div>
      <div className="mt-2 text-[10px] font-semibold tracking-[0.8px] text-[#8E96A3] uppercase">
        {t("tourismBudget.total", "Total")}
      </div>
      <div className="mt-2 h-[5px] overflow-hidden rounded-full bg-[#232A33]">
        <div className="h-full w-full rounded-full bg-[#58C26D]" />
      </div>
    </div>
  );
}

interface TourismSurplusCardProps {
  readonly surplus: number;
}

export function TourismSurplusCard({ surplus }: TourismSurplusCardProps) {
  const { t } = useTranslation();
  const pos = surplus >= 0;
  return (
    <div
      className={`flex min-h-[102px] flex-col justify-between rounded-[10px] bg-[#0C0F13] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] ${pos ? "border border-[#2D6E3A]" : "border border-[#6C3A2D]"}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={`inline-flex h-7 w-7 items-center justify-center rounded-[8px] font-mono text-xs font-bold ${pos ? "border border-[#2D6E3A] bg-[#17301D] text-[#58C26D]" : "border border-[#6C3A2D] bg-[#321A16] text-[#FF7A59]"}`}
        >
          {pos ? "+" : "-"}
        </span>
        <span
          className={`font-mono text-[17px] leading-none font-bold ${pos ? "text-[#58C26D]" : "text-[#FF7A59]"}`}
        >
          {pos ? "+" : "-"}${Math.abs(surplus)}
        </span>
      </div>
      <div className="mt-2 text-[10px] font-semibold tracking-[0.8px] text-[#8E96A3] uppercase">
        {t("tourismBudget.surplus", "surplus")}
      </div>
      <div className="mt-2 h-[5px] overflow-hidden rounded-full bg-[#232A33]">
        <div className={`h-full w-full rounded-full ${pos ? "bg-[#58C26D]" : "bg-[#FF7A59]"}`} />
      </div>
    </div>
  );
}
