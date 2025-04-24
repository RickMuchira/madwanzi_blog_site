"use client"

import { BubbleMenu, type Editor } from "@tiptap/react"
import { ToolbarProvider } from "@/components/tiptap/toolbars/toolbar-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { BoldToolbar } from "../toolbars/bold"
import { ItalicToolbar } from "../toolbars/italic"
import { AlignLeft, AlignCenter, AlignRight, Link as LinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

export function FloatingToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null

  return (
    <TooltipProvider>
      <BubbleMenu
        tippyOptions={{
          duration: 100,
          placement: "top",
        }}
        shouldShow={({ editor, state }) => {
          const { selection } = state
          const { empty } = selection
          
          // Don't show menu for image selections or when there's no text selected
          return !empty && 
                 editor.isEditable && 
                 !editor.isActive('image') && 
                 !editor.isActive('codeBlock')
        }}
        editor={editor}
        className="flex overflow-hidden rounded-md border bg-background shadow-md"
      >
        <ToolbarProvider editor={editor}>
          <div className="flex items-center gap-1 p-1">
            <BoldToolbar />
            <ItalicToolbar />
            <Separator orientation="vertical" className="mx-1 h-6" />
            
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8 p-0", editor.isActive('link') && "bg-accent")}
              onClick={() => {
                const previousUrl = editor.getAttributes('link').href;
                const url = window.prompt('URL', previousUrl);
                
                if (url === null) {
                  return;
                }
                
                if (url === '') {
                  editor.chain().focus().unsetLink().run();
                  return;
                }
                
                editor.chain().focus().setLink({ href: url }).run();
              }}
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
            
            <Separator orientation="vertical" className="mx-1 h-6" />
            
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8 p-0", editor.isActive({ textAlign: 'left' }) && "bg-accent")}
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8 p-0", editor.isActive({ textAlign: 'center' }) && "bg-accent")}
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8 p-0", editor.isActive({ textAlign: 'right' }) && "bg-accent")}
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
            >
              <AlignRight className="h-4 w-4" />
            </Button>
          </div>
        </ToolbarProvider>
      </BubbleMenu>
    </TooltipProvider>
  )
}