import { CirclePlus } from "lucide-react";

interface Props {
  onClick: () => void;
  label: string;
}

export function ComparisonAddButton({ onClick, label }: Props) {
  return (
    <button
      onClick={onClick}
      className="flex min-h-[160px] w-full flex-col items-center justify-center gap-2 rounded-lg p-4 transition-colors hover:border-[#3A3A3A] md:min-h-[180px] bg-[#141416] border border-dashed border-[#252525] cursor-pointer"
    >
      <CirclePlus size={28} className="text-on-surface" />
      <span className="text-xs text-on-surface">{label}</span>
    </button>
  );
}
