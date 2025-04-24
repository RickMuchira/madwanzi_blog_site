"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { isValidUrl } from "@/lib/tiptap-utils"
import {
  type CommandProps,
  Node,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  mergeAttributes,
} from "@tiptap/react"
import { Image, Link, Upload, Loader2, X } from "lucide-react"
import { FormEvent, useState } from "react"
import { useImageUpload } from "@/hooks/use-image-upload"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"

export interface ImagePlaceholderOptions {
  HTMLAttributes: Record<string, any>;
  articleUuid: string;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    imagePlaceholder: {
      insertImagePlaceholder: () => ReturnType
    }
  }
}

export const ImagePlaceholder = Node.create<ImagePlaceholderOptions>({
  name: "image-placeholder",

  addOptions() {
    return {
      HTMLAttributes: {},
      articleUuid: '',
    }
  },

  group: "block",

  parseHTML() {
    return [{ tag: `div[data-type="${this.name}"]` }]
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImagePlaceholderComponent)
  },

  addCommands() {
    return {
      insertImagePlaceholder: () => (props: CommandProps) => {
        return props.commands.insertContent({
          type: "image-placeholder",
        })
      },
    }
  },
})

function ImagePlaceholderComponent(props: any) {
  const { editor } = props
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<"upload" | "url">("upload")
  const [url, setUrl] = useState("")
  const [altText, setAltText] = useState("")
  const [urlError, setUrlError] = useState(false)
  const [isDragActive, setIsDragActive] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")

  // Get articleUuid from extension options or editor storage
  const articleUuid = props.extension?.options?.articleUuid || 
                      editor?.storage?.imagePlaceholder?.articleUuid || 
                      '';

  console.log("ImagePlaceholder using articleUuid:", articleUuid);

  const { previewUrl, fileInputRef, handleFileChange, handleRemove, uploading, error } = useImageUpload({
    articleUuid, 
    onUpload: (imageUrl) => {
      console.log("Image uploaded successfully, URL:", imageUrl);
      
      // Show success message
      toast({
        title: "Upload Complete",
        description: "Image uploaded successfully",
      });
      
      setUploadStatus("success");
      
      // Insert image at current position
      // Add a small delay to ensure the editor is ready
      setTimeout(() => {
        if (editor) {
          // This is the critical part - ensuring we're inserting the correct URL
          console.log("Inserting image with URL:", imageUrl);
          
          editor.chain()
            .focus()
            .setImage({ 
              src: imageUrl, 
              alt: altText || fileInputRef.current?.files?.[0]?.name 
            })
            .run();
          
          // Delete the placeholder node AFTER inserting the image
          setTimeout(() => {
            props.deleteNode();
          }, 100);
        }
      }, 100);
    },
    onError: (errorMsg) => {
      console.error("Image upload error:", errorMsg);
      setUploadStatus("error");
      toast({
        title: "Upload Failed",
        description: errorMsg || "Failed to upload image",
        variant: "destructive",
      });
    }
  });

  // Handle file input change with custom implementation
  const customHandleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("File selected:", e.target.files?.[0]?.name);
    setUploadStatus("uploading");
    await handleFileChange(e);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
    setUploadStatus("uploading");

    const file = e.dataTransfer.files[0]
    if (file) {
      console.log("File dropped:", file.name);
      const input = fileInputRef.current
      if (input) {
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(file)
        input.files = dataTransfer.files
        handleFileChange({ target: input } as any)
      }
    }
  }

  const handleInsertEmbed = (e: FormEvent) => {
    e.preventDefault()
    const valid = isValidUrl(url)
    if (!valid) {
      setUrlError(true)
      return
    }
    if (url) {
      console.log("Inserting image from URL:", url);
      editor.chain().focus().setImage({ src: url, alt: altText }).run()
      // Short delay before removing placeholder
      setTimeout(() => props.deleteNode(), 100);
    }
  }

  return (
    <NodeViewWrapper className="w-full my-4">
      <div className="relative">
        {!isExpanded ? (
          <div
            onClick={() => setIsExpanded(true)}
            className={cn(
              "group relative flex cursor-pointer flex-col items-center gap-4 rounded-lg border-2 border-dashed p-8 transition-all hover:bg-accent",
              props.selected && "border-primary bg-primary/5",
              isDragActive && "border-primary bg-primary/5",
              error && "border-destructive bg-destructive/5",
            )}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="rounded-full bg-background p-4 shadow-sm transition-colors group-hover:bg-accent">
              <Image className="h-6 w-6" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">Click to upload or drag and drop</p>
              <p className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF</p>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Add Image</h3>
              <Button variant="ghost" size="icon" onClick={() => props.deleteNode()}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </TabsTrigger>
                <TabsTrigger value="url">
                  <Link className="mr-2 h-4 w-4" />
                  URL
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload">
                <div
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className={cn(
                    "my-4 rounded-lg border-2 border-dashed p-8 text-center transition-colors",
                    isDragActive && "border-primary bg-primary/10",
                    error && "border-destructive bg-destructive/10",
                  )}
                >
                  {previewUrl ? (
                    <div className="space-y-4">
                      <img src={previewUrl} alt="Preview" className="mx-auto max-h-[200px] rounded-lg object-cover" />
                      <div className="space-y-2">
                        <Input
                          value={altText}
                          onChange={(e) => setAltText(e.target.value)}
                          placeholder="Alt text (optional)"
                        />
                      </div>
                      
                      {uploadStatus === "uploading" && (
                        <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Uploading image...</span>
                        </div>
                      )}
                      
                      {uploadStatus === "success" && (
                        <div className="text-sm text-green-600">
                          Upload complete! Inserting image...
                        </div>
                      )}
                      
                      {uploadStatus === "error" && (
                        <div className="text-sm text-red-600">
                          {error}
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={customHandleFileChange}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="flex cursor-pointer flex-col items-center gap-4">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Click to upload or drag and drop</p>
                          <p className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF</p>
                        </div>
                      </label>
                    </>
                  )}
                  {error && !uploadStatus && <p className="mt-2 text-sm text-destructive">{error}</p>}
                </div>
              </TabsContent>

              <TabsContent value="url">
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Input
                      value={url}
                      onChange={(e) => {
                        setUrl(e.target.value)
                        if (urlError) setUrlError(false)
                      }}
                      placeholder="Enter image URL..."
                    />
                    {urlError && <p className="text-xs text-destructive">Please enter a valid URL</p>}
                  </div>
                  <div className="space-y-2">
                    <Input
                      value={altText}
                      onChange={(e) => setAltText(e.target.value)}
                      placeholder="Alt text (optional)"
                    />
                  </div>
                  <Button onClick={handleInsertEmbed} className="w-full" disabled={!url}>
                    Add Image
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  )
}