import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React boundary error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[400px] w-full flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50/50 p-8 text-center shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 mb-4">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-red-950">Something went wrong on this page</h2>
          <p className="mt-1 text-xs text-red-800 max-w-md">
            {this.state.error?.message || 'An unexpected rendering error occurred.'}
          </p>
          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="mt-5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700 transition"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
