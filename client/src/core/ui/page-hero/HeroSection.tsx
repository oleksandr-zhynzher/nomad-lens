import React from "react";

interface HeroSectionProps {
  backgroundImage: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}

export function HeroSection({ backgroundImage, title, subtitle, children }: HeroSectionProps) {
  return (
    <div
      className={`relative w-full bg-[#0F1114] overflow-hidden ${children ? "min-h-[240px] md:min-h-[280px]" : "h-[120px] md:h-[180px]"}`}
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-[image:var(--hero-bg)]"
        style={{ "--hero-bg": `url(${backgroundImage})` } as React.CSSProperties}
      />

      {/* Gradient overlay: transparent top → opaque dark bottom */}
      <div className="absolute inset-0 [background:linear-gradient(180deg,#0D0D0F00_0%,#0D0D0FBB_60%,#0D0D0FFF_100%)]" />

      {/* Text content */}
      <div
        className={`px-4 md:px-12 absolute inset-0 flex flex-col gap-[10px] ${children ? "justify-end pb-6" : "justify-center"}`}
      >
        <h1 className="text-3xl md:text-[56px] font-bold text-on-surface m-0 leading-none [font-family:Oswald,_sans-serif]">
          {title}
        </h1>
        <p className="hidden md:block text-[15px] text-muted m-0">{subtitle}</p>
        {children && (
          <>
            {/* Copper rule */}
            <div className="hidden md:block w-32 h-0.5 bg-accent mt-2 mb-3" />
            {/* Stats row */}
            {children}
          </>
        )}
      </div>
    </div>
  );
}
