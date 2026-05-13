import type { ComponentType } from "react";

interface Props {
  icon?: ComponentType<{ size?: number; className?: string }>;
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
      className={`flex items-center border-b border-[#1C1C1C] py-4 ${highlight ? "bg-[#0D0D0F]" : ""}`}
      style={gap ? ({ "--rs-gap": gap, gap: "var(--rs-gap)" } as React.CSSProperties) : undefined}
    >
      <div className="flex items-center gap-2.5 w-[160px] md:w-[240px] shrink-0">
        {Icon && (
          <span
            className="shrink-0 text-[var(--ic)]"
            style={{ "--ic": iconColor ?? "#808080" } as React.CSSProperties}
          >
            <Icon size={16} className="text-[var(--ic)]" />
          </span>
        )}
        <span
          className={`text-[13px] text-dim ${labelWeight ? "[font-weight:var(--fw)]" : ""} ${labelColor ? "text-[var(--lc)]" : ""}`}
          style={
            {
              ...(labelWeight ? { "--fw": labelWeight } : {}),
              ...(labelColor ? { "--lc": labelColor } : {}),
            } as React.CSSProperties
          }
        >
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}
