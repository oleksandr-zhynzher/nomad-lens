interface PageHeroBannerProps {
  backgroundImage: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}

export function PageHeroBanner({
  backgroundImage,
  eyebrow,
  title,
  subtitle,
  children,
}: PageHeroBannerProps) {
  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 16px" }}>
      <div
        className="relative mb-6 md:mb-8 overflow-hidden rounded-lg"
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
          <div className="flex items-center gap-2 mb-2 md:mb-3 flex-wrap">
            {eyebrow.split("·").map((word, index) => (
              <span
                key={`${word}-${index}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span
                  style={{
                    width: "4px",
                    height: "4px",
                    borderRadius: "50%",
                    backgroundColor: "var(--color-accent-dim)",
                    flexShrink: 0,
                    display: "inline-block",
                  }}
                />
                <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "11px",
                    fontWeight: 500,
                    letterSpacing: "2.5px",
                    textTransform: "uppercase",
                    color: "var(--color-accent-dim)",
                    lineHeight: 1,
                  }}
                >
                  {word.trim()}
                </span>
              </span>
            ))}
          </div>

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
