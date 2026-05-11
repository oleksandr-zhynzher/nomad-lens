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
    <div style={{ borderBottom: "1px solid #242424" }}>
      <button
        type="button"
        className="button-hover-exempt weight-panel-group-button w-full flex items-center"
        style={{ height: "40px", padding: "0 14px", gap: "8px", backgroundColor: "#1A1A1A" }}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        {icon}
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            color: "#9E9E9E",
            flex: 1,
            textAlign: "left",
          }}
        >
          {label}
        </span>
        {badge}
        <ChevronDown
          size={14}
          style={{
            color: "#808080",
            transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
            transition: "transform 0.15s ease",
            flexShrink: 0,
          }}
        />
      </button>

      {isOpen && <div id={contentId}>{children}</div>}
    </div>
  );
}
