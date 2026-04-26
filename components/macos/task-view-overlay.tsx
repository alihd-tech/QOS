"use client"

import React, { useEffect } from "react"
import { useOS } from "./os-context"
import { LayoutGrid, X, Minus, Square, Trash2 } from "lucide-react"

export function TaskViewOverlay() {
  const {
    showTaskView,
    setShowTaskView,
    windows,
    apps,
    activeWindowId,
    focusWindow,
    minimizeWindow,
    restoreWindow,
    closeWindow,
  } = useOS()

  useEffect(() => {
    if (!showTaskView) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        setShowTaskView(false)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [showTaskView, setShowTaskView])

  if (!showTaskView) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-10 pb-8 px-6 bg-black/40 backdrop-blur-sm"
      onClick={() => setShowTaskView(false)}
    >
      <div
        className="w-full max-w-3xl rounded-2xl border border-border bg-popover/95 backdrop-blur shadow-2xl overflow-hidden flex flex-col max-h-[calc(100vh-6rem)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <LayoutGrid className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Task View</h2>
              <p className="text-xs text-muted-foreground">
                Running applications and active processes
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowTaskView(false)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Close Task View"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {/* Running applications */}
          <div className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Running applications
            </h3>
            {windows.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No applications running
              </p>
            ) : (
              <ul className="space-y-1">
                {windows.map((win) => {
                  const appDef = apps.find((a) => a.id === win.appId)
                  const isActive = win.id === activeWindowId
                  return (
                    <li
                      key={win.id}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                        isActive ? "bg-primary/10" : "hover:bg-muted/60"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-muted/80 flex items-center justify-center shrink-0">
                        {appDef?.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {win.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {appDef?.name ?? win.appId} •{" "}
                          {win.isMinimized ? "Minimized" : "Running"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            if (win.isMinimized) restoreWindow(win.id)
                            else focusWindow(win.id)
                            setShowTaskView(false)
                          }}
                          className="p-2 rounded-lg hover:bg-muted transition-colors"
                          title="Switch to"
                        >
                          <Square className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            win.isMinimized ? restoreWindow(win.id) : minimizeWindow(win.id)
                          }
                          className="p-2 rounded-lg hover:bg-muted transition-colors"
                          title={win.isMinimized ? "Restore" : "Minimize"}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            closeWindow(win.id)
                            if (windows.length <= 1) setShowTaskView(false)
                          }}
                          className="p-2 rounded-lg hover:bg-destructive/15 text-destructive transition-colors"
                          title="End task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {/* Active processes (same windows, different presentation) */}
          <div className="p-4 pt-0 border-t border-border">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Active processes
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-muted-foreground border-b border-border">
                    <th className="pb-2 font-medium">Process</th>
                    <th className="pb-2 font-medium">Application</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {windows.map((win) => {
                    const appDef = apps.find((a) => a.id === win.appId)
                    const isActive = win.id === activeWindowId
                    return (
                      <tr
                        key={win.id}
                        className={`border-b border-border/50 ${
                          isActive ? "bg-primary/5" : "hover:bg-muted/40"
                        }`}
                      >
                        <td className="py-2.5 font-medium truncate max-w-[140px]">
                          {win.title}
                        </td>
                        <td className="py-2.5 text-muted-foreground truncate max-w-[120px]">
                          {appDef?.name ?? win.appId}
                        </td>
                        <td className="py-2.5">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                              win.isMinimized
                                ? "bg-muted text-muted-foreground"
                                : "bg-primary/20 text-primary"
                            }`}
                          >
                            {win.isMinimized ? "Minimized" : "Running"}
                          </span>
                        </td>
                        <td className="py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                if (win.isMinimized) restoreWindow(win.id)
                                else focusWindow(win.id)
                                setShowTaskView(false)
                              }}
                              className="px-2 py-1 rounded text-xs font-medium hover:bg-muted"
                            >
                              Switch to
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                win.isMinimized ? restoreWindow(win.id) : minimizeWindow(win.id)
                              }
                              className="px-2 py-1 rounded text-xs font-medium hover:bg-muted"
                            >
                              {win.isMinimized ? "Restore" : "Minimize"}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                closeWindow(win.id)
                                if (windows.length <= 1) setShowTaskView(false)
                              }}
                              className="px-2 py-1 rounded text-xs font-medium text-destructive hover:bg-destructive/15"
                            >
                              End task
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {windows.length === 0 && (
              <p className="text-sm text-muted-foreground py-6 text-center">
                No active processes
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
