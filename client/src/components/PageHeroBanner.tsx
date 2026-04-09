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
    <div className="md:px-4" style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <div
        className="relative mb-6 overflow-hidden md:mb-8 md:rounded-lg"
        style={{
          background: "#0A0D12",
          backgroundImage: `url('${backgroundImage}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.85) 100%)",
          }}
        />

        <div
          className="relative flex flex-col justify-end px-4 py-4 md:px-12 md:py-12"
          style={{ minHeight: children ? "160px" : "120px" }}
        >
          <h1
            className="text-3xl md:text-6xl"
            style={{
              fontFamily: "Oswald, sans-serif",
              fontWeight: 700,
              lineHeight: "0.95",
              color: "#FFFFFF",
              marginBottom: "8px",
            }}
          >
            {title}
          </h1>

          <p
            className="hidden md:block"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "15px",
              color: "#8A8A8A",
              maxWidth: "580px",
              marginBottom: children ? "20px" : 0,
            }}
          >
            {subtitle}
          </p>

          {children && (
            <>
              <div
                className="hidden md:block"
                style={{
                  width: "128px",
                  height: "2px",
                  backgroundColor: "var(--color-accent)",
                  marginBottom: "16px",
                }}
              />
              {children}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
