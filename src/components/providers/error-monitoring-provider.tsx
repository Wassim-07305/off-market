"use client";

import { Component, useEffect, type ReactNode } from "react";
import { toast } from "sonner";
import { logError } from "@/lib/error-logger";

// ─── Global Error Boundary ──────────────────────────────────

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class GlobalErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logError({
      message: error.message,
      stack: error.stack ?? null,
      component_stack: errorInfo.componentStack ?? null,
      source: "error-boundary",
      severity: "critical",
      metadata: { digest: (error as Error & { digest?: string }).digest },
    });

    toast.error("Une erreur est survenue", {
      description: error.message?.slice(0, 100),
      duration: 6000,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center">
            <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Erreur inattendue
            </h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">
              L&apos;erreur a ete enregistree automatiquement. Rechargez la page pour continuer.
            </p>
          </div>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="h-10 px-5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all"
          >
            Recharger la page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Window Error Listeners ─────────────────────────────────

function WindowErrorListeners() {
  useEffect(() => {
    // Catch unhandled JS errors
    const handleError = (event: ErrorEvent) => {
      // Ignore ResizeObserver errors (benign browser noise)
      if (event.message?.includes("ResizeObserver")) return;

      logError({
        message: event.message || "Unhandled error",
        stack: event.error?.stack ?? null,
        source: "unhandled-error",
        severity: "error",
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });

      toast.error("Erreur detectee", {
        description: (event.message || "Erreur inconnue").slice(0, 100),
        duration: 5000,
      });
    };

    // Catch unhandled promise rejections
    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message =
        reason instanceof Error
          ? reason.message
          : typeof reason === "string"
            ? reason
            : "Unhandled promise rejection";

      // Ignore abort errors (user navigated away)
      if (message.includes("AbortError") || message.includes("aborted")) return;

      logError({
        message,
        stack: reason instanceof Error ? reason.stack ?? null : null,
        source: "unhandled-rejection",
        severity: "error",
        metadata: { reason: String(reason).slice(0, 500) },
      });

      toast.error("Erreur asynchrone", {
        description: message.slice(0, 100),
        duration: 5000,
      });
    };

    // Catch fetch/API errors by intercepting fetch
    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
      try {
        const response = await originalFetch.apply(this, args);

        // Log server errors (5xx) on API routes
        if (response.status >= 500) {
          const url = typeof args[0] === "string" ? args[0] : (args[0] as Request)?.url ?? "";
          if (url.includes("/api/")) {
            let body: string | null = null;
            try {
              const clone = response.clone();
              body = await clone.text();
            } catch { /* ignore */ }

            logError({
              message: `API Error ${response.status}: ${url}`,
              source: "api-error",
              severity: response.status >= 500 ? "critical" : "error",
              metadata: {
                status: response.status,
                statusText: response.statusText,
                url,
                responseBody: body?.slice(0, 500),
              },
            });
          }
        }

        return response;
      } catch (err) {
        // Don't log abort errors
        if (err instanceof Error && err.name === "AbortError") throw err;

        const url = typeof args[0] === "string" ? args[0] : (args[0] as Request)?.url ?? "";
        if (url.includes("/api/")) {
          logError({
            message: `Fetch failed: ${url} — ${err instanceof Error ? err.message : String(err)}`,
            stack: err instanceof Error ? err.stack ?? null : null,
            source: "api-error",
            severity: "error",
            metadata: { url },
          });
        }

        throw err;
      }
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
      window.fetch = originalFetch;
    };
  }, []);

  return null;
}

// ─── Combined Provider ──────────────────────────────────────

export function ErrorMonitoringProvider({ children }: { children: ReactNode }) {
  return (
    <GlobalErrorBoundary>
      <WindowErrorListeners />
      {children}
    </GlobalErrorBoundary>
  );
}
