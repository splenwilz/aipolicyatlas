import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Sidebar } from "@/components/sidebar";
import "./globals.css";

/**
 * Font configuration for Claude & Cursor Policy Directory
 * 
 * Geist Sans: Primary sans-serif font for UI
 * Geist Mono: Monospace font for code blocks
 * 
 * Reference: https://nextjs.org/docs/app/building-your-application/optimizing/fonts
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Root metadata for Claude & Cursor Policy Directory
 * 
 * SEO metadata for the entire application. Individual pages can override
 * the title using Next.js metadata API.
 * 
 * Reference: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
 */
export const metadata: Metadata = {
  title: {
    default: "Claude & Cursor Policy Directory",
    template: "%s | Claude & Cursor Policy Directory",
  },
  description:
    "Discover and explore Claude.md and .cursorule files from GitHub repositories. Searchable directory of AI coding assistant policy files used in open-source projects.",
  keywords: [
    "claude.md",
    "cursor rules",
    ".cursorule",
    "cursorules",
    "claude policy",
    "cursor policy",
    "AI coding assistant",
    "GitHub AI policies",
    "claude instructions",
    "cursor AI rules",
    "AI assistant policies",
  ],
  authors: [{ name: "Claude & Cursor Policy Directory" }],
  creator: "Claude & Cursor Policy Directory",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Claude & Cursor Policy Directory",
    title: "Claude & Cursor Policy Directory",
    description:
      "Discover Claude.md and .cursorule files from GitHub. Searchable directory of AI coding assistant policy files.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Claude & Cursor Policy Directory",
    description:
      "Searchable directory of Claude.md and .cursorule files from GitHub repositories.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 ml-64 min-h-screen max-lg:ml-0">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
