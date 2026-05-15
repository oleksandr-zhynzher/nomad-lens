import { GitCompare, X } from "lucide-react";

interface CompareModeActionsProps {
  readonly active: boolean;
  readonly selectedCount: number;
  readonly minCount?: number;
  readonly enterLabel: string;
  readonly compareLabel: string;
  readonly exitLabel: string;
  readonly helperText?: string;
  readonly onEnter: () => void;
  readonly onExit: () => void;
  readonly onCompare: () => void;
}

export function CompareModeActions({
  active,
  selectedCount,
  minCount = 2,
  enterLabel,
  compareLabel,
  exitLabel,
  helperText,
  onEnter,
  onExit,
  onCompare,
}: CompareModeActionsProps) {
  if (!active) {
    return (
      <button
        type="button"
        onClick={onEnter}
        className="flex h-10 w-full shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-surface-4 bg-[#161616] px-3.5 text-[13px] font-medium whitespace-nowrap text-muted sm:w-auto"
      >
        <GitCompare size={15} aria-hidden />
        {enterLabel}
      </button>
    );
  }

  const canCompare = selectedCount >= minCount;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex w-full shrink-0 items-center justify-end gap-2 sm:w-auto">
        <button
          type="button"
          onClick={onCompare}
          disabled={!canCompare}
          className={`flex h-10 flex-1 items-center justify-center gap-1.5 rounded-md px-3.5 text-[13px] font-semibold whitespace-nowrap transition-all sm:flex-none ${
            !canCompare
              ? "cursor-default border border-accent-dim bg-[#161616] text-accent-dim"
              : "cursor-pointer border-0 bg-accent text-white"
          }`}
        >
          <GitCompare size={15} aria-hidden />
          {compareLabel}
          {selectedCount > 0 ? (
            <span
              className={`rounded-[10px] px-[7px] py-px text-xs ${
                !canCompare ? "bg-[rgba(143,90,60,0.2)]" : "bg-[rgba(255,255,255,0.25)]"
              }`}
            >
              {selectedCount}
            </span>
          ) : null}
        </button>
        <button
          type="button"
          onClick={onExit}
          className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-md border border-surface-4 bg-[#161616] text-dim"
          aria-label={exitLabel}
        >
          <X size={16} aria-hidden />
        </button>
      </div>
      {helperText != null ? <p className="text-xs text-dim">{helperText}</p> : null}
    </div>
  );
}
