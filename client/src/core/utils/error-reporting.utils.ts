interface ErrorReportContext {
  readonly source: string;
  readonly metadata?: Record<string, unknown>;
}

function getErrorDetails(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      stack: error.stack,
    };
  }

  return {
    message: String(error),
    name: "NonError",
  };
}

export function reportClientError(error: unknown, context: ErrorReportContext): void {
  console.error("Nomad Lens client error", {
    ...context,
    error: getErrorDetails(error),
  });
}
