import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ToolbarProvider } from "./toolbar-provider"
import type { Editor } from "@tiptap/core"

// For now, implementing a minimal toolbar until we add all the buttons
export const EditorToolbar = ({ editor }: { editor: Editor }) => {
  return (
    <div className="sticky top-0 z-20 w-full border-b bg-background">
      <ToolbarProvider editor={editor}>
        <TooltipProvider>
          <ScrollArea className="h-fit py-0.5">
            <div className="flex items-center gap-1 px-2">
              {/* We'll add toolbar buttons here in the next steps */}
              <div className="p-2 text-sm text-muted-foreground">
                Editor toolbar - We'll add buttons here
              </div>
            </div>
          </ScrollArea>
        </TooltipProvider>
      </ToolbarProvider>
    </div>
  )
}