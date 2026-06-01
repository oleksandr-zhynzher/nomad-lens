interface PageHeroBannerProps {
  readonly backgroundImage: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly subtitle: string;
  readonly children?: React.ReactNode;
}

export function PageHeroBanner({
  backgroundImage,
  eyebrow,
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
          className={`relative flex flex-col justify-end px-4 py-4 md:px-12 md:py-12 ${children != null ? "min-h-[160px]" : "min-h-[120px]"}`}
        >
          {eyebrow !== "" ? (
            <div className="mb-2 flex items-center gap-2 md:mb-3">
              {eyebrow.split("·").map((word) => (
                <span key={word.trim()} className="flex items-center gap-2">
                  <span className="relative inline-block size-1 shrink-0 rounded-full bg-accent-dim" />
                  <span className="text-[11px] leading-none font-medium tracking-[2.5px] text-accent-dim uppercase">
                    {word.trim()}
                  </span>
                </span>
              ))}
            </div>
          ) : null}
          <h1 className="mb-2 [font-family:Oswald,_sans-serif] text-3xl leading-[0.95] font-semibold text-white md:text-6xl">
            {title}
          </h1>

          <p
            className={`hidden max-w-[580px] text-[15px] text-dim md:block ${children != null ? "mb-5" : "mb-0"}`}
          >
            {subtitle}
          </p>

          {children != null ? (
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
