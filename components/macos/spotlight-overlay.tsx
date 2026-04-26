"use client"

import React, { useEffect, useRef, useState, useMemo } from "react"
import { useOS } from "./os-context"
import { Search } from "lucide-react"

export function SpotlightOverlay() {
  const { showSpotlight, setShowSpotlight, apps, installedAppIds, openApp } = useOS()
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const installedApps = useMemo(
    () => apps.filter((a) => installedAppIds.includes(a.id)),
    [apps, installedAppIds]
  )

  const results = useMemo(() => {
    if (!query.trim()) return installedApps.slice(0, 8)
    const q = query.toLowerCase().trim()
    return installedApps.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        (a.category?.toLowerCase().includes(q))
    )
  }, [query, installedApps])

  useEffect(() => {
    if (!showSpotlight) return
    setQuery("")
    setSelectedIndex(0)
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [showSpotlight])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  useEffect(() => {
    if (!showSpotlight) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        setShowSpotlight(false)
        return
      }
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((i) => (i + 1) % Math.max(1, results.length))
        return
      }
      if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex((i) => (i - 1 + results.length) % Math.max(1, results.length))
        return
      }
      if (e.key === "Enter" && results[selectedIndex]) {
        e.preventDefault()
        openApp(results[selectedIndex].id)
        setShowSpotlight(false)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [showSpotlight, setShowSpotlight, results, selectedIndex, openApp])

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    const item = el.querySelector(`[data-index="${selectedIndex}"]`)
    item?.scrollIntoView({ block: "nearest", behavior: "smooth" })
  }, [selectedIndex])

  if (!showSpotlight) return null

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-start justify-center pt-[15vh] px-4 bg-black/35 backdrop-blur-sm"
      onClick={() => setShowSpotlight(false)}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-border bg-popover/95 backdrop-blur-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search apps, files, and more..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground outline-none border-none"
            autoComplete="off"
          />
          <kbd className="hidden sm:inline text-[11px] text-muted-foreground px-1.5 py-0.5 rounded bg-muted/80">
            ⌘Space
          </kbd>
        </div>
        <div
          ref={listRef}
          className="max-h-[min(50vh,320px)] overflow-auto py-2"
        >
          {results.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted-foreground text-center">
              No results for &quot;{query}&quot;
            </p>
          ) : (
            <ul className="px-2">
              {results.map((app, idx) => (
                <li key={app.id}>
                  <button
                    type="button"
                    data-index={idx}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                      idx === selectedIndex ? "bg-primary/15 text-primary" : "hover:bg-muted/70"
                    }`}
                    onClick={() => {
                      openApp(app.id)
                      setShowSpotlight(false)
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <div className="w-10 h-10 rounded-xl bg-muted/80 flex items-center justify-center shrink-0">
                      {app.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{app.name}</p>
                      {app.category && (
                        <p className="text-xs text-muted-foreground truncate">
                          {app.category}
                        </p>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="px-4 py-2 border-t border-border flex items-center gap-4 text-[11px] text-muted-foreground">
          <span>↑↓ Navigate</span>
          <span>↵ Open</span>
          <span>Esc Close</span>
        </div>
      </div>
    </div>
  )
}
