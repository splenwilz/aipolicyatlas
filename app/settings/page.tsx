/**
 * Settings Page
 * 
 * User settings and preferences page.
 * 
 * Features:
 * - Display preferences
 * - Notification settings
 * - Search preferences
 * - Account settings
 * - Privacy preferences
 * 
 * Reference: plan/blueprint.md - User System section
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Settings,
  Bell,
  Eye,
  Search,
  User,
  Shield,
  Palette,
  LayoutGrid,
  Save,
} from "lucide-react";

/**
 * Settings Page Component
 */
export default function SettingsPage() {
  // Display preferences state
  const [theme, setTheme] = useState<string>("dark");
  const [itemsPerPage, setItemsPerPage] = useState<string>("12");
  const [defaultSort, setDefaultSort] = useState<string>("votes");

  // Notification preferences state
  const [emailNotifications, setEmailNotifications] = useState<boolean>(true);
  const [voteNotifications, setVoteNotifications] = useState<boolean>(true);
  const [commentNotifications, setCommentNotifications] = useState<boolean>(false);

  // Search preferences state
  const [defaultSearchFilters, setDefaultSearchFilters] = useState<string>("all");
  const [highlightMatches, setHighlightMatches] = useState<boolean>(true);

  // Privacy preferences state
  const [profileVisibility, setProfileVisibility] = useState<string>("public");
  const [showVotes, setShowVotes] = useState<boolean>(true);

  /**
   * Handle save settings
   */
  const handleSave = () => {
    // In production, this would call an API endpoint
    console.log("Settings saved:", {
      theme,
      itemsPerPage,
      defaultSort,
      emailNotifications,
      voteNotifications,
      commentNotifications,
      defaultSearchFilters,
      highlightMatches,
      profileVisibility,
      showVotes,
    });
    // Show success message (would use toast in production)
    alert("Settings saved successfully!");
  };

  return (
    <div className="min-h-screen main-content">
      {/* Header Section */}
      <header className="border-b bg-[oklch(0.1_0.02_270_/_0.8)] backdrop-blur-xl border-[oklch(0.3_0.1_280_/_0.3)] relative overflow-hidden">
        {/* Subtle gradient overlay on header */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />
        <div className="relative z-10">
          <div className="container mx-auto px-4 py-8 md:py-10 lg:py-12 md:px-6 lg:px-8 xl:px-12 max-w-7xl">
            {/* Title */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/30">
                  <Settings className="h-6 w-6 text-blue-400" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-white">
                  Settings
                </h1>
              </div>
              <p className="text-sm text-[oklch(0.7_0.02_270)] max-w-2xl">
                Customize your AI Policy Atlas experience with preferences and settings.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 md:px-6 lg:px-8 xl:px-12 max-w-4xl">
        <div className="space-y-6">
          {/* Display Preferences */}
          <Card className="gap-4 py-4">
            <CardHeader className="px-6 pb-3">
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-cyan-400" />
                <CardTitle className="text-lg">Display Preferences</CardTitle>
              </div>
              <CardDescription>
                Customize how content is displayed
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 pt-0 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme" className="text-sm font-medium">
                  Theme
                </Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger id="theme" className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark">Dark (Default)</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="items-per-page" className="text-sm font-medium">
                  Items Per Page
                </Label>
                <Select value={itemsPerPage} onValueChange={setItemsPerPage}>
                  <SelectTrigger id="items-per-page" className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6</SelectItem>
                    <SelectItem value="12">12</SelectItem>
                    <SelectItem value="24">24</SelectItem>
                    <SelectItem value="48">48</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="default-sort" className="text-sm font-medium">
                  Default Sort
                </Label>
                <Select value={defaultSort} onValueChange={setDefaultSort}>
                  <SelectTrigger id="default-sort" className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="votes">Top Voted</SelectItem>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="ai-score">Highest AI Score</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card className="gap-4 py-4">
            <CardHeader className="px-6 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-purple-400" />
                <CardTitle className="text-lg">Notifications</CardTitle>
              </div>
              <CardDescription>
                Configure how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 pt-0 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications" className="text-sm font-medium">
                    Email Notifications
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Receive email updates about your activity
                  </p>
                </div>
                <Button
                  id="email-notifications"
                  variant={emailNotifications ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEmailNotifications(!emailNotifications)}
                  className="h-8"
                >
                  {emailNotifications ? "On" : "Off"}
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="vote-notifications" className="text-sm font-medium">
                    Vote Notifications
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Get notified when your policies receive votes
                  </p>
                </div>
                <Button
                  id="vote-notifications"
                  variant={voteNotifications ? "default" : "outline"}
                  size="sm"
                  onClick={() => setVoteNotifications(!voteNotifications)}
                  className="h-8"
                >
                  {voteNotifications ? "On" : "Off"}
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="comment-notifications" className="text-sm font-medium">
                    Comment Notifications
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Get notified when someone comments on your policies
                  </p>
                </div>
                <Button
                  id="comment-notifications"
                  variant={commentNotifications ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCommentNotifications(!commentNotifications)}
                  className="h-8"
                >
                  {commentNotifications ? "On" : "Off"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Search Preferences */}
          <Card className="gap-4 py-4">
            <CardHeader className="px-6 pb-3">
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5 text-cyan-400" />
                <CardTitle className="text-lg">Search Preferences</CardTitle>
              </div>
              <CardDescription>
                Customize your search experience
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 pt-0 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="default-filters" className="text-sm font-medium">
                  Default Search Filters
                </Label>
                <Select
                  value={defaultSearchFilters}
                  onValueChange={setDefaultSearchFilters}
                >
                  <SelectTrigger id="default-filters" className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Policies</SelectItem>
                    <SelectItem value="high-score">High AI Score Only</SelectItem>
                    <SelectItem value="recent">Recent Policies</SelectItem>
                    <SelectItem value="top-voted">Top Voted Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="highlight-matches" className="text-sm font-medium">
                    Highlight Search Matches
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Highlight matching text in search results
                  </p>
                </div>
                <Button
                  id="highlight-matches"
                  variant={highlightMatches ? "default" : "outline"}
                  size="sm"
                  onClick={() => setHighlightMatches(!highlightMatches)}
                  className="h-8"
                >
                  {highlightMatches ? "On" : "Off"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Preferences */}
          <Card className="gap-4 py-4">
            <CardHeader className="px-6 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-400" />
                <CardTitle className="text-lg">Privacy</CardTitle>
              </div>
              <CardDescription>
                Control your privacy and profile visibility
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 pt-0 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profile-visibility" className="text-sm font-medium">
                  Profile Visibility
                </Label>
                <Select
                  value={profileVisibility}
                  onValueChange={setProfileVisibility}
                >
                  <SelectTrigger id="profile-visibility" className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="unlisted">Unlisted</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Control who can see your profile and contributions
                </p>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-votes" className="text-sm font-medium">
                    Show My Votes
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Display your votes on your public profile
                  </p>
                </div>
                <Button
                  id="show-votes"
                  variant={showVotes ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowVotes(!showVotes)}
                  className="h-8"
                >
                  {showVotes ? "Visible" : "Hidden"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Section */}
          <Card className="gap-4 py-4">
            <CardHeader className="px-6 pb-3">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-purple-400" />
                <CardTitle className="text-lg">Account</CardTitle>
              </div>
              <CardDescription>
                Manage your account settings
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 pt-0 space-y-4">
              <div className="p-4 rounded-lg bg-[oklch(0.1_0.02_270_/_0.3)] border border-[oklch(0.3_0.1_280_/_0.2)]">
                <p className="text-sm text-muted-foreground mb-4">
                  You are currently viewing settings in demo mode. Sign in to save 
                  your preferences and access all features.
                </p>
                <Button variant="default" className="w-full">
                  Sign in with GitHub
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Export Data</Label>
                  <p className="text-xs text-muted-foreground">
                    Download your data and preferences
                  </p>
                </div>
                <Button variant="outline" size="sm" className="h-8">
                  Export
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium text-destructive">
                    Delete Account
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Permanently delete your account and all data
                  </p>
                </div>
                <Button variant="destructive" size="sm" className="h-8">
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Reset
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

