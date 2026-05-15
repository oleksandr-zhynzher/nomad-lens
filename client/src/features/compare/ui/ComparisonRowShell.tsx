import type { ComponentType } from "react";

interface ComparisonRowShellProps {
  readonly icon?: ComponentType<{ size?: number; className?: string }>;
  readonly iconColor?: string;
  readonly label: string;
  readonly labelWeight?: number;
  readonly labelColor?: string;
  readonly highlight?: boolean;
  readonly gap?: string;
  readonly children: React.ReactNode;
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
}: ComparisonRowShellProps) {
  return (
    <div
      className={`flex items-center border-b border-[#1C1C1C] py-4 ${highlight === true ? "bg-[#0D0D0F]" : ""}`}
      style={
        gap !== undefined
          ? ({ "--rs-gap": gap, gap: "var(--rs-gap)" } as React.CSSProperties)
          : undefined
      }
    >
      <div className="flex w-[160px] shrink-0 items-center gap-2.5 md:w-[240px]">
        {Icon ? (
          <span
            className="shrink-0 text-[var(--ic)]"
            style={{ "--ic": iconColor ?? "#808080" } as React.CSSProperties}
          >
            <Icon size={16} className="text-[var(--ic)]" />
          </span>
        ) : null}
        <span
          className={`text-[13px] text-dim ${labelWeight !== undefined ? "[font-weight:var(--fw)]" : ""} ${labelColor !== undefined ? "text-[var(--lc)]" : ""}`}
          style={
            {
              ...(labelWeight !== undefined ? { "--fw": labelWeight } : {}),
              ...(labelColor !== undefined ? { "--lc": labelColor } : {}),
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
