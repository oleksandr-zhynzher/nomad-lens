import { CirclePlus } from "lucide-react";

interface Props {
  onClick: () => void;
  label: string;
}

export function ComparisonAddButton({ onClick, label }: Props) {
  return (
    <button
      onClick={onClick}
      className="flex min-h-[160px] w-full flex-col items-center justify-center gap-2 rounded-lg p-4 transition-colors hover:border-[#3A3A3A] md:min-h-[180px]"
      style={{ backgroundColor: "#141416", border: "1px dashed #252525", cursor: "pointer" }}
    >
      <CirclePlus size={28} style={{ color: "#E8E9EB" }} />
      <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#E8E9EB" }}>
        {label}
      </span>
    </button>
  );
}
