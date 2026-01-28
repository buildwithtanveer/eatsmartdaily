"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import RichEditor from "@/components/RichEditor";
import MediaSelector from "@/components/admin/media/MediaSelector";
import { createPost, updatePost, deletePost } from "@/app/actions/posts";
import { 
  Copy, Check, Save, Trash2, ArrowLeft, Calendar, 
  Image as ImageIcon, Globe, Layout, Search, Link as LinkIcon,
  Settings, ChevronDown
} from "lucide-react";

interface PostData {
  id?: number;
  title?: string;
  content?: string;
  status?: string;
  publishedAt?: string | Date | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  featuredImage?: string | null;
  featuredImageAlt?: string | null;
  showInSlider?: boolean;
  showInPopular?: boolean;
  showInLatest?: boolean;
  categoryId?: number | null;
  excerpt?: string | null;
  focusKeyword?: string | null;
}

interface PostFormProps {
  categories: { id: number; name: string }[];
  post?: PostData; // If provided, we are in edit mode
  internalLinks?: { id: number; title: string; slug: string }[];
}

export default function PostForm({ categories, post, internalLinks = [] }: PostFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);

  const [title, setTitle] = useState(post?.title || "");
  const [content, setContent] = useState(post?.content || "");
  const [status, setStatus] = useState(post?.status || "DRAFT");
  const [publishedAt, setPublishedAt] = useState(post?.publishedAt ? new Date(post.publishedAt).toISOString().slice(0, 16) : "");
  const [metaTitle, setMetaTitle] = useState(post?.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(post?.metaDescription || "");
  const [featuredImage, setFeaturedImage] = useState(post?.featuredImage || "");
  const [featuredImageAlt, setFeaturedImageAlt] = useState(post?.featuredImageAlt || "");
  const [showInSlider, setShowInSlider] = useState(post?.showInSlider || false);
  const [showInPopular, setShowInPopular] = useState(post?.showInPopular || false);
  const [showInLatest, setShowInLatest] = useState(post?.showInLatest ?? true);
  const [categoryId, setCategoryId] = useState<number | string>(post?.categoryId || "");
  
  // Internal Linking Helper State
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const filteredLinks = internalLinks.filter(link => 
    link.title.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5);

  const copyToClipboard = (slug: string) => {
    const url = `/blog/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(slug);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleSubmit = (formData: FormData) => {
    // Validate Alt Text if Image is present
    if (featuredImage && !featuredImageAlt.trim()) {
      alert("Please provide Alt Text for the featured image. It is required for SEO.");
      return;
    }

    // Append rich editor content and controlled inputs that aren't native inputs
    formData.set("content", content);
    formData.set("featuredImage", featuredImage);
    formData.set("featuredImageAlt", featuredImageAlt);
    
    // Checkbox handling in FormData: if checked, value is "on", if not, it's missing.
    // But since I'm controlling state, I should ensure the FormData matches my state if I were submitting normally.
    // However, I'm constructing FormData from the form element, so native inputs work.
    // But "content" and "featuredImage" are custom.

    // Also verify checkboxes
    if (showInSlider) formData.set("showInSlider", "on"); else formData.delete("showInSlider");
    if (showInPopular) formData.set("showInPopular", "on"); else formData.delete("showInPopular");
    if (showInLatest) formData.set("showInLatest", "on"); else formData.delete("showInLatest");
    
    // Add scheduling date if present
    if (publishedAt) formData.set("publishedAt", publishedAt);

    startTransition(async () => {
      let result;
      if (post && post.id) {
        result = await updatePost(post.id, formData);
      } else {
        result = await createPost(formData);
      }

      if (result.success) {
        router.push("/admin/posts");
        router.refresh();
      } else {
        alert(result.message || "Something went wrong");
      }
    });
  };

  const handleDelete = async () => {
    if (!post || !post.id) return;
    if (!confirm("Are you sure you want to delete this post?")) return;
    
    setIsDeleting(true);
    const result = await deletePost(post.id);
    if (result.success) {
      router.push("/admin/posts");
      router.refresh();
    } else {
      alert("Failed to delete post");
      setIsDeleting(false);
    }
  };

  return (
    <form action={handleSubmit} className="max-w-[1600px] mx-auto pb-10">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/posts"
            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-600"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{post ? "Edit Post" : "Create New Post"}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {post ? `Editing "${post.title}"` : "Write something amazing today."}
            </p>
          </div>
        </div>
        
        <div className="flex gap-3 w-full sm:w-auto">
          {post && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting || isPending}
              className="flex items-center justify-center gap-2 text-red-600 bg-white border border-gray-200 px-4 py-2.5 rounded-lg hover:bg-red-50 hover:border-red-100 transition-all font-medium flex-1 sm:flex-none"
            >
              <Trash2 size={18} />
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          )}
          <button
            type="submit"
            disabled={isPending || isDeleting}
            className="flex items-center justify-center gap-2 bg-black text-white px-6 py-2.5 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-all font-medium shadow-sm hover:shadow-md hover:-translate-y-0.5 flex-1 sm:flex-none"
          >
            {isPending ? <Save className="animate-spin" size={18} /> : <Save size={18} />}
            {isPending ? "Saving..." : "Save Post"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Content Column */}
        <div className="xl:col-span-2 space-y-8">
          {/* Title & Content */}
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-200 space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Post Title</label>
              <input
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 text-xl font-bold border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-hidden transition-all placeholder:text-gray-400"
                placeholder="Enter post title..."
                required
                autoFocus
              />
            </div>

            <div className="min-h-[400px]">
              <RichEditor content={content} onChange={setContent} />
            </div>
          </div>

          {/* SEO Settings */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Globe size={20} />
              </div>
              <h3 className="font-bold text-gray-900">SEO Configuration</h3>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Meta Title</label>
                <div className="relative">
                  <input
                    name="metaTitle"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-hidden transition-all text-sm"
                    placeholder="SEO friendly title"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-mono">
                    {metaTitle.length}/60
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1.5">Ideally between 50-60 characters</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Meta Description</label>
                <div className="relative">
                  <textarea
                    name="metaDescription"
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-hidden transition-all text-sm min-h-[100px] resize-y"
                    placeholder="Brief summary for search engines..."
                  />
                  <span className="absolute right-3 bottom-3 text-xs text-gray-400 font-mono">
                    {metaDescription.length}/160
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1.5">Ideally between 150-160 characters</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Publishing Card */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <Settings size={18} />
              </div>
              <h3 className="font-bold text-gray-900">Publishing</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Status</label>
                <div className="relative">
                  <select
                    name="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-hidden appearance-none bg-gray-50 cursor-pointer font-medium text-sm"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>

              {(status === "SCHEDULED" || status === "PUBLISHED") && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    {status === "SCHEDULED" ? "Schedule Date" : "Publish Date"}
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    <input
                      type="datetime-local"
                      value={publishedAt}
                      onChange={(e) => setPublishedAt(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-hidden text-sm ${
                        status === "SCHEDULED" && !publishedAt ? "border-red-300 bg-red-50" : "border-gray-200"
                      }`}
                    />
                  </div>
                  {status === "SCHEDULED" && !publishedAt && (
                    <p className="text-xs text-red-500 mt-1 font-medium">Required for scheduling</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category</label>
                <div className="relative">
                  <select
                    name="categoryId"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-hidden appearance-none cursor-pointer text-sm"
                  >
                    <option value="">Select Category...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>
            </div>
          </div>

          {/* Featured Image Card */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100">
              <div className="p-2 bg-pink-50 text-pink-600 rounded-lg">
                <ImageIcon size={18} />
              </div>
              <h3 className="font-bold text-gray-900">Featured Image</h3>
            </div>

            <div className="space-y-4">
              <MediaSelector value={featuredImage} onChange={setFeaturedImage} />
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Alt Text {featuredImage && <span className="text-red-500">*</span>}
                </label>
                <input
                  value={featuredImageAlt}
                  onChange={(e) => setFeaturedImageAlt(e.target.value)}
                  placeholder="Describe image for SEO..."
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-hidden text-sm ${
                    featuredImage && !featuredImageAlt ? "border-red-300 bg-red-50" : "border-gray-200"
                  }`}
                  required={!!featuredImage}
                />
                <p className="text-xs text-gray-400 mt-1.5">Required for accessibility and SEO</p>
              </div>
            </div>
          </div>

          {/* Display Options Card */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
             <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100">
              <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                <Layout size={18} />
              </div>
              <h3 className="font-bold text-gray-900">Display Options</h3>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors group">
                <span className="text-sm font-medium text-gray-700">Show in Slider</span>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showInSlider}
                    onChange={(e) => setShowInSlider(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-black/10 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                </div>
              </label>

              <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors group">
                <span className="text-sm font-medium text-gray-700">Show in Popular</span>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showInPopular}
                    onChange={(e) => setShowInPopular(e.target.checked)}
                    className="sr-only peer"
                  />
                   <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-black/10 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                </div>
              </label>

              <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors group">
                <span className="text-sm font-medium text-gray-700">Show in Latest</span>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showInLatest}
                    onChange={(e) => setShowInLatest(e.target.checked)}
                    className="sr-only peer"
                  />
                   <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-black/10 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                </div>
              </label>
            </div>
          </div>

          {/* Internal Linking Helper */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100">
              <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                <LinkIcon size={18} />
              </div>
              <h3 className="font-bold text-gray-900">Link Helper</h3>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search posts to link..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-hidden text-sm"
                />
              </div>
              
              <div className="max-h-[200px] overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                {filteredLinks.length > 0 ? (
                  filteredLinks.map(link => (
                    <div key={link.id} className="group flex items-center justify-between text-sm p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200">
                      <div className="flex-1 min-w-0 mr-3">
                         <p className="truncate font-medium text-gray-700" title={link.title}>{link.title}</p>
                         <p className="truncate text-xs text-gray-400 font-mono mt-0.5">{link.slug}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(link.slug)}
                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-all"
                        title="Copy Link"
                      >
                        {copiedLink === link.slug ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <p className="text-xs">
                      {searchTerm ? "No matching posts" : "Search to find posts"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
