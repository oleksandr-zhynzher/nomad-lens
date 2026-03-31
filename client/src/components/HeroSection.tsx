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
        height: "180px",
        backgroundColor: "#0F1114",
        overflow: "hidden",
      }}
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
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "10px",
          padding: "0 48px",
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
          style={{
            fontFamily: "Anton, sans-serif",
            fontSize: "56px",
            fontWeight: "normal",
            color: "#E8E9EB",
            margin: 0,
            lineHeight: 1,
          }}
        >
          {title}
        </h1>
        <p
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
