"use client"

import Image from "@tiptap/extension-image"
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react"
import { AlignCenter, AlignLeft, AlignRight, MoreVertical, Trash } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export const ImageExtension = Image.extend({
  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: "100%",
      },
      align: {
        default: "center",
      },
      caption: {
        default: "",
      },
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(TiptapImage)
  },
})

function TiptapImage(props: any) {
  const { node, editor, selected, deleteNode, updateAttributes } = props
  const imageRef = useRef<HTMLImageElement | null>(null)
  const [resizing, setResizing] = useState(false)
  const [resizingPosition, setResizingPosition] = useState<"left" | "right">("left")
  const [resizeInitialWidth, setResizeInitialWidth] = useState(0)
  const [resizeInitialMouseX, setResizeInitialMouseX] = useState(0)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  
  // Log the image source on component mount
  useEffect(() => {
    console.log("TiptapImage rendering with src:", node.attrs.src);
  }, [node.attrs.src]);
  
  function handleResizingPosition({
    e,
    position,
  }: {
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
    position: "left" | "right"
  }) {
    startResize(e)
    setResizingPosition(position)
  }

  function startResize(event: React.MouseEvent<HTMLDivElement>) {
    event.preventDefault()
    setResizing(true)
    setResizeInitialMouseX(event.clientX)
    if (imageRef.current) {
      setResizeInitialWidth(imageRef.current.offsetWidth)
    }
  }

  function resize(event: MouseEvent) {
    if (!resizing) return

    let dx = event.clientX - resizeInitialMouseX
    if (resizingPosition === "left") {
      dx = resizeInitialMouseX - event.clientX
    }

    const newWidth = Math.max(resizeInitialWidth + dx, 150)
    updateAttributes({ width: newWidth })
  }

  function endResize() {
    setResizing(false)
    setResizeInitialMouseX(0)
    setResizeInitialWidth(0)
  }

  // Set up event listeners for resize
  useEffect(() => {
    window.addEventListener("mousemove", resize)
    window.addEventListener("mouseup", endResize)
    
    return () => {
      window.removeEventListener("mousemove", resize)
      window.removeEventListener("mouseup", endResize)
    }
  }, [resizing]); // Add proper dependency array

  return (
    <NodeViewWrapper
      className={cn(
        "relative flex flex-col rounded-md border-2 border-transparent transition-all duration-200",
        selected ? "border-blue-300" : "",
        node.attrs.align === "left" && "float-left mr-4",
        node.attrs.align === "center" && "mx-auto",
        node.attrs.align === "right" && "float-right ml-4",
      )}
      style={{ width: node.attrs.width }}
    >
      <div className="group relative flex flex-col rounded-md">
        <figure className="relative m-0">
          <img
            ref={imageRef}
            src={node.attrs.src}
            alt={node.attrs.alt || ""}
            title={node.attrs.title}
            className={cn(
              "rounded-lg transition-shadow duration-200 hover:shadow-lg",
              !imageLoaded && !imageError && "min-h-[100px] bg-gray-100",
              imageError && "border border-red-500"
            )}
            onLoad={() => {
              console.log("Image loaded successfully:", node.attrs.src);
              setImageLoaded(true);
              setImageError(false);
            }}
            onError={(e) => {
              console.error("Error loading image:", node.attrs.src, e);
              setImageError(true);
              setImageLoaded(false);
            }}
          />
          
          {imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-50 rounded-lg border border-red-200">
              <p className="text-red-600 text-sm">Failed to load image</p>
            </div>
          )}
          
          {editor?.isEditable && (
            <>
              <div
                className="absolute inset-y-0 z-20 flex w-[25px] cursor-col-resize items-center justify-start p-2"
                style={{ left: 0 }}
                onMouseDown={(event) => {
                  handleResizingPosition({ e: event, position: "left" })
                }}
              >
                <div className="z-20 h-[70px] w-1 rounded-xl border bg-[rgba(0,0,0,0.65)] opacity-0 transition-all group-hover:opacity-100" />
              </div>
              <div
                className="absolute inset-y-0 z-20 flex w-[25px] cursor-col-resize items-center justify-end p-2"
                style={{ right: 0 }}
                onMouseDown={(event) => {
                  handleResizingPosition({ e: event, position: "right" })
                }}
              >
                <div className="z-20 h-[70px] w-1 rounded-xl border bg-[rgba(0,0,0,0.65)] opacity-0 transition-all group-hover:opacity-100" />
              </div>
            </>
          )}
        </figure>

        {node.attrs.caption && (
          <div
            className="mt-2 text-center text-sm text-muted-foreground"
            onClick={() => editor?.isEditable && updateAttributes({ caption: prompt("Caption:", node.attrs.caption) || "" })}
          >
            {node.attrs.caption}
          </div>
        )}

        {editor?.isEditable && (
          <div className="absolute right-4 top-4 flex items-center gap-1 rounded-md border bg-background/80 p-1 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
            <Button
              size="icon"
              className={cn("size-7", node.attrs.align === "left" && "bg-accent")}
              variant="ghost"
              onClick={() => updateAttributes({ align: "left" })}
            >
              <AlignLeft className="size-4" />
            </Button>
            <Button
              size="icon"
              className={cn("size-7", node.attrs.align === "center" && "bg-accent")}
              variant="ghost"
              onClick={() => updateAttributes({ align: "center" })}
            >
              <AlignCenter className="size-4" />
            </Button>
            <Button
              size="icon"
              className={cn("size-7", node.attrs.align === "right" && "bg-accent")}
              variant="ghost"
              onClick={() => updateAttributes({ align: "right" })}
            >
              <AlignRight className="size-4" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" className="size-7" variant="ghost">
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => updateAttributes({ 
                  caption: prompt("Caption:", node.attrs.caption || "") || ""
                })}>
                  Add/Edit Caption
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateAttributes({ 
                  alt: prompt("Alt text:", node.attrs.alt || "") || ""
                })}>
                  Edit Alt Text
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={deleteNode}>
                  <Trash className="mr-2 size-4" /> Delete Image
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  )
}