"use client";

import { Plus, Trash2 } from "lucide-react";

interface ReferenceItem {
  title: string;
  url: string;
}

interface ReferencesSectionProps {
  references: ReferenceItem[];
  setReferences: (references: ReferenceItem[]) => void;
}

export default function ReferencesSection({ references, setReferences }: ReferencesSectionProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" x2="21" y1="14" y2="3"></line>
            </svg>
          </div>
          <h3 className="font-bold text-gray-900">References & Citations</h3>
        </div>
        <button
          type="button"
          onClick={() => setReferences([...references, { title: "", url: "" }])}
          className="text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
        >
          <Plus size={16} />
          Add Reference
        </button>
      </div>

      <div className="space-y-4">
        {references.map((ref, index) => (
          <div key={index} className="flex gap-4 items-end p-4 bg-gray-50 rounded-lg border border-gray-100 relative group">
            <div className="flex-1 space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Source Title</label>
                <input
                  value={ref.title}
                  onChange={(e) => {
                    const newRefs = [...references];
                    newRefs[index].title = e.target.value;
                    setReferences(newRefs);
                  }}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-hidden text-sm"
                  placeholder="e.g. WHO Nutrition Guide"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Source URL</label>
                <input
                  value={ref.url}
                  onChange={(e) => {
                    const newRefs = [...references];
                    newRefs[index].url = e.target.value;
                    setReferences(newRefs);
                  }}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-hidden text-sm"
                  placeholder="https://example.com/source"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => setReferences(references.filter((_, i) => i !== index))}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        {references.length === 0 && (
          <p className="text-center py-4 text-sm text-gray-400 italic">No references added yet.</p>
        )}
      </div>
    </div>
  );
}