/**
 * UI/UX Loading States and Error Message Components
 */

import { ReactNode } from "react";

/**
 * Loading skeleton component for content placeholders
 */
export function LoadingSkeleton({
  className = "",
  count = 1,
}: {
  className?: string;
  count?: number;
}) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg animate-pulse ${className}`}
        />
      ))}
    </>
  );
}

/**
 * Loading spinner for async operations
 */
export function LoadingSpinner({
  size = "md",
  label = "Loading",
}: {
  size?: "sm" | "md" | "lg";
  label?: string;
}) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizeClasses[size]} border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin`}
        role="status"
        aria-label={label}
      />
      {label && (
        <p className="text-sm text-gray-600" aria-live="polite">
          {label}
        </p>
      )}
    </div>
  );
}

/**
 * Error message component with accessibility
 */
export function ErrorMessage({
  error,
  onDismiss,
  canRetry = false,
  onRetry,
}: {
  error: string | Error;
  onDismiss?: () => void;
  canRetry?: boolean;
  onRetry?: () => void;
}) {
  const message = error instanceof Error ? error.message : error;

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm"
    >
      <div className="flex items-start gap-3">
        <svg
          className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
        <div className="flex-1">
          <p className="font-medium">Error</p>
          <p className="text-sm mt-1">{message}</p>
          {(onDismiss || canRetry) && (
            <div className="flex gap-2 mt-3">
              {canRetry && onRetry && (
                <button
                  onClick={onRetry}
                  className="text-sm font-medium text-red-700 hover:text-red-800 hover:underline"
                >
                  Try again
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="text-sm font-medium text-red-700 hover:text-red-800 hover:underline"
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Success message component
 */
export function SuccessMessage({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss?: () => void;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 text-sm"
    >
      <div className="flex items-start gap-3">
        <svg
          className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        <div className="flex-1">
          <p className="font-medium">{message}</p>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-sm font-medium text-green-700 hover:text-green-800 hover:underline mt-2"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Warning message component
 */
export function WarningMessage({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss?: () => void;
}) {
  return (
    <div
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700 text-sm"
    >
      <div className="flex items-start gap-3">
        <svg
          className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        <div className="flex-1">
          <p className="font-medium">{message}</p>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-sm font-medium text-yellow-700 hover:text-yellow-800 hover:underline mt-2"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Empty state component
 */
export function EmptyState({
  title,
  description,
  action,
  icon: Icon,
}: {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: ReactNode;
}) {
  return (
    <div className="py-12 text-center">
      {Icon && (
        <div className="mb-4 text-gray-400 flex justify-center">{Icon}</div>
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

/**
 * Loading overlay for full page or container
 */
export function LoadingOverlay({
  isLoading,
  message = "Loading...",
}: {
  isLoading: boolean;
  message?: string;
}) {
  if (!isLoading) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      role="status"
      aria-label="Loading page"
      aria-live="polite"
    >
      <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-4">
        <LoadingSpinner label={message} />
      </div>
    </div>
  );
}

/**
 * Form error summary for accessibility
 */
export function FormErrorSummary({
  errors,
}: {
  errors: Record<string, string>;
}) {
  const errorList = Object.entries(errors)
    .filter(([, error]) => error)
    .map(([field, error]) => ({ field, error }));

  if (errorList.length === 0) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className="bg-red-50 border-l-4 border-red-600 p-4 rounded-r-lg"
    >
      <h3 className="text-sm font-medium text-red-800 mb-2">
        Please fix the following errors:
      </h3>
      <ul className="list-disc pl-5 space-y-1">
        {errorList.map(({ field, error }) => (
          <li key={field} className="text-sm text-red-700">
            <strong>{field}:</strong> {error}
          </li>
        ))}
      </ul>
    </div>
  );
}
