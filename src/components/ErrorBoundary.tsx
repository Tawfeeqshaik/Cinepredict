import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
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
    console.error("Uncaught Error caught by ErrorBoundary:", error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] w-full bg-[#141414] border border-[#262626] rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4 shadow-2xl my-6">
          <div className="w-12 h-12 rounded-2xl bg-rose-950 border border-rose-800 text-rose-400 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-white font-display">
              {this.props.fallbackTitle || 'Component Rendering Error'}
            </h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-md">
              {this.state.error?.message || 'An unexpected rendering error occurred in this view section.'}
            </p>
          </div>

          <button
            type="button"
            onClick={this.handleRetry}
            className="px-4 py-2 bg-[#E50914] text-white hover:bg-[#B20710] rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload Component</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
