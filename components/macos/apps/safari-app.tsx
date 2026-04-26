"use client"

import { useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Share,
  Plus,
  Lock,
  BookOpen,
  Grid3X3,
} from "lucide-react"

interface Tab {
  id: string
  title: string
  url: string
}

const BOOKMARKS = [
  { name: "Apple", url: "apple.com" },
  { name: "GitHub", url: "github.com" },
  { name: "Wikipedia", url: "wikipedia.org" },
  { name: "YouTube", url: "youtube.com" },
  { name: "Reddit", url: "reddit.com" },
  { name: "Stack Overflow", url: "stackoverflow.com" },
]

const QUICK_LINKS = [
  { name: "Frequently Visited", items: ["github.com", "vercel.com", "nextjs.org", "react.dev"] },
]

export function SafariApp() {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: "1", title: "Start Page", url: "" },
  ])
  const [activeTabId, setActiveTabId] = useState("1")
  const [urlInput, setUrlInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const activeTab = tabs.find((t) => t.id === activeTabId)

  const navigateTo = (url: string) => {
    if (!url) return
    const cleanUrl = url.startsWith("http") ? url : `https://${url}`
    setIsLoading(true)
    setTabs(
      tabs.map((t) =>
        t.id === activeTabId
          ? { ...t, url: cleanUrl, title: new URL(cleanUrl).hostname }
          : t
      )
    )
    setUrlInput(cleanUrl)
    setTimeout(() => setIsLoading(false), 800)
  }

  const addTab = () => {
    const newTab: Tab = {
      id: Date.now().toString(),
      title: "Start Page",
      url: "",
    }
    setTabs([...tabs, newTab])
    setActiveTabId(newTab.id)
    setUrlInput("")
  }

  const closeTab = (tabId: string) => {
    if (tabs.length === 1) return
    const filtered = tabs.filter((t) => t.id !== tabId)
    setTabs(filtered)
    if (activeTabId === tabId) {
      setActiveTabId(filtered[filtered.length - 1].id)
    }
  }

  return (
    <div className="flex flex-col h-full" style={{ background: "#fff" }}>
      {/* Tab bar */}
      {tabs.length > 1 && (
        <div
          className="flex items-center gap-0.5 px-2 pt-1 shrink-0 overflow-x-auto"
          style={{
            background: "rgba(246,246,248,0.95)",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] rounded-t-lg cursor-pointer max-w-[180px] ${
                activeTabId === tab.id
                  ? "bg-white"
                  : "hover:bg-black/4"
              }`}
              onClick={() => {
                setActiveTabId(tab.id)
                setUrlInput(tab.url)
              }}
            >
              <span className="truncate flex-1" style={{ color: "#1d1d1f" }}>
                {tab.title}
              </span>
              <button
                className="w-4 h-4 flex items-center justify-center rounded hover:bg-black/10 text-[10px] opacity-50 hover:opacity-100 shrink-0"
                onClick={(e) => {
                  e.stopPropagation()
                  closeTab(tab.id)
                }}
              >
                ×
              </button>
            </div>
          ))}
          <button
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-black/5 shrink-0"
            onClick={addTab}
            aria-label="New tab"
          >
            <Plus className="w-3 h-3 opacity-50" />
          </button>
        </div>
      )}

      {/* URL bar */}
      <div
        className="flex items-center gap-2 px-3 py-2 shrink-0"
        style={{
          background: "rgba(246,246,248,0.95)",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <div className="flex items-center gap-1">
          <button className="p-1 rounded hover:bg-black/5">
            <ChevronLeft className="w-4 h-4 opacity-30" />
          </button>
          <button className="p-1 rounded hover:bg-black/5">
            <ChevronRight className="w-4 h-4 opacity-30" />
          </button>
        </div>

        {/* URL input */}
        <div
          className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px]"
          style={{ background: "rgba(0,0,0,0.05)" }}
        >
          <Lock className="w-3 h-3 opacity-30" />
          <input
            type="text"
            className="bg-transparent outline-none flex-1 text-center text-[13px]"
            style={{ color: "#1d1d1f" }}
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") navigateTo(urlInput)
            }}
            placeholder="Search or enter website name"
          />
          {isLoading && <RotateCw className="w-3 h-3 opacity-40 animate-spin" />}
        </div>

        <div className="flex items-center gap-1">
          <button className="p-1 rounded hover:bg-black/5">
            <Share className="w-4 h-4 opacity-40" />
          </button>
          <button className="p-1 rounded hover:bg-black/5">
            <Grid3X3 className="w-4 h-4 opacity-40" />
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-auto" style={{ background: "#f5f5f7" }}>
        {activeTab?.url ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-[24px] font-bold text-white"
              style={{ background: "#0071e3" }}
            >
              {activeTab.title.charAt(0).toUpperCase()}
            </div>
            <div className="text-[15px] font-medium" style={{ color: "#1d1d1f" }}>
              {activeTab.title}
            </div>
            <div className="text-[12px] opacity-40">{activeTab.url}</div>
            <div
              className="mt-2 px-4 py-2 rounded-lg text-[12px]"
              style={{ background: "rgba(0,0,0,0.05)", color: "#86868b" }}
            >
              Web content is simulated in this environment
            </div>
          </div>
        ) : (
          /* Start Page */
          <div className="max-w-[600px] mx-auto py-12 px-6">
            {/* Favorites */}
            <h3
              className="text-[13px] font-semibold mb-4"
              style={{ color: "#86868b" }}
            >
              Favorites
            </h3>
            <div className="grid grid-cols-4 gap-4 mb-10">
              {BOOKMARKS.map((bm) => (
                <button
                  key={bm.name}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-black/5 transition-colors"
                  onClick={() => navigateTo(bm.url)}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-[18px] font-bold text-white shadow-sm"
                    style={{
                      background:
                        bm.name === "Apple"
                          ? "#1d1d1f"
                          : bm.name === "GitHub"
                          ? "#24292e"
                          : bm.name === "YouTube"
                          ? "#ff0000"
                          : bm.name === "Reddit"
                          ? "#ff4500"
                          : "#0071e3",
                    }}
                  >
                    {bm.name.charAt(0)}
                  </div>
                  <span className="text-[11px]" style={{ color: "#1d1d1f" }}>
                    {bm.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Frequently Visited */}
            <h3
              className="text-[13px] font-semibold mb-4"
              style={{ color: "#86868b" }}
            >
              Frequently Visited
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {QUICK_LINKS[0].items.map((url) => (
                <button
                  key={url}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-black/5 transition-colors"
                  onClick={() => navigateTo(url)}
                >
                  <div
                    className="w-full h-20 rounded-lg flex items-center justify-center text-[12px]"
                    style={{ background: "rgba(0,0,0,0.04)", color: "#86868b" }}
                  >
                    {url}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
