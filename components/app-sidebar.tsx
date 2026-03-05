"use client"

import { useState } from "react"
import {
  Brain,
  ChevronLeft,
  ChevronRight,
  Folder,
  Hash,
  LayoutGrid,
  LogIn,
  Search,
  Trash2,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { useRouter } from "next/navigation"
import { signOut } from "@/actions/auth.actions"

interface AppSidebarProps {
  categories: string[]
  tags: string[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedTag: string | null;
  onTagSelect: (tag: string | null) => void;
  noteCount: number
  onDeleteCategory: (name: string) => void
  onDeleteTag: (name: string) => void
}

export function AppSidebar({
  categories,
  tags,
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  selectedTag,
  onTagSelect,
  noteCount,
  onDeleteCategory,
  onDeleteTag
}: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    await signOut()
    router.push('/auth')
  }

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

      {/* Navigation - Đã được viết lại bằng thẻ HTML thuần, bao mượt */}
      <div className="flex-1 overflow-y-auto py-2">
        <nav className="flex flex-col gap-1 px-2">
          {/* Nút All Notes */}
          <button
            onClick={() => onCategoryChange("All Notes")}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              selectedCategory === "All Notes"
                ? "bg-sidebar-accent text-sidebar-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
              collapsed && "justify-center px-0"
            )}
            title={collapsed ? "All Notes" : undefined}
          >
            <LayoutGrid className="size-4 shrink-0" />
            {!collapsed && <span>All Notes</span>}
          </button>

          {/* Danh sách Categories thật */}
          {categories.map((category) => (
            <div key={category} className="group relative flex items-center">
              <button
                onClick={() => onCategoryChange(category)}
                className={cn(
                  "flex flex-1 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  selectedCategory === category
                    ? "bg-sidebar-accent text-sidebar-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                  collapsed && "justify-center px-0"
                )}
              >
                <Folder className="size-4 shrink-0" />
                {!collapsed && <span className="truncate">{category}</span>}
              </button>

              {/* Nút xóa Category (Chỉ hiện khi hover) */}
              {!collapsed && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteCategory(category); // Gọi hàm ở đây
                  }}
                  className="absolute right-2 opacity-0 group-hover:opacity-100 p-1 hover:text-destructive transition-opacity"
                >
                  <Trash2 className="size-3" />
                </button>
              )}
            </div>
          ))}
        </nav>

        {/* Popular Tags */}
        {tags.map((tag) => {
          const isSelected = selectedTag === tag;
          return (
            <div key={tag} className="group relative inline-flex">
              <button
                onClick={() => onTagSelect(isSelected ? null : tag)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs transition-colors",
                  isSelected
                    ? "bg-foreground text-background font-medium"
                    : "bg-sidebar-accent text-muted-foreground hover:bg-sidebar-accent/80 hover:text-sidebar-foreground"
                )}
              >
                <Hash className="size-2.5" />
                {tag}
              </button>

              {/* Nút xóa Tag nhỏ xíu ở góc */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteTag(tag); // Gọi hàm ở đây
                }}
                className="absolute -top-1 -right-1 hidden group-hover:flex size-3 items-center justify-center rounded-full bg-destructive text-white shadow-sm"
              >
                <X className="size-2" />
              </button>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-2 border-t border-sidebar-border px-3 py-3">
        <Button
          variant="outline"
          size={collapsed ? "icon-sm" : "sm"}
          className="w-full border-sidebar-border text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogIn className="size-4 shrink-0 rotate-180" />
          {!collapsed && <span>Log out</span>}
        </Button>

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
    </aside >
  )
}