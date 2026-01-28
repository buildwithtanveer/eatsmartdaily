"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { deleteMediaFile } from "@/app/actions/media";
import { Trash2, Copy, Check, Search, Image as ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MediaGrid({ initialFiles }: { initialFiles: string[] }) {
  const [files, setFiles] = useState(initialFiles);
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const filteredFiles = files.filter((file) =>
    file.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (fileName: string) => {
    if (!confirm(`Are you sure you want to delete ${fileName}? This might break posts using this image.`)) return;

    startTransition(async () => {
      const result = await deleteMediaFile(fileName);
      if (result.success) {
        setFiles(files.filter((f) => f !== fileName));
        router.refresh();
      } else {
        alert(result.message || "Failed to delete file");
      }
    });
  };

  const handleCopy = (fileName: string) => {
    const url = `/uploads/${fileName}`;
    navigator.clipboard.writeText(url);
    setCopiedFile(fileName);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search media files..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-black/5 focus:border-black outline-hidden bg-white shadow-sm transition-all"
        />
      </div>

      {filteredFiles.length === 0 ? (
        <div className="bg-white p-16 text-center rounded-xl border border-gray-200 shadow-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
               <ImageIcon className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">
              {searchTerm ? "No files match your search." : "No media files found. Upload your first image!"}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
          {filteredFiles.map((file) => (
            <div key={file} className="group relative bg-white p-2 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
              <div className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden mb-3">
                <Image
                  src={`/uploads/${file}`}
                  alt={file}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 16vw"
                />
                
                {/* Actions Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                  <button
                    onClick={() => handleCopy(file)}
                    className="bg-white text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
                    title="Copy URL"
                  >
                    {copiedFile === file ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                  </button>
                  <button
                    onClick={() => handleDelete(file)}
                    disabled={isPending}
                    className="bg-white text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors shadow-lg"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-600 truncate px-1 font-medium" title={file}>
                {file}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
