"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Brain,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Hash,
  LayoutGrid,
  Lightbulb,
  Code,
  LogIn,
  Palette,
  User,
  Search,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"

interface AppSidebarProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  noteCount: number
}

const navItems = [
  { label: "All Notes", icon: LayoutGrid, category: "All Notes" },
  { label: "Learning", icon: Lightbulb, category: "Learning" },
  { label: "Engineering", icon: Code, category: "Engineering" },
  { label: "Design", icon: Palette, category: "Design" },
  { label: "Personal", icon: User, category: "Personal" },
]

export function AppSidebar({
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  noteCount,
}: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo / Header */}
      <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-4">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <Brain className="size-5 shrink-0 text-sidebar-foreground" />
            <span className="text-base font-semibold tracking-tight">
              Second Brain
            </span>
          </div>
        )}
        {collapsed && (
          <Brain className="mx-auto size-5 text-sidebar-foreground" />
        )}
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="px-3 pt-4 pb-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              className="h-8 pl-8 text-sm bg-sidebar-accent border-sidebar-border"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3">
        {!collapsed && (
          <span className="mb-2 block px-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Categories
          </span>
        )}
        <ul className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = selectedCategory === item.category
            return (
              <li key={item.category}>
                <button
                  onClick={() => onCategoryChange(item.category)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Popular Tags */}
      {!collapsed && (
        <div className="border-t border-sidebar-border px-4 py-3">
          <span className="mb-2 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Popular Tags
          </span>
          <div className="flex flex-wrap gap-1.5">
            {["react", "learning", "design", "productivity", "api"].map(
              (tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-md bg-sidebar-accent px-2 py-0.5 text-xs text-muted-foreground"
                >
                  <Hash className="size-2.5" />
                  {tag}
                </span>
              )
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex flex-col gap-2 border-t border-sidebar-border px-3 py-3">
        {/* Sign In link */}
        <Button
          variant="outline"
          size={collapsed ? "icon-sm" : "sm"}
          className="w-full border-sidebar-border text-muted-foreground hover:text-sidebar-foreground"
          asChild
        >
          <Link href="/auth">
            <LogIn className="size-4 shrink-0" />
            {!collapsed && <span>Sign In</span>}
          </Link>
        </Button>

        {/* Bottom row: theme toggle, note count, collapse */}
        <div className="flex items-center justify-between">
          <ThemeToggle />
          {!collapsed && (
            <span className="text-xs text-muted-foreground">
              {noteCount} notes
            </span>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <ChevronLeft className="size-4" />
            )}
          </Button>
        </div>
      </div>
    </aside>
  )
}
