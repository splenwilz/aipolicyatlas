/**
 * CopyButton Component
 * 
 * A reusable button component that copies text to clipboard.
 * Shows visual feedback when copy is successful.
 * 
 * Uses the Clipboard API:
 * Reference: https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API
 */

"use client";

import { useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Props for CopyButton component
 */
export interface CopyButtonProps {
  /** Text to copy to clipboard */
  text: string;
  /** Label shown on the button (optional) */
  label?: string;
  /** Button variant from shadcn/ui */
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary" | "link";
  /** Button size from shadcn/ui */
  size?: "default" | "sm" | "lg" | "icon";
  /** Additional CSS classes */
  className?: string;
  /** Callback when copy succeeds */
  onCopy?: () => void;
  /** Callback when copy fails */
  onError?: (error: Error) => void;
  /** Duration to show success state in milliseconds (default: 2000) */
  successDuration?: number;
}

/**
 * CopyButton Component
 * 
 * Renders a button that copies the provided text to the clipboard.
 * Shows a checkmark icon briefly after successful copy.
 * 
 * @example
 * <CopyButton text="Hello World" label="Copy" />
 * <CopyButton text={policy.url} size="icon" variant="ghost" />
 */
export function CopyButton({
  text,
  label,
  variant = "outline",
  size = "default",
  className,
  onCopy,
  onError,
  successDuration = 2000,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  /**
   * Handle copy to clipboard
   * 
   * Uses Clipboard API with fallback for older browsers.
   * Reference: https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText
   */
  const handleCopy = useCallback(async () => {
    try {
      // Check if Clipboard API is available
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers or non-secure contexts
        // Create a temporary textarea element
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        textarea.style.left = "-999999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      // Show success state
      setCopied(true);
      onCopy?.();

      // Reset after duration
      setTimeout(() => {
        setCopied(false);
      }, successDuration);
    } catch (error) {
      console.error("Failed to copy text:", error);
      const err = error instanceof Error ? error : new Error("Failed to copy text");
      onError?.(err);
    }
  }, [text, onCopy, onError, successDuration]);

  // Determine button content based on size and state
  const showIconOnly = size === "icon" || !label;
  const Icon = copied ? Check : Copy;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={cn(
        "transition-all",
        copied && "text-green-400",
        className
      )}
      title={copied ? "Copied!" : label || "Copy to clipboard"}
      aria-label={copied ? "Copied!" : label || "Copy to clipboard"}
    >
      <Icon className={cn("h-4 w-4", !showIconOnly && "mr-2")} />
      {!showIconOnly && (
        <span>{copied ? "Copied!" : label || "Copy"}</span>
      )}
    </Button>
  );
}

