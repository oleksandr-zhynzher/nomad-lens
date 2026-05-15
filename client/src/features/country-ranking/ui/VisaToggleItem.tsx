import { Info } from "lucide-react";
import { Tooltip } from "@core/ui";
import { ToggleSwitch } from "@features/country-ranking/ui";

interface VisaToggleItemProps {
  readonly label: string;
  readonly tooltipTitle: string;
  readonly tooltipDesc: string;
  readonly checked: boolean;
  readonly onChange: (checked: boolean) => void;
}

export function VisaToggleItem({
  label,
  tooltipTitle,
  tooltipDesc,
  checked,
  onChange,
}: VisaToggleItemProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-tertiary">{label}</span>
        <Tooltip
          content={
            <div>
              <div className="mb-2 font-semibold text-white">{tooltipTitle}</div>
              <div>{tooltipDesc}</div>
            </div>
          }
          side="top"
        >
          <Info size={14} color="#FFFFFF" className="shrink-0 cursor-pointer opacity-60" />
        </Tooltip>
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} ariaLabel={label} />
    </div>
  );
}
