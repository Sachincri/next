import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Robust clipboard copy helper with fallback to document.execCommand('copy').
 * Avoids uncaught NotAllowedError: Permission denied on insecure origins or blocked permissions.
 */
export async function copyToClipboardSafe(text: string): Promise<boolean> {
  if (typeof window === "undefined" || !text) return false

  // 1. Try modern navigator.clipboard
  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // Fall through to textarea fallback
    }
  }

  // 2. Fallback to hidden textarea with document.execCommand('copy')
  try {
    const textArea = document.createElement("textarea")
    textArea.value = text
    textArea.style.position = "fixed"
    textArea.style.left = "-999999px"
    textArea.style.top = "-999999px"
    textArea.setAttribute("readonly", "")
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    const successful = document.execCommand("copy")
    document.body.removeChild(textArea)
    return successful
  } catch {
    return false
  }
}
