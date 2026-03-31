import { InfoPageHeader } from "../components/InfoPageHeader";
import { HeroSection } from "../components/HeroSection";

export function DataSourcesPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0D0D0F" }}>
      <InfoPageHeader activePage="data-sources" />
      <HeroSection
        backgroundImage="/images/generated-1774980841973.png"
        eyebrow="REFERENCE"
        title="DATA SOURCES"
        subtitle="Transparent methodology — every score is traceable to its origin."
      />
      <div style={{ color: "#E8E9EB", padding: "40px" }}>
        <p>Cards coming soon</p>
      </div>
    </div>
  );
}
