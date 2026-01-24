'use client';

import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough, 
  Code, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Quote, 
  Undo, 
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Unlink
} from 'lucide-react';

interface TiptapEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

export default function TiptapEditor({ 
  value, 
  onChange, 
  placeholder = "Type your content here...", 
  className = "",
  id 
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer',
        },
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-2 sm:p-4',
      },
      handlePaste: (view, event, slice) => {
        // Allow default paste behavior to preserve formatting
        return false;
      },
    },
  });

    useEffect(() => {
    if (editor) {
      const currentContent = editor.getHTML();
      
      if (value !== currentContent) {
        editor.commands.setContent(value || '', { emitUpdate: false });
      }
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div className={`border border-gray-300 rounded-lg ${className}`}>
        <div className="p-4 text-gray-400">Loading editor...</div>
      </div>
    );
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className={`border border-gray-300 rounded-lg ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-1 sm:p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        {/* Text Formatting */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-1 sm:pr-2 mr-1 sm:mr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1 sm:p-2 rounded hover:bg-gray-100 transition-colors ${
              editor.isActive('bold') ? 'bg-gray-200 text-gray-800' : 'text-gray-600'
            }`}
            title="Bold"
          >
            <Bold className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1 sm:p-2 rounded hover:bg-gray-100 transition-colors ${
              editor.isActive('italic') ? 'bg-gray-200 text-gray-800' : 'text-gray-600'
            }`}
            title="Italic"
          >
            <Italic className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-1 sm:p-2 rounded hover:bg-gray-100 transition-colors ${
              editor.isActive('underline') ? 'bg-gray-200 text-gray-800' : 'text-gray-600'
            }`}
            title="Underline"
          >
            <UnderlineIcon className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-1 sm:p-2 rounded hover:bg-gray-100 transition-colors ${
              editor.isActive('strike') ? 'bg-gray-200 text-gray-800' : 'text-gray-600'
            }`}
            title="Strikethrough"
          >
            <Strikethrough className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-1 sm:p-2 rounded hover:bg-gray-100 transition-colors ${
              editor.isActive('code') ? 'bg-gray-200 text-gray-800' : 'text-gray-600'
            }`}
            title="Code"
          >
            <Code className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Headings */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-1 sm:pr-2 mr-1 sm:mr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-1 sm:p-2 rounded hover:bg-gray-100 transition-colors ${
              editor.isActive('heading', { level: 1 }) ? 'bg-gray-200 text-gray-800' : 'text-gray-600'
            }`}
            title="Heading 1"
          >
            <Heading1 className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1 sm:p-2 rounded hover:bg-gray-100 transition-colors ${
              editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 text-gray-800' : 'text-gray-600'
            }`}
            title="Heading 2"
          >
            <Heading2 className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-1 sm:p-2 rounded hover:bg-gray-100 transition-colors ${
              editor.isActive('heading', { level: 3 }) ? 'bg-gray-200 text-gray-800' : 'text-gray-600'
            }`}
            title="Heading 3"
          >
            <Heading3 className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-1 sm:pr-2 mr-1 sm:mr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1 sm:p-2 rounded hover:bg-gray-100 transition-colors ${
              editor.isActive('bulletList') ? 'bg-gray-200 text-gray-800' : 'text-gray-600'
            }`}
            title="Bullet List"
          >
            <List className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1 sm:p-2 rounded hover:bg-gray-100 transition-colors ${
              editor.isActive('orderedList') ? 'bg-gray-200 text-gray-800' : 'text-gray-600'
            }`}
            title="Numbered List"
          >
            <ListOrdered className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1 sm:p-2 rounded hover:bg-gray-100 transition-colors ${
              editor.isActive('blockquote') ? 'bg-gray-200 text-gray-800' : 'text-gray-600'
            }`}
            title="Quote"
          >
            <Quote className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Text Alignment */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-1 sm:pr-2 mr-1 sm:mr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-1 sm:p-2 rounded hover:bg-gray-100 transition-colors ${
              editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200 text-gray-800' : 'text-gray-600'
            }`}
            title="Align Left"
          >
            <AlignLeft className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-1 sm:p-2 rounded hover:bg-gray-100 transition-colors ${
              editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200 text-gray-800' : 'text-gray-600'
            }`}
            title="Align Center"
          >
            <AlignCenter className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-1 sm:p-2 rounded hover:bg-gray-100 transition-colors ${
              editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200 text-gray-800' : 'text-gray-600'
            }`}
            title="Align Right"
          >
            <AlignRight className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={`p-1 sm:p-2 rounded hover:bg-gray-100 transition-colors ${
              editor.isActive({ textAlign: 'justify' }) ? 'bg-gray-200 text-gray-800' : 'text-gray-600'
            }`}
            title="Justify"
          >
            <AlignJustify className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Links */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-1 sm:pr-2 mr-1 sm:mr-2">
          <button
            type="button"
            onClick={setLink}
            className={`p-1 sm:p-2 rounded hover:bg-gray-100 transition-colors ${
              editor.isActive('link') ? 'bg-gray-200 text-gray-800' : 'text-gray-600'
            }`}
            title="Add Link"
          >
            <LinkIcon className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().unsetLink().run()}
            className={`p-1 sm:p-2 rounded hover:bg-gray-100 transition-colors ${
              !editor.isActive('link') ? 'bg-gray-200 text-gray-800' : 'text-gray-600'
            }`}
            title="Remove Link"
          >
            <Unlink className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-2 rounded hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
            title="Undo"
          >
            <Undo className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-2 rounded hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
            title="Redo"
          >
            <Redo className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="relative">
        <EditorContent 
          editor={editor} 
          className="min-h-[200px] max-h-[400px] overflow-y-auto"
        />
        
        {/* Character Count */}
        <div className="absolute bottom-3 right-3 text-xs text-gray-400 bg-white px-2 py-1 rounded shadow-sm">
          {value.replace(/<[^>]*>/g, '').length} characters
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        .ProseMirror {
          outline: none;
          padding: 1rem;
          min-height: 200px;
        }
        
        .ProseMirror p.is-editor-empty:first-child::before {
          color: #adb5bd;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        
        .ProseMirror h1 {
          font-size: 2rem;
          font-weight: bold;
          margin: 1rem 0 0.5rem 0;
          line-height: 1.2;
        }
        
        .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0.8rem 0 0.4rem 0;
          line-height: 1.3;
        }
        
        .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: bold;
          margin: 0.6rem 0 0.3rem 0;
          line-height: 1.4;
        }
        
        .ProseMirror p {
          margin: 0.5rem 0;
          line-height: 1.6;
        }
        
        .ProseMirror ul, .ProseMirror ol {
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        
        .ProseMirror li {
          margin: 0.25rem 0;
        }
        
        .ProseMirror blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #6b7280;
        }
        
        .ProseMirror code {
          background-color: #f3f4f6;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
        }
        
        .ProseMirror pre {
          background-color: #f3f4f6;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1rem 0;
        }
        
        .ProseMirror pre code {
          background: none;
          padding: 0;
        }
        
        .ProseMirror a {
          color: #2563eb;
          text-decoration: underline;
          cursor: pointer;
        }
        
        .ProseMirror a:hover {
          color: #1d4ed8;
        }
        
        .ProseMirror strong {
          font-weight: bold;
        }
        
        .ProseMirror em {
          font-style: italic;
        }
        
        .ProseMirror u {
          text-decoration: underline;
        }
        
        .ProseMirror s {
          text-decoration: line-through;
        }
      `}</style>
    </div>
  );
}
