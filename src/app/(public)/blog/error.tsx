"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Blog Page Error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Something went wrong loading the blog.
      </h2>
      <p className="text-gray-600 mb-6 max-w-md">
        We encountered an error while fetching the latest posts. Please try again later.
      </p>
      
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
        >
          Try Again
        </button>
        <Link 
          href="/"
          className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
        >
          Go Home
        </Link>
      </div>

      <div className="mt-8 p-4 bg-red-50 text-red-800 rounded text-left text-xs font-mono max-w-lg overflow-auto">
        <p className="font-bold">Error Details (for debugging):</p>
        <p>{error.message}</p>
        {error.digest && <p>Digest: {error.digest}</p>}
      </div>
    </div>
  );
}
