"use client"

import { type ChangeEvent, type MouseEvent, type ReactNode, useMemo, useState } from "react"
import {
  ChevronDown,
  ChevronRight,
  Code,
  Files,
  GitBranch,
  Play,
  Plus,
  Search,
  Settings,
  Terminal as TerminalIcon,
  X,
} from "lucide-react"

interface FileItem {
  name: string
  lang: string
  icon: ReactNode
  content: string
  dirty?: boolean
}

const starterFiles: FileItem[] = [
  {
    name: "App.tsx",
    lang: "tsx",
    icon: <Code size={15} className="text-sky-400" />,
    content: `import React from "react";
import "./styles.css";

export default function App() {
  const [count, setCount] = React.useState(0);

  return (
    <main className="wrapper">
      <h1>Welcome to M-OS Code</h1>
      <button onClick={() => setCount((prev) => prev + 1)}>
        Clicked {count} times
      </button>
    </main>
  );
}`,
  },
  {
    name: "styles.css",
    lang: "css",
    icon: <Code size={15} className="text-pink-400" />,
    content: `.wrapper {
  min-height: 100vh;
  display: grid;
  place-content: center;
  gap: 16px;
  color: #e2e8f0;
  background: radial-gradient(circle at top, #1e293b, #0f172a 70%);
}

button {
  border: 0;
  border-radius: 10px;
  padding: 10px 16px;
  color: #f8fafc;
  background: linear-gradient(120deg, #2563eb, #7c3aed);
}`,
  },
  {
    name: "README.md",
    lang: "md",
    icon: <Code size={15} className="text-emerald-400" />,
    content: `# M-OS Demo

## Scripts
- npm install
- npm run dev

## Notes
This lightweight editor inside M-OS simulates a basic IDE workflow.`,
  },
]

const getLangFromFileName = (name: string) => {
  if (name.endsWith(".tsx") || name.endsWith(".ts")) return "tsx"
  if (name.endsWith(".css")) return "css"
  if (name.endsWith(".md")) return "md"
  if (name.endsWith(".json")) return "json"
  return "txt"
}

