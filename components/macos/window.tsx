"use client"

import React from "react"

import { useOS, type AppWindow, type AppDefinition, type WindowType } from "./os-context"
import { useRef, useCallback, useState, useEffect } from "react"

const MENU_BAR_HEIGHT = 28

interface WindowProps {
  window: AppWindow
  children: React.ReactNode
  isActive: boolean
  appDef?: AppDefinition
}

export function Window({ window: win, children, isActive, appDef }: WindowProps) {
  const {
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    focusWindow,
    updateWindowPosition,
    updateWindowSize,
    windows,
    apps,
    settings,
  } = useOS()

  const windowRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeDirection, setResizeDirection] = useState("")
  const [trafficHover, setTrafficHover] = useState(false)
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const dragStart = useRef({ x: 0, y: 0, winX: 0, winY: 0 })
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0, winX: 0, winY: 0 })

  const trafficOnLeft = settings.window.trafficLightsPosition === "left"
  const showSwitcher = settings.window.showMaximizeSwitcher && windows.length > 1
  const isInteracting = isDragging || isResizing
  const windowType: WindowType = appDef?.windowType ?? "system"
  const isNativeMaximized = windowType === "native" && win.isMaximized
  const showTitleBar = !isNativeMaximized

  // Clamp position to keep window within viewport bounds
  const clampPosition = useCallback(
    (x: number, y: number, w: number, h: number) => {
      const vw = typeof window !== "undefined" ? window.innerWidth : 1280
      const vh = typeof window !== "undefined" ? window.innerHeight : 720
      const minVisible = 50
      return {
        x: Math.max(0, Math.min(x, vw - minVisible)),
        y: Math.max(MENU_BAR_HEIGHT, Math.min(y, vh - minVisible)),
      }
    },
    []
  )

  // Drag handlers
  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      if (win.isMaximized) return
      e.preventDefault()
      focusWindow(win.id)
      setIsDragging(true)
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        winX: win.x,
        winY: win.y,
      }
    },
    [win.id, win.x, win.y, win.isMaximized, focusWindow]
  )

  useEffect(() => {
    if (!isDragging) return

    const handleMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStart.current.x
      const dy = e.clientY - dragStart.current.y
      let newX = dragStart.current.winX + dx
      let newY = dragStart.current.winY + dy
      const clamped = clampPosition(newX, newY, win.width, win.height)
      updateWindowPosition(win.id, clamped.x, clamped.y)
    }

    const handleUp = () => setIsDragging(false)

    document.addEventListener("mousemove", handleMove)
    document.addEventListener("mouseup", handleUp)
    document.body.style.userSelect = "none"
    document.body.style.cursor = "grabbing"
    return () => {
      document.removeEventListener("mousemove", handleMove)
      document.removeEventListener("mouseup", handleUp)
      document.body.style.userSelect = ""
      document.body.style.cursor = ""
    }
  }, [isDragging, win.id, win.width, win.height, clampPosition, updateWindowPosition])

  // Resize handlers
  const handleResizeStart = useCallback(
    (e: React.MouseEvent, direction: string) => {
      if (win.isMaximized) return
      e.preventDefault()
      e.stopPropagation()
      focusWindow(win.id)
      setIsResizing(true)
      setResizeDirection(direction)
      resizeStart.current = {
        x: e.clientX,
        y: e.clientY,
        w: win.width,
        h: win.height,
        winX: win.x,
        winY: win.y,
      }
    },
    [win.id, win.width, win.height, win.x, win.y, win.isMaximized, focusWindow]
  )

  useEffect(() => {
    if (!isResizing) return

    const handleMove = (e: MouseEvent) => {
      const dx = e.clientX - resizeStart.current.x
      const dy = e.clientY - resizeStart.current.y
      let newW = resizeStart.current.w
      let newH = resizeStart.current.h
      let newX = resizeStart.current.winX
      let newY = resizeStart.current.winY

      if (resizeDirection.includes("e")) newW = Math.max(win.minWidth, resizeStart.current.w + dx)
      if (resizeDirection.includes("s")) newH = Math.max(win.minHeight, resizeStart.current.h + dy)
      if (resizeDirection.includes("w")) {
        const newWidth = Math.max(win.minWidth, resizeStart.current.w - dx)
        newX = resizeStart.current.winX + (resizeStart.current.w - newWidth)
        newW = newWidth
      }
      if (resizeDirection.includes("n")) {
        const newHeight = Math.max(win.minHeight, resizeStart.current.h - dy)
        newY = Math.max(MENU_BAR_HEIGHT, resizeStart.current.winY + (resizeStart.current.h - newHeight))
        newH = newHeight
      }

      // Clamp to viewport
      const vw = typeof window !== "undefined" ? window.innerWidth : 1280
      const vh = typeof window !== "undefined" ? window.innerHeight : 720
      newW = Math.min(newW, vw - newX)
      newH = Math.min(newH, vh - newY)
      newW = Math.max(win.minWidth, newW)
      newH = Math.max(win.minHeight, newH)

      updateWindowSize(win.id, newW, newH)
      updateWindowPosition(win.id, newX, newY)
    }

    const handleUp = () => {
      setIsResizing(false)
      setResizeDirection("")
    }

    document.addEventListener("mousemove", handleMove)
    document.addEventListener("mouseup", handleUp)
    document.body.style.userSelect = "none"
    return () => {
      document.removeEventListener("mousemove", handleMove)
      document.removeEventListener("mouseup", handleUp)
      document.body.style.userSelect = ""
    }
  }, [isResizing, resizeDirection, win.id, win.minWidth, win.minHeight, updateWindowSize, updateWindowPosition])

  if (win.isMinimized) return null

  // Maximized: use fixed positioning to cover the full page below menu bar
  const isMaximized = win.isMaximized
  const containerStyle: React.CSSProperties = isMaximized
    ? {
        position: "fixed",
        inset: `${MENU_BAR_HEIGHT}px 0 0 0`,
        zIndex: win.zIndex,
      }
    : {
        position: "absolute",
        left: win.x,
        top: win.y,
        width: win.width,
        height: win.height,
        zIndex: win.zIndex,
      }

  return (
    <div
      ref={windowRef}
      className={`window-appear ${
        isInteracting ? "select-none" : "transition-[width,height,left,top] duration-75 ease-out"
      }`}
      style={containerStyle}
      onMouseDown={() => focusWindow(win.id)}
      data-window-id={win.id}
      data-maximized={isMaximized}
    >
      {/* Window frame - theme-aware via CSS variables */}
      <div
        className={`w-full h-full overflow-hidden flex flex-col ${
          isMaximized ? "rounded-t-xl" : "rounded-xl"
        }`}
        style={{
          background: isActive
            ? "hsl(var(--window-bg))"
            : "hsl(var(--window-toolbar) / 0.88)",
          backdropFilter: "blur(40px) saturate(180%)",
          WebkitBackdropFilter: "blur(40px) saturate(180%)",
          boxShadow: isActive
            ? "0 0 0 0.5px hsl(var(--window-border)), 0 24px 60px rgba(0,0,0,0.18), 0 8px 20px rgba(0,0,0,0.08)"
            : "0 0 0 0.5px hsl(var(--window-border) / 0.7), 0 8px 30px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        {/* Title bar - hidden for native apps when maximized (header moves to menubar) */}
        {showTitleBar && (
        <div
          className="os-chrome flex items-center justify-between h-[46px] px-4 shrink-0 relative cursor-default"
          onMouseDown={handleDragStart}
          onDoubleClick={() => maximizeWindow(win.id)}
          style={{
            background: "hsl(var(--window-toolbar))",
            borderBottom: "1px solid hsl(var(--window-border))",
          }}
        >
          <div className={`flex items-center gap-2 z-10 shrink-0 ${!trafficOnLeft ? "order-2" : ""}`}>
            {/* Traffic lights - when right: order reverses (maximize, minimize, close) so close stays at edge */}
            <div
              className={`flex items-center gap-2 ${!trafficOnLeft ? "flex-row-reverse" : ""}`}
              onMouseEnter={() => setTrafficHover(true)}
              onMouseLeave={() => setTrafficHover(false)}
            >
              <button
                className="w-3 h-3 rounded-full flex items-center justify-center transition-colors"
                style={{
                  background: isActive
                    ? "hsl(var(--traffic-close))"
                    : "hsl(var(--muted))",
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  closeWindow(win.id)
                }}
                aria-label="Close window"
              >
                {trafficHover && (
                  <svg width="8" height="8" viewBox="0 0 8 8" stroke="#4d0000" strokeWidth="1.2">
                    <line x1="1.5" y1="1.5" x2="6.5" y2="6.5" />
                    <line x1="6.5" y1="1.5" x2="1.5" y2="6.5" />
                  </svg>
                )}
              </button>
              <button
                className="w-3 h-3 rounded-full flex items-center justify-center transition-colors"
                style={{
                  background: isActive
                    ? "hsl(var(--traffic-minimize))"
                    : "hsl(var(--muted))",
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  minimizeWindow(win.id)
                }}
                aria-label="Minimize window"
              >
                {trafficHover && (
                  <svg width="8" height="8" viewBox="0 0 8 8" stroke="#995700" strokeWidth="1.2">
                    <line x1="1" y1="4" x2="7" y2="4" />
                  </svg>
                )}
              </button>
              <button
                className="w-3 h-3 rounded-full flex items-center justify-center transition-colors"
                style={{
                  background: isActive
                    ? "hsl(var(--traffic-maximize))"
                    : "hsl(var(--muted))",
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  maximizeWindow(win.id)
                }}
                aria-label="Maximize window"
              >
                {trafficHover && (
                  <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="#006500" strokeWidth="1.2">
                    <polyline points="2,6 2,2 6,2" />
                    <polyline points="8,4 8,8 4,8" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Window title */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span
              className="text-[13px] font-medium"
              style={{
                color: isActive
                  ? "hsl(var(--foreground))"
                  : "hsl(var(--muted-foreground))",
              }}
            >
              {win.title}
            </span>
          </div>

          {/* Window switcher (open windows) */}
          {showSwitcher && (
            <div className={`relative z-10 shrink-0 ${trafficOnLeft ? "" : "order-1"}`}>
              <button
                className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-muted/60 transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  setSwitcherOpen((v) => !v)
                }}
                aria-label="Switch window"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              </button>
              {switcherOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    aria-hidden
                    onClick={() => setSwitcherOpen(false)}
                  />
                  <div
                    className="absolute top-full right-0 mt-1 min-w-[180px] py-1 rounded-lg bg-popover border border-border shadow-lg z-50"
                    style={{ [trafficOnLeft ? "right" : "left"]: 0 }}
                  >
                    {windows
                      .filter((w) => !w.isMinimized)
                      .map((w) => {
                        const appDef = apps.find((a) => a.id === w.appId)
                        return (
                          <button
                            key={w.id}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-left text-[13px] hover:bg-muted/60 ${
                              w.id === win.id ? "bg-primary/10 text-primary" : ""
                            }`}
                            onClick={(e) => {
                              e.stopPropagation()
                              focusWindow(w.id)
                              setSwitcherOpen(false)
                            }}
                          >
                            {appDef?.icon && (
                              <span className="w-4 h-4 flex items-center justify-center shrink-0">
                                {appDef.icon}
                              </span>
                            )}
                            <span className="truncate">{w.title}</span>
                          </button>
                        )
                      })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        )}

        {/* Window content */}
        <div
          className="flex-1 overflow-hidden relative"
          style={{ color: "hsl(var(--foreground))" }}
        >
          {children}
        </div>
      </div>

      {/* Resize handles */}
      {!win.isMaximized && (
        <>
          {/* Edges */}
          <div className="absolute top-0 left-2 right-2 h-1 cursor-n-resize" onMouseDown={(e) => handleResizeStart(e, "n")} />
          <div className="absolute bottom-0 left-2 right-2 h-1 cursor-s-resize" onMouseDown={(e) => handleResizeStart(e, "s")} />
          <div className="absolute left-0 top-2 bottom-2 w-1 cursor-w-resize" onMouseDown={(e) => handleResizeStart(e, "w")} />
          <div className="absolute right-0 top-2 bottom-2 w-1 cursor-e-resize" onMouseDown={(e) => handleResizeStart(e, "e")} />
          {/* Corners */}
          <div className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize" onMouseDown={(e) => handleResizeStart(e, "nw")} />
          <div className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize" onMouseDown={(e) => handleResizeStart(e, "ne")} />
          <div className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize" onMouseDown={(e) => handleResizeStart(e, "sw")} />
          <div className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize" onMouseDown={(e) => handleResizeStart(e, "se")} />
        </>
      )}
    </div>
  )
}
