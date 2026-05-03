"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Search, Plus, Trash2, Pin, Clock3, FileText, Menu } from "lucide-react"

type Note = {
  id: string
  title: string
  content: string
  createdAt: number
  updatedAt: number
  pinned: boolean
}

function createNote(): Note {
  const now = Date.now()
  return {
    id: crypto.randomUUID(),
    title: "New Note",
    content: "",
    createdAt: now,
    updatedAt: now,
    pinned: false
  }
}

function formatTimestamp(ts: number) {
  const d = new Date(ts)
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

function getPreview(text: string) {
  const oneLine = text.replace(/\n+/g, " ").replace(/\s+/g, " ").trim()
  return oneLine.length ? oneLine.slice(0, 80) : ""
}

function countWords(text: string) {
  const t = text.trim()
  if (!t) return 0
  return t.split(/\s+/).filter(Boolean).length
}

export function NotesApp() {
  const [notes, setNotes] = useState<Note[]>(() => [createNote()])
  const [selectedId, setSelectedId] = useState<string>(() => notes[0]?.id ?? "")
  const [searchQuery, setSearchQuery] = useState("")
  const [isDrawerOpen, setDrawerOpen] = useState(false)
  const [isTrashPressed, setIsTrashPressed] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  // Make sure selectedId is valid after notes change
  useEffect(() => {
    setSelectedId((prev) => {
      if (prev && notes.some((n) => n.id === prev)) return prev
      return notes[0]?.id ?? ""
    })
  }, [notes.length])

  const selectedNote = useMemo(
    () => notes.find((n) => n.id === selectedId) ?? null,
    [notes, selectedId]
  )

  const filteredNotes = useMemo(() => {
    const q = searchQuery.toLowerCase()

    const out = notes.filter((n) => {
      if (!q) return true
      return (
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q)
      )
    })

    out.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      return b.updatedAt - a.updatedAt
    })

    return out
  }, [notes, searchQuery])

  const stats = useMemo(() => {
    const content = selectedNote?.content ?? ""
    return {
      words: countWords(content),
      chars: content.length
    }
  }, [selectedNote])

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey
      if (meta && e.key.toLowerCase() === "n") {
        e.preventDefault()
        addNote()
      }
      if (meta && e.key.toLowerCase() === "f") {
        e.preventDefault()
        searchRef.current?.focus()
      }
      if (e.key === "Delete" && selectedNote) {
        e.preventDefault()
        deleteSelectedNote()
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [selectedNote, notes, selectedId])

  function addNote() {
    const newNote = createNote()
    setNotes((prev) => [newNote, ...prev])
    setSelectedId(newNote.id)
    setTimeout(() => textareaRef.current?.focus(), 0)
    if (window.innerWidth < 640) setDrawerOpen(false) // close drawer on mobile after add
  }

  function deleteSelectedNote() {
    if (!selectedNote) return
    setNotes((prev) => prev.filter((n) => n.id !== selectedNote.id))
    setIsTrashPressed(true)
    const remaining = notes.filter((n) => n.id !== selectedNote.id)
    setTimeout(() => {
      if (remaining.length) setSelectedId(remaining[0].id)
      else {
        const fresh = createNote()
        setNotes([fresh])
        setSelectedId(fresh.id)
      }
      setIsTrashPressed(false)
    }, 0)

    if (window.innerWidth < 640) setDrawerOpen(false) // close drawer on delete
  }

  function updateNoteContent(content: string) {
    if (!selectedNote) return
    setNotes((prev) =>
      prev.map((n) =>
        n.id === selectedId ? { ...n, content, updatedAt: Date.now() } : n
      )
    )
  }

  function updateNoteTitle(title: string) {
    if (!selectedNote) return
    const trimmed = title.slice(0, 60)
    setNotes((prev) =>
      prev.map((n) =>
        n.id === selectedId
          ? { ...n, title: trimmed.trim() || "New Note", updatedAt: Date.now() }
          : n
      )
    )
  }

  function togglePin() {
    if (!selectedNote) return
    setNotes((prev) =>
      prev.map((n) =>
        n.id === selectedId ? { ...n, pinned: !n.pinned } : n
      )
    )
  }

  return (
    <div className="flex h-full flex-col md:flex-row bg-background text-foreground">

      {/* Sidebar for md+; overlay drawer on small screens */}
      <aside
        className={`fixed inset-0 z-50 bg-background shadow-lg transform transition-transform duration-300 ease-in-out
          ${isDrawerOpen ? "translate-x-0" : "-translate-x-full"}
          md:static md:shadow-none md:translate-x-0 md:w-[280px]`}
      >
        {/* Sidebar Header (mobile top bar) */}
        <div className="flex items-center justify-between p-3 border-b border-border md:hidden">
          <div className="text-lg font-medium">Notes</div>
          <button
            className="p-2 rounded-full hover:bg-muted"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        {/* Sidebar content */}
        <div className="h-full flex flex-col">
          {/* Search + actions */}
          <div className="p-3 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] bg-muted flex-1">
                <Search className="w-4 h-4 opacity-60" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search notes"
                  className="bg-transparent outline-none placeholder:text-muted-foreground/70 flex-1"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <button
                className="p-2 rounded-lg hover:bg-muted"
                onClick={addNote}
                title="New (Ctrl/Cmd+ N)"
              >
                <Plus className="w-4 h-4 text-primary" />
              </button>

              <button
                className="p-2 rounded-lg hover:bg-muted"
                onClick={deleteSelectedNote}
                disabled={!selectedNote}
                title="Delete (Delete)"
              >
                <Trash2 className="w-4 h-4 opacity-70" />
              </button>
            </div>
          </div>

          {/* Notes list */}
          <div className="flex-1 overflow-y-auto px-2 py-2">
            {filteredNotes.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground px-4 text-center space-y-2">
                <FileText className="w-10 h-10" />
                <div className="text-sm">No matching notes</div>
                <button
                  onClick={() => {
                    setSearchQuery("")
                    searchRef.current?.focus()
                  }}
                  className="text-[12px] px-3 py-1.5 rounded-md border hover:bg-muted"
                >
                  Clear search
                </button>
              </div>
            ) : (
              filteredNotes.map((note) => {
                const isActive = note.id === selectedId
                return (
                  <button
                    key={note.id}
                    onClick={() => {
                      setSelectedId(note.id)
                      if (window.innerWidth < 640) setDrawerOpen(false)
                    }}
                    className={`w-full text-left rounded-xl px-3 py-2.5 transition
                      ${isActive ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="pt-0.5">
                        {note.pinned ? (
                          <Pin
                            className={`w-3.5 h-3.5 ${
                              isActive ? "text-primary" : "text-muted-foreground"
                            }`}
                          />
                        ) : (
                          <div className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div
                            className={`text-[13px] font-semibold truncate ${
                              isActive ? "text-primary" : "text-foreground"
                            }`}
                            title={note.title}
                          >
                            {note.title}
                          </div>
                        </div>
                        <div className="mt-1 text-[11px] text-muted-foreground line-clamp-2">
                          {note.content.trim() ? getPreview(note.content) : "No content"}
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>{formatTimestamp(note.updatedAt)}</span>
                          <span className="truncate">
                            {note.content.trim() ? `${countWords(note.content)}w` : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>
        {/* Mobile drawer toggle button */}
        <div className="absolute bottom-4 right-4 md:hidden z-50">
          <button
            className="p-3 rounded-full bg-primary/20 hover:bg-primary/30 transition"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-primary" />
          </button>
        </div>
      </aside>

      {/* Main editor */}
      <main className="flex-1 flex flex-col bg-background relative md:ml-[280px]">
        {selectedNote ? (
          <>
            {/* Header */}
            <div className="px-6 pt-5 pb-3 border-b border-border flex items-center justify-between gap-4 sticky top-0 backdrop-blur-sm bg-background/70 z-10">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                  <Clock3 className="w-4 h-4 opacity-80" />
                  <span className="truncate">
                    Edited {formatTimestamp(selectedNote.updatedAt)}
                  </span>
                  <span aria-hidden="true">•</span>
                  <span className="truncate">{formatTimestamp(selectedNote.createdAt)}</span>
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground/70">
                  {selectedNote.pinned ? "Pinned" : "Not pinned"}
                </div>
              </div>

              <button
                onClick={togglePin}
                className={`text-[12px] px-3 py-1.5 rounded-md border transition
                  ${
                    selectedNote.pinned
                      ? "bg-primary/10 text-primary border-primary/30"
                      : "hover:bg-muted border-border"
                  }`}
              >
                {selectedNote.pinned ? "Pinned" : "Pin"}
              </button>
            </div>

            {/* Title */}
            <div className="px-6 pt-4 pb-2">
              <input
                value={selectedNote.title}
                onChange={(e) => updateNoteTitle(e.target.value)}
                className="w-full bg-transparent outline-none text-[26px] font-semibold tracking-tight placeholder:text-muted-foreground/70"
                placeholder="Title"
              />
            </div>

            {/* Content */}
            <div className="flex-1 px-6 pb-4">
              <textarea
                ref={textareaRef}
                className="w-full h-full bg-transparent outline-none text-[14px] leading-relaxed resize-none placeholder:text-muted-foreground/60"
                value={selectedNote.content}
                onChange={(e) => updateNoteContent(e.target.value)}
                placeholder="Start writing..."
              />
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-border text-[11px] flex items-center justify-between text-muted-foreground">
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" />
                <span>
                  {stats.words} word{stats.words === 1 ? "" : "s"} • {stats.chars} characters
                </span>
              </div>
              <span className="hidden sm:inline"> | {countWords(selectedNote.content)} words</span>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-muted-foreground flex-col gap-2 px-4">
            <FileText className="w-10 h-10" />
            <div className="text-center text-sm">Select or create a note</div>
          </div>
        )}
      </main>
    </div>
  )
}
