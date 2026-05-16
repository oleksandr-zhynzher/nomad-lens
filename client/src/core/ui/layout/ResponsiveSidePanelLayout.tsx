import { MobileFabButton } from "@core/ui/actions";
import { MobileSheet } from "@core/ui/MobileSheet";
import type { ReactNode } from "react";

interface MobileSheetConfig {
  readonly open: boolean;
  readonly title: string;
  readonly closeLabel: string;
  readonly onClose: () => void;
  readonly children: ReactNode;
}

interface MobileFabConfig {
  readonly label: string;
  readonly ariaLabel?: string;
  readonly icon: ReactNode;
  readonly onClick: () => void;
}

interface ResponsiveSidePanelLayoutProps {
  readonly sidebar: ReactNode;
  readonly mobileSheet: MobileSheetConfig;
  readonly mobileFab: MobileFabConfig;
  readonly children: ReactNode;
}

export function ResponsiveSidePanelLayout({
  sidebar,
  mobileSheet,
  mobileFab,
  children,
}: ResponsiveSidePanelLayoutProps) {
  return (
    <div className="flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-14 hidden h-[calc(100vh-56px)] w-[340px] shrink-0 self-start overflow-y-auto border-r border-[#1E1E22] bg-[#131416] md:block">
        {sidebar}
      </aside>

      {/* Mobile sheet */}
      <MobileSheet
        open={mobileSheet.open}
        title={mobileSheet.title}
        closeLabel={mobileSheet.closeLabel}
        onClose={mobileSheet.onClose}
      >
        <div className="flex-1 overflow-y-auto">{mobileSheet.children}</div>
      </MobileSheet>

      {/* Mobile FAB */}
      <MobileFabButton
        label={mobileFab.label}
        {...(mobileFab.ariaLabel !== undefined && { ariaLabel: mobileFab.ariaLabel })}
        icon={mobileFab.icon}
        onClick={mobileFab.onClick}
      />

      {/* Main content */}
      <main className="min-w-0 flex-1 bg-bg pb-28 md:pb-0">{children}</main>
    </div>
  );
}
