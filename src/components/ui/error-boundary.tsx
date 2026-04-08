"use client";

import { Component, type ReactNode } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "./button";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-accent-risk/10 flex items-center justify-center mb-4">
            <AlertCircle className="w-7 h-7 text-accent-risk" />
          </div>
          <h3 className="font-display text-lg text-text-primary">
            Something went wrong
          </h3>
          <p className="text-sm text-text-secondary mt-2 max-w-md">
            {this.state.error?.message || "An unexpected error occurred"}
          </p>
          <Button
            variant="secondary"
            size="sm"
            className="mt-6"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
