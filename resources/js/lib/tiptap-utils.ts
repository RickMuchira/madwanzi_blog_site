// Utility functions for TipTap

// Class name applied to node views that handle their own selected styles
export const NODE_HANDLES_SELECTED_STYLE_CLASSNAME = 'ProseMirror-selectednode'

// Validate URL format
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch (error) {
    return false
  }
}

// Helper to safely get HTML from editor
export function getEditorContent(editor: any): string {
  if (!editor) return ""
  return editor.getHTML()
}

// Convert HTML string to plain text (for word counting)
export function htmlToPlainText(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return doc.body.textContent || ""
}

// Calculate reading time from word count
export function calculateReadingTime(wordCount: number): number {
  const wordsPerMinute = 225 // Average reading speed
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute))
}