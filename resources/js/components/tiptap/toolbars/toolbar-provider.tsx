"use client"

import { type Editor } from "@tiptap/react"
import React, { createContext, useContext } from "react"

interface ToolbarContextType {
  editor: Editor | null
}

const ToolbarContext = createContext<ToolbarContextType>({ editor: null })

export function ToolbarProvider({
  editor,
  children,
}: {
  editor: Editor | null
  children: React.ReactNode
}) {
  return (
    <ToolbarContext.Provider value={{ editor }}>
      {children}
    </ToolbarContext.Provider>
  )
}

export function useToolbar() {
  const context = useContext(ToolbarContext)
  if (context === undefined) {
    throw new Error("useToolbar must be used within a ToolbarProvider")
  }
  return context
}