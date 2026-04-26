"use client"

import React, { useEffect, useState, useCallback } from "react"
import { useOS } from "./os-context"

export function AppSwitcherOverlay() {
  const {
    showAppSwitcher,
    setShowAppSwitcher,
    windows,
    apps,
    focusWindow,
    activeWindowId,
  } = useOS()

  const openWindows = windows.filter((w) => !w.isMinimized)
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    const idx = openWindows.findIndex((w) => w.id === activeWindowId)
    setSelectedIndex(idx >= 0 ? idx : 0)
  }, [showAppSwitcher, activeWindowId, openWindows.length])

  const cycle = useCallback(
    (delta: number) => {
      if (openWindows.length === 0) return
      setSelectedIndex((i) => (i + delta + openWindows.length) % openWindows.length)
    },
    [openWindows.length]
  )

  useEffect(() => {
    if (!showAppSwitcher) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        setShowAppSwitcher(false)
        return
      }
      if (e.key === "Tab") {
        e.preventDefault()
        cycle(e.shiftKey ? -1 : 1)
        return
      }
      if (e.key === "Enter") {
        e.preventDefault()
        const w = openWindows[selectedIndex]
        if (w) {
          focusWindow(w.id)
          setShowAppSwitcher(false)
        }
        return
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [showAppSwitcher, setShowAppSwitcher, cycle, selectedIndex, openWindows, focusWindow])

  if (!showAppSwitcher) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center pb-24 bg-black/20 backdrop-blur-sm"
      onClick={() => setShowAppSwitcher(false)}
    >
      <div
        className="flex items-end gap-2 px-4 py-3 rounded-2xl bg-popover/95 backdrop-blur border border-border shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {openWindows.map((w, i) => {
          const appDef = apps.find((a) => a.id === w.appId)
          const isSelected = i === selectedIndex
          return (
            <button
              key={w.id}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl min-w-[64px] transition-colors ${
                isSelected ? "bg-primary/20 ring-2 ring-primary" : "hover:bg-muted/50"
              }`}
              onClick={() => {
                focusWindow(w.id)
                setShowAppSwitcher(false)
              }}
              onMouseEnter={() => setSelectedIndex(i)}
            >
              <span className="w-12 h-12 flex items-center justify-center shrink-0">
                {appDef?.icon}
              </span>
              <span className="text-[11px] max-w-[64px] truncate text-center">
                {appDef?.name ?? w.title}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
