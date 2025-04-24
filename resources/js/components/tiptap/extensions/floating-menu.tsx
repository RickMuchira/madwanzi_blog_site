"use client"

import { FloatingMenu, type Editor } from "@tiptap/react"
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Image as ImageIcon,
  Code,
  Quote,
  Table,
  Minus,
  CheckSquare,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface CommandItem {
  title: string
  description: string
  icon: React.ReactNode
  command: (editor: Editor) => void
}

interface TipTapFloatingMenuProps {
  editor: Editor
  articleUuid?: string // Add articleUuid prop
}

export function TipTapFloatingMenu({ editor, articleUuid }: TipTapFloatingMenuProps) {
  if (!editor) return null

  // Store articleUuid in editor storage for access by other components
  if (articleUuid) {
    editor.storage.imagePlaceholder = {
      ...editor.storage.imagePlaceholder,
      articleUuid
    }
  }

  const items: CommandItem[] = [
    {
      title: "Heading 1",
      description: "Large section heading",
      icon: <Heading1 className="h-4 w-4" />,
      command: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      title: "Heading 2",
      description: "Medium section heading",
      icon: <Heading2 className="h-4 w-4" />,
      command: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      title: "Heading 3",
      description: "Small section heading",
      icon: <Heading3 className="h-4 w-4" />,
      command: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      title: "Bullet List",
      description: "Create a simple bullet list",
      icon: <List className="h-4 w-4" />,
      command: (editor) => editor.chain().focus().toggleBulletList().run(),
    },
    {
      title: "Numbered List",
      description: "Create a numbered list",
      icon: <ListOrdered className="h-4 w-4" />,
      command: (editor) => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      title: "Image",
      description: "Upload or embed an image",
      icon: <ImageIcon className="h-4 w-4" />,
      command: (editor) => editor.chain().focus().insertImagePlaceholder().run(),
    },
    {
      title: "Code Block",
      description: "Add a code block",
      icon: <Code className="h-4 w-4" />,
      command: (editor) => editor.chain().focus().toggleCodeBlock().run(),
    },
    {
      title: "Blockquote",
      description: "Add a quote",
      icon: <Quote className="h-4 w-4" />,
      command: (editor) => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      title: "Horizontal Rule",
      description: "Add a horizontal divider",
      icon: <Minus className="h-4 w-4" />,
      command: (editor) => editor.chain().focus().setHorizontalRule().run(),
    },
  ]

  return (
    <FloatingMenu
      editor={editor}
      tippyOptions={{ duration: 100 }}
      className="flex overflow-hidden rounded-md border bg-background shadow-md max-w-xs w-full"
      shouldShow={({ state }) => {
        const { selection } = state
        const { $anchor, empty } = selection
        
        // Only show when typing '/' at the start of an empty paragraph
        const isSlash = $anchor.parent.textContent[0] === '/'
        return (
          empty &&
          $anchor.parent.type.name === 'paragraph' &&
          $anchor.parent.content.size <= 1 &&
          isSlash
        )
      }}
    >
      <div className="flex flex-col w-full p-1">
        {items.map((item, index) => (
          <button
            key={index}
            onClick={() => {
              // Delete the '/' character
              editor.commands.deleteRange({
                from: editor.state.selection.anchor - 1,
                to: editor.state.selection.anchor,
              })
              // Execute the command
              item.command(editor)
            }}
            className={cn(
              "flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent text-left"
            )}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-sm border bg-background">
              {item.icon}
            </div>
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
          </button>
        ))}
      </div>
    </FloatingMenu>
  )
}