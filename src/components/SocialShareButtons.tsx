'use client';

import { useState } from 'react';
import { Facebook, Twitter, Linkedin, Link as LinkIcon, Check } from 'lucide-react';

interface SocialShareButtonsProps {
  url: string;
  title: string;
  description: string;
}

export default function SocialShareButtons({ url, title, description }: SocialShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const shareOnFacebook = () => {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const shareOnTwitter = () => {
    const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const shareOnLinkedIn = () => {
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const shareOnPinterest = () => {
    const media = document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';
    const shareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(media)}&description=${encodeURIComponent(description)}`;
    window.open(shareUrl, '_blank', 'width=750,height=600');
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="mt-8 bg-linear-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl p-6 shadow-lg">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          💚 Found this helpful? Share it!
        </h3>
        <p className="text-gray-600">Help others discover this article</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Facebook */}
        <button
          onClick={shareOnFacebook}
          className="group flex flex-col items-center justify-center p-4 bg-white hover:bg-blue-600 border-2 border-blue-600 rounded-xl transition-all hover:scale-105 hover:shadow-lg"
          aria-label="Share on Facebook"
        >
          <Facebook className="w-8 h-8 text-blue-600 group-hover:text-white mb-2 transition" />
          <span className="text-sm font-bold text-blue-600 group-hover:text-white transition">
            Facebook
          </span>
        </button>

        {/* Twitter */}
        <button
          onClick={shareOnTwitter}
          className="group flex flex-col items-center justify-center p-4 bg-white hover:bg-sky-500 border-2 border-sky-500 rounded-xl transition-all hover:scale-105 hover:shadow-lg"
          aria-label="Share on Twitter"
        >
          <Twitter className="w-8 h-8 text-sky-500 group-hover:text-white mb-2 transition" />
          <span className="text-sm font-bold text-sky-500 group-hover:text-white transition">
            Twitter
          </span>
        </button>

        {/* LinkedIn */}
        <button
          onClick={shareOnLinkedIn}
          className="group flex flex-col items-center justify-center p-4 bg-white hover:bg-blue-700 border-2 border-blue-700 rounded-xl transition-all hover:scale-105 hover:shadow-lg"
          aria-label="Share on LinkedIn"
        >
          <Linkedin className="w-8 h-8 text-blue-700 group-hover:text-white mb-2 transition" />
          <span className="text-sm font-bold text-blue-700 group-hover:text-white transition">
            LinkedIn
          </span>
        </button>

        {/* Pinterest */}
        <button
          onClick={shareOnPinterest}
          className="group flex flex-col items-center justify-center p-4 bg-white hover:bg-red-600 border-2 border-red-600 rounded-xl transition-all hover:scale-105 hover:shadow-lg"
          aria-label="Save to Pinterest"
        >
          <svg
            className="w-8 h-8 text-red-600 group-hover:text-white mb-2 transition"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.690 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.350-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
          </svg>
          <span className="text-sm font-bold text-red-600 group-hover:text-white transition">
            Pinterest
          </span>
        </button>

        {/* Copy Link */}
        <button
          onClick={copyLink}
          className="group flex flex-col items-center justify-center p-4 bg-white hover:bg-gray-700 border-2 border-gray-700 rounded-xl transition-all hover:scale-105 hover:shadow-lg"
          aria-label="Copy link"
        >
          {copied ? (
            <Check className="w-8 h-8 text-green-600 mb-2" />
          ) : (
            <LinkIcon className="w-8 h-8 text-gray-700 group-hover:text-white mb-2 transition" />
          )}
          <span className="text-sm font-bold text-gray-700 group-hover:text-white transition">
            {copied ? 'Copied!' : 'Copy'}
          </span>
        </button>
      </div>
    </div>
  );
}
