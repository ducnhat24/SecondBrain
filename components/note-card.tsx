"use client"

import Image from "next/image"
import {
  Hash,
  MoreHorizontal,
  Copy,
  ImageIcon,
  CopyPlus,
  FileDown,
  Trash2,
} from "lucide-react"
import type { Note } from "@/lib/sample-data"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { deleteNote } from "@/actions/note.actions"
import { toast } from "sonner"

interface NoteCardProps {
  note: Note
  onView: (note: Note) => void
  onDuplicate: (note: Note) => void
  onDelete: (noteId: string) => void
}

function stripMarkdown(md: string): string {
  return md
    .replace(/#{1,6}\s+/g, "")        // headings
    .replace(/(\*{1,2}|_{1,2})(.*?)\1/g, "$2") // bold/italic
    .replace(/`{1,3}[^`]*`{1,3}/g, "") // inline/block code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links
    .replace(/^[>\-*]\s+/gm, "")       // blockquotes, list markers
    .replace(/\|.*\|/g, "")            // table rows
    .replace(/\n{2,}/g, " ")           // collapse newlines
    .trim()
}

export function NoteCard({ note, onView, onDuplicate, onDelete }: NoteCardProps) {
  const handleCopyText = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(`${note.title}\n\n${note.content}`)
  }

  const handleCopyImage = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!note.coverImage) return
    try {
      const response = await fetch(note.coverImage)
      const blob = await response.blob()
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ])
    } catch {
      // Fallback: copy the image URL
      navigator.clipboard.writeText(note.coverImage)
    }
  }

  const handleExportPdf = (e: React.MouseEvent) => {
    e.stopPropagation()
    // Create a simple printable version
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>${note.title}</title>
            <style>body{font-family:system-ui,sans-serif;max-width:680px;margin:40px auto;padding:0 20px;color:#18181b}h1{font-size:24px;margin-bottom:8px}p{font-size:14px;line-height:1.7;color:#3f3f46}.tags{margin-top:16px;display:flex;gap:6px;flex-wrap:wrap}.tag{background:#f4f4f5;border-radius:6px;padding:2px 8px;font-size:12px;color:#71717a}</style>
          </head>
          <body>
            <h1>${note.title}</h1>
            <p style="color:#a1a1aa;font-size:12px;margin-bottom:24px">${note.category} &middot; ${note.updatedAt}</p>
            ${note.coverImage ? `<img src="${note.coverImage}" style="width:100%;border-radius:8px;margin-bottom:24px" />` : ""}
            <p>${note.content}</p>
            <div class="tags">${note.tags.map((t) => `<span class="tag">#${t}</span>`).join("")}</div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  return (
    <article
      className={cn(
        "group relative cursor-pointer rounded-xl border border-border bg-card text-card-foreground",
        "shadow-sm transition-all duration-200",
        "hover:-translate-y-1 hover:shadow-md hover:border-border/80"
      )}
    >
      {/* Dropdown trigger - positioned absolute top-right */}
      <div className="absolute right-2 top-2 z-10 opacity-0 transition-opacity group-hover:opacity-100">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="size-7 bg-card/80 backdrop-blur-sm hover:bg-card"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="size-4 text-muted-foreground" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleCopyText}>
              <Copy className="size-4" />
              Copy text
            </DropdownMenuItem>
            {note.coverImage && (
              <DropdownMenuItem onClick={handleCopyImage}>
                <ImageIcon className="size-4" />
                Copy image
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                onDuplicate(note)
              }}
            >
              <CopyPlus className="size-4" />
              Duplicate note
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportPdf}>
              <FileDown className="size-4" />
              Export as PDF
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
              onClick={async (e) => {
                e.stopPropagation();
                if (window.confirm("Bạn có chắc chắn muốn xóa note này vĩnh viễn?")) {
                  // 1. Gọi API chém tận gốc dưới Database
                  const res = await deleteNote(note.id);

                  if (res.success) {
                    toast.success("Đã xóa note vĩnh viễn!");
                    // 2. Báo cho Frontend ẩn cái thẻ đi
                    onDelete(note.id);
                  } else {
                    toast.error("Lỗi xóa note: " + res.error);
                  }
                }
              }}
            >
              <Trash2 className="mr-2 size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Clickable body for viewing */}
      <div onClick={() => onView(note)}>
        {/* Cover Image */}
        {note.coverImage && (
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-t-xl">
            <Image
              src={note.coverImage}
              alt={`Cover for ${note.title}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex flex-col gap-3 p-4">
          {/* Category label */}
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {note.category}
          </span>

          {/* Title */}
          <h3 className="text-base font-semibold leading-snug text-card-foreground text-pretty">
            {note.title}
          </h3>

          {/* Snippet */}
          <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
            {stripMarkdown(note.content)}
          </p>

          {/* AI Auto-Tags */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-secondary-foreground"
              >
                <Hash className="size-2.5" />
                {tag}
              </span>
            ))}
          </div>

          {/* Date */}
          <span className="text-[11px] text-muted-foreground/70">
            {new Date(note.updatedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </div>
    </article>
  )
}
