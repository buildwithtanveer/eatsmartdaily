"use client";

import { Facebook, Twitter, Linkedin, Link as LinkIcon, Share2 } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useState } from "react";
import { incrementShareCount } from "@/app/actions/share";

interface ShareButtonsProps {
  title: string;
  url: string;
  postId?: number;
  initialShareCount?: number;
}

export default function ShareButtons({ title, url, postId, initialShareCount = 0 }: ShareButtonsProps) {
  const [shareCount, setShareCount] = useState(initialShareCount);
  const [hasShared, setHasShared] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handleShare = async () => {
    if (!hasShared && postId) {
      setHasShared(true);
      setShareCount((prev) => prev + 1);
      await incrementShareCount(postId);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    alert("Link copied to clipboard!");
    handleShare();
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4 md:py-5 border-y border-gray-100">
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center gap-2 text-gray-800 font-semibold text-xs md:text-sm uppercase tracking-[0.16em]">
          <Share2 size={18} />
          <span>Share this article</span>
        </div>
        {shareCount > 0 && (
          <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full font-medium">
            {shareCount > 1000 ? `${(shareCount / 1000).toFixed(1)}k` : shareCount} shares
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 text-xs md:text-sm font-semibold transition"
          aria-label="Share on Facebook"
          onClick={handleShare}
        >
          <Facebook size={18} />
          <span className="hidden sm:inline">Facebook</span>
        </a>
        <a
          href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-full hover:bg-sky-600 text-xs md:text-sm font-semibold transition"
          aria-label="Share on Twitter"
          onClick={handleShare}
        >
          <Twitter size={18} />
          <span className="hidden sm:inline">Twitter</span>
        </a>
        <a
          href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-800 text-white rounded-full hover:bg-blue-900 text-xs md:text-sm font-semibold transition"
          aria-label="Share on LinkedIn"
          onClick={handleShare}
        >
          <Linkedin size={18} />
          <span className="hidden sm:inline">LinkedIn</span>
        </a>
        <a
          href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-full hover:bg-[#20b858] text-xs md:text-sm font-semibold transition"
          aria-label="Share on WhatsApp"
          onClick={handleShare}
        >
          <FaWhatsapp size={18} />
          <span className="hidden sm:inline">WhatsApp</span>
        </a>
        <button
          onClick={copyToClipboard}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 text-xs md:text-sm font-semibold transition"
          aria-label="Copy link"
        >
          <LinkIcon size={18} />
          <span className="hidden sm:inline">Copy link</span>
        </button>
      </div>
    </div>
  );
}
