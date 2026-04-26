"use client"

import React, { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { useOS } from "./os-context"
import { useWallet } from "@solana/wallet-adapter-react"
import { resolveWallpaperUrl } from "@/lib/wallpaper"
import { Wifi, Battery, Signal } from "lucide-react"

export function MobileShell() {
  const { apps, installedAppIds, openApp, windows, closeWindow, wallpaperUrl } = useOS()
  const { publicKey, connected } = useWallet()
  const { resolvedTheme } = useTheme()
  const theme = (resolvedTheme ?? "light") as "light" | "dark"
  const wallpaper = resolveWallpaperUrl(wallpaperUrl, theme)
  const [currentTime, setCurrentTime] = useState("")
  const [mounted, setMounted] = useState(false)
  const [openAppId, setOpenAppId] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    function update() {
      setCurrentTime(
        new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      )
    }
    update()
    const timer = setInterval(update, 1000)
    return () => clearInterval(timer)
  }, [])

  const installedApps = apps.filter((a) => installedAppIds.includes(a.id))

  const handleOpenApp = (appId: string) => {
    setOpenAppId(appId)
    openApp(appId)
  }

  const handleCloseApp = () => {
    if (openAppId) {
      const win = windows.find((w) => w.appId === openAppId)
      if (win) closeWindow(win.id)
    }
    setOpenAppId(null)
  }

  const activeAppDef = apps.find((a) => a.id === openAppId)
  const activeWindow = windows.find((w) => w.appId === openAppId)

  const truncatedAddress =
    connected && publicKey
      ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
      : null

  return (
    <div
      className="h-[100dvh] w-screen flex flex-col relative overflow-hidden"
      style={{
        backgroundImage: `url(${wallpaper})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* iOS Status Bar */}
      <div className="os-chrome flex items-center justify-between px-6 pt-3 pb-1 z-50 relative">
        <span
          className="text-[15px] font-semibold"
          style={{ color: openAppId ? "#1d1d1f" : "#fff" }}
        >
          {mounted ? currentTime : "\u00A0"}
        </span>
        <div className="flex items-center gap-1.5">
          <Signal
            className="w-4 h-4"
            style={{ color: openAppId ? "#1d1d1f" : "#fff" }}
          />
          <Wifi
            className="w-4 h-4"
            style={{ color: openAppId ? "#1d1d1f" : "#fff" }}
          />
          <Battery
            className="w-5 h-5"
            style={{ color: openAppId ? "#1d1d1f" : "#fff" }}
          />
        </div>
      </div>

      {/* App View (Full Screen) */}
      {openAppId && activeAppDef && activeWindow ? (
        <div className="flex-1 flex flex-col bg-white relative z-40">
          {/* App Header */}
          <div
            className="flex items-center px-4 py-2 border-b border-black/6"
            style={{ background: "rgba(246,246,246,0.98)" }}
          >
            <button
              onClick={handleCloseApp}
              className="flex items-center gap-1 text-[#007AFF] text-[16px]"
            >
              <svg
                width="10"
                height="16"
                viewBox="0 0 10 16"
                fill="none"
                stroke="#007AFF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M8 2L2 8L8 14" />
              </svg>
              Back
            </button>
            <span className="absolute left-1/2 -translate-x-1/2 text-[16px] font-semibold text-[#1d1d1f]">
              {activeAppDef.name}
            </span>
          </div>
          {/* App Content */}
          <div className="flex-1 overflow-auto">
            {React.createElement(activeAppDef.component, {
              windowId: activeWindow.id,
            })}
          </div>
        </div>
      ) : (
        <>
          {/* Home Screen */}
          <div className="flex-1 overflow-auto relative z-10">
            {/* Wallet badge */}
            {truncatedAddress && (
              <div className="flex justify-center mt-3 mb-1">
                <div
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                  style={{
                    background: "rgba(255,255,255,0.2)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-white/90 text-[11px] font-mono">
                    {truncatedAddress}
                  </span>
                </div>
              </div>
            )}

            {/* App Grid */}
            <div className="grid grid-cols-4 gap-y-6 gap-x-4 px-6 py-6">
              {installedApps.map((app) => (
                <button
                  key={app.id}
                  className="flex flex-col items-center gap-1.5 active:scale-90 transition-transform"
                  onClick={() => handleOpenApp(app.id)}
                >
                  <div className="w-[60px] h-[60px] rounded-[14px] overflow-hidden shadow-lg">
                    {app.icon}
                  </div>
                  <span className="text-white text-[11px] font-medium leading-tight text-center max-w-[64px] truncate drop-shadow-md">
                    {app.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* iOS Dock */}
          <div className="os-chrome pb-4 pt-2 px-6 z-20 relative">
            <div
              className="flex items-center justify-around gap-2 px-4 py-3 rounded-[22px]"
              style={{
                background: "rgba(255,255,255,0.25)",
                backdropFilter: "blur(30px)",
                WebkitBackdropFilter: "blur(30px)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              {/* Show first 4 installed apps as dock favorites */}
              {installedApps.slice(0, 4).map((app) => (
                <button
                  key={app.id}
                  className="w-[50px] h-[50px] rounded-[12px] overflow-hidden active:scale-90 transition-transform shadow-md"
                  onClick={() => handleOpenApp(app.id)}
                >
                  {app.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Home indicator */}
          <div className="flex justify-center pb-2">
            <div className="w-[134px] h-[5px] rounded-full bg-white/30" />
          </div>
        </>
      )}
    </div>
  )
}
