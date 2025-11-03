/**
 * CopyUrlButton Component
 * 
 * Client component that copies the current page URL to clipboard.
 * Automatically detects the current URL from the browser.
 * 
 * Uses the Clipboard API:
 * Reference: https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API
 */

"use client";

import { usePathname } from "next/navigation";
import { CopyButton } from "./copy-button";

/**
 * Props for CopyUrlButton component
 */
export interface CopyUrlButtonProps {
  /** Additional path segments (e.g., policy ID) */
  path?: string;
  /** Button label */
  label?: string;
  /** Button variant */
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary" | "link";
  /** Button size */
  size?: "default" | "sm" | "lg" | "icon";
  /** Additional CSS classes */
  className?: string;
}

/**
 * CopyUrlButton Component
 * 
 * Renders a button that copies the current page URL to clipboard.
 * Automatically constructs the full URL from the current pathname.
 * 
 * @example
 * <CopyUrlButton path={`/policy/${id}`} label="Copy Link" />
 */
export function CopyUrlButton({
  path,
  label = "Copy Link",
  variant = "outline",
  size = "default",
  className,
}: CopyUrlButtonProps) {
  const pathname = usePathname();

  // Construct the full URL
  // pathname already includes the path, or we use the provided path
  const urlToCopy = path
    ? `${typeof window !== "undefined" ? window.location.origin : ""}${path}`
    : typeof window !== "undefined"
    ? window.location.href
    : `${pathname}`;

  return (
    <CopyButton
      text={urlToCopy}
      label={label}
      variant={variant}
      size={size}
      className={className}
    />
  );
}

