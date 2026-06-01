import { Tooltip } from "@core/ui/Tooltip";
import { ChevronDown, ChevronUp, Filter, List } from "lucide-react";

interface SearchMatchControlsProps {
  /** "filter" hides non-matches; "highlight" scrolls to each match */
  readonly mode: "filter" | "highlight";
  readonly matchCount: number;
  readonly cursor: number;
  readonly onPrev: () => void;
  readonly onNext: () => void;
  readonly onModeChange: (mode: "filter" | "highlight") => void;
  /** Tooltip label when in filter mode, explaining what switching will do */
  readonly scrollModeTooltip: string;
  /** Tooltip label when in highlight mode, explaining what switching will do */
  readonly filterModeTooltip: string;
  readonly prevLabel: string;
  readonly nextLabel: string;
  readonly switchToScrollLabel: string;
  readonly switchToFilterLabel: string;
  readonly navButtonClassName?: string;
}

export function SearchMatchControls({
  mode,
  matchCount,
  cursor,
  onPrev,
  onNext,
  onModeChange,
  scrollModeTooltip,
  filterModeTooltip,
  prevLabel,
  nextLabel,
  switchToScrollLabel,
  switchToFilterLabel,
  navButtonClassName = "flex size-6 cursor-pointer items-center justify-center rounded-[3px] border-0 bg-surface-4 text-tertiary disabled:opacity-40",
}: SearchMatchControlsProps) {
  const hasMatches = matchCount > 0;
  return (
    <div className="flex shrink-0 items-center gap-1">
      {mode === "highlight" ? (
        <>
          <span className="min-w-9 text-right font-mono text-[11px] text-dim">
            {hasMatches ? `${cursor + 1}/${matchCount}` : "0/0"}
          </span>
          <button
            onClick={onPrev}
            disabled={!hasMatches}
            className={navButtonClassName}
            aria-label={prevLabel}
          >
            <ChevronUp size={14} />
          </button>
          <button
            onClick={onNext}
            disabled={!hasMatches}
            className={navButtonClassName}
            aria-label={nextLabel}
          >
            <ChevronDown size={14} />
          </button>
        </>
      ) : null}
      <Tooltip
        side="bottom"
        content={<span>{mode === "filter" ? scrollModeTooltip : filterModeTooltip}</span>}
      >
        <button
          onClick={() => {
            onModeChange(mode === "filter" ? "highlight" : "filter");
          }}
          className="flex size-6 cursor-pointer items-center justify-center rounded-[3px] border-0 bg-surface-4 text-muted"
          aria-label={mode === "filter" ? switchToScrollLabel : switchToFilterLabel}
        >
          {mode === "filter" ? <List size={13} /> : <Filter size={13} />}
        </button>
      </Tooltip>
    </div>
  );
}
