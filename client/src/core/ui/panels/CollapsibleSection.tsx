import type { ReactElement, ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface CollapsibleSectionProps {
  /** Unique key used for identifying the section (e.g. for aria). */
  id: string;
  icon: ReactElement;
  label: string;
  /** Optional badge content shown between label and chevron. */
  badge?: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
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
        className="button-hover-exempt weight-panel-group-button w-full flex items-center h-10 px-[14px] gap-2 bg-surface"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        {icon}
        <span className="text-[10px] font-semibold tracking-[1.5px] uppercase text-muted flex-1 text-left">
          {label}
        </span>
        {badge}
        <ChevronDown
          size={14}
          className={`text-dimmer shrink-0 transition-transform duration-150 ${isOpen ? "rotate-0" : "-rotate-90"}`}
        />
      </button>

      {isOpen && <div id={contentId}>{children}</div>}
    </div>
  );
}
