interface EmptyStateProps {
  readonly message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return <p className="py-20 text-center text-sm text-dim">{message}</p>;
}
