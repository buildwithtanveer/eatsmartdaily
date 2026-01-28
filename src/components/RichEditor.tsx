"use client";

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import { useState } from "react";
import { Bold, Italic, List, ListOrdered, Quote, Undo, Redo, Image as ImageIcon } from "lucide-react";
import MediaLibraryModal from "@/components/admin/media/MediaLibraryModal";

const MenuBar = ({ editor, onImageClick }: { editor: Editor | null; onImageClick: () => void }) => {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap gap-2 border-b p-2 mb-2 bg-gray-50">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-1 rounded ${editor.isActive("bold") ? "bg-gray-200" : "hover:bg-gray-200"}`}
      >
        <Bold size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-1 rounded ${editor.isActive("italic") ? "bg-gray-200" : "hover:bg-gray-200"}`}
      >
        <Italic size={18} />
      </button>
      <div className="w-px h-6 bg-gray-300 mx-1" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1 rounded ${editor.isActive("bulletList") ? "bg-gray-200" : "hover:bg-gray-200"}`}
      >
        <List size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1 rounded ${editor.isActive("orderedList") ? "bg-gray-200" : "hover:bg-gray-200"}`}
      >
        <ListOrdered size={18} />
      </button>
      <div className="w-px h-6 bg-gray-300 mx-1" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-1 rounded ${editor.isActive("blockquote") ? "bg-gray-200" : "hover:bg-gray-200"}`}
      >
        <Quote size={18} />
      </button>
      <button
        type="button"
        onClick={onImageClick}
        className="p-1 rounded hover:bg-gray-200"
        title="Insert Image"
      >
        <ImageIcon size={18} />
      </button>
      <div className="w-px h-6 bg-gray-300 mx-1" />
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
      >
        <Undo size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
      >
        <Redo size={18} />
      </button>
    </div>
  );
};

interface RichEditorProps {
  content: string;
  onChange: (html: string) => void;
}

export default function RichEditor({ content, onChange }: RichEditorProps) {
  const [isMediaOpen, setIsMediaOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExtension.configure({
        inline: true,
        allowBase64: true,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: "prose max-w-none focus:outline-none min-h-[200px] p-2",
      },
    },
    immediatelyRender: false, 
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  const handleImageSelect = (url: string) => {
    if (editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
    setIsMediaOpen(false);
  };

  if (!editor) return null;

  return (
    <>
      <div className="border border-gray-200 rounded-lg bg-white overflow-hidden focus-within:ring-2 focus-within:ring-black/5 focus-within:border-black transition-all">
        <MenuBar editor={editor} onImageClick={() => setIsMediaOpen(true)} />
        <EditorContent editor={editor} className="p-2" />
      </div>
      
      <MediaLibraryModal 
        isOpen={isMediaOpen} 
        onClose={() => setIsMediaOpen(false)} 
        onSelect={handleImageSelect} 
      />
    </>
  );
}
