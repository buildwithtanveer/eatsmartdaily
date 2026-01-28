"use client";

import { useEffect } from "react";

export default function TrackView({ postId }: { postId: number }) {
  useEffect(() => {
    // Fire and forget view increment
    // We use a small delay to ensure it doesn't compete with initial page load resources
    const timer = setTimeout(() => {
      fetch("/api/views", {
        method: "POST",
        body: JSON.stringify({ postId }),
        headers: {
          "Content-Type": "application/json",
        },
        keepalive: true, // Ensure request completes even if user navigates away
      }).catch(() => {
        // Ignore errors for view tracking
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [postId]);

  return null;
}
