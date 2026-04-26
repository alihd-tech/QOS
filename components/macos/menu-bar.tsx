"use client"

import { useOS } from "./os-context"
import { Wifi, Battery, Search, Volume2, LayoutGrid, Sliders, Bell } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"

export function MenuBar() {
  const {
    menuBarApp,
    menuBarWindow,
    apps,
    settings,
    currentTime,
    lockScreen,
    openApp,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    showTaskView,
    setShowTaskView,
    showSpotlight,
    setShowSpotlight,
    showControlCenter,
    setShowControlCenter,
    showNotificationCenter,
    setShowNotificationCenter,
  } = useOS()
  const { publicKey, connected } = useWallet()
  const activeApp = apps.find((a) => a.id === menuBarApp)
  const appName = activeApp?.name ?? "Finder"
  const isNativeMaximized =
    menuBarWindow &&
    activeApp?.windowType === "native" &&
    menuBarWindow.isMaximized
  const trafficOnLeft = settings.window.trafficLightsPosition === "left"

  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [trafficHover, setTrafficHover] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // Only render time on client to prevent hydration mismatch
  const formattedTime = mounted
    ? currentTime.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : ""

  const formattedDate = mounted
    ? currentTime.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : ""

  const truncatedAddress =
    connected && publicKey
      ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
      : null

  const menus: Record<string, string[]> = {
    [appName]: [
      "About " + appName,
      "---",
      "Preferences...",
      "---",
      "Quit " + appName,
    ],
    File: ["New Window", "New Tab", "---", "Close Window"],
    Edit: ["Undo", "Redo", "---", "Cut", "Copy", "Paste", "Select All"],
    View: ["Show Toolbar", "Show Sidebar", "---", "Enter Full Screen"],
    Window: ["Minimize", "Zoom", "---", "Bring All to Front"],
    Help: [appName + " Help"],
  }

  return (
    <div
      ref={menuRef}
      className="os-chrome fixed top-0 left-0 right-0 h-7 z-[9999] flex items-center px-4 text-[13px] font-medium"
      style={{
        background: "hsl(var(--menubar-bg))",
        backdropFilter: "blur(40px) saturate(180%)",
        WebkitBackdropFilter: "blur(40px) saturate(180%)",
        borderBottom: "1px solid hsl(var(--window-border))",
        color: "hsl(var(--foreground))",
      }}
    >
      {/* Q Logo */}
      <button
        className="flex items-center justify-center w-8 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded"
        onClick={() => setOpenMenu(openMenu === "apple" ? null : "apple")}
      >
        <span
          className="text-[16px] font-bold leading-none"
          style={{ color: "hsl(var(--foreground))" }}
        >
          Q
        </span>
      </button>

      {openMenu === "apple" && (
        <div
          className="absolute top-7 left-2 glass rounded-lg shadow-xl py-1 min-w-[200px] border bg-popover border-border"
          style={{ color: "hsl(var(--foreground))" }}
        >
          <MenuItem label="About This QOS" />
          <MenuSeparator />
          <MenuItem label="System Preferences..." onClick={() => openApp("settings")} />
          <MenuItem label="QOS App Store..." onClick={() => openApp("appstore")} />
          <MenuSeparator />
          <MenuItem label="Force Quit..." />
          <MenuSeparator />
          <MenuItem label="Lock Screen" onClick={() => lockScreen()} />
          <MenuItem label="Sleep" />
          <MenuItem label="Restart..." />
          <MenuItem label="Shut Down..." />
        </div>
      )}

      {/* Native app maximized: traffic lights + window title in menubar (left or right per setting) */}
      {isNativeMaximized && menuBarWindow && trafficOnLeft && (
        <div className="flex items-center gap-2 ml-2">
          <MenubarTrafficLights
            win={menuBarWindow}
            trafficHover={trafficHover}
            setTrafficHover={setTrafficHover}
            trafficOnLeft={true}
            closeWindow={closeWindow}
            minimizeWindow={minimizeWindow}
            maximizeWindow={maximizeWindow}
          />
          <span className="text-[12px] font-medium truncate max-w-[200px]" title={menuBarWindow.title}>
            {menuBarWindow.title}
          </span>
        </div>
      )}

      {/* App menus */}
      <div className="flex items-center gap-0 ml-1">
        {Object.entries(menus).map(([label, items], i) => (
          <div key={label} className="relative">
            <button
              className={`px-2 h-7 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${
                i === 0 ? "font-semibold" : ""
              } ${openMenu === label ? "bg-black/8 dark:bg-white/8" : ""}`}
              onClick={() =>
                setOpenMenu(openMenu === label ? null : label)
              }
              onMouseEnter={() => openMenu && setOpenMenu(label)}
            >
              {label}
            </button>
            {openMenu === label && (
              <div
                className="absolute top-7 left-0 glass rounded-lg shadow-xl py-1 min-w-[200px] border bg-popover border-border"
                style={{ color: "hsl(var(--foreground))" }}
              >
                {items.map((item, idx) =>
                  item === "---" ? (
                    <MenuSeparator key={`sep-${idx}`} />
                  ) : (
                    <MenuItem
                      key={item}
                      label={item}
                      onClick={() => setOpenMenu(null)}
                    />
                  )
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-1">
        {/* Native app maximized header when traffic lights on right */}
        {isNativeMaximized && menuBarWindow && !trafficOnLeft && (
          <>
            <span className="text-[12px] font-medium truncate max-w-[200px] mr-2" title={menuBarWindow.title}>
              {menuBarWindow.title}
            </span>
            <MenubarTrafficLights
              win={menuBarWindow}
              trafficHover={trafficHover}
              setTrafficHover={setTrafficHover}
              trafficOnLeft={false}
              closeWindow={closeWindow}
              minimizeWindow={minimizeWindow}
              maximizeWindow={maximizeWindow}
            />
            <div className="w-px h-4 bg-black/10 dark:bg-white/10 mx-1" />
          </>
        )}
        {/* Task View */}
        <button
          type="button"
          onClick={() => setShowTaskView(!showTaskView)}
          className={`flex items-center justify-center w-8 h-7 rounded transition-colors ${
            showTaskView ? "bg-primary/20 text-primary" : "hover:bg-black/5 dark:hover:bg-white/5"
          }`}
          title="Task View"
          aria-label="Task View"
        >
          <LayoutGrid className="w-4 h-4" />
        </button>
        {/* Spotlight */}
        <button
          type="button"
          onClick={() => {
            setShowSpotlight(!showSpotlight)
            setShowControlCenter(false)
            setShowNotificationCenter(false)
          }}
          className={`flex items-center justify-center w-8 h-7 rounded transition-colors ${
            showSpotlight ? "bg-primary/20 text-primary" : "hover:bg-black/5 dark:hover:bg-white/5"
          }`}
          title="Spotlight Search (⌘Space)"
          aria-label="Spotlight Search"
        >
          <Search className="w-4 h-4" />
        </button>
        {/* Control Center */}
        <button
          type="button"
          onClick={() => {
            setShowControlCenter(!showControlCenter)
            setShowNotificationCenter(false)
          }}
          className={`flex items-center justify-center w-8 h-7 rounded transition-colors ${
            showControlCenter ? "bg-primary/20 text-primary" : "hover:bg-black/5 dark:hover:bg-white/5"
          }`}
          title="Control Center"
          aria-label="Control Center"
        >
          <Sliders className="w-4 h-4" />
        </button>
        {/* Notification Center */}
        <button
          type="button"
          onClick={() => {
            setShowNotificationCenter(!showNotificationCenter)
            setShowControlCenter(false)
          }}
          className={`flex items-center justify-center w-8 h-7 rounded transition-colors ${
            showNotificationCenter ? "bg-primary/20 text-primary" : "hover:bg-black/5 dark:hover:bg-white/5"
          }`}
          title="Notification Center"
          aria-label="Notification Center"
        >
          <Bell className="w-4 h-4" />
        </button>
        {/* Wallet address chip */}
        {truncatedAddress && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/5 mx-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-mono opacity-70">
              {truncatedAddress}
            </span>
          </div>
        )} 
        <button
          type="button"
          onClick={() => {
            setShowNotificationCenter(!showNotificationCenter)
            setShowControlCenter(false)
          }}
          className={`flex items-center gap-1.5 px-2 h-7 rounded transition-colors ${
            showNotificationCenter ? "bg-primary/20 text-primary" : "hover:bg-black/5 dark:hover:bg-white/5"
          }`}
          title="Date & Time — Notification Center"
        >
          <span className="text-[13px] opacity-90">
            {mounted ? `${formattedDate} ${formattedTime}` : "\u00A0"}
          </span>
        </button>
      </div>
    </div>
  )
}

function MenuItem({
  label,
  onClick,
}: {
  label: string
  onClick?: () => void
}) {
  return (
    <button
      className="w-full text-left px-3 py-1 text-[13px] hover:bg-primary hover:text-primary-foreground rounded-[4px] mx-1 transition-colors"
      style={{ width: "calc(100% - 8px)" }}
      onClick={onClick}
    >
      {label}
    </button>
  )
}

function MenuSeparator() {
  return <div className="h-px bg-border my-1 mx-2" />
}

function MenubarTrafficLights({
  win,
  trafficHover,
  setTrafficHover,
  trafficOnLeft,
  closeWindow,
  minimizeWindow,
  maximizeWindow,
}: {
  win: { id: string }
  trafficHover: boolean
  setTrafficHover: (v: boolean) => void
  trafficOnLeft: boolean
  closeWindow: (id: string) => void
  minimizeWindow: (id: string) => void
  maximizeWindow: (id: string) => void
}) {
  return (
    <div
      className={`flex items-center gap-1.5 ${!trafficOnLeft ? "flex-row-reverse" : ""}`}
      onMouseEnter={() => setTrafficHover(true)}
      onMouseLeave={() => setTrafficHover(false)}
    >
      <button
        className="w-2.5 h-2.5 rounded-full flex items-center justify-center transition-colors"
        style={{ background: "hsl(var(--traffic-close))" }}
        onClick={(e) => {
          e.stopPropagation()
          closeWindow(win.id)
        }}
        aria-label="Close window"
      >
        {trafficHover && (
          <svg width="6" height="6" viewBox="0 0 8 8" stroke="#4d0000" strokeWidth="1.2">
            <line x1="1.5" y1="1.5" x2="6.5" y2="6.5" />
            <line x1="6.5" y1="1.5" x2="1.5" y2="6.5" />
          </svg>
        )}
      </button>
      <button
        className="w-2.5 h-2.5 rounded-full flex items-center justify-center transition-colors"
        style={{ background: "hsl(var(--traffic-minimize))" }}
        onClick={(e) => {
          e.stopPropagation()
          minimizeWindow(win.id)
        }}
        aria-label="Minimize window"
      >
        {trafficHover && (
          <svg width="6" height="6" viewBox="0 0 8 8" stroke="#995700" strokeWidth="1.2">
            <line x1="1" y1="4" x2="7" y2="4" />
          </svg>
        )}
      </button>
      <button
        className="w-2.5 h-2.5 rounded-full flex items-center justify-center transition-colors"
        style={{ background: "hsl(var(--traffic-maximize))" }}
        onClick={(e) => {
          e.stopPropagation()
          maximizeWindow(win.id)
        }}
        aria-label="Maximize window"
      >
        {trafficHover && (
          <svg width="7" height="7" viewBox="0 0 10 10" fill="none" stroke="#006500" strokeWidth="1.2">
            <polyline points="2,6 2,2 6,2" />
            <polyline points="8,4 8,8 4,8" />
          </svg>
        )}
      </button>
    </div>
  )
}
