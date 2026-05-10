"use client"

import { useState, useRef } from "react"
import {
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Share,
  Plus,
  Lock,
  BookOpen,
  LayoutGrid,
  X,
  Apple,
  Github,
  Youtube, 
  Globe,
  History,
  Search,
} from "lucide-react"

interface Tab {
  id: string
  title: string
  url: string
}

const BOOKMARKS = [
  { name: "Apple", url: "apple.com", icon: Apple, color: "#1d1d1f" },
  { name: "GitHub", url: "github.com", icon: Github, color: "#24292e" },
  { name: "Wikipedia", url: "wikipedia.org", icon: Globe, color: "#000000" },
  { name: "YouTube", url: "youtube.com", icon: Youtube, color: "#ff0000" }, 
  { name: "Stack Overflow", url: "stackoverflow.com", icon: Globe, color: "#f48024" },
]

const FREQUENTLY_VISITED = [
  { url: "github.com", title: "GitHub" },
  { url: "vercel.com", title: "Vercel" },
  { url: "nextjs.org", title: "Next.js" },
  { url: "react.dev", title: "React" },
]

export function SafariApp() {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: "start", title: "Start Page", url: "" },
  ])
  const [activeTabId, setActiveTabId] = useState("start")
  const [urlInput, setUrlInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const urlInputRef = useRef<HTMLInputElement>(null)

  const activeTab = tabs.find((t) => t.id === activeTabId)

  const navigateTo = (url: string) => {
    if (!url.trim()) return
    let cleanUrl = url.trim()
    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
      cleanUrl = `https://${cleanUrl}`
    }
    setIsLoading(true)
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeTabId
          ? {
              ...tab,
              url: cleanUrl,
              title: new URL(cleanUrl).hostname.replace("www.", ""),
            }
          : tab
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
    setTabs((prev) => [...prev, newTab])
    setActiveTabId(newTab.id)
    setUrlInput("")
  }

  const closeTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (tabs.length === 1) return
    const newTabs = tabs.filter((t) => t.id !== tabId)
    setTabs(newTabs)
    if (activeTabId === tabId) {
      const newActive = newTabs[newTabs.length - 1]
      setActiveTabId(newActive.id)
      setUrlInput(newActive.url)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (urlInput.trim()) {
      navigateTo(urlInput)
      urlInputRef.current?.blur()
    }
  }

  const renderStartPage = () => (
    <div className="max-w-3xl mx-auto py-8 sm:py-12 px-4 sm:px-6 animate-fade-in">
      {/* Large search bar */}
      <div className="mb-10 sm:mb-12">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-muted/40 border border-border/50 focus-within:border-primary/50 focus-within:shadow-lg transition-all">
            <Search className="w-4 h-4 text-muted-foreground/60 shrink-0" />
            <input
              ref={urlInputRef}
              type="text"
              className="flex-1 bg-transparent outline-none text-[15px] text-foreground placeholder:text-muted-foreground/60"
              placeholder="Search or enter website name"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
            />
            {isLoading && <RotateCw className="w-4 h-4 text-primary animate-spin" />}
          </div>
        </form>
      </div>

      {/* Favorites */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-4 h-4 text-primary" />
          <h3 className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
            Favorites
          </h3>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {BOOKMARKS.map((bm) => (
            <button
              key={bm.name}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-200 hover:bg-muted/60 active:scale-95 touch-manipulation group"
              onClick={() => navigateTo(bm.url)}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all"
                style={{ background: bm.color }}
              >
                <bm.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-[12px] font-medium text-foreground/80">
                {bm.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Frequently Visited */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <History className="w-4 h-4 text-primary" />
          <h3 className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
            Frequently Visited
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {FREQUENTLY_VISITED.map((item) => (
            <button
              key={item.url}
              className="flex flex-col items-start gap-2 p-3 rounded-xl bg-muted/30 hover:bg-muted/60 transition-all duration-200 text-left active:scale-[0.98]"
              onClick={() => navigateTo(item.url)}
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Globe className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-[13px] font-medium text-foreground">{item.title}</p>
                <p className="text-[10px] text-muted-foreground truncate">{item.url}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-[11px] text-muted-foreground/60">
          Web content is simulated in this environment
        </p>
      </div>
    </div>
  )

  const renderWebView = () => (
    <div className="flex flex-col items-center justify-center h-full gap-5 p-6 text-center animate-fade-in">
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg"
        style={{ background: "linear-gradient(135deg, #0071e3, #34aadc)" }}
      >
        {activeTab?.title?.charAt(0).toUpperCase() || "W"}
      </div>
      <div>
        <h2 className="text-xl font-semibold text-foreground">{activeTab?.title}</h2>
        <p className="text-[13px] text-muted-foreground mt-1">{activeTab?.url}</p>
      </div>
      <div className="px-4 py-2 rounded-full bg-muted/50 text-[12px] text-muted-foreground">
        🌐 Web content simulation – real browsing not available
      </div>
    </div>
  )

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      {/* Tab bar – only when multiple tabs */}
      {tabs.length > 1 && (
        <div className="shrink-0 overflow-x-auto scrollbar-hide border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="flex items-center gap-1 px-2 pt-1.5 min-w-max">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-t-xl text-[12px] cursor-pointer transition-all duration-150 max-w-[160px] sm:max-w-[200px] ${
                  activeTabId === tab.id
                    ? "bg-background text-foreground shadow-[0_-2px_0_#0071e3] font-medium"
                    : "text-muted-foreground hover:bg-muted/60"
                }`}
                onClick={() => {
                  setActiveTabId(tab.id)
                  setUrlInput(tab.url)
                }}
              >
                <div className="w-4 h-4 rounded-full bg-muted-foreground/20 flex items-center justify-center shrink-0">
                  {tab.url ? (
                    <Globe className="w-2.5 h-2.5" />
                  ) : (
                    <BookOpen className="w-2.5 h-2.5" />
                  )}
                </div>
                <span className="truncate flex-1">{tab.title}</span>
                <button
                  className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-muted/80 transition-colors shrink-0 opacity-60 hover:opacity-100"
                  onClick={(e) => closeTab(tab.id, e)}
                  aria-label="Close tab"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <button
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-muted/80 transition-colors shrink-0 ml-1"
              onClick={addTab}
              aria-label="New tab"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Navigation & URL bar */}
      <div className="shrink-0 flex items-center gap-2 px-3 py-2 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-0.5">
          <button className="p-1.5 rounded-full hover:bg-muted/60 transition-colors active:scale-95">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="p-1.5 rounded-full hover:bg-muted/60 transition-colors active:scale-95">
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            className="p-1.5 rounded-full hover:bg-muted/60 transition-colors active:scale-95"
            onClick={() => navigateTo(urlInput)}
          >
            <RotateCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 relative">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/50 border border-border/50 focus-within:border-primary/50 transition-all">
            <Lock className="w-3 h-3 text-muted-foreground/60 shrink-0" />
            <input
              ref={urlInputRef}
              type="text"
              className="flex-1 bg-transparent outline-none text-[13px] sm:text-[14px] text-foreground placeholder:text-muted-foreground/60 text-center sm:text-left"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Search or enter address"
            />
            {isLoading && <RotateCw className="w-3.5 h-3.5 text-primary animate-spin shrink-0" />}
          </div>
        </form>

        <div className="flex items-center gap-0.5">
          <button className="p-1.5 rounded-full hover:bg-muted/60 transition-colors active:scale-95">
            <Share className="w-4 h-4" />
          </button>
          <button
            className="p-1.5 rounded-full hover:bg-muted/60 transition-colors active:scale-95 sm:hidden"
            onClick={addTab}
          >
            <Plus className="w-4 h-4" />
          </button>
          <button className="p-1.5 rounded-full hover:bg-muted/60 transition-colors active:scale-95">
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto bg-background">
        {activeTab?.url ? renderWebView() : renderStartPage()}
      </div>
    </div>
  )
}