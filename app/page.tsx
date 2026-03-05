"use client"

import { useState, useMemo, useCallback } from "react"
import { Plus } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { NotesGrid } from "@/components/notes-grid"
import { NewNoteModal } from "@/components/new-note-modal"
import { ViewNoteModal } from "@/components/view-note-modal"
import { RagChat } from "@/components/rag-chat"
import { Button } from "@/components/ui/button"
import { sampleNotes, type Note } from "@/lib/sample-data"

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("All Notes")
  const [searchQuery, setSearchQuery] = useState("")
  const [notes, setNotes] = useState<Note[]>(sampleNotes)
  const [newNoteOpen, setNewNoteOpen] = useState(false)
  const [viewingNote, setViewingNote] = useState<Note | null>(null)
  const [viewNoteOpen, setViewNoteOpen] = useState(false)

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesCategory =
        selectedCategory === "All Notes" ||
        note.category === selectedCategory
      const matchesSearch =
        searchQuery === "" ||
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        )
      return matchesCategory && matchesSearch
    })
  }, [notes, selectedCategory, searchQuery])

  const handleSaveNote = useCallback((note: Note) => {
    setNotes((prev) => [note, ...prev])
  }, [])

  const handleViewNote = useCallback((note: Note) => {
    setViewingNote(note)
    setViewNoteOpen(true)
  }, [])

  const handleDuplicateNote = useCallback((note: Note) => {
    const duplicated: Note = {
      ...note,
      id: Date.now().toString(),
      title: `${note.title} (Copy)`,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    }
    setNotes((prev) => [duplicated, ...prev])
  }, [])

  const handleEditNote = useCallback((updatedNote: Note) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === updatedNote.id ? updatedNote : n))
    )
    setViewingNote(updatedNote)
  }, [])

  const handleDeleteNote = useCallback((noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId))
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <AppSidebar
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        noteCount={notes.length}
      />

      <main className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/95 px-6 py-4 backdrop-blur-sm">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              {selectedCategory}
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {filteredNotes.length}{" "}
              {filteredNotes.length === 1 ? "note" : "notes"}
              {searchQuery && (
                <span>
                  {" "}
                  matching &ldquo;{searchQuery}&rdquo;
                </span>
              )}
            </p>
          </div>
          <Button
            onClick={() => setNewNoteOpen(true)}
            className="gap-2"
            size="default"
          >
            <Plus className="size-4" />
            New Note
          </Button>
        </header>

        {/* Notes Grid */}
        <div className="p-6">
          <NotesGrid
            notes={filteredNotes}
            onViewNote={handleViewNote}
            onDuplicateNote={handleDuplicateNote}
            onDeleteNote={handleDeleteNote}
          />
        </div>
      </main>

      <NewNoteModal
        open={newNoteOpen}
        onOpenChange={setNewNoteOpen}
        onSave={handleSaveNote}
      />

      <ViewNoteModal
        note={viewingNote}
        open={viewNoteOpen}
        onOpenChange={setViewNoteOpen}
        onEditNote={handleEditNote}
      />

      <RagChat />
    </div>
  )
}
