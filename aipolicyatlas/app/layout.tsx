import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Sidebar } from "@/components/sidebar";
import "./globals.css";

/**
 * Font configuration for AI Policy Atlas
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
 * Root metadata for AI Policy Atlas
 * 
 * SEO metadata for the entire application. Individual pages can override
 * the title using Next.js metadata API.
 * 
 * Reference: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
 */
export const metadata: Metadata = {
  title: {
    default: "AI Policy Atlas",
    template: "%s | AI Policy Atlas",
  },
  description:
    "A searchable, ranked directory of AI-related policy files from GitHub repositories. Explore how open-source projects define and govern AI usage.",
  keywords: [
    "AI policy",
    "artificial intelligence governance",
    "open source AI",
    "AI ethics",
    "GitHub policies",
    "code of conduct",
    "AI rules",
  ],
  authors: [{ name: "AI Policy Atlas" }],
  creator: "AI Policy Atlas",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "AI Policy Atlas",
    title: "AI Policy Atlas",
    description:
      "Explore how open-source projects define and govern AI usage through their policy files.",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Policy Atlas",
    description:
      "A searchable directory of AI-related policy files from GitHub repositories.",
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
