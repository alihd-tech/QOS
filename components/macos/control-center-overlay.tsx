"use client"

import React, { useCallback, useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { useOS } from "./os-context"
import {
  Wifi,
  WifiOff,
  Bluetooth,
  Battery,
  BatteryLow,
  Volume2,
  Sun,
  Moon,
  Maximize2,
  Minimize2,
  LayoutGrid,
  Lock,
  Search,
  BellOff,
  Bell,
} from "lucide-react"

export function ControlCenterOverlay() {
  const {
    showControlCenter,
    setShowControlCenter,
    settings,
    updateSoundSettings,
    updateNotificationSettings,
    activeWindowId,
    maximizeWindow,
    lockScreen,
    setShowMissionControl,
    setShowSpotlight,
    openApp,
  } = useOS()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [online, setOnline] = useState(true)
  const [bluetoothAvailable, setBluetoothAvailable] = useState(false)
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null)
  const [batteryCharging, setBatteryCharging] = useState<boolean | null>(null)
  const [fullscreen, setFullscreen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!showControlCenter) return
    setOnline(typeof navigator !== "undefined" ? navigator.onLine : true)
    const onOnline = () => setOnline(true)
    const onOffline = () => setOnline(false)
    window.addEventListener("online", onOnline)
    window.addEventListener("offline", onOffline)
    return () => {
      window.removeEventListener("online", onOnline)
      window.removeEventListener("offline", onOffline)
    }
  }, [showControlCenter])

  useEffect(() => {
    if (!showControlCenter) return
    let cancelled = false
    let batteryCleanup: (() => void) | undefined
    const nav = navigator as Navigator & {
      bluetooth?: { getAvailability?: () => Promise<boolean> }
      getBattery?: () => Promise<{
        level: number
        charging: boolean
        addEventListener: (type: string, fn: () => void) => void
        removeEventListener: (type: string, fn: () => void) => void
      }>
    }
    if (nav.bluetooth?.getAvailability) {
      nav.bluetooth.getAvailability().then((avail) => {
        if (!cancelled) setBluetoothAvailable(avail)
      })
    } else {
      setBluetoothAvailable(false)
    }
    if (nav.getBattery) {
      nav.getBattery().then((bat) => {
        if (cancelled) return
        const sync = () => {
          setBatteryLevel(Math.round(bat.level * 100))
          setBatteryCharging(bat.charging)
        }
        sync()
        bat.addEventListener("levelchange", sync)
        bat.addEventListener("chargingchange", sync)
        batteryCleanup = () => {
          bat.removeEventListener("levelchange", sync)
          bat.removeEventListener("chargingchange", sync)
        }
      })
    } else {
      setBatteryLevel(null)
      setBatteryCharging(null)
    }
    return () => {
      cancelled = true
      batteryCleanup?.()
    }
  }, [showControlCenter])

  useEffect(() => {
    const onFs = () => setFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener("fullscreenchange", onFs)
    onFs()
    return () => document.removeEventListener("fullscreenchange", onFs)
  }, [])

  useEffect(() => {
    if (!showControlCenter) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        setShowControlCenter(false)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [showControlCenter, setShowControlCenter])

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else {
        await document.documentElement.requestFullscreen()
      }
    } catch {
      /* user denied or API unsupported */
    }
  }, [])

  const closeAnd = useCallback(
    (fn: () => void) => {
      fn()
      setShowControlCenter(false)
    },
    [setShowControlCenter]
  )

  if (!showControlCenter) return null

  const volume = settings.sound?.volume ?? 70
  const setVolume = (v: number) =>
    updateSoundSettings({ volume: Math.max(0, Math.min(100, v)) })

  const appearance = mounted ? (resolvedTheme === "dark" ? "dark" : "light") : "light"
  const dndOn = !settings.notifications.enabled

  return (
    <div
      data-block-system-context
      className="fixed inset-0 z-[9997] flex justify-end pt-12 pb-4 pr-4"
      onClick={() => setShowControlCenter(false)}
    >
      <div
        className="w-[320px] rounded-2xl border border-border bg-popover/95 backdrop-blur-xl shadow-2xl overflow-hidden animate-in slide-in-from-right-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-4 gap-2">
            <ControlCenterStatusTile
              icon={online ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
              label="Wi‑Fi"
              active={online}
              subtitle={online ? "On" : "Off"}
            />
            <ControlCenterStatusTile
              icon={<Bluetooth className="w-5 h-5" />}
              label="Bluetooth"
              active={bluetoothAvailable}
              subtitle={bluetoothAvailable ? "On" : "Off"}
            />
            <ControlCenterStatusTile
              icon={
                batteryLevel !== null && batteryLevel <= 20 ? (
                  <BatteryLow className="w-5 h-5" />
                ) : (
                  <Battery className="w-5 h-5" />
                )
              }
              label="Battery"
              active={batteryLevel !== null}
              subtitle={
                batteryLevel === null
                  ? "N/A"
                  : batteryCharging
                    ? `${batteryLevel}% · Charging`
                    : `${batteryLevel}%`
              }
            />
            <button
              type="button"
              onClick={toggleFullscreen}
              className={`flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-xl transition-colors ${
                fullscreen
                  ? "bg-primary/15 text-primary"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted"
              }`}
            >
              {fullscreen ? (
                <Minimize2 className="w-5 h-5" />
              ) : (
                <Maximize2 className="w-5 h-5" />
              )}
              <span className="text-[11px] font-medium truncate w-full text-center">
                {fullscreen ? "Exit full" : "Full screen"}
              </span>
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Appearance
              </span>
            </div>
            <div className="flex rounded-xl bg-muted/60 p-1 gap-1">
              <button
                type="button"
                disabled={!mounted}
                onClick={() => setTheme("light")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  appearance === "light"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Sun className="w-4 h-4 shrink-0" />
                Light
              </button>
              <button
                type="button"
                disabled={!mounted}
                onClick={() => setTheme("dark")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  appearance === "dark"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Moon className="w-4 h-4 shrink-0" />
                Dark
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Sound
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Volume2 className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                type="range"
                min={0}
                max={100}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="flex-1 h-2 rounded-full appearance-none bg-muted accent-primary"
              />
              <span className="text-xs text-muted-foreground w-8">{volume}%</span>
            </div>
          </div>

          <div className="pt-2 border-t border-border space-y-3">
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Quick actions
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  updateNotificationSettings({ enabled: !settings.notifications.enabled })
                }
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-medium transition-colors ${
                  dndOn
                    ? "bg-primary/15 text-primary"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted"
                }`}
              >
                {dndOn ? <BellOff className="w-4 h-4 shrink-0" /> : <Bell className="w-4 h-4 shrink-0" />}
                {dndOn ? "DND on" : "DND off"}
              </button>
              <button
                type="button"
                onClick={() =>
                  closeAnd(() => {
                    setShowMissionControl(true)
                  })
                }
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-medium bg-muted/60 text-muted-foreground hover:bg-muted transition-colors"
              >
                <LayoutGrid className="w-4 h-4 shrink-0" />
                Mission Control
              </button>
              <button
                type="button"
                onClick={() =>
                  closeAnd(() => {
                    setShowSpotlight(true)
                  })
                }
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-medium bg-muted/60 text-muted-foreground hover:bg-muted transition-colors"
              >
                <Search className="w-4 h-4 shrink-0" />
                Spotlight
              </button>
              <button
                type="button"
                onClick={() =>
                  closeAnd(() => {
                    lockScreen()
                  })
                }
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-medium bg-muted/60 text-muted-foreground hover:bg-muted transition-colors"
              >
                <Lock className="w-4 h-4 shrink-0" />
                Lock screen
              </button>
              <button
                type="button"
                disabled={!activeWindowId}
                onClick={() => {
                  if (!activeWindowId) return
                  const id = activeWindowId
                  closeAnd(() => maximizeWindow(id))
                }}
                className="col-span-2 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-medium bg-muted/60 text-muted-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:pointer-events-none"
              >
                <Maximize2 className="w-4 h-4 shrink-0" />
                {activeWindowId ? "Toggle zoom (active window)" : "No window focused"}
              </button>
              <button
                type="button"
                onClick={() =>
                  closeAnd(() => {
                    openApp("settings")
                  })
                }
                className="col-span-2 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-medium bg-muted/60 text-muted-foreground hover:bg-muted transition-colors"
              >
                System Preferences
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ControlCenterStatusTile({
  icon,
  label,
  active,
  subtitle,
}: {
  icon: React.ReactNode
  label: string
  active: boolean
  subtitle: string
}) {
  return (
    <div
      role="status"
      aria-label={`${label}: ${subtitle}`}
      className={`flex flex-col items-center justify-center gap-0.5 py-3 px-2 rounded-xl ${
        active ? "bg-primary/15 text-primary" : "bg-muted/60 text-muted-foreground"
      }`}
    >
      {icon}
      <span className="text-[11px] font-medium truncate w-full text-center">{label}</span>
      <span className="text-[10px] opacity-80 truncate w-full text-center leading-tight px-0.5">
        {subtitle}
      </span>
    </div>
  )
}
