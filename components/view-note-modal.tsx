"use client"

import { useState, useEffect, useCallback, type DragEvent } from "react"
import Image from "next/image"
import {
  Hash,
  Calendar,
  Pencil,
  Eye,
  X,
  ImagePlus,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { cn } from "@/lib/utils"
import type { Note } from "@/lib/sample-data"

interface ViewNoteModalProps {
  note: Note | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEditNote?: (note: Note) => void
}

export function ViewNoteModal({
  note,
  open,
  onOpenChange,
  onEditNote,
}: ViewNoteModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTab, setEditTab] = useState<"write" | "preview">("write")
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")
  const [editImage, setEditImage] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  // Reset edit state whenever a new note is opened or modal closes
  useEffect(() => {
    if (note && open) {
      setEditTitle(note.title)
      setEditContent(note.content)
      setEditImage(note.coverImage ?? null)
    }
    if (!open) {
      setIsEditing(false)
      setEditTab("write")
    }
  }, [note, open])

  const enterEditMode = () => {
    if (!note) return
    setEditTitle(note.title)
    setEditContent(note.content)
    setEditImage(note.coverImage ?? null)
    setEditTab("write")
    setIsEditing(true)
  }

  const cancelEdit = () => {
    if (!note) return
    setEditTitle(note.title)
    setEditContent(note.content)
    setEditImage(note.coverImage ?? null)
    setIsEditing(false)
    setEditTab("write")
  }

  const saveEdit = () => {
    if (!note || !editTitle.trim()) return
    const updatedNote: Note = {
      ...note,
      title: editTitle.trim(),
      content: editContent.trim(),
      coverImage: editImage ?? undefined,
      updatedAt: new Date().toISOString().split("T")[0],
    }
    onEditNote?.(updatedNote)
    setIsEditing(false)
    setEditTab("write")
  }

  // Image upload handlers
  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0 && files[0].type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onloadend = () => setEditImage(reader.result as string)
      reader.readAsDataURL(files[0])
    }
  }, [])

  const handleFileSelect = useCallback(() => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onloadend = () => setEditImage(reader.result as string)
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }, [])

  if (!note) return null

  /* ------- EDIT MODE ------- */
  if (isEditing) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl h-[90vh] flex flex-col backdrop-blur-sm bg-card/98">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-card-foreground">
              <Pencil className="size-5" />
              Edit Note
            </DialogTitle>
            <DialogDescription>
              Modify your note below. Switch to Preview to see how it renders.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-1 flex-col gap-4 min-h-0">
            {/* Title */}
            <Input
              placeholder="Note title..."
              className="text-base font-medium h-11 shrink-0"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />

            {/* Write / Preview Tabs */}
            <div className="flex flex-1 flex-col min-h-0">
              <div className="flex items-center gap-1 border-b border-border pb-0 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditTab("write")}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
                    editTab === "write"
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Pencil className="size-3.5" />
                  Write
                </button>
                <button
                  type="button"
                  onClick={() => setEditTab("preview")}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
                    editTab === "preview"
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Eye className="size-3.5" />
                  Preview
                </button>
              </div>

              <div className="flex-1 min-h-0 pt-4">
                {editTab === "write" ? (
                  <Textarea
                    placeholder="Write your note in Markdown..."
                    className="h-full resize-none text-sm leading-relaxed font-mono"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                  />
                ) : (
                  <ScrollArea className="h-full rounded-lg border border-border bg-background p-6">
                    {editContent.trim() ? (
                      <MarkdownRenderer content={editContent} />
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        Nothing to preview yet. Switch to the Write tab and
                        start typing.
                      </p>
                    )}
                  </ScrollArea>
                )}
              </div>
            </div>

            {/* Image Upload */}
            <div className="shrink-0">
              {editImage ? (
                <div className="relative rounded-lg overflow-hidden border border-border">
                  <img
                    src={editImage}
                    alt="Cover preview"
                    className="w-full h-36 object-cover"
                  />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                    onClick={() => setEditImage(null)}
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              ) : (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={handleFileSelect}
                  className={cn(
                    "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-6 transition-colors",
                    dragOver
                      ? "border-primary/50 bg-primary/5"
                      : "border-border hover:border-muted-foreground/30 hover:bg-accent/50"
                  )}
                >
                  <ImagePlus className="size-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Drop an image here, or click to browse
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Edit Footer */}
          <div className="flex items-center justify-end gap-2 pt-2 shrink-0 border-t border-border">
            <Button variant="outline" onClick={cancelEdit}>
              Cancel
            </Button>
            <Button onClick={saveEdit} disabled={!editTitle.trim()}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  /* ------- VIEW MODE ------- */
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden bg-card">
        <DialogHeader className="sr-only">
          <DialogTitle>{note.title}</DialogTitle>
          <DialogDescription>Viewing note: {note.title}</DialogDescription>
        </DialogHeader>

        {/* Cover Image - full bleed */}
        {note.coverImage && (
          <div className="relative w-full h-56 sm:h-64 shrink-0">
            <Image
              src={note.coverImage}
              alt={`Cover for ${note.title}`}
              fill
              className="object-cover"
              sizes="(max-width: 896px) 100vw, 896px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
          </div>
        )}

        {/* Edit button - top right of content area */}
        <div className="absolute top-3 right-12 z-20">
          <Button
            variant="outline"
            size="icon-sm"
            className="rounded-full bg-card/80 backdrop-blur-sm border-border hover:bg-card shadow-sm"
            onClick={enterEditMode}
            aria-label="Edit note"
          >
            <Pencil className="size-3.5" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="px-8 py-6 sm:px-10 sm:py-8">
            {/* Category + Date Row */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {note.category}
              </span>
              <span className="text-muted-foreground/40">|</span>
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="size-3" />
                {new Date(note.updatedAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-2xl sm:text-3xl font-bold leading-tight text-card-foreground text-balance mb-6">
              {note.title}
            </h2>

            {/* Full Content -- Rendered Markdown */}
            <MarkdownRenderer content={note.content} />

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-border">
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground"
                >
                  <Hash className="size-3" />
                  {tag}
                </span>
              ))}
            </div>

            {/* Metadata Footer */}
            <div className="mt-6 flex items-center gap-4 text-[11px] text-muted-foreground/60">
              <span>
                Created{" "}
                {new Date(note.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span>
                Updated{" "}
                {new Date(note.updatedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
