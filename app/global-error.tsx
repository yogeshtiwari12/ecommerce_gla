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
      <body className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="max-w-md w-full p-6 rounded-lg border border-gray-800 bg-gradient-to-b from-gray-900 to-black shadow-xl">
          <h2 className="text-2xl font-bold mb-3">Something went wrong</h2>
          <p className="text-sm text-gray-300 mb-4 break-all">
            {error.message || "Unexpected error"}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => reset()}
              className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Try again
            </button>
            <button
              onClick={() => location.reload()}
              className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              Reload
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
