"use client"

import { useState } from "react"
import {
  ChevronRight,
  File,
  Folder,
  HardDrive,
  Home,
  ImageIcon,
  FileText,
  Music,
  Download,
  Star,
  Clock,
  Trash2,
} from "lucide-react"

interface FileItem {
  name: string
  type: "folder" | "file" | "image" | "document" | "music"
  size?: string
  modified?: string
  children?: FileItem[]
}

const fileSystem: FileItem[] = [
  {
    name: "Desktop",
    type: "folder",
    modified: "Today",
    children: [
      { name: "screenshot.png", type: "image", size: "2.4 MB", modified: "Today" },
      { name: "notes.txt", type: "document", size: "4 KB", modified: "Yesterday" },
    ],
  },
  {
    name: "Documents",
    type: "folder",
    modified: "Today",
    children: [
      { name: "Resume.pdf", type: "document", size: "240 KB", modified: "Jan 15, 2026" },
      { name: "Project Proposal.docx", type: "document", size: "1.2 MB", modified: "Jan 28, 2026" },
      {
        name: "Work",
        type: "folder",
        modified: "Feb 1, 2026",
        children: [
          { name: "report-q4.xlsx", type: "document", size: "890 KB", modified: "Jan 10, 2026" },
          { name: "meeting-notes.txt", type: "document", size: "12 KB", modified: "Feb 1, 2026" },
        ],
      },
    ],
  },
  {
    name: "Downloads",
    type: "folder",
    modified: "Today",
    children: [
      { name: "installer.dmg", type: "file", size: "180 MB", modified: "Today" },
      { name: "photo-album.zip", type: "file", size: "45 MB", modified: "Yesterday" },
    ],
  },
  {
    name: "Pictures",
    type: "folder",
    modified: "Jan 20, 2026",
    children: [
      { name: "vacation-2025", type: "folder", modified: "Dec 28, 2025" },
      { name: "wallpaper.jpg", type: "image", size: "5.1 MB", modified: "Jan 5, 2026" },
    ],
  },
  {
    name: "Music",
    type: "folder",
    modified: "Jan 12, 2026",
    children: [
      { name: "playlist.m3u", type: "music", size: "2 KB", modified: "Jan 12, 2026" },
    ],
  },
]

const sidebarItems = [
  { label: "Favorites", isHeader: true },
  { label: "AirDrop", icon: Folder },
  { label: "Recents", icon: Clock },
  { label: "Applications", icon: Folder },
  { label: "Desktop", icon: Home },
  { label: "Documents", icon: FileText },
  { label: "Downloads", icon: Download },
  { label: "iCloud", isHeader: true },
  { label: "iCloud Drive", icon: Folder },
  { label: "Tags", isHeader: true },
]

function getFileIcon(type: string) {
  switch (type) {
    case "folder":
      return <Folder className="w-4 h-4 text-[#3b9ff5]" />
    case "image":
      return <ImageIcon className="w-4 h-4 text-[#e86590]" />
    case "document":
      return <FileText className="w-4 h-4 text-[#5599e8]" />
    case "music":
      return <Music className="w-4 h-4 text-[#e86590]" />
    default:
      return <File className="w-4 h-4 text-[#999]" />
  }
}

