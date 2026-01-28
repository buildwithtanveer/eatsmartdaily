"use client";

import { useActionState } from "react";
import { submitContactForm } from "@/app/actions/contact";
import {
  ErrorMessage,
  SuccessMessage,
  FormErrorSummary,
} from "@/components/ui/UXStates";

export default function ContactForm() {
  const [state, formAction, isPending] = useActionState(
    submitContactForm,
    null,
  );

  const errors = state?.errors
    ? Object.fromEntries(
        Object.entries(state.errors).map(([key, value]) => [
          key,
          Array.isArray(value) ? value[0] : value,
        ]),
      )
    : {};

  return (
    <>
      {state?.success ? (
        <div className="mb-6">
          <SuccessMessage
            message={
              state.message ||
              "Your message has been sent successfully! We'll get back to you soon."
            }
          />
        </div>
      ) : (
        <form
          action={formAction}
          className="space-y-6 bg-gray-50 p-6 rounded-lg border border-gray-200"
        >
          {state?.message && !state?.success && (
            <div className="mb-6">
              <ErrorMessage error={state.message} />
            </div>
          )}

          {Object.keys(errors).length > 0 && (
            <FormErrorSummary errors={errors as Record<string, string>} />
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Name{" "}
              <span className="text-red-500" aria-label="required">
                *
              </span>
            </label>
            <input
              name="name"
              type="text"
              disabled={isPending}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Your Name"
              aria-label="Your name"
              required
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1" role="alert">
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Email{" "}
              <span className="text-red-500" aria-label="required">
                *
              </span>
            </label>
            <input
              name="email"
              type="email"
              disabled={isPending}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="your@email.com"
              aria-label="Your email"
              required
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1" role="alert">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Subject
            </label>
            <input
              name="subject"
              type="text"
              disabled={isPending}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Subject (Optional)"
              aria-label="Message subject"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Message{" "}
              <span className="text-red-500" aria-label="required">
                *
              </span>
            </label>
            <textarea
              name="message"
              rows={6}
              disabled={isPending}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="How can we help you?"
              aria-label="Your message"
              required
            />
            {errors.message && (
              <p className="text-red-500 text-sm mt-1" role="alert">
                {errors.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="bg-[#568c2c] text-white px-8 py-3 rounded font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition w-full md:w-auto flex items-center justify-center gap-2"
            aria-busy={isPending}
          >
            {isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              "Send Message"
            )}
          </button>
        </form>
      )}
    </>
  );
}
