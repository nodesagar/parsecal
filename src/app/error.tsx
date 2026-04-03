"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="bg-bg-card border border-border rounded-[16px] p-8 max-w-md w-full text-center">
        <div className="w-12 h-12 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6 text-error" />
        </div>
        <h2 className="text-xl font-bold text-text mb-2">Something went wrong</h2>
        <p className="text-sm text-text-muted mb-6">
          {error.message || "An unexpected error occurred in the application."}
        </p>
        {error.digest && (
          <p className="text-xs text-text-light font-mono mb-6 truncate opacity-50">
            ID: {error.digest}
          </p>
        )}
        <button
          onClick={() => reset()}
          className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 rounded-[10px] flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          <RefreshCcw className="w-4 h-4" />
          Try again
        </button>
      </div>
    </div>
  );
}
