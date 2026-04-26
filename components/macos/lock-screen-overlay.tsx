"use client"

import React from "react"
import { useOS } from "./os-context"

export function LockScreenOverlay() {
  const { isLocked, unlockScreen, currentTime } = useOS()
  if (!isLocked) return null

  const timeStr = currentTime.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  })
  const dateStr = currentTime.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  })

  return (
    <div
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-background/80 backdrop-blur-xl"
      onClick={() => unlockScreen()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") unlockScreen()
      }}
      aria-label="Lock screen - click or press Enter to unlock"
    >
      <div className="text-center">
        <div className="text-7xl font-extralight tabular-nums text-foreground">
          {timeStr}
        </div>
        <div className="text-lg text-muted-foreground mt-2">{dateStr}</div>
        <p className="text-sm text-muted-foreground mt-12">
          Click anywhere or press Enter to unlock
        </p>
      </div>
    </div>
  )
}