export function CodeEditorApp() {
  const [files, setFiles] = useState<FileItem[]>(starterFiles)
  const [openFiles, setOpenFiles] = useState<string[]>(["App.tsx"])
  const [activeFileName, setActiveFileName] = useState("App.tsx")
  const [searchQuery, setSearchQuery] = useState("")
  const [isExplorerOpen, setIsExplorerOpen] = useState(true)
  const [isTerminalOpen, setIsTerminalOpen] = useState(true)
  const [cursor, setCursor] = useState({ line: 1, column: 1 })
  const [terminalLines, setTerminalLines] = useState<string[]>([
    "[M-OS Code] Ready",
    "$ npm run dev",
    "Vite dev server started on http://localhost:5173",
  ])

  const activeFile = files.find((file) => file.name === activeFileName) ?? null
  const lineCount = Math.max(18, (activeFile?.content.split("\n").length ?? 1) + 4)

  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return files
    const q = searchQuery.toLowerCase()
    return files.filter((file) => file.name.toLowerCase().includes(q))
  }, [files, searchQuery])

  const openFile = (name: string) => {
    if (!openFiles.includes(name)) {
      setOpenFiles((prev) => [...prev, name])
    }
    setActiveFileName(name)
  }

  const closeFile = (event: MouseEvent, name: string) => {
    event.stopPropagation()
    setOpenFiles((prev) => {
      const remaining = prev.filter((fileName) => fileName !== name)
      if (activeFileName === name) {
        setActiveFileName(remaining[remaining.length - 1] ?? "")
      }
      return remaining
    })
  }

  const updateContent = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (!activeFile) return
    const nextContent = event.target.value
    const start = event.target.selectionStart
    const head = nextContent.slice(0, start)
    const lines = head.split("\n")
    setCursor({
      line: lines.length,
      column: (lines[lines.length - 1]?.length ?? 0) + 1,
    })

    setFiles((prev) =>
      prev.map((file) =>
        file.name === activeFile.name ? { ...file, content: nextContent, dirty: true } : file
      )
    )
  }

  const saveFile = () => {
    if (!activeFile) return
    setFiles((prev) =>
      prev.map((file) => (file.name === activeFile.name ? { ...file, dirty: false } : file))
    )
    setTerminalLines((prev) => [...prev, `$ Saved ${activeFile.name}`])
  }

  const createFile = () => {
    const baseName = "untitled"
    const existing = new Set(files.map((file) => file.name))
    let i = 1
    let nextName = `${baseName}-${i}.ts`
    while (existing.has(nextName)) {
      i += 1
      nextName = `${baseName}-${i}.ts`
    }

    const newFile: FileItem = {
      name: nextName,
      lang: getLangFromFileName(nextName),
      icon: <Code size={15} className="text-amber-300" />,
      content: "export const hello = 'new file';\n",
      dirty: true,
    }
    setFiles((prev) => [...prev, newFile])
    setOpenFiles((prev) => [...prev, nextName])
    setActiveFileName(nextName)
  }

  const runActiveFile = () => {
    if (!activeFile) return
    setTerminalLines((prev) => [
      ...prev,
      `$ Running ${activeFile.name}...`,
      activeFile.lang === "css"
        ? "Styles compiled successfully."
        : activeFile.lang === "md"
          ? "Markdown preview generated."
          : "Compilation finished with 0 errors.",
    ])
    setIsTerminalOpen(true)
  }

  return (
    <div className="flex h-full min-h-0 bg-[#111318] text-[#d6d9e0]">
      <aside className="w-12 shrink-0 border-r border-white/10 bg-[#151923] py-4">
        <div className="flex h-full flex-col items-center gap-4">
          <button className="rounded-md p-2 text-sky-400 transition hover:bg-white/10 hover:text-white">
            <Files size={20} />
          </button>
          <button className="rounded-md p-2 text-zinc-500 transition hover:bg-white/10 hover:text-white">
            <Search size={20} />
          </button>
          <button className="rounded-md p-2 text-zinc-500 transition hover:bg-white/10 hover:text-white">
            <GitBranch size={20} />
          </button>
          <button
            className="rounded-md p-2 text-zinc-500 transition hover:bg-white/10 hover:text-white"
            onClick={runActiveFile}
            title="Run active file"
          >
            <Play size={20} />
          </button>
          <button
            className="rounded-md p-2 text-zinc-500 transition hover:bg-white/10 hover:text-white"
            onClick={() => setIsTerminalOpen((prev) => !prev)}
            title="Toggle terminal"
          >
            <TerminalIcon size={20} />
          </button>
          <div className="mt-auto">
            <button className="rounded-md p-2 text-zinc-500 transition hover:bg-white/10 hover:text-white">
              <Settings size={18} />
            </button>
          </div>
        </div>
      </aside>

      {isExplorerOpen && (
        <aside className="w-72 shrink-0 border-r border-white/10 bg-[#181d29] text-[13px]">
          <div className="flex h-10 items-center justify-between border-b border-white/10 px-3 text-[11px] uppercase tracking-wide text-zinc-400">
            <span>Explorer</span>
            <div className="flex items-center gap-1">
              <button className="rounded p-1 hover:bg-white/10" onClick={createFile} title="New file">
                <Plus size={13} />
              </button>
              <button
                className="rounded p-1 hover:bg-white/10"
                onClick={() => setIsExplorerOpen(false)}
                title="Hide explorer"
              >
                <X size={13} />
              </button>
            </div>
          </div>
          <div className="px-3 py-2">
            <div className="flex items-center gap-2 rounded-md border border-white/10 bg-black/20 px-2 py-1.5">
              <Search size={14} className="text-zinc-500" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search files"
                className="w-full bg-transparent text-sm text-zinc-200 outline-none placeholder:text-zinc-500"
              />
            </div>
          </div>
          <div className="px-2 pb-2">
            <div className="flex items-center gap-1 px-2 py-1 text-zinc-300">
              <ChevronDown size={14} />
              <span className="text-xs uppercase tracking-wide">M-OS Workspace</span>
            </div>
            <div className="ml-3 space-y-0.5">
              {filteredFiles.map((file) => {
                const isActive = file.name === activeFileName
                const isOpen = openFiles.includes(file.name)
                return (
                  <button
                    key={file.name}
                    className={`group flex w-full items-center gap-2 rounded px-2 py-1.5 text-left transition ${
                      isActive ? "bg-[#263042] text-white" : "text-zinc-300 hover:bg-white/10"
                    }`}
                    onClick={() => openFile(file.name)}
                  >
                    {file.icon}
                    <span className="truncate">{file.name}</span>
                    {file.dirty && <span className="text-[10px] text-amber-300">●</span>}
                    {isOpen && (
                      <span className="ml-auto opacity-0 transition group-hover:opacity-100">
                        <X
                          size={12}
                          className="hover:text-red-300"
                          onClick={(event) => closeFile(event, file.name)}
                        />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </aside>
      )}

      {!isExplorerOpen && (
        <button
          className="w-6 shrink-0 border-r border-white/10 bg-[#181d29] text-zinc-400 transition hover:text-white"
          onClick={() => setIsExplorerOpen(true)}
          title="Show explorer"
        >
          <ChevronRight size={16} className="mx-auto" />
        </button>
      )}

      <main className="flex min-w-0 flex-1 flex-col">
        <div className="h-10 border-b border-white/10 bg-[#1a1f2d]">
          <div className="flex h-full items-center overflow-x-auto">
            {openFiles.length === 0 ? (
              <span className="px-3 text-sm text-zinc-500">No file open</span>
            ) : (
              openFiles.map((name) => {
                const file = files.find((item) => item.name === name)
                if (!file) return null
                const isActive = name === activeFileName
                return (
                  <button
                    key={name}
                    onClick={() => setActiveFileName(name)}
                    className={`group flex h-full items-center gap-2 border-r border-white/10 px-3 text-[13px] ${
                      isActive ? "bg-[#111318] text-white" : "text-zinc-400 hover:bg-white/10"
                    }`}
                  >
                    {file.icon}
                    <span className="max-w-[160px] truncate">{name}</span>
                    {file.dirty && <span className="text-[10px] text-amber-300">●</span>}
                    <X
                      size={12}
                      className={`rounded hover:bg-white/10 ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                      onClick={(event) => closeFile(event, name)}
                    />
                  </button>
                )
              })
            )}
          </div>
        </div>

        <div className="flex min-h-0 flex-1">
          {activeFile ? (
            <>
              <div className="w-14 select-none overflow-hidden border-r border-white/10 bg-[#131824] pt-3 text-right text-xs text-zinc-500">
                {Array.from({ length: lineCount }).map((_, index) => (
                  <div key={index} className="h-[22px] pr-3 leading-[22px]">
                    {index + 1}
                  </div>
                ))}
              </div>
              <textarea
                value={activeFile.content}
                onChange={updateContent}
                spellCheck={false}
                className="flex-1 resize-none bg-[#111318] px-4 py-3 font-mono text-[13px] leading-[22px] text-zinc-200 outline-none"
              />
            </>
          ) : (
            <div className="grid flex-1 place-items-center text-zinc-500">Select or create a file to begin.</div>
          )}
        </div>

        {isTerminalOpen && (
          <div className="h-36 border-t border-white/10 bg-[#0d1018]">
            <div className="flex h-8 items-center justify-between border-b border-white/10 px-3 text-xs text-zinc-400">
              <span>TERMINAL</span>
              <button className="hover:text-white" onClick={() => setIsTerminalOpen(false)}>
                <X size={13} />
              </button>
            </div>
            <div className="h-[calc(100%-2rem)] overflow-auto px-3 py-2 font-mono text-xs text-zinc-300">
              {terminalLines.map((line, index) => (
                <div key={`${line}-${index}`} className="leading-5">
                  {line}
                </div>
              ))}
            </div>
          </div>
        )}

        <footer className="flex h-7 items-center justify-between bg-[#2563eb] px-3 text-[11px] text-white">
          <div className="flex items-center gap-3">
            <span>main</span>
            <button onClick={saveFile} className="rounded px-2 py-0.5 transition hover:bg-white/20">
              Save
            </button>
            <span>UTF-8</span>
            <span>{activeFile?.lang.toUpperCase() ?? "TXT"}</span>
          </div>
          <div className="flex items-center gap-3">
            <span>{activeFile?.dirty ? "Unsaved changes" : "All changes saved"}</span>
            <span>
              Ln {cursor.line}, Col {cursor.column}
            </span>
          </div>
        </footer>
      </main>
    </div>
  )
}