"use client"

import { useState, useCallback, type DragEvent } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { ImagePlus, X, FileText, Pencil, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Note } from "@/lib/sample-data"

interface NewNoteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (note: Note) => void
}

export function NewNoteModal({ open, onOpenChange, onSave }: NewNoteModalProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [dragOver, setDragOver] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write")

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
    if (files.length > 0) {
      const file = files[0]
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setImagePreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      }
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
        reader.onloadend = () => {
          setImagePreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }, [])

  const handleSave = () => {
    if (!title.trim()) return
    const newNote: Note = {
      id: Date.now().toString(),
      title: title.trim(),
      content: content.trim(),
      coverImage: imagePreview ?? undefined,
      tags: ["new"],
      category: "Personal",
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    }
    onSave(newNote)
    setTitle("")
    setContent("")
    setImagePreview(null)
    setActiveTab("write")
    onOpenChange(false)
  }

  const handleCancel = () => {
    setTitle("")
    setContent("")
    setImagePreview(null)
    setActiveTab("write")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl h-[90vh] flex flex-col backdrop-blur-sm bg-card/98">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-card-foreground">
            <FileText className="size-5" />
            New Note
          </DialogTitle>
          <DialogDescription>
            Create a new note with Markdown support. Switch to Preview to see
            how it renders.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-1 flex-col gap-4 min-h-0">
          {/* Title */}
          <Input
            placeholder="Note title..."
            className="text-base font-medium h-11 shrink-0"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* Write / Preview Tabs */}
          <div className="flex flex-1 flex-col min-h-0">
            {/* Tab Bar */}
            <div className="flex items-center gap-1 border-b border-border pb-0 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("write")}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
                  activeTab === "write"
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Pencil className="size-3.5" />
                Write
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
                  activeTab === "preview"
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Eye className="size-3.5" />
                Preview
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 min-h-0 pt-4">
              {activeTab === "write" ? (
                <Textarea
                  placeholder="Write your note in Markdown..."
                  className="h-full resize-none text-sm leading-relaxed font-mono"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              ) : (
                <ScrollArea className="h-full rounded-lg border border-border bg-background p-6">
                  {content.trim() ? (
                    <MarkdownRenderer content={content} />
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      Nothing to preview yet. Switch to the Write tab and start
                      typing.
                    </p>
                  )}
                </ScrollArea>
              )}
            </div>
          </div>

          {/* Image Drop Zone */}
          <div className="shrink-0">
            {imagePreview ? (
              <div className="relative rounded-lg overflow-hidden border border-border">
                <img
                  src={imagePreview}
                  alt="Cover preview"
                  className="w-full h-36 object-cover"
                />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                  onClick={() => setImagePreview(null)}
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

        <DialogFooter className="shrink-0">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title.trim()}>
            Save Note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
