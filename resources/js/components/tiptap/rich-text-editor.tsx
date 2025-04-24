"use client"

import "./tiptap.css"
import { useCallback, useEffect } from "react"
import { EditorContent, useEditor, type Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import TextAlign from "@tiptap/extension-text-align"
import TextStyle from "@tiptap/extension-text-style"
import Color from "@tiptap/extension-color"
import Highlight from "@tiptap/extension-highlight"
import Link from "@tiptap/extension-link"
import Underline from "@tiptap/extension-underline"
import Typography from "@tiptap/extension-typography"

import { EditorToolbar } from "@/components/tiptap/toolbars/editor-toolbar"
import { FloatingToolbar } from "@/components/tiptap/extensions/floating-toolbar"
import { TipTapFloatingMenu } from "@/components/tiptap/extensions/floating-menu"
import { getEditorContent, htmlToPlainText, calculateReadingTime } from "@/lib/tiptap-utils"
import { ImageExtension } from "@/components/tiptap/extensions/image"
import { ImagePlaceholder } from "@/components/tiptap/extensions/image-placeholder"

interface RichTextEditorProps {
  initialContent: string;
  articleUuid: string; // Add articleUuid prop
  onUpdate?: (content: string) => void;
  onStatsUpdate?: (stats: { wordCount: number, readingTime: number }) => void;
  onEditorReady?: (editor: Editor) => void;
}

export function RichTextEditor({ 
  initialContent = "", 
  articleUuid, // Add this parameter
  onUpdate,
  onStatsUpdate,
  onEditorReady
}: RichTextEditorProps) {
  
  const updateStats = useCallback((content: string) => {
    if (!onStatsUpdate) return
    
    const plainText = htmlToPlainText(content)
    const wordCount = plainText.split(/\s+/).filter(Boolean).length
    const readingTime = calculateReadingTime(wordCount)
    
    onStatsUpdate({ wordCount, readingTime })
  }, [onStatsUpdate])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        orderedList: {
          HTMLAttributes: { class: "list-decimal" },
        },
        bulletList: {
          HTMLAttributes: { class: "list-disc" },
        },
        heading: { levels: [1, 2, 3, 4] },
      }),
      Placeholder.configure({
        emptyNodeClass: "is-editor-empty",
        placeholder: ({ node }) => {
          switch (node.type.name) {
            case "heading":
              return `Heading ${node.attrs.level}`
            case "codeBlock":
              return ""
            default:
              return "Write, type '/' for commands"
          }
        },
        includeChildren: false,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TextStyle,
      Underline,
      Link,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Typography,
      ImageExtension,
      ImagePlaceholder.configure({
        articleUuid // Pass articleUuid to the ImagePlaceholder extension
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: "max-w-full focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      const content = getEditorContent(editor)
      onUpdate?.(content)
      updateStats(content)
    },
  })

  // Set initial content if it changes externally
  useEffect(() => {
    if (!editor || !initialContent) return
    
    // Only update if content differs to avoid cursor jump
    if (editor.getHTML() !== initialContent) {
      editor.commands.setContent(initialContent)
      updateStats(initialContent)
    }
  }, [editor, initialContent, updateStats])

  // Call onEditorReady when editor is available
  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor)
    }
  }, [editor, onEditorReady])

  if (!editor) return null

  return (
    <div className="relative w-full overflow-hidden border bg-card">
      <EditorToolbar editor={editor} />
      <FloatingToolbar editor={editor} />
      <TipTapFloatingMenu editor={editor} articleUuid={articleUuid} />
      <EditorContent 
        editor={editor} 
        className="min-h-[500px] w-full cursor-text p-4 sm:p-6" 
      />
    </div>
  )
}