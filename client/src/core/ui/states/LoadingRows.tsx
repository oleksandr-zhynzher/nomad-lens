interface LoadingRowsProps {
  readonly count?: number;
  readonly rowClassName?: string;
}

export function LoadingRows({
  count = 8,
  rowClassName = "h-14 border-t border-border bg-surface",
}: LoadingRowsProps) {
  return (
    <div className="flex flex-col gap-0">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={`animate-pulse ${rowClassName}`} />
      ))}
    </div>
  );
}
