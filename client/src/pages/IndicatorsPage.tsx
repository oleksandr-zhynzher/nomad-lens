import { InfoPageHeader } from "../components/InfoPageHeader";
import { HeroSection } from "../components/HeroSection";

export function IndicatorsPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0D0D0F" }}>
      <InfoPageHeader activePage="indicators" />
      <HeroSection
        backgroundImage="/images/generated-1774980841973.png"
        eyebrow="REFERENCE"
        title="INDICATORS"
        subtitle="How each score is calculated — data sources, methodology, and weighting."
      />
      <div style={{ color: "#E8E9EB", padding: "40px" }}>
        <p>Cards coming soon</p>
      </div>
    </div>
  );
}
