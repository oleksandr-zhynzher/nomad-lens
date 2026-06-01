/* eslint-disable functional/no-classes, functional/no-class-inheritance, functional/no-this-expressions -- React Error Boundaries require a class component */
import { Component, type ErrorInfo, type ReactNode } from "react";

import { reportClientError } from "../../utils/error-reporting.utils";

interface AppErrorBoundaryProps {
  readonly children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    void error;
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    reportClientError(error, {
      source: "react-error-boundary",
      metadata: {
        componentStack: info.componentStack,
      },
    });
  }

  private readonly handleReload = () => {
    globalThis.location.reload();
  };

  override render(): ReactNode {
    const content = this.state.hasError ? (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface px-6 text-center">
        <h1 className="text-lg font-semibold text-white">Something went wrong</h1>
        <p className="max-w-md text-sm text-dim">
          An unexpected error occurred while rendering this page.
        </p>
        <button
          type="button"
          onClick={this.handleReload}
          className="rounded bg-accent px-4 py-2 text-sm font-semibold text-black"
        >
          Reload page
        </button>
      </div>
    ) : (
      this.props.children
    );

    return content;
  }
}
