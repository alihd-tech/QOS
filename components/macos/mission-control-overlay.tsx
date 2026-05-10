"use client"

import React, { useEffect } from "react"
import { useOS } from "./os-context"

export function MissionControlOverlay() {
  const { showMissionControl, setShowMissionControl, windows, apps, focusWindow } = useOS()
  const openWindows = windows.filter((w) => !w.isMinimized)

  useEffect(() => {
    if (!showMissionControl) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        setShowMissionControl(false)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [showMissionControl, setShowMissionControl])

  if (!showMissionControl) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col bg-black/30 backdrop-blur-sm p-8"
      onClick={() => setShowMissionControl(false)}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-foreground">Mission Control</h2>
        <p className="text-sm text-muted-foreground">Click a window to switch</p>
      </div>
      <div
        className="flex-1 grid gap-4 overflow-auto justify-items-center content-start"
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {openWindows.map((w) => {
          const appDef = apps.find((a) => a.id === w.appId)
          return (
            <button
              key={w.id}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-popover/90 border border-border shadow-lg hover:ring-2 hover:ring-primary transition-all w-full max-w-[220px]"
              onClick={() => {
                focusWindow(w.id)
                setShowMissionControl(false)
              }}
            >
              <span className="w-16 h-16 flex items-center justify-center shrink-0 rounded-lg bg-muted/50">
                {appDef?.icon}
              </span>
              <span className="text-[13px] font-medium truncate w-full text-center">
                {w.title}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
