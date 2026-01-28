"use client";

import { useState } from "react";
import Image from "next/image";
import { Image as ImageIcon } from "lucide-react";
import MediaLibraryModal from "./MediaLibraryModal";

interface MediaSelectorProps {
  value: string;
  onChange: (url: string) => void;
}

export default function MediaSelector({ value, onChange }: MediaSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <div className="flex items-center gap-4">
        {value && (
          <div className="relative w-24 h-24 border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-gray-50">
            {value.startsWith("http") ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img 
                src={value} 
                alt="Preview" 
                className="w-full h-full object-cover absolute inset-0"
              />
            ) : (
              <Image
                src={value}
                alt="Preview"
                fill
                className="object-cover"
              />
            )}
          </div>
        )}
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 rounded-lg text-gray-700 font-medium transition-all shadow-sm text-sm"
        >
          <ImageIcon size={18} />
          {value ? "Change Image" : "Select Featured Image"}
        </button>
      </div>

      <MediaLibraryModal 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSelect={(url) => {
            onChange(url);
            setIsOpen(false);
        }}
        selectedUrl={value}
      />
    </div>
  );
}
