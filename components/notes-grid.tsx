"use client"

import { useMemo } from "react"
import { NoteCard } from "@/components/note-card"
import type { Note } from "@/lib/sample-data"

interface NotesGridProps {
  notes: Note[]
  onViewNote: (note: Note) => void
  onDuplicateNote: (note: Note) => void
  onDeleteNote: (noteId: string) => void
}

export function NotesGrid({ notes, onViewNote, onDuplicateNote, onDeleteNote }: NotesGridProps) {
  // Split notes into columns for masonry layout
  const columns = useMemo(() => {
    const cols: Note[][] = [[], [], []]
    notes.forEach((note, idx) => {
      cols[idx % 3].push(note)
    })
    return cols
  }, [notes])

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="rounded-xl border border-border bg-card p-8">
          <p className="text-base font-medium text-card-foreground">
            No notes found
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your search or category filter.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {columns.map((column, colIdx) => (
        <div key={colIdx} className="flex flex-col gap-4">
          {column.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onView={onViewNote}
              onDuplicate={onDuplicateNote}
              onDelete={onDeleteNote}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
