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
import { createCategory, getCategories, deleteCategoryByName, updateCategoryByName } from "@/actions/category.actions"
import { getTags } from "@/actions/tag.actions"
import { deleteTagByName } from "@/actions/tag.actions"
import { CategoryModal } from "@/components/category-modal"
import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

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

  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [categoryModalMode, setCategoryModalMode] = useState<"create" | "edit">("create")
  const [categoryToEdit, setCategoryToEdit] = useState("")

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // 2 hàm bọc ngoài để: Khi user chọn Category hoặc Tag trên Mobile -> Tự động đóng Sidebar lại cho gọn
  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat)
    setIsMobileMenuOpen(false)
  }

  const handleTagSelect = (tag: string | null) => {
    setSelectedTag(tag)
    setIsMobileMenuOpen(false)
  }

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
  const openCreateCategoryModal = () => {
    setCategoryModalMode("create")
    setCategoryToEdit("")
    setCategoryModalOpen(true)
  }

  const openEditCategoryModal = (oldName: string) => {
    setCategoryModalMode("edit")
    setCategoryToEdit(oldName)
    setCategoryModalOpen(true)
  }

  const handleSaveCategoryModal = async (newName: string) => {
    // 1. Check trùng lặp
    if (dbCategories.includes(newName) && newName !== categoryToEdit) {
      toast.error("Danh mục này đã tồn tại!")
      return
    }

    // 2. Chế độ TẠO MỚI
    if (categoryModalMode === "create") {
      const res = await createCategory(newName)
      if (res.success) {
        toast.success("Tạo danh mục thành công!")
        setDbCategories(prev => [...prev, newName])
        setCategoryModalOpen(false) // Đóng Modal
      } else {
        toast.error("Lỗi: " + res.error)
      }
    }
    // 3. Chế độ ĐỔI TÊN
    else {
      const res = await updateCategoryByName(categoryToEdit, newName)
      if (res.success) {
        toast.success("Đã đổi tên danh mục!")
        setDbCategories(prev => prev.map(c => c === categoryToEdit ? newName : c))
        if (selectedCategory === categoryToEdit) setSelectedCategory(newName)
        setNotes(prev => prev.map(note =>
          note.category === categoryToEdit ? { ...note, category: newName } : note
        ))
        setCategoryModalOpen(false) // Đóng Modal
      } else {
        toast.error("Lỗi: " + res.error)
      }
    }
  }

  // Tự động tính toán những Category và Tag ĐANG ĐƯỢC SỬ DỤNG bởi mảng notes hiện tại
  const activeCategories = useMemo(() => {
    const usedCats = new Set(notes.map(n => n.category))
    return dbCategories.filter(c => usedCats.has(c))
  }, [notes, dbCategories])

  const activeTags = useMemo(() => {
    const allTags = notes.flatMap(note => note.tags || [])
    const uniqueTags = new Set(allTags)
    uniqueTags.delete("untagged")
    return Array.from(uniqueTags).sort()
  }, [notes])
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">

      {/* 1. DESKTOP SIDEBAR (Sẽ bị ẩn đi trên màn hình điện thoại) */}
      <div className="hidden md:block">
        <AppSidebar
          categories={dbCategories}
          tags={activeTags}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedTag={selectedTag}
          onTagSelect={setSelectedTag}
          noteCount={notes.length}
          onDeleteCategory={handleDeleteCategory}
          onDeleteTag={handleDeleteTag}
          onCreateCategory={openCreateCategoryModal}
          onUpdateCategory={openEditCategoryModal}
        />
      </div>

      <main className="flex-1 overflow-y-auto flex flex-col relative">

        {/* 2. MOBILE HEADER (Chỉ hiện trên điện thoại) */}
        <header className="md:hidden sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0 -ml-2">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[280px] border-none">
                {/* Tái sử dụng lại Sidebar nguyên bản cho Mobile */}
                <AppSidebar
                  categories={dbCategories}
                  tags={activeTags}
                  selectedCategory={selectedCategory}
                  onCategoryChange={handleCategorySelect} // Dùng hàm bọc để auto-close
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  selectedTag={selectedTag}
                  onTagSelect={handleTagSelect} // Dùng hàm bọc để auto-close
                  noteCount={notes.length}
                  onDeleteCategory={handleDeleteCategory}
                  onDeleteTag={handleDeleteTag}
                  onCreateCategory={openCreateCategoryModal}
                  onUpdateCategory={openEditCategoryModal}
                />
              </SheetContent>
            </Sheet>
            <span className="font-semibold truncate max-w-[150px]">{selectedCategory}</span>
          </div>
          <Button onClick={() => setNewNoteOpen(true)} size="sm" className="gap-1.5 h-8">
            <Plus className="size-3.5" />
            <span className="text-xs">New</span>
          </Button>
        </header>

        {/* 3. DESKTOP HEADER (Giữ nguyên code header cũ của bạn, nhưng thêm hidden md:flex) */}
        <header className="hidden md:flex sticky top-0 z-10 items-center justify-between border-b border-border bg-background/95 px-6 py-4 backdrop-blur-sm">
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

        {/* 4. KHUNG HIỂN THỊ NOTES */}
        <div className="p-4 md:p-6 flex-1">
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

      {/* --- CÁC MODALS GIỮ NGUYÊN --- */}
      <NewNoteModal open={newNoteOpen} onOpenChange={setNewNoteOpen} onSave={handleSaveNote} categories={dbCategories} />
      <ViewNoteModal note={viewingNote} open={viewNoteOpen} onOpenChange={setViewNoteOpen} onEditNote={handleEditNote} onDeleteNote={handleDeleteNote} categories={dbCategories} />
      <CategoryModal open={categoryModalOpen} onOpenChange={setCategoryModalOpen} onSave={handleSaveCategoryModal} mode={categoryModalMode} initialName={categoryToEdit} />
      <RagChat />
    </div>
  )
}