export function FinderApp() {
  const [selectedSidebar, setSelectedSidebar] = useState("Desktop")
  const [currentPath, setCurrentPath] = useState<string[]>(["Desktop"])
  const [selectedFile, setSelectedFile] = useState<string | null>(null)

  const getCurrentFiles = (): FileItem[] => {
    let current = fileSystem
    for (const segment of currentPath) {
      const found = current.find((f) => f.name === segment)
      if (found?.children) {
        current = found.children
      } else {
        break
      }
    }
    return current
  }

  const files = getCurrentFiles()

  const navigateToFolder = (folderName: string) => {
    setCurrentPath((prev) => [...prev, folderName])
    setSelectedFile(null)
  }

  const handleSidebarClick = (label: string) => {
    setSelectedSidebar(label)
    const folderMap: Record<string, string[]> = {
      Desktop: ["Desktop"],
      Documents: ["Documents"],
      Downloads: ["Downloads"],
      Recents: ["Desktop"],
      Applications: ["Desktop"],
    }
    setCurrentPath(folderMap[label] || ["Desktop"])
    setSelectedFile(null)
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div
        className="w-[180px] shrink-0 flex flex-col py-2 overflow-y-auto"
        style={{
          background: "rgba(238, 237, 240, 0.95)",
          borderRight: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        {sidebarItems.map((item) =>
          item.isHeader ? (
            <div
              key={item.label}
              className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wide"
              style={{ color: "#86868b" }}
            >
              {item.label}
            </div>
          ) : (
            <button
              key={item.label}
              className={`flex items-center gap-2 px-4 py-1 text-[13px] mx-1.5 rounded transition-colors ${
                selectedSidebar === item.label
                  ? "bg-[#0058d0]/10 text-[#0058d0]"
                  : "text-[#1d1d1f] hover:bg-black/5"
              }`}
              onClick={() => handleSidebarClick(item.label)}
            >
              {item.icon && <item.icon className="w-4 h-4 opacity-70" />}
              {item.label}
            </button>
          )
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div
          className="flex items-center gap-2 px-3 h-[38px] shrink-0"
          style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
        >
          <button
            className="p-1 rounded hover:bg-black/5 text-[#86868b]"
            onClick={() => {
              if (currentPath.length > 1) {
                setCurrentPath((prev) => prev.slice(0, -1))
              }
            }}
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
          </button>
          <div className="flex items-center gap-1 text-[13px]">
            {currentPath.map((segment, i) => (
              <span key={`${segment}-${i}`} className="flex items-center gap-1">
                {i > 0 && (
                  <ChevronRight className="w-3 h-3" style={{ color: "#86868b" }} />
                )}
                <button
                  className="hover:bg-black/5 px-1 rounded"
                  onClick={() => setCurrentPath(currentPath.slice(0, i + 1))}
                  style={{ color: i === currentPath.length - 1 ? "#1d1d1f" : "#86868b" }}
                >
                  {segment}
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* File list */}
        <div className="flex-1 overflow-auto p-1">
          {/* Column headers */}
          <div
            className="grid grid-cols-[1fr_100px_140px] px-3 py-1 text-[11px] font-medium"
            style={{ color: "#86868b", borderBottom: "1px solid rgba(0,0,0,0.06)" }}
          >
            <span>Name</span>
            <span>Size</span>
            <span>Date Modified</span>
          </div>
          {files.map((file) => (
            <button
              key={file.name}
              className={`w-full grid grid-cols-[1fr_100px_140px] px-3 py-1.5 text-[13px] rounded transition-colors ${
                selectedFile === file.name
                  ? "bg-[#0058d0] text-white"
                  : "hover:bg-black/4"
              }`}
              onClick={() => setSelectedFile(file.name)}
              onDoubleClick={() => {
                if (file.type === "folder") navigateToFolder(file.name)
              }}
            >
              <span className="flex items-center gap-2 truncate">
                {selectedFile === file.name ? (
                  file.type === "folder" ? (
                    <Folder className="w-4 h-4 text-white shrink-0" />
                  ) : (
                    <File className="w-4 h-4 text-white shrink-0" />
                  )
                ) : (
                  <span className="shrink-0">{getFileIcon(file.type)}</span>
                )}
                <span className="truncate">{file.name}</span>
              </span>
              <span
                className={selectedFile === file.name ? "" : "opacity-60"}
                style={{ color: selectedFile === file.name ? "white" : undefined }}
              >
                {file.size || "--"}
              </span>
              <span
                className={selectedFile === file.name ? "" : "opacity-60"}
                style={{ color: selectedFile === file.name ? "white" : undefined }}
              >
                {file.modified || "--"}
              </span>
            </button>
          ))}
          {files.length === 0 && (
            <div className="flex items-center justify-center h-32 text-[13px] opacity-40">
              This folder is empty
            </div>
          )}
        </div>

        {/* Status bar */}
        <div
          className="px-3 py-1 text-[11px] shrink-0"
          style={{ color: "#86868b", borderTop: "1px solid rgba(0,0,0,0.06)" }}
        >
          {files.length} items
        </div>
      </div>
    </div>
  )
}
