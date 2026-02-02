"use client";

import { useSearchParams } from "next/navigation";
import { useState, useTransition, Suspense } from "react";
import { unsubscribeByEmail } from "@/app/actions/newsletter";
import { Mail, CheckCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [isPending, startTransition] = useTransition();

  const handleUnsubscribe = () => {
    if (!email) return;
    startTransition(async () => {
      const result = await unsubscribeByEmail(email);
      if (result.success) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    });
  };

  if (!email) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
          <Mail className="w-8 h-8 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Unsubscribe</h1>
        <p className="text-gray-600">Link is invalid or expired.</p>
        <Link
          href="/"
          className="inline-block text-emerald-600 hover:text-emerald-700 font-medium"
        >
          Return Home
        </Link>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="text-center space-y-4">
        <div className="flex justify-center mb-4">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Unsubscribed</h1>
        <p className="text-gray-600">
          You have been successfully unsubscribed from our newsletter.
        </p>
        <Link
          href="/"
          className="inline-block mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
        >
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto">
        <AlertTriangle className="w-8 h-8 text-amber-500" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Confirm Unsubscribe</h1>
        <p className="text-gray-600 mt-2">
          Are you sure you want to unsubscribe <strong>{email}</strong>?
        </p>
      </div>

      <button
        onClick={handleUnsubscribe}
        disabled={isPending}
        className="w-full bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
      >
        {isPending ? "Unsubscribing..." : "Yes, Unsubscribe Me"}
      </button>

      <Link
        href="/"
        className="block text-gray-500 hover:text-gray-700 text-sm"
      >
        Cancel
      </Link>

      {status === "error" && (
        <p className="text-red-500 text-sm">
          Failed to unsubscribe. Please try again.
        </p>
      )}
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6 bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <Suspense fallback={<div>Loading...</div>}>
          <UnsubscribeContent />
        </Suspense>
      </div>
    </div>
  );
}
