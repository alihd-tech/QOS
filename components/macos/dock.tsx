"use client"

import React, { useState, useRef, useCallback, useEffect } from "react"
import { useOS } from "./os-context"
import type { DockPosition, DockSize } from "@/lib/settings"

const DOCK_SIZE_MAP: Record<DockSize, number> = {
  small: 40,
  medium: 48,
  large: 56,
}

const EDGE_THRESHOLD = 12

export function Dock() {
  const { apps, openApp, windows, installedAppIds, settings } = useOS()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const dockRef = useRef<HTMLDivElement>(null)
  const [mouseCoord, setMouseCoord] = useState<number | null>(null)
  const [edgeHovered, setEdgeHovered] = useState(false)
  const [dockHovered, setDockHovered] = useState(false)

  const { size, position, autoHide, magnify, alwaysOnTop } = settings.dock
  const itemSize = DOCK_SIZE_MAP[size]
  const hasOpenWindows = windows.length > 0
  const shouldHide = autoHide && hasOpenWindows
  const isVisible = !shouldHide || edgeHovered || dockHovered

  const dockApps = apps.filter((a) => installedAppIds.includes(a.id))

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dockRef.current) return
      const rect = dockRef.current.getBoundingClientRect()
      if (position === "bottom") {
        setMouseCoord(e.clientX - rect.left)
      } else {
        setMouseCoord(e.clientY - rect.top)
      }
    },
    [position]
  )

  const handleMouseEnter = useCallback(() => {
    setDockHovered(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setHoveredIndex(null)
    setMouseCoord(null)
    setDockHovered(false)
  }, [])

  // Edge strip hover: show dock when mouse enters screen edge
  useEffect(() => {
    if (!shouldHide) return
    const onMove = (e: MouseEvent) => {
      const w = window.innerWidth
      const h = window.innerHeight
      if (position === "bottom" && h - e.clientY <= EDGE_THRESHOLD) {
        setEdgeHovered(true)
      } else if (position === "left" && e.clientX <= EDGE_THRESHOLD) {
        setEdgeHovered(true)
      } else if (position === "right" && w - e.clientX <= EDGE_THRESHOLD) {
        setEdgeHovered(true)
      } else {
        setEdgeHovered(false)
      }
    }
    window.addEventListener("mousemove", onMove)
    return () => window.removeEventListener("mousemove", onMove)
  }, [shouldHide, position])

  const getScale = (index: number) => {
    if (!magnify || mouseCoord === null || !dockRef.current) return 1
    const gap = 6
    const totalItems = dockApps.length
    const totalLen = totalItems * itemSize + (totalItems - 1) * gap
    const start = (dockRef.current[position === "bottom" ? "offsetWidth" : "offsetHeight"] - totalLen) / 2
    const itemCenter = start + index * (itemSize + gap) + itemSize / 2
    const distance = Math.abs(mouseCoord - itemCenter)
    const maxDistance = 100
    if (distance > maxDistance) return 1
    return 1 + 0.4 * (1 - distance / maxDistance)
  }

  const isVertical = position === "left" || position === "right"
  const positionClasses =
    position === "bottom"
      ? "bottom-2 left-1/2 -translate-x-1/2"
      : position === "left"
        ? "left-2 top-1/2 -translate-y-1/2"
        : "right-2 top-1/2 -translate-y-1/2"

  const dockStyle: React.CSSProperties = {
    background: "hsl(var(--dock-bg))",
    backdropFilter: "blur(40px) saturate(180%)",
    WebkitBackdropFilter: "blur(40px) saturate(180%)",
    border: "1px solid hsl(var(--window-border))",
    boxShadow:
      "0 0 0 0.5px hsl(var(--window-border)), 0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
  }

  return (
    <>
      {/* Invisible edge strip to trigger dock show when auto-hide */}
      {shouldHide && (
        <div
          className={`fixed ${alwaysOnTop ? "z-[9997]" : "z-[50]"}`}
          style={
            position === "bottom"
              ? { bottom: 0, left: 0, right: 0, height: EDGE_THRESHOLD }
              : position === "left"
                ? { left: 0, top: 0, bottom: 0, width: EDGE_THRESHOLD }
                : { right: 0, top: 0, bottom: 0, width: EDGE_THRESHOLD }
          }
          aria-hidden
        />
      )}
      <div
        className={`os-chrome fixed ${alwaysOnTop ? "z-[9998]" : "z-[50]"} flex rounded-2xl transition-all duration-300 ${positionClasses} ${
          isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={
          !isVisible && shouldHide
            ? position === "bottom"
              ? { transform: "translateX(-50%) translateY(calc(100% + 16px))" }
              : position === "left"
                ? { transform: "translateY(-50%) translateX(calc(-100% - 16px))" }
                : { transform: "translateY(-50%) translateX(calc(100% + 16px))" }
            : undefined
        }
      >
        <div
          ref={dockRef}
          className={
            isVertical
              ? "flex flex-col items-center gap-1.5 px-1.5 py-3 rounded-2xl"
              : "flex items-end gap-1.5 px-3 py-1.5 rounded-2xl"
          }
          style={dockStyle}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onMouseEnter={handleMouseEnter}
        >
          {dockApps.map((app, index) => {
            const scale = getScale(index)
            const hasOpenWindow = windows.some((w) => w.appId === app.id)
            const margin = (scale - 1) * (itemSize / 2)
            return (
              <div key={app.id} className="flex flex-col items-center relative">
                <button
                  className="dock-item flex items-center justify-center rounded-xl"
                  style={{
                    width: itemSize,
                    height: itemSize,
                    transform: `scale(${scale})`,
                    transformOrigin: isVertical ? "center center" : "bottom center",
                    ...(isVertical ? { marginLeft: margin, marginRight: margin } : { marginBottom: margin }),
                  }}
                  onClick={() => openApp(app.id)}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  aria-label={`Open ${app.name}`}
                >
                  {app.icon}
                </button>
                {hoveredIndex === index && (
                  <div
                    className={`absolute bg-popover text-popover-foreground text-[12px] px-2 py-0.5 rounded whitespace-nowrap border border-border shadow-md ${
                      position === "left"
                        ? "left-full ml-2 top-1/2 -translate-y-1/2"
                        : position === "right"
                          ? "right-full mr-2 top-1/2 -translate-y-1/2"
                          : "-top-8"
                    }`}
                    style={
                      !isVertical ? { transform: `translateY(-${margin}px)` } : undefined
                    }
                  >
                    {app.name}
                  </div>
                )}
                {hasOpenWindow && (
                  <div
                    className={`w-1 h-1 rounded-full bg-foreground/50 absolute ${
                      isVertical ? "left-1/2 -translate-x-1/2 -bottom-1.5" : "-bottom-1.5"
                    }`}
                    style={
                      isVertical ? { marginBottom: margin } : { transform: `translateY(${margin}px)` }
                    }
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
