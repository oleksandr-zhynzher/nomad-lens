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
      className="flex items-center border-b border-[#1C1C1C] py-4"
      style={{
        ...(highlight ? { backgroundColor: "#0D0D0F" } : {}),
        ...(gap ? { gap } : {}),
      }}
    >
      <div className="flex items-center gap-2.5 w-[160px] md:w-[240px] shrink-0">
        {Icon && <Icon size={16} style={{ color: iconColor ?? "#808080", flexShrink: 0 }} />}
        <span
          className="text-[13px] text-dim"
          style={{
            fontWeight: labelWeight,
            color: labelColor ?? undefined,
          }}
        >
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}
