import type { ReactElement, ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface CollapsibleSectionProps {
  /** Unique key used for identifying the section (e.g. for aria). */
  readonly id: string;
  readonly icon: ReactElement;
  readonly label: string;
  /** Optional badge content shown between label and chevron. */
  readonly badge?: ReactNode;
  readonly isOpen: boolean;
  readonly onToggle: () => void;
  readonly children: ReactNode;
}

/**
 * A collapsible panel section with a 40-px header button, icon, uppercase label,
 * optional badge, and a chevron that rotates when closed.
 */
export function CollapsibleSection({
  id,
  icon,
  label,
  badge,
  isOpen,
  onToggle,
  children,
}: CollapsibleSectionProps) {
  const contentId = `section-content-${id}`;

  return (
    <div className="border-b border-[#242424]">
      <button
        type="button"
        className="button-hover-exempt weight-panel-group-button flex h-10 w-full items-center gap-2 bg-surface px-[14px]"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        {icon}
        <span className="flex-1 text-left text-[10px] font-semibold tracking-[1.5px] text-muted uppercase">
          {label}
        </span>
        {badge}
        <ChevronDown
          size={14}
          className={`shrink-0 text-dimmer transition-transform duration-150 ${isOpen ? "rotate-0" : "-rotate-90"}`}
        />
      </button>

      {isOpen ? <div id={contentId}>{children}</div> : null}
    </div>
  );
}
