/**
 * Policy Detail Page
 * 
 * Displays the full content of a policy with:
 * - Full markdown content (rendered)
 * - Repository metadata (stars, forks, language)
 * - AI summary and tags
 * - Vote button component
 * - Back navigation
 * 
 * Uses Next.js App Router dynamic routes.
 * Reference: https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, ExternalLink, Star, GitFork, Code } from "lucide-react";
import { getPolicyById } from "@/lib/demo-data";
import { VoteButton } from "@/components/vote-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

/**
 * Policy Detail Page Props
 * 
 * Next.js App Router automatically passes params to page components
 */
interface PolicyDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Policy Detail Page Component
 * 
 * Server component that fetches and displays policy details.
 */
export default async function PolicyDetailPage({ params }: PolicyDetailPageProps) {
  // Await params in Next.js 15+ (async params)
  const { id } = await params;

  // Fetch policy data
  const policy = getPolicyById(id);

  // Show 404 if policy not found
  if (!policy) {
    notFound();
  }

  // Format date for display
  const formattedDate = new Date(policy.created_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Calculate net votes
  const netVotes = policy.upvotes_count - policy.downvotes_count;

  return (
    <div className="min-h-screen main-content">
      {/* Header with Back Button */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 md:px-6 lg:px-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Policies
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4 md:px-6 lg:px-8 xl:px-12 max-w-7xl">
        <div className="grid gap-4 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_350px]">
          {/* Left Column: Main Content */}
          <div className="space-y-4">
            {/* Policy Header Card */}
            <Card className="gap-4 py-4">
              <CardHeader className="px-6 pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">
                      {policy.filename}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 text-base">
                      <span className="font-medium">{policy.repo.full_name}</span>
                      <span>·</span>
                      <span>{policy.repo.language}</span>
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="shrink-0 font-semibold text-base px-3 py-1">
                    AI Score: {policy.ai_score}/100
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="px-6 pt-0">
                {/* AI Summary */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Summary
                  </h3>
                  <p className="text-base leading-relaxed">{policy.summary}</p>
                </div>

                {/* Tags */}
                {policy.tags.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {policy.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Policy Content Card */}
            <Card className="gap-4 py-4">
              <CardHeader className="px-6 pb-3">
                <CardTitle>Policy Content</CardTitle>
                <CardDescription>
                  Last updated: {formattedDate}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6 pt-0">
                {/* Markdown Content */}
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown
                    components={{
                      // Customize heading styles
                      h1: ({ node, ...props }) => (
                        <h1 className="text-2xl font-bold mt-4 mb-3 first:mt-0" {...props} />
                      ),
                      h2: ({ node, ...props }) => (
                        <h2 className="text-xl font-bold mt-4 mb-2 first:mt-0" {...props} />
                      ),
                      h3: ({ node, ...props }) => (
                        <h3 className="text-lg font-semibold mt-3 mb-2 first:mt-0" {...props} />
                      ),
                      // Style paragraphs
                      p: ({ node, ...props }) => (
                        <p className="mb-3 leading-relaxed last:mb-0" {...props} />
                      ),
                      // Style lists
                      ul: ({ node, ...props }) => (
                        <ul className="list-disc pl-6 mb-3 space-y-1.5 last:mb-0" {...props} />
                      ),
                      ol: ({ node, ...props }) => (
                        <ol className="list-decimal pl-6 mb-3 space-y-1.5 last:mb-0" {...props} />
                      ),
                      // Style code blocks
                      code: ({ node, className, ...props }) => {
                        const isInline = !className;
                        return isInline ? (
                          <code
                            className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
                            {...props}
                          />
                        ) : (
                          <code
                            className="block bg-muted p-3 rounded-md overflow-x-auto text-sm font-mono mb-3 last:mb-0"
                            {...props}
                          />
                        );
                      },
                    }}
                  >
                    {policy.content}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Sidebar */}
          <div className="space-y-4">
            {/* Vote Section */}
            <Card className="gap-3 py-4">
              <CardHeader className="px-6 pb-3">
                <CardTitle className="text-lg">Vote</CardTitle>
                <CardDescription>
                  Help the community find the best policies
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6 pt-0">
                <VoteButton
                  initialUpvotes={policy.upvotes_count}
                  initialDownvotes={policy.downvotes_count}
                />
              </CardContent>
            </Card>

            {/* Repository Info */}
            <Card className="gap-3 py-4">
              <CardHeader className="px-6 pb-3">
                <CardTitle className="text-lg">Repository</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pt-0 space-y-3">
                {/* Repo Stats */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="h-4 w-4" />
                      <span>Stars</span>
                    </div>
                    <span className="font-semibold">
                      {policy.repo.stars.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <GitFork className="h-4 w-4" />
                      <span>Forks</span>
                    </div>
                    <span className="font-semibold">
                      {policy.repo.forks.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Code className="h-4 w-4" />
                      <span>Language</span>
                    </div>
                    <span className="font-semibold">{policy.repo.language}</span>
                  </div>
                </div>

                <Separator />

                {/* View on GitHub Button */}
                <a
                  href={policy.repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button variant="outline" className="w-full gap-2">
                    <ExternalLink className="h-4 w-4" />
                    View on GitHub
                  </Button>
                </a>
              </CardContent>
            </Card>

            {/* Vote Stats */}
            <Card className="gap-3 py-4">
              <CardHeader className="px-6 pb-3">
                <CardTitle className="text-lg">Community Votes</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pt-0">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Upvotes</span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      {policy.upvotes_count}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Downvotes</span>
                    <span className="font-medium text-red-600 dark:text-red-400">
                      {policy.downvotes_count}
                    </span>
                  </div>
                  {netVotes !== 0 && (
                    <>
                      <Separator />
                      <div className="flex items-center justify-between text-sm font-semibold">
                        <span>Net Votes</span>
                        <span
                          className={
                            netVotes > 0
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }
                        >
                          {netVotes > 0 ? "+" : ""}
                          {netVotes}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
