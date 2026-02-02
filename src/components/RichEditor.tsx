"use client";

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import { useState } from "react";
import { 
  Bold, Italic, List, ListOrdered, Quote, Undo, Redo, 
  Image as ImageIcon, Link as LinkIcon, Heading1, Heading2, Code 
} from "lucide-react";
import MediaLibraryModal from "@/components/admin/media/MediaLibraryModal";

const MenuBar = ({ editor, onImageClick }: { editor: Editor | null; onImageClick: () => void }) => {
  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    // update link
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-wrap gap-2 border-b p-2 mb-2 bg-gray-50">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-1 rounded ${editor.isActive("heading", { level: 2 }) ? "bg-gray-200" : "hover:bg-gray-200"}`}
        title="Heading 2"
      >
        <Heading1 size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`p-1 rounded ${editor.isActive("heading", { level: 3 }) ? "bg-gray-200" : "hover:bg-gray-200"}`}
        title="Heading 3"
      >
        <Heading2 size={18} />
      </button>
      <div className="w-px h-6 bg-gray-300 mx-1" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-1 rounded ${editor.isActive("bold") ? "bg-gray-200" : "hover:bg-gray-200"}`}
        title="Bold"
      >
        <Bold size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-1 rounded ${editor.isActive("italic") ? "bg-gray-200" : "hover:bg-gray-200"}`}
        title="Italic"
      >
        <Italic size={18} />
      </button>
      <button
        type="button"
        onClick={setLink}
        className={`p-1 rounded ${editor.isActive("link") ? "bg-gray-200" : "hover:bg-gray-200"}`}
        title="Link"
      >
        <LinkIcon size={18} />
      </button>
      <div className="w-px h-6 bg-gray-300 mx-1" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1 rounded ${editor.isActive("bulletList") ? "bg-gray-200" : "hover:bg-gray-200"}`}
        title="Bullet List"
      >
        <List size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1 rounded ${editor.isActive("orderedList") ? "bg-gray-200" : "hover:bg-gray-200"}`}
        title="Ordered List"
      >
        <ListOrdered size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`p-1 rounded ${editor.isActive("codeBlock") ? "bg-gray-200" : "hover:bg-gray-200"}`}
        title="Code Block"
      >
        <Code size={18} />
      </button>
      <div className="w-px h-6 bg-gray-300 mx-1" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-1 rounded ${editor.isActive("blockquote") ? "bg-gray-200" : "hover:bg-gray-200"}`}
        title="Quote"
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
        title="Undo"
      >
        <Undo size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
        title="Redo"
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
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      ImageExtension.configure({
        inline: true,
        allowBase64: true,
      }),
      LinkExtension.configure({
        openOnClick: false,
        autolink: true,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: "prose max-w-none focus:outline-none min-h-[400px] p-4",
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
      <div className="border border-gray-200 rounded-lg bg-white overflow-hidden focus-within:ring-2 focus-within:ring-black/5 focus-within:border-black transition-all shadow-sm">
        <MenuBar editor={editor} onImageClick={() => setIsMediaOpen(true)} />
        <EditorContent editor={editor} className="min-h-[400px]" />
      </div>
      
      <MediaLibraryModal 
        isOpen={isMediaOpen} 
        onClose={() => setIsMediaOpen(false)} 
        onSelect={handleImageSelect} 
      />
    </>
  );
}