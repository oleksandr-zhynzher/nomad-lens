import type { ElementType, ReactNode } from "react";

interface HeroStatProps {
  readonly as?: ElementType;
  readonly value: ReactNode;
  readonly label: string;
  readonly [key: string]: unknown;
}

export function HeroStat({ as: Component = "div", value, label, ...rest }: HeroStatProps) {
  return (
    <Component className="min-w-0 no-underline" {...rest}>
      <div className="font-mono text-lg leading-none font-semibold text-accent-dim">{value}</div>
      <div className="mt-1 text-[10px] tracking-[1px] text-dimmest uppercase">{label}</div>
    </Component>
  );
}

export function HeroStatDivider() {
  return <div className="hero-stat-divider" />;
}
