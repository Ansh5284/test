import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    errorMessage: '',
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error?.message || 'An unexpected error occurred while loading the archive.',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('CA Final Vault runtime error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F9F8F4] text-[#171614] flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-white border border-[#E5E2DA] rounded-xl p-8 space-y-4">
            <p className="text-xs font-mono text-[#9A3412]">Runtime Recovery</p>
            <h1 className="font-serif text-2xl font-semibold text-[#171614]">
              Unable to render the revision archive
            </h1>
            <p className="text-sm text-[#57534E] leading-relaxed">{this.state.errorMessage}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-xs font-medium text-white bg-[#1D3B73] rounded-md hover:bg-[#152C57] transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
