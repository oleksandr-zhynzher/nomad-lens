import type { ComponentType } from "react";

interface Props {
  icon?: ComponentType<{ size?: number; style?: React.CSSProperties }>;
  iconColor?: string;
  label: string;
  labelWeight?: number;
  labelColor?: string;
  highlight?: boolean;
  gap?: string;
  children: React.ReactNode;
}

export function ComparisonRowShell({
  icon: Icon,
  iconColor,
  label,
  labelWeight,
  labelColor,
  highlight,
  gap,
  children,
}: Props) {
  return (
    <div
      className="flex items-center"
      style={{
        borderBottom: "1px solid #1C1C1C",
        padding: "16px 0",
        ...(highlight ? { backgroundColor: "#0D0D0F" } : {}),
        ...(gap ? { gap } : {}),
      }}
    >
      <div className="flex items-center gap-2.5 w-[160px] md:w-[240px] shrink-0">
        {Icon && <Icon size={16} style={{ color: iconColor ?? "#808080", flexShrink: 0 }} />}
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "13px",
            fontWeight: labelWeight,
            color: labelColor ?? "#8A8A8A",
          }}
        >
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}
