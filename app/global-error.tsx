"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="max-w-md w-full p-6 rounded-lg border border-border bg-card shadow-xl">
          <h2 className="text-2xl font-bold mb-3">Something went wrong</h2>
          <p className="text-sm text-muted-foreground mb-4 break-all">
            {error.message || "Unexpected error"}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => reset()}
              className="px-4 py-2 rounded bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
            >
              Try again
            </button>
            <button
              onClick={() => location.reload()}
              className="px-4 py-2 rounded bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
            >
              Reload
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
