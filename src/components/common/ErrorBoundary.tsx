import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Name of the section, shown in the fallback so users know what failed. */
  label: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Contains render errors to one section so a single failing component
 * does not blank the whole workstation.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" className="max-w-md mx-auto my-8 p-4 rounded-2xl border border-rose-200 bg-rose-50 text-rose-900 text-xs space-y-2">
          <p className="font-bold">The {this.props.label} section could not be displayed.</p>
          <p>No data was changed. Reload the page to try again.</p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            className="px-3 py-1.5 rounded-lg bg-white border border-rose-300 font-semibold hover:bg-rose-100"
          >
            Retry this section
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
