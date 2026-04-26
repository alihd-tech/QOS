"use client"

import React, { useEffect } from "react"
import { useOS } from "./os-context"
import { Bell, BellOff, X } from "lucide-react"

export function NotificationCenterOverlay() {
  const {
    showNotificationCenter,
    setShowNotificationCenter,
    environmentNotification,
    clearEnvironmentNotification,
    currentTime,
  } = useOS()

  useEffect(() => {
    if (!showNotificationCenter) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        setShowNotificationCenter(false)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [showNotificationCenter, setShowNotificationCenter])

  if (!showNotificationCenter) return null

  const formattedTime = currentTime.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
  const formattedDate = currentTime.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })

  return (
    <div
      className="fixed inset-0 z-[9997] flex justify-end pt-12 pb-4 pr-4"
      onClick={() => setShowNotificationCenter(false)}
    >
      <div
        className="w-[360px] rounded-2xl border border-border bg-popover/95 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100vh-6rem)] animate-in slide-in-from-right-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with date/time */}
        <div className="px-5 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
            <button
              type="button"
              onClick={() => setShowNotificationCenter(false)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{formattedDate}</p>
          <p className="text-2xl font-light text-foreground mt-0.5">{formattedTime}</p>
        </div>

        {/* Notifications list */}
        <div className="flex-1 overflow-auto py-2">
          {environmentNotification ? (
            <div className="mx-3 mb-2 rounded-xl border border-border bg-card/80 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">Q-OS</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {environmentNotification.message}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      clearEnvironmentNotification()
                    }}
                    className="mt-2 text-xs text-muted-foreground hover:text-foreground underline"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {!environmentNotification && (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-14 h-14 rounded-full bg-muted/80 flex items-center justify-center mb-3">
                <BellOff className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">No Notifications</p>
              <p className="text-xs text-muted-foreground mt-1">
                Notifications from Q-OS and apps will appear here.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border">
          <button
            type="button"
            className="w-full py-2 text-center text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/60 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  )
}
