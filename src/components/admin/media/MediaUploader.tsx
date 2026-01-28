"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2 } from "lucide-react";

export default function MediaUploader({ onUploadSuccess }: { onUploadSuccess?: (url?: string) => void }) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        if (onUploadSuccess) {
            onUploadSuccess(data.url);
        } else {
            router.refresh();
        }
      } else {
        alert(data.error || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      alert("Upload error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <label className={`
        relative overflow-hidden
        bg-black text-white px-5 py-2.5 rounded-xl cursor-pointer 
        hover:bg-gray-800 transition-all shadow-sm hover:shadow 
        inline-flex items-center gap-2 font-medium text-sm
        ${isUploading ? "opacity-80 cursor-wait" : ""}
      `}>
        {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
        {isUploading ? "Uploading..." : "Upload New Image"}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
          disabled={isUploading}
        />
      </label>
    </div>
  );
}
