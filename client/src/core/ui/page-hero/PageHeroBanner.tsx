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
    <div className="mx-auto max-w-[1200px] md:px-4">
      <div
        className="relative mb-6 overflow-hidden bg-[#0A0D12] [background-image:var(--hero-bg-img)] bg-cover bg-center bg-no-repeat md:mb-8 md:rounded-lg"
        style={{ "--hero-bg-img": `url('${backgroundImage}')` } as React.CSSProperties}
      >
        <div className="absolute inset-0 [background:linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.85)_100%)]" />

        <div
          className={`relative flex flex-col justify-end px-4 py-4 md:px-12 md:py-12 ${children ? "min-h-[160px]" : "min-h-[120px]"}`}
        >
          <h1 className="mb-2 [font-family:Oswald,_sans-serif] text-3xl leading-[0.95] font-semibold text-white md:text-6xl">
            {title}
          </h1>

          <p
            className={`hidden max-w-[580px] text-[15px] text-dim md:block ${children ? "mb-5" : "mb-0"}`}
          >
            {subtitle}
          </p>

          {children ? (
            <>
              <div className="mb-4 hidden h-0.5 w-32 bg-accent md:block" />
              {children}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
