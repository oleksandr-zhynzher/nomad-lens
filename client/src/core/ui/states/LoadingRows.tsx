interface LoadingRowsProps {
  readonly count?: number;
  readonly rowClassName?: string;
}

export function LoadingRows({
  count = 8,
  rowClassName = "h-14 border-t border-border bg-surface",
}: LoadingRowsProps) {
  const rowKeys = Array.from({ length: count }, (_, index) => `loading-row-${index}`);

  return (
    <div className="flex flex-col gap-0">
      {rowKeys.map((rowKey) => (
        <div key={rowKey} className={`animate-pulse ${rowClassName}`} />
      ))}
    </div>
  );
}
