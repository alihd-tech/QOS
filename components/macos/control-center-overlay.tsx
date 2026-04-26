"use client"

import React, { useEffect, useState } from "react"
import { useOS } from "./os-context"
import {
  Wifi,
  Bluetooth,
  Battery,
  Volume2,
  Sun,
  Moon,
  Smartphone,
  Airplay,
} from "lucide-react"

export function ControlCenterOverlay() {
  const { showControlCenter, setShowControlCenter, settings, updateSoundSettings } = useOS()
  const [wifiOn, setWifiOn] = useState(true)
  const [bluetoothOn, setBluetoothOn] = useState(true)
  const [darkMode, setDarkMode] = useState(false)

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

  if (!showControlCenter) return null

  const volume = settings.sound?.volume ?? 70
  const setVolume = (v: number) =>
    updateSoundSettings({ volume: Math.max(0, Math.min(100, v)) })

  return (
    <div
      className="fixed inset-0 z-[9997] flex justify-end pt-12 pb-4 pr-4"
      onClick={() => setShowControlCenter(false)}
    >
      <div
        className="w-[320px] rounded-2xl border border-border bg-popover/95 backdrop-blur-xl shadow-2xl overflow-hidden animate-in slide-in-from-right-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 space-y-4">
          {/* Top row: connectivity */}
          <div className="grid grid-cols-4 gap-2">
            <ControlCenterToggle
              icon={<Wifi className="w-5 h-5" />}
              label="Wi-Fi"
              on={wifiOn}
              toggle={() => setWifiOn((v) => !v)}
            />
            <ControlCenterToggle
              icon={<Bluetooth className="w-5 h-5" />}
              label="Bluetooth"
              on={bluetoothOn}
              toggle={() => setBluetoothOn((v) => !v)}
            />
            <ControlCenterToggle
              icon={<Battery className="w-5 h-5" />}
              label="Battery"
              on={true}
              toggle={() => {}}
            />
            <ControlCenterToggle
              icon={<Airplay className="w-5 h-5" />}
              label="AirDrop"
              on={false}
              toggle={() => {}}
            />
          </div>

          {/* Display & Sound */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Display
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Moon className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                type="range"
                min={0}
                max={100}
                value={darkMode ? 100 : 0}
                onChange={(e) => setDarkMode(Number(e.target.value) > 50)}
                className="flex-1 h-2 rounded-full appearance-none bg-muted accent-primary"
              />
              <Sun className="w-4 h-4 text-muted-foreground shrink-0" />
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

          {/* Focus / other row */}
          <div className="pt-2 border-t border-border">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Focus
              </span>
            </div>
            <div className="mt-2 flex gap-2">
              {["Do Not Disturb", "Work", "Sleep"].map((label) => (
                <button
                  key={label}
                  type="button"
                  className="flex-1 py-2 px-3 rounded-xl text-xs font-medium bg-muted/60 hover:bg-muted transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ControlCenterToggle({
  icon,
  label,
  on,
  toggle,
}: {
  icon: React.ReactNode
  label: string
  on: boolean
  toggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={toggle}
      className={`flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-xl transition-colors ${
        on ? "bg-primary/15 text-primary" : "bg-muted/60 text-muted-foreground hover:bg-muted"
      }`}
    >
      {icon}
      <span className="text-[11px] font-medium truncate w-full text-center">{label}</span>
    </button>
  )
}
