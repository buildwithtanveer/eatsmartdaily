"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { updateConsent } from "./GoogleAnalytics";

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      // Delay showing to avoid CLS on initial load or overwhelming user immediately
      const timer = setTimeout(() => setShowConsent(true), 1000);
      return () => clearTimeout(timer);
    } else if (consent === "accepted") {
      updateConsent(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookie_consent", "accepted");
    updateConsent(true);
    setShowConsent(false);
  };

  const declineCookies = () => {
    // Note: In a real implementation, this should actually disable non-essential cookies.
    // For now, we just acknowledge the choice and hide the banner.
    localStorage.setItem("cookie_consent", "declined");
    updateConsent(false);
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 m-4 md:m-6 animate-slide-up">
      <div className="max-w-4xl mx-auto bg-white border border-gray-200 shadow-2xl rounded-xl p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-2">We value your privacy</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. 
            By clicking &quot;Accept All&quot;, you consent to our use of cookies. 
            Read our <Link href="/privacy-policy" className="text-green-600 hover:underline">Privacy Policy</Link> and <Link href="/cookie-policy" className="text-green-600 hover:underline">Cookie Policy</Link>.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={declineCookies}
            className="flex-1 md:flex-none px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            Decline
          </button>
          <button 
            onClick={acceptCookies}
            className="flex-1 md:flex-none px-6 py-2 text-sm font-bold text-white bg-[#568c2c] hover:bg-green-700 rounded-lg shadow-sm transition"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
