/* eslint-disable functional/no-classes, functional/no-class-inheritance, functional/no-this-expressions, @typescript-eslint/strict-boolean-expressions -- React Error Boundaries require a class component */
import { Component, type ErrorInfo, type ReactNode } from "react";

interface AppErrorBoundaryProps {
  readonly children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { hasError: true, message: error.message };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled application error", error, info.componentStack);
  }

  private readonly handleReload = () => {
    globalThis.location.reload();
  };

  override async render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface px-6 text-center">
          <h1 className="text-lg font-semibold text-white">Something went wrong</h1>
          <p className="max-w-md text-sm text-dim">
            {this.state.message || "An unexpected error occurred while rendering this page."}
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="rounded bg-accent px-4 py-2 text-sm font-semibold text-black"
          >
            Reload page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
