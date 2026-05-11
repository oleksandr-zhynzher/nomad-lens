interface PageHeroBannerProps {
  backgroundImage: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}

export function PageHeroBanner({
  backgroundImage,
  title,
  subtitle,
  children,
}: PageHeroBannerProps) {
  return (
    <div className="md:px-4 max-w-[1200px] mx-auto">
      <div
        className="relative mb-6 overflow-hidden md:mb-8 md:rounded-lg bg-[#0A0D12] bg-cover bg-center bg-no-repeat [background-image:var(--hero-bg-img)]"
        style={{ "--hero-bg-img": `url('${backgroundImage}')` } as React.CSSProperties}
      >
        <div className="absolute inset-0 [background:linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.85)_100%)]" />

        <div
          className={`relative flex flex-col justify-end px-4 py-4 md:px-12 md:py-12 ${children ? "min-h-[160px]" : "min-h-[120px]"}`}
        >
          <h1 className="text-3xl md:text-6xl font-semibold leading-[0.95] text-white mb-2 [font-family:Oswald,_sans-serif]">
            {title}
          </h1>

          <p
            className={`hidden md:block text-[15px] text-dim max-w-[580px] ${children ? "mb-5" : "mb-0"}`}
          >
            {subtitle}
          </p>

          {children && (
            <>
              <div className="hidden md:block w-32 h-0.5 bg-accent mb-4" />
              {children}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
