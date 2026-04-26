"use client"

import { useEffect, useMemo, useState } from "react"
import { Plus, Trash2, Search, Pin, Clock3, FileText } from "lucide-react"

interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: number
  pinned: boolean
}

const defaultNotes: Note[] = [
  {
    id: "1",
    title: "Welcome to Notes",
    content: "This is your first note. Start typing to edit it, or create a new note with the + button above.",
    createdAt: "Feb 5, 2026",
    updatedAt: new Date("2026-02-05T11:20:00").getTime(),
    pinned: true,
  },
  {
    id: "2",
    title: "Shopping List",
    content: "Milk\nBread\nEggs\nButter\nCoffee\nFruit",
    createdAt: "Feb 4, 2026",
    updatedAt: new Date("2026-02-04T14:05:00").getTime(),
    pinned: false,
  },
  {
    id: "3",
    title: "Meeting Notes",
    content: "Discussion points:\n- Q1 planning\n- Budget review\n- Team updates\n\nAction items:\n- Follow up with design team\n- Send updated timeline",
    createdAt: "Feb 3, 2026",
    updatedAt: new Date("2026-02-03T09:30:00").getTime(),
    pinned: false,
  },
]

const STORAGE_KEY = "m-os-notes-data"

function getNoteTitle(content: string) {
  const firstLine = content
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.length > 0)
  return firstLine?.slice(0, 60) || "New Note"
}

function getPreview(content: string) {
  const preview = content
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.length > 0)
  return preview?.slice(0, 70) || "No additional text"
}

