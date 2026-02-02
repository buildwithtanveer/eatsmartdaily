"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAd, updateAd, deleteAd, toggleAdStatus } from "@/app/actions/ads";
import { Megaphone, Code, Image as ImageIcon, Type, Trash2, Edit, Power, Plus } from "lucide-react";

type Ad = {
  id: number;
  name: string;
  type: "IMAGE" | "CODE" | "TEXT";
  location: "HEADER" | "SIDEBAR" | "IN_ARTICLE" | "FOOTER" | "BELOW_TITLE" | "END_CONTENT";
  content: string;
  isActive: boolean;
};

export default function AdManager({ ads }: { ads: Ad[] }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const router = useRouter(); // Need router for refresh

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    let result;
    if (editingAd) {
      result = await updateAd(editingAd.id, null, formData);
    } else {
      result = await createAd(null, formData);
    }

    if (result.success) {
      setIsEditing(false);
      setEditingAd(null);
      router.refresh();
    } else {
      alert(result.message || "Operation failed");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this ad?")) return;
    await deleteAd(id);
    router.refresh();
  };

  const handleToggle = async (ad: Ad) => {
    await toggleAdStatus(ad.id, !ad.isActive);
    router.refresh();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "CODE": return <Code size={16} />;
      case "IMAGE": return <ImageIcon size={16} />;
      default: return <Type size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      {!isEditing && (
        <div className="flex justify-end">
           <button
            onClick={() => {
              setEditingAd(null);
              setIsEditing(true);
            }}
            className="bg-black text-white px-4 py-2.5 rounded-xl hover:bg-gray-800 transition-colors shadow-sm font-medium flex items-center gap-2"
          >
            <Plus size={18} />
            New Ad Unit
          </button>
        </div>
      )}

      {isEditing && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">{editingAd ? "Edit Ad Unit" : "Create New Ad Unit"}</h3>
            <button 
              onClick={() => setIsEditing(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              Cancel
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ad Name</label>
                <input
                  name="name"
                  defaultValue={editingAd?.name}
                  required
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-black/5 focus:border-black outline-hidden transition-all"
                  placeholder="e.g. Sidebar Banner Top"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ad Type</label>
                <div className="relative">
                  <select
                    name="type"
                    defaultValue={editingAd?.type || "CODE"}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-black/5 focus:border-black outline-hidden transition-all appearance-none bg-white"
                  >
                    <option value="CODE">HTML/JS Code (AdSense/Ezoic)</option>
                    <option value="IMAGE">Image URL (Custom Banner)</option>
                    <option value="TEXT">Plain Text (Notice/Alert)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Placement</label>
                <select
                  name="location"
                  defaultValue={editingAd?.location || "SIDEBAR"}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-black/5 focus:border-black outline-hidden transition-all appearance-none bg-white"
                >
                  <option value="HEADER">Header (Above Content)</option>
                  <option value="SIDEBAR">Sidebar (Sticky/Standard)</option>
                  <option value="IN_ARTICLE">Inside Article (After 2nd paragraph)</option>
                  <option value="BELOW_TITLE">Below Title (Above Content)</option>
                  <option value="END_CONTENT">End of Content (Before Bio)</option>
                  <option value="FOOTER">Footer (Before Copyright)</option>
                </select>
              </div>
              <div className="flex items-center pt-8">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      defaultChecked={editingAd ? editingAd.isActive : true}
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 transition-all checked:border-green-500 checked:bg-green-500"
                    />
                    <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100">
                      <svg stroke="currentColor" fill="none" strokeWidth="3" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="12" width="12" xmlns="http://www.w3.org/2000/svg"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Active (Visible on site)</span>
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content (Code / URL / Text)</label>
              <textarea
                name="content"
                defaultValue={editingAd?.content}
                required
                rows={6}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 font-mono text-sm focus:ring-2 focus:ring-black/5 focus:border-black outline-hidden transition-all"
                placeholder="<script>...</script> or https://..."
              />
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-6 py-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-black text-white px-8 py-2.5 rounded-lg hover:bg-gray-800 font-medium transition-colors shadow-sm"
              >
                Save Ad Unit
              </button>
            </div>
          </form>
        </div>
      )}

      {ads.length === 0 && !isEditing ? (
        <div className="bg-white p-16 text-center rounded-xl border border-gray-200 shadow-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
               <Megaphone className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No ad units found.</p>
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-600 hover:underline font-medium"
            >
              Create your first ad
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {ads.map((ad) => (
            <div key={ad.id} className={`
              bg-white rounded-xl border p-5 shadow-sm transition-all hover:shadow-md group
              ${!ad.isActive ? "opacity-75 bg-gray-50 border-gray-200" : "border-gray-200"}
            `}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-3">
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center shrink-0
                    ${ad.isActive ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-400"}
                  `}>
                    {getTypeIcon(ad.type)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 line-clamp-1">{ad.name}</h4>
                    <div className="text-xs text-gray-500 flex flex-wrap gap-2 mt-1">
                      <span className="bg-gray-100 px-2 py-0.5 rounded-md font-medium">{ad.location}</span>
                      <span className="bg-gray-100 px-2 py-0.5 rounded-md font-medium">{ad.type}</span>
                    </div>
                  </div>
                </div>
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${ad.isActive ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-gray-300"}`} />
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg text-xs font-mono text-gray-600 h-24 overflow-hidden mb-5 border border-gray-100 relative group-hover:border-gray-200 transition-colors">
                <div className="absolute inset-0 bg-linear-to-b from-transparent to-gray-50 pointer-events-none" />
                {ad.content}
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    setEditingAd(ad);
                    setIsEditing(true);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="flex-1 flex items-center justify-center gap-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 py-2 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <Edit size={14} />
                  Edit
                </button>
                <button
                  onClick={() => handleToggle(ad)}
                  className={`
                    flex items-center justify-center p-2 rounded-lg border transition-colors
                    ${ad.isActive 
                      ? "border-gray-200 text-gray-400 hover:text-orange-600 hover:bg-orange-50 hover:border-orange-200" 
                      : "border-green-200 text-green-600 bg-green-50 hover:bg-green-100"
                    }
                  `}
                  title={ad.isActive ? "Disable" : "Enable"}
                >
                  <Power size={16} />
                </button>
                <button
                  onClick={() => handleDelete(ad.id)}
                  className="flex items-center justify-center p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
