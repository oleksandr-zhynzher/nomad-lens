interface HeroSectionProps {
  backgroundImage: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}

export function HeroSection({
  backgroundImage,
  title,
  subtitle,
  children,
}: HeroSectionProps) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        backgroundColor: "#0F1114",
        overflow: "hidden",
      }}
      className={
        children ? "min-h-[240px] md:min-h-[280px]" : "h-[120px] md:h-[180px]"
      }
    >
      {/* Background image */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Gradient overlay: transparent top → opaque dark bottom */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, #0D0D0F00 0%, #0D0D0FBB 60%, #0D0D0FFF 100%)",
        }}
      />

      {/* Text content */}
      <div
        className="px-4 md:px-12"
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: children ? "flex-end" : "center",
          gap: "10px",
          paddingBottom: children ? "24px" : undefined,
        }}
      >
        <h1
          className="text-3xl md:text-[56px]"
          style={{
            fontFamily: "Oswald, sans-serif",
            fontWeight: 700,
            color: "#E8E9EB",
            margin: 0,
            lineHeight: 1,
          }}
        >
          {title}
        </h1>
        <p
          className="hidden md:block"
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "15px",
            color: "#9E9E9E",
            margin: 0,
          }}
        >
          {subtitle}
        </p>
        {children && (
          <>
            {/* Copper rule */}
            <div
              className="hidden md:block"
              style={{
                width: "128px",
                height: "2px",
                backgroundColor: "var(--color-accent)",
                marginTop: "8px",
                marginBottom: "12px",
              }}
            />
            {/* Stats row */}
            {children}
          </>
        )}
      </div>
    </div>
  );
}
