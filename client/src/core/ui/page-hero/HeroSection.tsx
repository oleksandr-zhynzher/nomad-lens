import type React from "react";

interface HeroSectionProps {
  readonly backgroundImage: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly subtitle: string;
  readonly children?: React.ReactNode;
}

export function HeroSection({ backgroundImage, title, subtitle, children }: HeroSectionProps) {
  return (
    <div
      className={`relative w-full overflow-hidden bg-[#0F1114] ${children != null ? "min-h-[240px] md:min-h-[280px]" : "h-[120px] md:h-[180px]"}`}
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-[image:var(--hero-bg)] bg-cover bg-center"
        style={{ "--hero-bg": `url(${backgroundImage})` } as React.CSSProperties}
      />

      {/* Gradient overlay: transparent top → opaque dark bottom */}
      <div className="absolute inset-0 [background:linear-gradient(180deg,#0D0D0F00_0%,#0D0D0FBB_60%,#0D0D0FFF_100%)]" />

      {/* Text content */}
      <div
        className={`absolute inset-0 flex flex-col gap-[10px] px-4 md:px-12 ${children != null ? "justify-end pb-6" : "justify-center"}`}
      >
        <h1 className="m-0 [font-family:Oswald,_sans-serif] text-3xl leading-none font-bold text-on-surface md:text-[56px]">
          {title}
        </h1>
        <p className="m-0 hidden text-[15px] text-muted md:block">{subtitle}</p>
        {children != null ? (
          <>
            {/* Copper rule */}
            <div className="mt-2 mb-3 hidden h-0.5 w-32 bg-accent md:block" />
            {/* Stats row */}
            {children}
          </>
        ) : null}
      </div>
    </div>
  );
}
