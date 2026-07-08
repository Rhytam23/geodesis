import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * ErrorBoundary
 *
 * Catches unexpected React render errors and presents a user-friendly fallback
 * instead of a blank screen. In production, the detailed stack trace is hidden.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <RiskyComponent />
 *   </ErrorBoundary>
 *
 *   <ErrorBoundary fallback={<MyCustomFallback />}>
 *     ...
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // In production, replace this with your error monitoring service (e.g. Sentry):
    // Sentry.captureException(error, { extra: errorInfo });
    if (import.meta.env.DEV) {
      console.error('[Geodesis] Uncaught render error:', error, errorInfo);
    }
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      const isDev = import.meta.env.DEV;

      return (
        <div
          role="alert"
          aria-live="assertive"
          className="card p-8 text-center max-w-md mx-auto mt-10"
        >
          <div className="text-3xl mb-3" aria-hidden="true">
            ⚠️
          </div>
          <h2 className="font-semibold text-lg mb-2">Something went wrong</h2>
          <p className="text-sm text-slate-600 mb-6">
            An unexpected error occurred. Your data is safe — no information was lost.
          </p>
          <button
            onClick={this.handleReset}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            Try Again
          </button>

          {isDev && this.state.error && (
            <details className="mt-5 text-left">
              <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600 select-none">
                Developer details
              </summary>
              <div className="mt-2 text-[11px] bg-slate-50 p-3 rounded-lg text-red-600 font-mono overflow-auto whitespace-pre-wrap">
                {this.state.error.message}
                {this.state.errorInfo?.componentStack && (
                  <div className="mt-2 text-slate-500">
                    {this.state.errorInfo.componentStack}
                  </div>
                )}
              </div>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
