"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import RichEditor from "@/components/RichEditor";
import MediaSelector from "@/components/admin/media/MediaSelector";
import { createPost, updatePost, deletePost } from "@/app/actions/posts";
import { 
  Copy, Check, Save, Trash2, ArrowLeft, Calendar, 
  Image as ImageIcon, Globe, Layout, Search, Link as LinkIcon,
  Settings, ChevronDown, Plus, X, Eye, EyeOff, AlertCircle
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
  allowComments?: boolean;
  categoryId?: number | null;
  excerpt?: string | null;
  focusKeyword?: string | null;
  faq?: any;
  references?: any;
  isFeatured?: boolean;
  reviewerId?: number | null;
  tags?: { tag: { id: number; name: string } }[];
}

interface PostFormProps {
  categories: { id: number; name: string }[];
  tags: { id: number; name: string }[];
  post?: PostData; // If provided, we are in edit mode
  internalLinks?: { id: number; title: string; slug: string }[];
  users?: { id: number; name: string }[];
}

export default function PostForm({ categories, tags, post, internalLinks = [], users = [] }: PostFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  
  // Autosave State
  const [postId, setPostId] = useState<number | undefined>(post?.id);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [timeAgo, setTimeAgo] = useState<string>("");
  const isFirstRun = useRef(true);
  
  // Validation State
  const [errors, setErrors] = useState<Record<string, string>>({});

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
  const [allowComments, setAllowComments] = useState(post?.allowComments ?? true);
  const [isFeatured, setIsFeatured] = useState(post?.isFeatured || false);
  const [categoryId, setCategoryId] = useState<number | string>(post?.categoryId || "");
  const [reviewerId, setReviewerId] = useState<number | string>(post?.reviewerId || "");
  const [selectedTags, setSelectedTags] = useState<number[]>(
    post?.tags?.map((t) => t.tag.id) || []
  );

  // FAQ State
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>(
    Array.isArray(post?.faq) ? post.faq : []
  );

  // References State
  const [references, setReferences] = useState<{ title: string; url: string }[]>(
    Array.isArray(post?.references) ? post.references : []
  );
  
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

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!content.trim() || content === "<p></p>") newErrors.content = "Content is required";
    if (featuredImage && !featuredImageAlt.trim()) newErrors.featuredImageAlt = "Alt text is required for accessibility";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getFormData = (overrides: Record<string, any> = {}) => {
    const formData = new FormData();
    formData.set("title", overrides.title ?? title);
    formData.set("content", overrides.content ?? content);
    formData.set("status", overrides.status ?? status);
    const currentCategoryId = overrides.categoryId ?? categoryId;
    if (currentCategoryId) formData.set("categoryId", currentCategoryId.toString());
    formData.set("featuredImage", overrides.featuredImage ?? featuredImage);
    formData.set("featuredImageAlt", overrides.featuredImageAlt ?? featuredImageAlt);
    
    if (overrides.showInSlider ?? showInSlider) formData.set("showInSlider", "on");
    if (overrides.showInPopular ?? showInPopular) formData.set("showInPopular", "on");
    if (overrides.showInLatest ?? showInLatest) formData.set("showInLatest", "on");
    if (overrides.allowComments ?? allowComments) formData.set("allowComments", "on");
    if (overrides.isFeatured ?? isFeatured) formData.set("isFeatured", "on");
    
    formData.set("metaTitle", overrides.metaTitle ?? metaTitle);
    formData.set("metaDescription", overrides.metaDescription ?? metaDescription);
    
    const currentReviewerId = overrides.reviewerId ?? reviewerId;
    if (currentReviewerId) formData.set("reviewerId", currentReviewerId.toString());
    formData.set("faq", JSON.stringify(faqs.filter(f => f.question && f.answer)));
    formData.set("references", JSON.stringify(references.filter(r => r.title && r.url)));
    formData.set("tags", JSON.stringify(selectedTags));
    
    const currentPublishedAt = overrides.publishedAt ?? publishedAt;
    if (currentPublishedAt) formData.set("publishedAt", currentPublishedAt);
    
    return formData;
  };

  const savePost = async (silent = false, overrides: Record<string, any> = {}) => {
    if (!silent && !validate()) return;
    
    // Don't autosave if no title
    if (silent && !title.trim()) return;

    if (silent) setIsSaving(true);
    
    const formData = getFormData(overrides);
    
    let result;
    try {
      if (postId) {
        result = await updatePost(postId, formData);
      } else {
        result = await createPost(formData);
      }

      if (result.success) {
        if (result.post?.id) {
          setPostId(result.post.id);
        }
        setLastSaved(new Date());
        setIsDirty(false);
        
        // Update local state if overrides were used
        if (overrides.status) setStatus(overrides.status);
        
        if (!silent) {
          router.push("/admin/posts");
          router.refresh();
        }
      } else if (!silent) {
        alert(result.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Save failed:", error);
      if (!silent) alert("Failed to save post");
    } finally {
      setIsSaving(false);
    }
  };

  // Autosave Effect
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    // Mark as dirty whenever dependencies change
    setIsDirty(true);

    // Only autosave if we have a title and it's a draft
    // Or if it's already saved (has ID) to update it
    if (!title.trim() || status === "PUBLISHED" || status === "SCHEDULED") return;

    const timer = setTimeout(() => {
      savePost(true);
    }, 5000); // Autosave every 5 seconds of inactivity

    return () => clearTimeout(timer);
  }, [
    title, content, status, publishedAt, metaTitle, metaDescription,
    featuredImage, featuredImageAlt, showInSlider, showInPopular, 
    showInLatest, allowComments, isFeatured, categoryId, reviewerId, 
    selectedTags, faqs, references
  ]);

  // Update "Saved X ago" text
  useEffect(() => {
    if (!lastSaved) return;
    
    const updateTime = () => {
      const diff = Math.floor((new Date().getTime() - lastSaved.getTime()) / 1000);
      if (diff < 60) setTimeAgo("just now");
      else if (diff < 3600) setTimeAgo(`${Math.floor(diff / 60)}m ago`);
      else setTimeAgo(`${Math.floor(diff / 3600)}h ago`);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [lastSaved]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        savePost(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        setViewMode(prev => prev === 'edit' ? 'preview' : 'edit');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        // Publish shortcut
        if (confirm("Do you want to publish this post now?")) {
           savePost(false, { status: 'PUBLISHED' });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [title, content, status, categoryId, featuredImage, featuredImageAlt]); // Add dependencies needed for getFormData via closure if not using refs

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    startTransition(() => {
      savePost(false);
    });
  };

  const handleDelete = async () => {
    if (!postId) return;
    if (!confirm("Are you sure you want to delete this post?")) return;
    
    setIsDeleting(true);
    const result = await deletePost(postId);
    if (result.success) {
      router.push("/admin/posts");
      router.refresh();
    } else {
      alert("Failed to delete post");
      setIsDeleting(false);
    }
  };

  const PreviewPanel = () => (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 max-w-4xl mx-auto">
      <div className="mb-8 text-center border-b pb-8">
        {featuredImage && (
          <div className="relative w-full h-64 md:h-96 mb-6 rounded-xl overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={featuredImage} alt={featuredImageAlt} className="object-cover w-full h-full" />
          </div>
        )}
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">{title || "Untitled Post"}</h1>
        <div className="flex items-center justify-center gap-4 text-gray-500 text-sm">
          <span>{new Date().toLocaleDateString()}</span>
          <span>•</span>
          <span>{categories.find(c => c.id === Number(categoryId))?.name || "Uncategorized"}</span>
        </div>
      </div>
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto pb-10">
      {/* Header Actions */}
      <div className="sticky top-16 z-30 bg-gray-50/95 backdrop-blur-sm py-4 border-b border-gray-200 mb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin/posts"
              className="w-11 h-11 flex items-center justify-center bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-600 shadow-sm"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{postId ? "Edit Post" : "Create New Post"}</h1>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Status Indicator */}
            <div className="mr-4 hidden sm:block">
              {isSaving ? (
                <span className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                  Saving...
                </span>
              ) : isDirty ? (
                !title.trim() ? (
                  <span className="text-sm font-medium text-orange-600 flex items-center gap-2">
                    <AlertCircle size={14} />
                    Title required
                  </span>
                ) : (
                  <span className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
                    Unsaved
                  </span>
                )
              ) : lastSaved ? (
                <span className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <Check size={14} />
                  Saved
                </span>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'edit' ? 'preview' : 'edit')}
              className="h-11 flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 px-5 rounded-lg hover:bg-gray-50 transition-all font-medium shadow-sm"
            >
              {viewMode === 'edit' ? <Eye size={18} /> : <EyeOff size={18} />}
              {viewMode === 'edit' ? "Preview" : "Edit"}
            </button>
            
            {postId && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting || isPending}
                className="h-11 w-11 flex items-center justify-center text-red-600 bg-white border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-100 transition-all font-medium shadow-sm"
              >
                <Trash2 size={18} />
              </button>
            )}
            
            <button
              onClick={handleSubmit}
              disabled={isPending || isDeleting}
              className="h-11 flex items-center justify-center gap-2 bg-black text-white px-8 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-all font-medium shadow-sm"
            >
              {isPending ? <Save className="animate-spin" size={18} /> : <Save size={18} />}
              {isPending ? "Saving..." : "Save Post"}
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'preview' ? (
        <PreviewPanel />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="xl:col-span-2 space-y-8">
            {/* Title & Content */}
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-200 space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Post Title <span className="text-red-500">*</span>
                </label>
                <input
                  name="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full px-4 py-3 text-xl font-bold border rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-hidden transition-all placeholder:text-gray-400 ${errors.title ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                  placeholder="Enter post title..."
                  autoFocus
                />
                {errors.title && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12}/> {errors.title}</p>}
              </div>

              <div className="min-h-[400px]">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Content <span className="text-red-500">*</span>
                </label>
                <RichEditor content={content} onChange={setContent} />
                {errors.content && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12}/> {errors.content}</p>}
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

            {/* FAQ Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                    <Search size={20} />
                  </div>
                  <h3 className="font-bold text-gray-900">FAQ Section</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setFaqs([...faqs, { question: "", answer: "" }])}
                  className="text-sm font-bold text-green-600 hover:text-green-700 flex items-center gap-1"
                >
                  <Plus size={16} />
                  Add Question
                </button>
              </div>
              
              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-100 relative group">
                    <button
                      type="button"
                      onClick={() => setFaqs(faqs.filter((_, i) => i !== index))}
                      className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Question</label>
                        <input
                          value={faq.question}
                          onChange={(e) => {
                            const newFaqs = [...faqs];
                            newFaqs[index].question = e.target.value;
                            setFaqs(newFaqs);
                          }}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-hidden text-sm"
                          placeholder="e.g. Is this recipe vegan?"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Answer</label>
                        <textarea
                          value={faq.answer}
                          onChange={(e) => {
                            const newFaqs = [...faqs];
                            newFaqs[index].answer = e.target.value;
                            setFaqs(newFaqs);
                          }}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-hidden text-sm min-h-[80px]"
                          placeholder="Provide a clear answer..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {faqs.length === 0 && (
                  <p className="text-center py-4 text-sm text-gray-400 italic">No FAQ items added yet.</p>
                )}
              </div>
            </div>

            {/* References Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                    <LinkIcon size={20} />
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
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-hidden text-sm"
                      />
                    </div>
                  </div>
                )}
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
                <MediaSelector
                  value={featuredImage || ""}
                  onChange={setFeaturedImage}
                />
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Alt Text <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="featuredImageAlt"
                    value={featuredImageAlt}
                    onChange={(e) => setFeaturedImageAlt(e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-hidden text-sm ${errors.featuredImageAlt ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                    placeholder="Describe the image..."
                  />
                  {errors.featuredImageAlt && <p className="text-red-500 text-xs mt-1">{errors.featuredImageAlt}</p>}
                </div>
              </div>
            </div>

            {/* Categories & Tags */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Layout size={18} />
                </div>
                <h3 className="font-bold text-gray-900">Organization</h3>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category</label>
                  <div className="relative">
                    <select
                      name="categoryId"
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-hidden appearance-none bg-gray-50 cursor-pointer text-sm"
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={16} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedTags.map(tagId => {
                      const tag = tags.find(t => t.id === tagId);
                      return tag ? (
                        <span key={tag.id} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {tag.name}
                          <button
                            type="button"
                            onClick={() => setSelectedTags(selectedTags.filter(id => id !== tag.id))}
                            className="hover:text-red-600"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ) : null;
                    })}
                  </div>
                  <select
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      if (id && !selectedTags.includes(id)) {
                        setSelectedTags([...selectedTags, id]);
                      }
                      e.target.value = "";
                    }}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-hidden appearance-none bg-gray-50 cursor-pointer text-sm"
                  >
                    <option value="">Add Tag...</option>
                    {tags.map((tag) => (
                      <option key={tag.id} value={tag.id}>
                        {tag.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Visibility Settings */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100">
                <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
                  <Eye size={18} />
                </div>
                <h3 className="font-bold text-gray-900">Visibility</h3>
              </div>
              
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                  />
                  <span className="text-sm font-medium text-gray-700">Feature this post</span>
                </label>
                
                <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={showInSlider}
                    onChange={(e) => setShowInSlider(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                  />
                  <span className="text-sm font-medium text-gray-700">Show in Slider</span>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={showInPopular}
                    onChange={(e) => setShowInPopular(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                  />
                  <span className="text-sm font-medium text-gray-700">Show in Popular</span>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={allowComments}
                    onChange={(e) => setAllowComments(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                  />
                  <span className="text-sm font-medium text-gray-700">Allow Comments</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}