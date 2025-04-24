import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ToolbarProvider } from "@/components/tiptap/toolbars/toolbar-provider"
import type { Editor } from "@tiptap/core"
import { BoldToolbar } from "@/components/tiptap/toolbars/bold"
import { ItalicToolbar } from "@/components/tiptap/toolbars/italic"
import { ImagePlaceholderToolbar } from "@/components/tiptap/extensions/image-placeholder-toolbar"
import { AlignLeft, AlignCenter, AlignRight, Heading1, Heading2, Heading3, List, ListOrdered, Code, Quote, Undo, Redo, Link as LinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export const EditorToolbar = ({ editor }: { editor: Editor }) => {
  if (!editor) return null

  return (
    <div className="sticky top-0 z-20 w-full border-b bg-background">
      <ToolbarProvider editor={editor}>
        <TooltipProvider>
          <ScrollArea className="h-fit py-0.5 overflow-x-auto">
            <div className="flex items-center gap-0.5 px-2 py-1">
              {/* History Group */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 p-0 sm:h-9 sm:w-9"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().chain().focus().undo().run()}
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 p-0 sm:h-9 sm:w-9"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().chain().focus().redo().run()}
              >
                <Redo className="h-4 w-4" />
              </Button>
              <Separator orientation="vertical" className="mx-1 h-7" />

              {/* Text Structure Group */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn("h-8 w-8 p-0 sm:h-9 sm:w-9", editor.isActive('heading', { level: 1 }) && "bg-accent")}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                  >
                    <Heading1 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Heading 1</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn("h-8 w-8 p-0 sm:h-9 sm:w-9", editor.isActive('heading', { level: 2 }) && "bg-accent")}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                  >
                    <Heading2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Heading 2</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn("h-8 w-8 p-0 sm:h-9 sm:w-9", editor.isActive('heading', { level: 3 }) && "bg-accent")}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                  >
                    <Heading3 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Heading 3</TooltipContent>
              </Tooltip>
              <Separator orientation="vertical" className="mx-1 h-7" />

              {/* Basic Formatting Group */}
              <BoldToolbar />
              <ItalicToolbar />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn("h-8 w-8 p-0 sm:h-9 sm:w-9", editor.isActive('link') && "bg-accent")}
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
                </TooltipTrigger>
                <TooltipContent>Link</TooltipContent>
              </Tooltip>
              <Separator orientation="vertical" className="mx-1 h-7" />

              {/* Lists & Structure Group */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn("h-8 w-8 p-0 sm:h-9 sm:w-9", editor.isActive('bulletList') && "bg-accent")}
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Bullet List</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn("h-8 w-8 p-0 sm:h-9 sm:w-9", editor.isActive('orderedList') && "bg-accent")}
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  >
                    <ListOrdered className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Numbered List</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn("h-8 w-8 p-0 sm:h-9 sm:w-9", editor.isActive('blockquote') && "bg-accent")}
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                  >
                    <Quote className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Blockquote</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn("h-8 w-8 p-0 sm:h-9 sm:w-9", editor.isActive('codeBlock') && "bg-accent")}
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                  >
                    <Code className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Code Block</TooltipContent>
              </Tooltip>
              <Separator orientation="vertical" className="mx-1 h-7" />

              {/* Alignment Group */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn("h-8 w-8 p-0 sm:h-9 sm:w-9", editor.isActive({ textAlign: 'left' }) && "bg-accent")}
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                  >
                    <AlignLeft className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Align Left</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn("h-8 w-8 p-0 sm:h-9 sm:w-9", editor.isActive({ textAlign: 'center' }) && "bg-accent")}
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                  >
                    <AlignCenter className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Align Center</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn("h-8 w-8 p-0 sm:h-9 sm:w-9", editor.isActive({ textAlign: 'right' }) && "bg-accent")}
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                  >
                    <AlignRight className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Align Right</TooltipContent>
              </Tooltip>
              <Separator orientation="vertical" className="mx-1 h-7" />

              {/* Media Group */}
              <ImagePlaceholderToolbar />
            </div>
          </ScrollArea>
        </TooltipProvider>
      </ToolbarProvider>
    </div>
  )
}