function formatTimestamp(timestamp: number) {
  return new Date(timestamp).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function NotesApp() {
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedId, setSelectedId] = useState<string>(defaultNotes[0].id)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as Note[]
        if (Array.isArray(parsed) && parsed.length > 0) {
          setNotes(parsed)
          setSelectedId(parsed[0].id)
        } else {
          setNotes(defaultNotes)
        }
      } else {
        setNotes(defaultNotes)
      }
    } catch {
      setNotes(defaultNotes)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (!isLoaded) return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
  }, [notes, isLoaded])

  const selectedNote = notes.find((n) => n.id === selectedId)

  const addNote = () => {
    const timestamp = Date.now()
    const newNote: Note = {
      id: timestamp.toString(),
      title: "New Note",
      content: "",
      createdAt: new Date(timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      updatedAt: timestamp,
      pinned: false,
    }
    setNotes((prev) => [newNote, ...prev])
    setSelectedId(newNote.id)
  }

  const deleteNote = () => {
    if (!selectedNote) return
    const filtered = notes.filter((n) => n.id !== selectedNote.id)
    setNotes(filtered)
    if (filtered.length > 0) {
      setSelectedId(filtered[0].id)
    } else {
      setSelectedId("")
    }
  }

  const updateNote = (content: string) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === selectedId
          ? {
              ...n,
              content,
              title: getNoteTitle(content),
              updatedAt: Date.now(),
            }
          : n
      )
    )
  }

  const togglePin = () => {
    if (!selectedNote) return
    setNotes((prev) =>
      prev.map((note) =>
        note.id === selectedNote.id
          ? { ...note, pinned: !note.pinned, updatedAt: Date.now() }
          : note
      )
    )
  }

  const sortedNotes = useMemo(
    () =>
      [...notes].sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
        return b.updatedAt - a.updatedAt
      }),
    [notes]
  )

  const filteredNotes = searchQuery
    ? sortedNotes.filter(
        (n) =>
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sortedNotes

  const wordCount = selectedNote
    ? selectedNote.content
        .trim()
        .split(/\s+/)
        .filter(Boolean).length
    : 0

  return (
    <div
      className="flex h-full"
      style={{
        background:
          "radial-gradient(circle at top left, rgba(255,255,255,0.95), rgba(244,246,251,0.94) 40%, rgba(239,242,249,0.9))",
      }}
    >
      {/* Note list sidebar */}
      <div
        className="w-[260px] shrink-0 flex flex-col"
        style={{
          background: "rgba(247, 248, 251, 0.78)",
          borderRight: "1px solid rgba(0,0,0,0.08)",
          backdropFilter: "blur(14px)",
        }}
      >
        {/* Search & actions */}
        <div className="flex items-center gap-1.5 p-2.5">
          <div
            className="flex-1 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px]"
            style={{ background: "rgba(0,0,0,0.06)" }}
          >
            <Search className="w-3.5 h-3.5 opacity-40" />
            <input
              type="text"
              placeholder="Search"
              className="bg-transparent outline-none flex-1 text-[12px]"
              style={{ color: "#1d1d1f" }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            className="p-1.5 rounded-lg hover:bg-black/5 transition-colors"
            onClick={addNote}
            aria-label="New note"
          >
            <Plus className="w-4 h-4" style={{ color: "#e8a620" }} />
          </button>
          <button
            className="p-1.5 rounded-lg hover:bg-black/5 transition-colors"
            onClick={deleteNote}
            aria-label="Delete note"
            disabled={!selectedNote}
          >
            <Trash2 className="w-4 h-4 opacity-40 disabled:opacity-20" />
          </button>
        </div>

        <div className="px-3 pb-2 text-[11px] opacity-50" style={{ color: "#1d1d1f" }}>
          {filteredNotes.length} {filteredNotes.length === 1 ? "note" : "notes"}
        </div>

        {/* Notes list */}
        <div className="flex-1 overflow-y-auto px-2.5 pb-3">
          {filteredNotes.length > 0 ? (
            filteredNotes.map((note) => (
              <button
                key={note.id}
                className={`w-full text-left px-3 py-2.5 rounded-xl mb-1 transition-all border ${
                  selectedId === note.id
                    ? "bg-[#e8a620]/15 border-[#e8a620]/35 shadow-sm"
                    : "hover:bg-black/[0.035] border-transparent"
                }`}
                onClick={() => setSelectedId(note.id)}
              >
                <div className="flex items-center gap-1.5">
                  {note.pinned && <Pin className="w-3 h-3 text-[#e8a620]" />}
                  <div
                    className="text-[13px] font-semibold truncate flex-1"
                    style={{ color: "#1d1d1f" }}
                  >
                    {note.title}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] opacity-50">{formatTimestamp(note.updatedAt)}</span>
                  <span className="text-[11px] opacity-45 truncate flex-1">{getPreview(note.content)}</span>
                </div>
              </button>
            ))
          ) : (
            <div className="h-full grid place-items-center px-3 py-6 text-center">
              <div className="max-w-[180px]">
                <div className="mx-auto mb-2 w-8 h-8 rounded-full grid place-items-center bg-black/5">
                  <Search className="w-4 h-4 opacity-40" />
                </div>
                <p className="text-[12px] font-medium text-[#1d1d1f]">No notes found</p>
                <p className="text-[11px] opacity-50 mt-1">Try a different keyword or create a new note.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Note editor */}
      <div className="flex-1 flex flex-col" style={{ background: "rgba(255,255,255,0.82)" }}>
        {selectedNote ? (
          <>
            <div className="px-5 pt-4 pb-2 border-b border-black/5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[12px] opacity-50" style={{ color: "#1d1d1f" }}>
                <Clock3 className="w-3.5 h-3.5" />
                <span>Edited {formatTimestamp(selectedNote.updatedAt)}</span>
                <span className="opacity-60">Created {selectedNote.createdAt}</span>
              </div>
              <button
                onClick={togglePin}
                className={`px-2.5 py-1 rounded-md text-[11px] border transition-colors ${
                  selectedNote.pinned
                    ? "bg-[#e8a620]/15 border-[#e8a620]/40 text-[#996d11]"
                    : "bg-white/60 border-black/10 hover:bg-black/[0.04]"
                }`}
              >
                {selectedNote.pinned ? "Pinned" : "Pin note"}
              </button>
            </div>
            <div className="px-5 pt-4 pb-2">
              <input
                value={selectedNote.title}
                onChange={(e) => {
                  const value = e.target.value.slice(0, 60)
                  setNotes((prev) =>
                    prev.map((n) =>
                      n.id === selectedId ? { ...n, title: value || "New Note", updatedAt: Date.now() } : n
                    )
                  )
                }}
                className="w-full bg-transparent outline-none text-[23px] font-semibold tracking-tight"
                style={{ color: "#1d1d1f" }}
                placeholder="Untitled"
              />
            </div>
            <textarea
              className="flex-1 px-5 py-2 outline-none resize-none text-[14px] leading-relaxed"
              style={{ color: "#1d1d1f", background: "transparent" }}
              value={selectedNote.content}
              onChange={(e) => updateNote(e.target.value)}
              placeholder="Start writing..."
            />
            <div className="px-5 py-2 border-t border-black/5 text-[11px] flex items-center justify-between text-[#1d1d1f]/55">
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>{wordCount} words</span>
              </div>
              <span>{selectedNote.content.length} characters</span>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[14px] opacity-35">
            {isLoaded ? "Select a note or create a new one" : "Loading notes..."}
          </div>
        )}
      </div>
    </div>
  )
}
