"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { Plus, Loader2 } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { NotesGrid } from "@/components/notes-grid"
import { NewNoteModal } from "@/components/new-note-modal"
import { ViewNoteModal } from "@/components/view-note-modal"
import { RagChat } from "@/components/rag-chat"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

import type { Note } from "@/lib/sample-data"
import { getNotes } from "@/actions/note.actions"
import { getCategories } from "@/actions/category.actions"
import { getTags } from "@/actions/tag.actions"
import { deleteCategoryByName } from "@/actions/category.actions"
import { deleteTagByName } from "@/actions/tag.actions"

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("All Notes")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  // State lưu data thật từ DB
  const [notes, setNotes] = useState<Note[]>([])
  const [dbCategories, setDbCategories] = useState<string[]>([])
  const [dbTags, setDbTags] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [newNoteOpen, setNewNoteOpen] = useState(false)
  const [viewingNote, setViewingNote] = useState<Note | null>(null)
  const [viewNoteOpen, setViewNoteOpen] = useState(false)

  // FETCH DATA TỪ SUPABASE
  useEffect(() => {
    async function fetchMyData() {
      setIsLoading(true)

      // Chạy 3 API cùng lúc cho lẹ
      const [notesRes, catRes, tagsRes] = await Promise.all([
        getNotes(),
        getCategories(),
        getTags()
      ])

      if (notesRes.success && notesRes.data) {
        setNotes(notesRes.data)
      } else {
        toast.error("Không thể tải Notes: " + notesRes.error)
      }

      if (catRes.success && catRes.data) {
        setDbCategories(catRes.data.map((c: any) => c.name))
      }

      if (tagsRes.success && tagsRes.data) {
        setDbTags(tagsRes.data.map((t: any) => t.name))
      }

      setIsLoading(false)
    }

    fetchMyData()
  }, [])

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesCategory =
        selectedCategory === "All Notes" || note.category === selectedCategory
      const matchesSearch =
        searchQuery === "" ||
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesTag =
        selectedTag === null ||
        note.tags.some((tag) => tag.toLowerCase() === selectedTag.toLowerCase())

      return matchesCategory && matchesSearch && matchesTag
    })
  }, [notes, selectedCategory, searchQuery, selectedTag])

  // Cập nhật State khi tạo Note mới (Cập nhật cả Sidebar)
  const handleSaveNote = useCallback((note: Note) => {
    setNotes((prev) => [note, ...prev])

    // Tự động thêm Category mới vào Sidebar nếu nó chưa tồn tại
    if (note.category && note.category !== "All Notes" && note.category !== "Untagged") {
      setDbCategories(prev => prev.includes(note.category) ? prev : [...prev, note.category])
    }

    // Tự động thêm Tags mới vào Sidebar nếu nó chưa tồn tại
    if (note.tags) {
      note.tags.forEach(tag => {
        if (tag !== "untagged") {
          setDbTags(prev => prev.includes(tag) ? prev : [...prev, tag])
        }
      })
    }
  }, [])

  const handleViewNote = useCallback((note: Note) => {
    setViewingNote(note)
    setViewNoteOpen(true)
  }, [])

  const handleDuplicateNote = useCallback((note: Note) => {
    // TODO: Tính năng Duplicate
  }, [])

  const handleEditNote = useCallback((updatedNote: Note) => {
    setNotes((prev) => prev.map((n) => (n.id === updatedNote.id ? updatedNote : n)))
    setViewingNote(updatedNote)
  }, [])

  const handleDeleteNote = useCallback((noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId))
  }, [])

  const handleDeleteCategory = async (name: string) => {
    if (!window.confirm(`Xóa danh mục "${name}"? Các note bên trong sẽ chuyển về Untagged.`)) return

    const res = await deleteCategoryByName(name)
    if (res.success) {
      toast.success(`Đã xóa danh mục ${name}`)
      // Xóa khỏi Sidebar
      setDbCategories(prev => prev.filter(c => c !== name))
      // Nếu đang chọn danh mục bị xóa, tự động chuyển về "All Notes"
      if (selectedCategory === name) setSelectedCategory("All Notes")
      // Cập nhật lại list Notes: Đổi những note có category này thành "Untagged"
      setNotes(prev => prev.map(note =>
        note.category === name ? { ...note, category: "Untagged" } : note
      ))
    } else {
      toast.error("Lỗi xóa danh mục: " + res.error)
    }
  }

  const handleDeleteTag = async (name: string) => {
    if (!window.confirm(`Xóa tag #${name} vĩnh viễn?`)) return

    const res = await deleteTagByName(name)
    if (res.success) {
      toast.success(`Đã xóa tag ${name}`)
      // Xóa khỏi Sidebar
      setDbTags(prev => prev.filter(t => t !== name))
      // Nếu đang filter bằng tag này, bỏ filter đi
      if (selectedTag === name) setSelectedTag(null)
      // Cập nhật lại list Notes: Gỡ tag này ra khỏi toàn bộ các note đang chứa nó
      setNotes(prev => prev.map(note => ({
        ...note,
        tags: note.tags.filter(t => t !== name)
      })))
    } else {
      toast.error("Lỗi xóa tag: " + res.error)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <AppSidebar
        categories={dbCategories}
        tags={dbTags}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedTag={selectedTag}
        onTagSelect={setSelectedTag}
        noteCount={notes.length}
        onDeleteCategory={handleDeleteCategory}
        onDeleteTag={handleDeleteTag}
      />

      <main className="flex-1 overflow-y-auto flex flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/95 px-6 py-4 backdrop-blur-sm">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              {selectedCategory}
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {filteredNotes.length} {filteredNotes.length === 1 ? "note" : "notes"}
              {searchQuery && <span> matching &ldquo;{searchQuery}&rdquo;</span>}
            </p>
          </div>
          <Button onClick={() => setNewNoteOpen(true)} className="gap-2" size="default">
            <Plus className="size-4" />
            New Note
          </Button>
        </header>

        <div className="p-6 flex-1">
          {isLoading ? (
            <div className="flex h-full w-full items-center justify-center flex-col gap-3 text-muted-foreground">
              <Loader2 className="size-8 animate-spin" />
              <p className="text-sm font-medium">Đang tải Second Brain của bạn...</p>
            </div>
          ) : (
            <NotesGrid
              notes={filteredNotes}
              onViewNote={handleViewNote}
              onDuplicateNote={handleDuplicateNote}
              onDeleteNote={handleDeleteNote}
            />
          )}
        </div>
      </main>

      <NewNoteModal open={newNoteOpen} onOpenChange={setNewNoteOpen} onSave={handleSaveNote} />
      <ViewNoteModal note={viewingNote} open={viewNoteOpen} onOpenChange={setViewNoteOpen} onEditNote={handleEditNote} />
      <RagChat />
    </div>
  )
}