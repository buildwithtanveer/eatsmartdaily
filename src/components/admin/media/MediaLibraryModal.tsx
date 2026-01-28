"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getMediaFiles } from "@/app/actions/media";
import MediaUploader from "./MediaUploader";
import { X, Image as ImageIcon, Link as LinkIcon, Globe } from "lucide-react";

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  selectedUrl?: string;
}

export default function MediaLibraryModal({ isOpen, onClose, onSelect, selectedUrl }: MediaLibraryModalProps) {
  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'library' | 'url'>('library');
  const [externalUrl, setExternalUrl] = useState("");

  const loadFiles = async () => {
    setLoading(true);
    try {
      const mediaFiles = await getMediaFiles();
      setFiles(mediaFiles);
    } catch (error) {
      console.error("Failed to load media files", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadFiles();
      setActiveTab('library');
      setExternalUrl("");
    }
  }, [isOpen]);

  const handleUploadSuccess = (newUrl?: string) => {
    if (newUrl) {
        // Extract filename from URL
        const fileName = newUrl.split("/").pop();
        if (fileName) {
            setFiles(prev => [fileName, ...prev]);
        }
    }
    loadFiles();
  };

  const handleExternalUrlSubmit = () => {
    if (externalUrl.trim()) {
      onSelect(externalUrl.trim());
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col border border-gray-200 animate-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-black/5 rounded-lg">
              <ImageIcon size={20} className="text-gray-700" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Media Library</h3>
              <p className="text-xs text-gray-500 mt-0.5">Select an image or use a URL</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('library')}
            className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'library'
                ? "text-black border-b-2 border-black bg-gray-50/50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <ImageIcon size={16} />
            Media Library
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'url'
                ? "text-black border-b-2 border-black bg-gray-50/50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <LinkIcon size={16} />
            Insert from URL
          </button>
        </div>

        {activeTab === 'library' ? (
          <>
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-sm text-gray-600 font-medium">Available Images</p>
                <MediaUploader onUploadSuccess={handleUploadSuccess} />
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-white custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-3"></div>
                  <p className="text-sm">Loading media files...</p>
                </div>
              ) : files.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
                  <ImageIcon size={48} className="text-gray-200 mb-4" />
                  <p className="font-medium text-gray-600">No images found</p>
                  <p className="text-sm mt-1">Upload a new image to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {files.map((file) => (
                    <div
                      key={file}
                      onClick={() => {
                        onSelect(`/uploads/${file}`);
                        onClose();
                      }}
                      className={`cursor-pointer group relative aspect-square border rounded-xl overflow-hidden transition-all duration-200 ${
                        selectedUrl === `/uploads/${file}` 
                          ? "ring-2 ring-black border-black shadow-md scale-[1.02]" 
                          : "border-gray-200 hover:border-gray-400 hover:shadow-md"
                      }`}
                    >
                      <Image
                        src={`/uploads/${file}`}
                        alt={file}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, 20vw"
                      />
                      <div className={`absolute inset-0 transition-colors duration-200 ${
                        selectedUrl === `/uploads/${file}` ? "bg-black/0" : "bg-black/0 group-hover:bg-black/10"
                      }`} />
                      
                      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/40 to-transparent p-3 pt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <p className="text-white text-[10px] font-medium truncate">
                          {file}
                        </p>
                      </div>
                      
                      {selectedUrl === `/uploads/${file}` && (
                        <div className="absolute top-2 right-2 bg-black text-white p-1 rounded-full shadow-sm">
                          <ImageIcon size={12} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="p-8 flex-1 flex flex-col items-center justify-center bg-white">
            <div className="w-full max-w-md space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-500">
                  <Globe size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Insert from External URL</h3>
                <p className="text-sm text-gray-500">Paste an image URL from another website</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="url-input" className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <input
                    id="url-input"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
                  />
                </div>

                {externalUrl && (
                  <div className="relative aspect-video w-full bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={externalUrl}
                      alt="Preview"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        // You could add error state handling here
                      }}
                      onLoad={(e) => {
                        (e.target as HTMLImageElement).style.display = 'block';
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center -z-10 text-gray-400 text-sm">
                      Invalid Image URL
                    </div>
                  </div>
                )}

                <button
                  onClick={handleExternalUrlSubmit}
                  disabled={!externalUrl.trim()}
                  className="w-full py-2.5 bg-black text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Insert Image
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
