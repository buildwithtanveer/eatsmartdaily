"use client";

import { useState } from "react";
import { createComment } from "@/app/actions/comments";
import {
  ErrorMessage,
  SuccessMessage,
  LoadingSpinner,
} from "@/components/ui/UXStates";
import { a11yLabels } from "@/lib/a11y";

type Comment = {
  id: number;
  name: string;
  content: string;
  createdAt: Date;
};

export default function CommentSection({
  postId,
  comments,
}: {
  postId: number;
  comments: Comment[];
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    formData.append("postId", postId.toString());

    try {
      const result = await createComment(null, formData);
      setIsSubmitting(false);

      if (result.success) {
        setSuccessMessage(
          result.message || "Your comment has been submitted successfully!",
        );
        (e.target as HTMLFormElement).reset();
        // Auto-dismiss success message after 5 seconds
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        setErrorMessage(
          result.message || "Failed to submit comment. Please try again.",
        );
      }
    } catch (error) {
      setIsSubmitting(false);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.",
      );
    }
  };

  return (
    <section
      className="bg-gray-50 p-6 md:p-10 rounded-xl mt-12 border border-gray-100"
      id="comments"
    >
      <h3 className="text-2xl font-bold text-gray-900 mb-8">
        Comments ({comments.length})
      </h3>

      {/* Comment List */}
      <div className="space-y-8 mb-12">
        {comments.length === 0 ? (
          <p className="text-gray-500 italic">
            No comments yet. Be the first to share your thoughts!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold shrink-0">
                {comment.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-gray-900">{comment.name}</h4>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-400">
                    {new Date(comment.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                  {comment.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Comment Form */}
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-xs border border-gray-100">
        <h4 className="text-xl font-bold text-gray-800 mb-2">
          {a11yLabels.commentForm}
        </h4>
        <p className="text-gray-500 text-sm mb-6">
          Your email address will not be published. Required fields are marked{" "}
          <span className="text-red-500">*</span>
        </p>

        {successMessage && (
          <div className="mb-6">
            <SuccessMessage
              message={successMessage}
              onDismiss={() => setSuccessMessage(null)}
            />
          </div>
        )}

        {errorMessage && (
          <div className="mb-6">
            <ErrorMessage
              error={errorMessage}
              onDismiss={() => setErrorMessage(null)}
            />
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          aria-label="Submit a comment"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name{" "}
                <span className="text-red-500" aria-label="required">
                  *
                </span>
              </label>
              <input
                name="name"
                required
                disabled={isSubmitting}
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-hidden transition disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="John Doe"
                aria-label="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email{" "}
                <span className="text-red-500" aria-label="required">
                  *
                </span>
              </label>
              <input
                name="email"
                type="email"
                required
                disabled={isSubmitting}
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-hidden transition disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="john@example.com"
                aria-label="Your email"
              />
            </div>
          </div>

          {/* Honeypot field (hidden from real users) */}
          <div className="hidden" aria-hidden="true">
            <label>
              Don&apos;t fill this out if you&apos;re human:
              <input name="website_url" tabIndex={-1} autoComplete="off" />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website (Optional)
            </label>
            <input
              name="website"
              type="url"
              disabled={isSubmitting}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-hidden transition disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="https://yourwebsite.com"
              aria-label="Your website"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comment{" "}
              <span className="text-red-500" aria-label="required">
                *
              </span>
            </label>
            <textarea
              name="content"
              required
              disabled={isSubmitting}
              rows={5}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-hidden transition disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Share your thoughts..."
              aria-label="Your comment"
            ></textarea>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-black text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              "Post Comment"
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
