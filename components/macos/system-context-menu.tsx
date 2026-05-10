"use client"

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import { useOS } from "./os-context"
import { formatShortcut } from "@/lib/settings"

/** Elements inside a node with this attribute do not open the system context menu. */
export const DATA_BLOCK_SYSTEM_CONTEXT = "data-block-system-context"

const LONG_PRESS_MS = 480
const MOVE_CANCEL_PX = 14
const ESTIMATED_MENU_W = 260
const ESTIMATED_MENU_H = 340

function isBlockedTarget(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest(`[${DATA_BLOCK_SYSTEM_CONTEXT}]`) !== null
}

function clampPosition(x: number, y: number, w: number, h: number) {
  const pad = 8
  const vw = typeof window !== "undefined" ? window.innerWidth : 800
  const vh = typeof window !== "undefined" ? window.innerHeight : 600
  let left = x
  let top = y
  if (left + w + pad > vw) left = vw - w - pad
  if (top + h + pad > vh) top = vh - h - pad
  return { left: Math.max(pad, left), top: Math.max(pad, top) }
}

type MenuItem =
  | { type: "sep" }
  | { type: "item"; label: string; shortcut?: string; action: () => void }

export function useSystemContextMenu() {
  const {
    openApp,
    setShowSpotlight,
    setShowMissionControl,
    setShowTaskView,
    setShowControlCenter,
    setShowNotificationCenter,
    lockScreen,
    settings,
  } = useOS()

  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null)
  const [placement, setPlacement] = useState({ left: 0, top: 0 })
  const menuRef = useRef<HTMLDivElement>(null)
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  /** Ignore outside-dismiss briefly so long-press / synthetic clicks do not instantly close the menu. */
  const dismissBlockedUntilRef = useRef(0)

  const close = useCallback(() => setAnchor(null), [])

  const openAt = useCallback((clientX: number, clientY: number) => {
    dismissBlockedUntilRef.current = Date.now() + 380
    const p = clampPosition(clientX, clientY, ESTIMATED_MENU_W, ESTIMATED_MENU_H)
    setPlacement(p)
    setAnchor({ x: clientX, y: clientY })
  }, [])

  useLayoutEffect(() => {
    if (!anchor || !menuRef.current) return
    const r = menuRef.current.getBoundingClientRect()
    setPlacement(clampPosition(anchor.x, anchor.y, r.width, r.height))
  }, [anchor])

  const onContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if (isBlockedTarget(e.target)) return
      e.preventDefault()
      e.stopPropagation()
      openAt(e.clientX, e.clientY)
    },
    [openAt]
  )

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }, [])

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (isBlockedTarget(e.target)) return
      const t = e.touches[0]
      touchStartRef.current = { x: t.clientX, y: t.clientY }
      clearLongPressTimer()
      longPressTimerRef.current = setTimeout(() => {
        longPressTimerRef.current = null
        openAt(t.clientX, t.clientY)
      }, LONG_PRESS_MS)
    },
    [openAt, clearLongPressTimer]
  )

  const onTouchEnd = useCallback(() => {
    clearLongPressTimer()
    touchStartRef.current = null
  }, [clearLongPressTimer])

  const onTouchCancel = useCallback(() => {
    clearLongPressTimer()
    touchStartRef.current = null
  }, [clearLongPressTimer])

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current || !longPressTimerRef.current) return
      const t = e.touches[0]
      const dx = t.clientX - touchStartRef.current.x
      const dy = t.clientY - touchStartRef.current.y
      if (dx * dx + dy * dy > MOVE_CANCEL_PX * MOVE_CANCEL_PX) {
        clearLongPressTimer()
        touchStartRef.current = null
      }
    },
    [clearLongPressTimer]
  )

  useEffect(() => {
    if (!anchor) return
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") close()
    }
    const onPointerDown = (ev: MouseEvent | TouchEvent) => {
      if (Date.now() < dismissBlockedUntilRef.current) return
      const node = menuRef.current
      const t = ev.target
      if (node && t instanceof Node && node.contains(t)) return
      close()
    }
    window.addEventListener("keydown", onKey)
    window.addEventListener("mousedown", onPointerDown)
    window.addEventListener("touchstart", onPointerDown, { capture: true })
    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("mousedown", onPointerDown)
      window.removeEventListener("touchstart", onPointerDown, { capture: true })
    }
  }, [anchor, close])

  const runAndClose = useCallback(
    (fn: () => void) => {
      fn()
      close()
    },
    [close]
  )

  const items: MenuItem[] = [
    {
      type: "item",
      label: "Open Finder",
      action: () => runAndClose(() => openApp("finder")),
    },
    {
      type: "item",
      label: "System Settings",
      action: () => runAndClose(() => openApp("settings")),
    },
    {
      type: "item",
      label: "App Store",
      action: () => runAndClose(() => openApp("appstore")),
    },
    { type: "sep" },
    {
      type: "item",
      label: "Spotlight",
      shortcut: formatShortcut(settings.shortcuts.spotlight),
      action: () => runAndClose(() => setShowSpotlight(true)),
    },
    {
      type: "item",
      label: "Mission Control",
      shortcut: formatShortcut(settings.shortcuts.missionControl),
      action: () => runAndClose(() => setShowMissionControl(true)),
    },
    {
      type: "item",
      label: "Task View",
      action: () => runAndClose(() => setShowTaskView(true)),
    },
    {
      type: "item",
      label: "Control Center",
      action: () => runAndClose(() => setShowControlCenter(true)),
    },
    {
      type: "item",
      label: "Notification Center",
      action: () => runAndClose(() => setShowNotificationCenter(true)),
    },
    { type: "sep" },
    {
      type: "item",
      label: "Lock Screen",
      shortcut: formatShortcut(settings.shortcuts.lockScreen),
      action: () => runAndClose(() => lockScreen()),
    },
  ]

  const surfaceProps = {
    onContextMenu,
    onTouchStart,
    onTouchEnd,
    onTouchCancel,
    onTouchMove,
  }

  const menu =
    anchor && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-label="System menu"
            className={cn(
              "fixed z-[100002] min-w-[13rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md outline-none",
              "animate-in fade-in-0 zoom-in-95 duration-100"
            )}
            style={{ left: placement.left, top: placement.top }}
            onContextMenu={(e) => e.preventDefault()}
          >
            {items.map((it, i) =>
              it.type === "sep" ? (
                <div key={`sep-${i}`} className="-mx-1 my-1 h-px bg-border" role="separator" />
              ) : (
                <button
                  key={it.label}
                  type="button"
                  role="menuitem"
                  className={cn(
                    "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-left text-sm outline-none",
                    "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                  )}
                  onClick={() => it.action()}
                >
                  <span className="flex-1 truncate">{it.label}</span>
                  {it.shortcut ? (
                    <span className="ml-4 shrink-0 text-xs tracking-widest text-muted-foreground">
                      {it.shortcut}
                    </span>
                  ) : null}
                </button>
              )
            )}
          </div>,
          document.body
        )
      : null

  return { surfaceProps, menu }
}
