import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, LogOut, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  isRoot?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[CinePredict Runtime Error Caught by Boundary]:", error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleReset = () => {
    try {
      localStorage.removeItem('cinepredict_active_user');
    } catch {}
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[380px] w-full bg-[#0B0B0B] border border-[#262626] rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-6 shadow-2xl my-6 font-sans">
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-red-500 uppercase bg-red-950/40 px-3 py-1 rounded-full border border-red-800/40">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>CINEPREDICT</span>
          </div>

          <div className="max-w-md space-y-2">
            <h3 className="text-xl font-bold text-white font-display tracking-tight">
              Something went wrong while loading this module.
            </h3>
            <p className="text-xs text-neutral-400 font-mono leading-relaxed">
              {this.state.error?.message || 'A runtime rendering error occurred. The system safely caught this exception to prevent application crash.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={this.handleRetry}
              className="px-5 py-2.5 bg-[#E50914] text-white hover:bg-[#B20710] rounded-xl text-xs font-bold shadow-lg shadow-red-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry</span>
            </button>

            <button
              type="button"
              onClick={this.handleGoHome}
              className="px-5 py-2.5 bg-[#141414] text-neutral-300 hover:text-white hover:bg-[#1f1f1f] border border-[#333] rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <Home className="w-4 h-4 text-neutral-400" />
              <span>Return to Dashboard</span>
            </button>
          </div>

          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <details className="mt-4 text-left max-w-lg w-full bg-[#050505] p-3 rounded-xl border border-[#222] text-[11px] font-mono text-neutral-500 overflow-auto max-h-36">
              <summary className="cursor-pointer text-red-400 font-semibold mb-1">Technical Stack Trace</summary>
              <pre className="whitespace-pre-wrap">{this.state.error.stack}</pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
