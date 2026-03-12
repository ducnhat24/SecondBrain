"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Tag, X, FileText, Edit2, Save, Trash2 } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { categories, type Note } from "@/lib/sample-data"
import { toast } from "sonner"
import { updateNote, deleteNote } from "@/actions/note.actions"

interface ViewNoteModalProps {
  note: Note | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEditNote: (note: Note) => void
  onDeleteNote?: (id: string) => void
  categories?: string[]
}

export function ViewNoteModal({ note, open, onOpenChange, onEditNote, onDeleteNote, categories }: ViewNoteModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")
  const [editCategory, setEditCategory] = useState("")
  const [editTags, setEditTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // Cập nhật state khi note thay đổi
  useEffect(() => {
    if (note) {
      setEditTitle(note.title)
      setEditContent(note.content)
      setEditCategory(note.category)
      setEditTags(note.tags)
    }
  }, [note])

  if (!note) return null

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Gọi API thật từ Backend
      const res = await updateNote(note.id, {
        title: editTitle,
        content: editContent,
        categoryName: editCategory,
        tags: editTags
      })

      if (res.success) {
        onEditNote({
          ...note,
          title: editTitle,
          content: editContent,
          category: editCategory,
          tags: editTags,
          updatedAt: new Date().toISOString()
        })
        setIsEditing(false)
        toast.success("Đã lưu thay đổi vào hệ thống!")
      } else {
        toast.error("Lỗi: " + res.error)
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi kết nối Server.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm("Bạn có chắc muốn xóa ghi chú này?")) return

    const res = await deleteNote(note.id) // Gọi API Server Action

    if (res.success) {
      toast.success("Đã xóa note vĩnh viễn!")

      if (onDeleteNote) {
        onDeleteNote(note.id)
      }

      onOpenChange(false) // Đóng Modal
    } else {
      toast.error("Xóa thất bại: " + res.error)
    }
  }
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const newTag = tagInput.trim().toLowerCase()
      if (newTag && !editTags.includes(newTag)) {
        setEditTags(prev => [...prev, newTag])
      }
      setTagInput("")
    }
  }

  const handleRemoveTag = (e: React.MouseEvent, tagToRemove: string) => {
    e.stopPropagation()
    setEditTags(prev => prev.filter(t => t !== tagToRemove))
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      onOpenChange(val)
      if (!val) setIsEditing(false) // Reset về mode view khi đóng
    }}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
        {/* Header Image */}
        {note.coverImage && (
          <div className="w-full h-48 sm:h-64 relative shrink-0">
            <img src={note.coverImage} alt={note.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 pt-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-md">
                <Calendar className="size-3" />
                {note.createdAt}
              </div>
              <Badge variant="outline" className="font-normal capitalize">{note.category}</Badge>
            </div>
            {!isEditing && (
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="gap-2">
                <Edit2 className="size-3.5" /> Edit
              </Button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="text-2xl font-bold border-none bg-transparent p-0 focus-visible:ring-0 shadow-none h-auto"
                placeholder="Note title..."
              />

              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <Select value={editCategory} onValueChange={setEditCategory}>
                  <SelectTrigger className="w-[160px] h-8 text-xs">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Quét mảng categories thật để render ra UI */}
                    {categories?.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex-1 flex flex-wrap items-center gap-2 border rounded-md px-2 min-h-8 bg-background focus-within:ring-1 focus-within:ring-ring">
                  {editTags.map(tag => (
                    <Badge key={tag} variant="secondary" className="gap-1 px-1.5 py-0 text-[10px] font-normal group">
                      {tag}
                      <button
                        type="button" // Ngăn chặn trigger submit form
                        onClick={(e) => handleRemoveTag(e, tag)}
                        className="ml-1 rounded-full outline-none hover:bg-destructive hover:text-destructive-foreground p-0.5 transition-colors"
                      >
                        <X className="size-2.5" />
                      </button>
                    </Badge>
                  ))}
                  <input
                    placeholder="Add tags..."
                    className="flex-1 bg-transparent border-none outline-none text-xs min-w-[80px] py-1"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                  />
                </div>
              </div>

              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[300px] font-mono text-sm leading-relaxed"
                placeholder="Content..."
              />
            </div>
          ) : (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold tracking-tight">{note.title}</h1>

              <div className="flex flex-wrap gap-2">
                {note.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="gap-1 text-xs font-normal">
                    <Tag className="size-3 opacity-70" /> {tag}
                  </Badge>
                ))}
              </div>

              <div className="prose prose-sm dark:prose-invert max-w-none border-t pt-6">
                <ReactMarkdown>{note.content}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-4 border-t bg-muted/20 shrink-0">
          {isEditing ? (
            <div className="flex justify-between w-full">
              <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={handleDelete
              }>
                <Trash2 className="size-4 mr-2" /> Delete Note
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-2">
                  <Save className="size-4" /> {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}