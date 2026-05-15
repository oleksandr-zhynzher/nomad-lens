import type { ReactNode } from "react";

interface HeroStatsProps {
  readonly children: ReactNode;
}

export function HeroStats({ children }: HeroStatsProps) {
  return <div className="hero-stats-row hero-banner-stats">{children}</div>;
}
