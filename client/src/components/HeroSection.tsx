interface HeroSectionProps {
  backgroundImage: string;
  eyebrow: string;
  title: string;
  subtitle: string;
}

export function HeroSection({ backgroundImage, eyebrow, title, subtitle }: HeroSectionProps) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        backgroundColor: "#0F1114",
        overflow: "hidden",
      }}
      className="h-[120px] md:h-[180px]"
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
          justifyContent: "center",
          gap: "10px",
        }}
      >
        <span
          style={{
            fontFamily: "Geist, sans-serif",
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "2px",
            color: "#8F5A3C",
            textTransform: "uppercase",
          }}
        >
          {eyebrow}
        </span>
        <h1
          className="text-3xl md:text-[56px]"
          style={{
            fontFamily: "Anton, sans-serif",
            fontWeight: "normal",
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
            color: "#888888",
            margin: 0,
          }}
        >
          {subtitle}
        </p>
      </div>
    </div>
  );
}
