"use client";

import { useState } from "react";
import Link from "next/link";
import { Link2, CheckCircle, ExternalLink, RefreshCw, AlertTriangle } from "lucide-react";

interface Post {
  id: number;
  title: string;
}

interface BrokenLinkResult {
  postId: number;
  postTitle: string;
  postSlug: string;
  brokenLinks: {
    url: string;
    status: number | string;
  }[];
}

export default function BrokenLinkScanner({ posts }: { posts: Post[] }) {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<BrokenLinkResult[]>([]);
  const [currentPost, setCurrentPost] = useState<string>("");

  const startScan = async () => {
    if (!confirm("This will scan all posts for broken links. It may take a while. Continue?")) return;
    
    setIsScanning(true);
    setProgress(0);
    setResults([]);
    
    const chunkSize = 5;
    const total = posts.length;
    let processed = 0;

    // Iterate in chunks
    for (let i = 0; i < total; i += chunkSize) {
      // If user navigated away, we can't easily stop the loop unless we use a ref or check mounted state, 
      // but for simplicity let's just run.
      
      const chunk = posts.slice(i, i + chunkSize);
      const postIds = chunk.map(p => p.id);
      
      setCurrentPost(`Scanning batch ${Math.min(i + chunkSize, total)} of ${total}...`);

      try {
        const res = await fetch("/api/admin/check-links", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postIds }),
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.results && data.results.length > 0) {
             setResults(prev => [...prev, ...data.results]);
          }
        }
      } catch (err) {
        console.error("Scan error", err);
      }

      processed += chunk.length;
      setProgress(Math.round((processed / total) * 100));
    }

    setIsScanning(false);
    setCurrentPost("Scan complete.");
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Link2 size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Broken Link Scanner</h2>
              <p className="text-sm text-gray-500 mt-1">Scan {posts.length} published posts for broken external links to improve SEO.</p>
            </div>
          </div>
          <button
            onClick={startScan}
            disabled={isScanning}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-medium transition-all shadow-sm ${
              isScanning 
                ? "bg-blue-400 cursor-not-allowed" 
                : "bg-black hover:bg-gray-800 hover:-translate-y-0.5"
            }`}
          >
            {isScanning ? <RefreshCw className="animate-spin" size={18} /> : <RefreshCw size={18} />}
            {isScanning ? "Scanning..." : "Start Scan"}
          </button>
        </div>

        {isScanning && (
          <div className="mt-8 space-y-3">
            <div className="flex justify-between text-sm font-medium text-gray-700">
               <span>{currentPost}</span>
               <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
           <div className="p-4 border-b border-red-100 bg-red-50 flex items-center gap-3">
             <AlertTriangle className="text-red-600" size={20} />
             <h3 className="font-semibold text-red-800">Found {results.reduce((acc, r) => acc + r.brokenLinks.length, 0)} broken links in {results.length} posts</h3>
           </div>
           <div className="divide-y divide-gray-100">
             {results.map((result, idx) => (
                <div key={idx} className="p-5 hover:bg-gray-50 transition-colors">
                   <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        <h4 className="font-semibold text-gray-900">{result.postTitle}</h4>
                      </div>
                      <Link 
                        href={`/admin/posts/${result.postId}`} 
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                        target="_blank"
                      >
                        Edit Post <ExternalLink size={14} />
                      </Link>
                   </div>
                   <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                     <ul className="divide-y divide-gray-200">
                       {result.brokenLinks.map((link, lIdx) => (
                          <li key={lIdx} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 text-sm group hover:bg-white transition-colors">
                             <span className={`w-16 font-mono text-xs font-bold px-2 py-1 rounded text-center shrink-0 border ${
                               typeof link.status === 'number' && link.status >= 500 ? 'bg-red-50 text-red-700 border-red-100' : 
                               link.status === 404 ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-gray-100 text-gray-700 border-gray-200'
                             }`}>
                               {link.status}
                             </span>
                             <a 
                               href={link.url} 
                               target="_blank" 
                               rel="noopener noreferrer" 
                               className="text-gray-600 hover:text-blue-600 hover:underline truncate max-w-2xl block transition-colors"
                             >
                               {link.url}
                             </a>
                          </li>
                       ))}
                     </ul>
                   </div>
                </div>
             ))}
           </div>
        </div>
      )}
      
      {!isScanning && results.length === 0 && progress === 100 && (
         <div className="p-12 text-center bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-2">
              <CheckCircle size={32} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">All Clear!</h3>
              <p className="text-gray-500">No broken links were found in your published posts.</p>
            </div>
         </div>
      )}
    </div>
  );
}
