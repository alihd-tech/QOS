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
  Menu,
  X,
  Search,
  Grid3X3,
  List,
  ChevronLeft,
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

function getFileIcon(type: string, className = "w-5 h-5") {
  switch (type) {
    case "folder":
      return <Folder className={`${className} text-blue-500`} />
    case "image":
      return <ImageIcon className={`${className} text-pink-500`} />
    case "document":
      return <FileText className={`${className} text-blue-400`} />
    case "music":
      return <Music className={`${className} text-pink-500`} />
    default:
      return <File className={`${className} text-gray-400`} />
  }
}

export function FinderApp() {
  const [selectedSidebar, setSelectedSidebar] = useState("Desktop")
  const [currentPath, setCurrentPath] = useState<string[]>(["Desktop"])
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [searchQuery, setSearchQuery] = useState("")

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
  const filteredFiles = searchQuery
    ? files.filter(file => file.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : files

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
      "iCloud Drive": ["Desktop"], // fallback
    }
    setCurrentPath(folderMap[label] || ["Desktop"])
    setSelectedFile(null)
    setIsSidebarOpen(false)
  }

  const goBack = () => {
    if (currentPath.length > 1) {
      setCurrentPath((prev) => prev.slice(0, -1))
    }
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Mobile Header with Menu and Navigation */}
      <div className="lg:hidden sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Menu size={20} className="text-gray-700 dark:text-gray-300" />
        </button>
        <div className="flex items-center gap-2 flex-1 justify-center">
          <button
            onClick={goBack}
            className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition ${
              currentPath.length <= 1 ? "opacity-30" : ""
            }`}
            disabled={currentPath.length <= 1}
          >
            <ChevronLeft size={20} className="text-gray-700 dark:text-gray-300" />
          </button>
          <div className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate max-w-[150px]">
            {currentPath[currentPath.length - 1]}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {viewMode === "list" ? (
              <Grid3X3 size={20} className="text-gray-700 dark:text-gray-300" />
            ) : (
              <List size={20} className="text-gray-700 dark:text-gray-300" />
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar - Desktop always visible, Mobile slide-out */}
        <div
          className={`
            fixed inset-0 z-30 lg:relative lg:inset-auto
            transform transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            w-72 lg:w-64 bg-gray-50 dark:bg-gray-800/90 lg:bg-gray-50 lg:dark:bg-gray-800
            border-r border-gray-200 dark:border-gray-700
            flex flex-col shadow-xl lg:shadow-none
          `}
        >
          {/* Sidebar header with close on mobile */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 lg:hidden">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Locations</h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-2">
            {sidebarItems.map((item) =>
              item.isHeader ? (
                <div
                  key={item.label}
                  className="px-4 pt-4 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                >
                  {item.label}
                </div>
              ) : (
                <button
                  key={item.label}
                  onClick={() => handleSidebarClick(item.label)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors
                    ${selectedSidebar === item.label
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium"
                      : "text-gray-800 dark:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
                    }
                  `}
                >
                  {item.icon && <item.icon className="w-4 h-4 opacity-70" />}
                  <span>{item.label}</span>
                </button>
              )
            )}
          </div>
        </div>

        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-25 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Desktop Toolbar */}
          <div className="hidden lg:flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="flex items-center gap-2">
              <button
                onClick={goBack}
                className={`p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition ${
                  currentPath.length <= 1 ? "opacity-40 cursor-default" : ""
                }`}
                disabled={currentPath.length <= 1}
              >
                <ChevronLeft size={18} className="text-gray-600 dark:text-gray-400" />
              </button>
              <div className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                {currentPath.map((segment, i) => (
                  <span key={`${segment}-${i}`} className="flex items-center gap-1">
                    {i > 0 && <ChevronRight size={14} className="text-gray-400" />}
                    <button
                      onClick={() => setCurrentPath(currentPath.slice(0, i + 1))}
                      className={`hover:underline ${i === currentPath.length - 1 ? "font-medium" : "text-gray-500"}`}
                    >
                      {segment}
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
                className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {viewMode === "list" ? (
                  <Grid3X3 size={18} className="text-gray-600 dark:text-gray-400" />
                ) : (
                  <List size={18} className="text-gray-600 dark:text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar (optional) */}
          <div className="lg:hidden px-4 pt-2 pb-1">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-100 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* File List (list or grid view) */}
          <div className="flex-1 overflow-auto p-2 sm:p-3">
            {filteredFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
                <File size={48} className="mb-3 opacity-30" />
                <p className="text-sm">This folder is empty</p>
              </div>
            ) : viewMode === "list" ? (
              // List View (with column headers on desktop only)
              <div className="w-full">
                {/* Column headers - hidden on mobile */}
                <div className="hidden lg:grid grid-cols-[1fr_100px_140px] px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                  <span>Name</span>
                  <span>Size</span>
                  <span>Date Modified</span>
                </div>
                <div className="space-y-0.5">
                  {filteredFiles.map((file) => (
                    <button
                      key={file.name}
                      className={`
                        w-full flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 px-3 py-2 rounded-lg transition-all
                        ${selectedFile === file.name
                          ? "bg-blue-100 dark:bg-blue-900/40"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800/50"
                        }
                      `}
                      onClick={() => setSelectedFile(file.name)}
                      onDoubleClick={() => {
                        if (file.type === "folder") navigateToFolder(file.name)
                      }}
                    >
                      {/* Mobile layout: stacked */}
                      <div className="flex items-center gap-3 w-full">
                        <span className="shrink-0">{getFileIcon(file.type, "w-5 h-5")}</span>
                        <span className="flex-1 text-left text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                          {file.name}
                        </span>
                        {/* Show size and date inline on mobile */}
                        <div className="flex gap-3 text-xs text-gray-500 dark:text-gray-400">
                          {file.size && <span>{file.size}</span>}
                          {file.modified && <span className="hidden sm:inline">{file.modified}</span>}
                        </div>
                      </div>
                      {/* Desktop: show in grid columns via hidden divs */}
                      <div className="hidden lg:flex items-center justify-between w-full col-span-2 ml-8">
                        <span className="text-sm text-gray-600 dark:text-gray-300 w-[100px]">
                          {file.size || "--"}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-300 w-[140px]">
                          {file.modified || "--"}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              // Grid View (mobile + desktop)
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {filteredFiles.map((file) => (
                  <button
                    key={file.name}
                    className={`
                      flex flex-col items-center p-3 rounded-xl transition-all
                      ${selectedFile === file.name
                        ? "bg-blue-100 dark:bg-blue-900/40 ring-2 ring-blue-500"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800/50"
                      }
                    `}
                    onClick={() => setSelectedFile(file.name)}
                    onDoubleClick={() => {
                      if (file.type === "folder") navigateToFolder(file.name)
                    }}
                  >
                    <div className="w-12 h-12 flex items-center justify-center mb-2">
                      {getFileIcon(file.type, "w-10 h-10")}
                    </div>
                    <span className="text-xs text-center font-medium text-gray-800 dark:text-gray-200 line-clamp-2 break-words w-full">
                      {file.name}
                    </span>
                    {file.size && (
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                        {file.size}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Status Bar */}
          <div className="px-4 py-1.5 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
            {filteredFiles.length} item{filteredFiles.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>
    </div>
  )
}