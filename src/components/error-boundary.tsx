"use client";

import { Component, type ReactNode } from "react";

/** Keeps one broken demo from taking down the whole page. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div role="alert" className="max-w-sm text-center text-sm text-muted-foreground">
        <p className="font-medium text-foreground">This preview failed to render.</p>
        <p className="mt-1 font-mono text-xs">{this.state.error.message}</p>
      </div>
    );
  }
}
