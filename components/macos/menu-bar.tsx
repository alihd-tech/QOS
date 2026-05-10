"use client"

import { useOS } from "./os-context"
import {
  Wifi,
  WifiOff,
  Battery,
  BatteryLow,
  Search,
  Volume2,
  LayoutGrid,
  Sliders,
  Bell,
  BellOff,
  Layers,
} from "lucide-react"
import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useTheme } from "next-themes"
import type { ShortcutBinding } from "@/lib/settings"

const QOS_VERSION = "2.3.1"

type MenuLeaf =
  | { type: "sep" }
  | {
      type: "item"
      label: string
      shortcut?: string
      disabled?: boolean
      action?: () => void
    }

function formatShortcut(b: ShortcutBinding): string {
  const parts: string[] = []
  if (b.meta) parts.push("⌘")
  if (b.ctrl) parts.push("⌃")
  if (b.alt) parts.push("⌥")
  if (b.shift) parts.push("⇧")
  const k = b.key
  const symbol =
    k === " "
      ? "Space"
      : k === "ArrowUp"
        ? "↑"
        : k === "ArrowDown"
          ? "↓"
          : k === "ArrowLeft"
            ? "←"
            : k === "ArrowRight"
              ? "→"
              : k === "Tab"
                ? "Tab"
                : k.length === 1
                  ? k.toUpperCase()
                  : k
  parts.push(symbol)
  return parts.join("")
}

export function MenuBar() {
  const {
    menuBarApp,
    menuBarWindow,
    apps,
    windows,
    settings,
    currentTime,
    lockScreen,
    openApp,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    focusWindow,
    restoreWindow,
    showTaskView,
    setShowTaskView,
    showSpotlight,
    setShowSpotlight,
    showControlCenter,
    setShowControlCenter,
    showNotificationCenter,
    setShowNotificationCenter,
    showMissionControl,
    setShowMissionControl,
    setShowAppSwitcher,
  } = useOS()
  const { resolvedTheme, setTheme } = useTheme()
  const { publicKey, connected } = useWallet()
  const activeApp = apps.find((a) => a.id === menuBarApp)
  const appName = activeApp?.name ?? "Finder"
  const frontAppId = menuBarApp ?? "finder"
  const isNativeMaximized =
    menuBarWindow &&
    activeApp?.windowType === "native" &&
    menuBarWindow.isMaximized
  const trafficOnLeft = settings.window.trafficLightsPosition === "left"
  const shortcuts = settings.shortcuts
  const volume = settings.sound?.volume ?? 70
  const dndOn = !settings.notifications.enabled

  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [trafficHover, setTrafficHover] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [forceQuitOpen, setForceQuitOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [online, setOnline] = useState(true)
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null)
  const [batteryCharging, setBatteryCharging] = useState<boolean | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setOnline(typeof navigator !== "undefined" ? navigator.onLine : true)
    const onOnline = () => setOnline(true)
    const onOffline = () => setOnline(false)
    window.addEventListener("online", onOnline)
    window.addEventListener("offline", onOffline)
    return () => {
      window.removeEventListener("online", onOnline)
      window.removeEventListener("offline", onOffline)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    let batteryCleanup: (() => void) | undefined
    const nav = navigator as Navigator & {
      getBattery?: () => Promise<{
        level: number
        charging: boolean
        addEventListener: (type: string, fn: () => void) => void
        removeEventListener: (type: string, fn: () => void) => void
      }>
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

  useEffect(() => {
    if (!aboutOpen && !forceQuitOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAboutOpen(false)
        setForceQuitOpen(false)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [aboutOpen, forceQuitOpen])

  const closeMenus = useCallback(() => setOpenMenu(null), [])

  const run = useCallback(
    (fn?: () => void) => {
      closeMenus()
      fn?.()
    },
    [closeMenus]
  )

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await document.documentElement.requestFullscreen()
    } catch {
      /* unsupported or denied */
    }
  }, [])

  const bringAllToFront = useCallback(() => {
    const sorted = [...windows].sort((a, b) => a.zIndex - b.zIndex)
    for (const w of sorted) {
      if (w.isMinimized) restoreWindow(w.id)
      else focusWindow(w.id)
    }
  }, [windows, restoreWindow, focusWindow])

  const quitFrontApp = useCallback(() => {
    windows
      .filter((w) => w.appId === frontAppId)
      .forEach((w) => closeWindow(w.id))
  }, [windows, frontAppId, closeWindow])

  const execEdit = useCallback((command: string) => {
    try {
      document.execCommand(command)
    } catch {
      /* no focused editable region */
    }
  }, [])

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

  const forceQuitGroups = useMemo(() => {
    const map = new Map<string, number>()
    for (const w of windows) {
      map.set(w.appId, (map.get(w.appId) ?? 0) + 1)
    }
    return Array.from(map.entries()).map(([appId, count]) => ({
      appId,
      name: apps.find((a) => a.id === appId)?.name ?? appId,
      count,
    }))
  }, [windows, apps])

  useEffect(() => {
    if (forceQuitOpen && forceQuitGroups.length === 0) setForceQuitOpen(false)
  }, [forceQuitOpen, forceQuitGroups.length])

  const menus: Record<string, MenuLeaf[]> = useMemo(() => {
    const appearance = mounted ? (resolvedTheme === "dark" ? "dark" : "light") : "light"
    return {
      [appName]: [
        { type: "item", label: `About ${appName}`, action: () => setAboutOpen(true) },
        { type: "sep" },
        {
          type: "item",
          label: "Preferences…",
          shortcut: "⌘,",
          action: () => openApp("settings"),
        },
        { type: "sep" },
        {
          type: "item",
          label: `Quit ${appName}`,
          shortcut: "⌘Q",
          disabled: windows.filter((w) => w.appId === frontAppId).length === 0,
          action: quitFrontApp,
        },
      ],
      File: [
        {
          type: "item",
          label: "New Window",
          shortcut: "⌘N",
          action: () => openApp(frontAppId),
        },
        {
          type: "item",
          label: "New Tab",
          disabled: frontAppId !== "safari",
          action: () => openApp("safari"),
        },
        { type: "sep" },
        {
          type: "item",
          label: "Close Window",
          shortcut: "⌘W",
          disabled: !menuBarWindow,
          action: () => menuBarWindow && closeWindow(menuBarWindow.id),
        },
      ],
      Edit: [
        { type: "item", label: "Undo", shortcut: "⌘Z", action: () => execEdit("undo") },
        {
          type: "item",
          label: "Redo",
          shortcut: "⌘⇧Z",
          action: () => execEdit("redo"),
        },
        { type: "sep" },
        { type: "item", label: "Cut", shortcut: "⌘X", action: () => execEdit("cut") },
        { type: "item", label: "Copy", shortcut: "⌘C", action: () => execEdit("copy") },
        { type: "item", label: "Paste", shortcut: "⌘V", action: () => execEdit("paste") },
        {
          type: "item",
          label: "Select All",
          shortcut: "⌘A",
          action: () => execEdit("selectAll"),
        },
      ],
      View: [
        {
          type: "item",
          label: appearance === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode",
          action: () => setTheme(appearance === "dark" ? "light" : "dark"),
        },
        { type: "item", label: "Enter Full Screen", action: toggleFullscreen },
        { type: "sep" },
        {
          type: "item",
          label: "Mission Control",
          shortcut: formatShortcut(shortcuts.missionControl),
          action: () => setShowMissionControl(true),
        },
        {
          type: "item",
          label: "App Switcher",
          shortcut: formatShortcut(shortcuts.appSwitcher),
          action: () => setShowAppSwitcher(true),
        },
      ],
      Window: [
        {
          type: "item",
          label: "Minimize",
          shortcut: "⌘M",
          disabled: !menuBarWindow,
          action: () => menuBarWindow && minimizeWindow(menuBarWindow.id),
        },
        {
          type: "item",
          label: "Zoom",
          disabled: !menuBarWindow,
          action: () => menuBarWindow && maximizeWindow(menuBarWindow.id),
        },
        { type: "sep" },
        {
          type: "item",
          label: "Bring All to Front",
          disabled: windows.length === 0,
          action: bringAllToFront,
        },
      ],
      Help: [
        {
          type: "item",
          label: `${appName} Help`,
          action: () => openApp("settings"),
        },
        { type: "sep" },
        {
          type: "item",
          label: "Keyboard Shortcuts…",
          action: () => setAboutOpen(true),
        },
      ],
    }
  }, [
    appName,
    frontAppId,
    windows,
    menuBarWindow,
    mounted,
    resolvedTheme,
    shortcuts,
    openApp,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    quitFrontApp,
    bringAllToFront,
    toggleFullscreen,
    setTheme,
    setShowMissionControl,
    setShowAppSwitcher,
    execEdit,
  ])

  const openMissionControl = () => {
    setShowMissionControl(!showMissionControl)
    setShowControlCenter(false)
    setShowNotificationCenter(false)
  }

  return (
    <div
      ref={menuRef}
      data-block-system-context
      className="os-chrome fixed top-0 left-0 right-0 h-7 z-[9999] flex items-center px-4 text-[13px] font-medium"
      style={{
        background: "hsl(var(--menubar-bg))",
        backdropFilter: "blur(40px) saturate(180%)",
        WebkitBackdropFilter: "blur(40px) saturate(180%)",
        borderBottom: "1px solid hsl(var(--window-border))",
        color: "hsl(var(--foreground))",
      }}
    >
      {aboutOpen && (
        <AboutModal onClose={() => setAboutOpen(false)} appLabel={appName} />
      )}
      {forceQuitOpen && (
        <ForceQuitModal
          groups={forceQuitGroups}
          onClose={() => setForceQuitOpen(false)}
          onForceQuit={(appId) => {
            windows.filter((w) => w.appId === appId).forEach((w) => closeWindow(w.id))
          }}
        />
      )}

      <button
        className="flex items-center justify-center w-8 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded"
        onClick={() => setOpenMenu(openMenu === "apple" ? null : "apple")}
        aria-label="Apple menu"
        aria-expanded={openMenu === "apple"}
        aria-haspopup="menu"
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
          className="absolute top-7 left-2 glass rounded-lg shadow-xl py-1 min-w-[240px] border bg-popover border-border"
          style={{ color: "hsl(var(--foreground))" }}
          role="menu"
        >
          <MenuRow
            label="About This Q-OS"
            onClick={() => run(() => setAboutOpen(true))}
          />
          <MenuSeparator />
          <MenuRow label="System Preferences…" onClick={() => run(() => openApp("settings"))} />
          <MenuRow label="Q-OS App Store…" onClick={() => run(() => openApp("appstore"))} />
          <MenuSeparator />
          <MenuRow
            label="Force Quit…"
            disabled={windows.length === 0}
            onClick={() => run(() => setForceQuitOpen(true))}
          />
          <MenuSeparator />
          <MenuRow label="Lock Screen" onClick={() => run(() => lockScreen())} />
          <MenuRow label="Sleep" onClick={() => run(() => lockScreen())} />
          <MenuRow
            label="Restart Q-OS…"
            onClick={() =>
              run(() => {
                if (typeof window !== "undefined" && window.confirm("Restart Q-OS? Unsaved work in apps may be lost.")) {
                  window.location.reload()
                }
              })
            }
          />
          <MenuRow
            label="Shut Down Q-OS…"
            onClick={() =>
              run(() => {
                if (
                  typeof window !== "undefined" &&
                  window.confirm(
                    "End this Q-OS session? You can open the page again to start fresh."
                  )
                ) {
                  window.close()
                  setTimeout(() => {
                    alert("Close this browser tab to finish shutting down.")
                  }, 100)
                }
              })
            }
          />
        </div>
      )}

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

      <div className="flex items-center gap-0 ml-1">
        {Object.entries(menus).map(([label, items], i) => (
          <div key={label} className="relative">
            <button
              className={`px-2 h-7 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${
                i === 0 ? "font-semibold" : ""
              } ${openMenu === label ? "bg-black/8 dark:bg-white/8" : ""}`}
              onClick={() => setOpenMenu(openMenu === label ? null : label)}
              onMouseEnter={() => openMenu && setOpenMenu(label)}
              aria-expanded={openMenu === label}
              aria-haspopup="menu"
            >
              {label}
            </button>
            {openMenu === label && (
              <div
                className="absolute top-7 left-0 glass rounded-lg shadow-xl py-1 min-w-[220px] border bg-popover border-border"
                style={{ color: "hsl(var(--foreground))" }}
                role="menu"
              >
                {items.map((entry, idx) =>
                  entry.type === "sep" ? (
                    <MenuSeparator key={`sep-${label}-${idx}`} />
                  ) : (
                    <MenuRow
                      key={`${entry.label}-${idx}`}
                      label={entry.label}
                      shortcut={entry.shortcut}
                      disabled={entry.disabled}
                      onClick={() => run(entry.action)}
                    />
                  )
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-0.5">
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

        <div
          className="hidden sm:flex items-center gap-0.5 px-1 rounded-md bg-black/[0.04] dark:bg-white/[0.06]"
          title={
            batteryLevel === null
              ? online
                ? "Network connected"
                : "Offline"
              : `${online ? "Online" : "Offline"} · Battery ${batteryLevel}%${batteryCharging ? " (charging)" : ""}`
          }
        >
          {online ? (
            <Wifi className="w-3.5 h-3.5 opacity-70" aria-hidden />
          ) : (
            <WifiOff className="w-3.5 h-3.5 opacity-70 text-amber-600" aria-hidden />
          )}
          {batteryLevel !== null &&
            (batteryLevel <= 20 ? (
              <BatteryLow className="w-3.5 h-3.5 opacity-70 ml-0.5" aria-hidden />
            ) : (
              <Battery className="w-3.5 h-3.5 opacity-70 ml-0.5" aria-hidden />
            ))}
          <span
            className="flex items-center justify-center w-7 h-7 rounded"
            title={`Output volume: ${volume}%`}
          >
            <Volume2 className="w-3.5 h-3.5 opacity-70" aria-hidden />
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowTaskView(!showTaskView)}
          className={`flex items-center justify-center w-8 h-7 rounded transition-colors ${
            showTaskView ? "bg-primary/20 text-primary" : "hover:bg-black/5 dark:hover:bg-white/5"
          }`}
          title="Task View"
          aria-label="Task View"
        >
          <Layers className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={openMissionControl}
          className={`flex items-center justify-center w-8 h-7 rounded transition-colors ${
            showMissionControl ? "bg-primary/20 text-primary" : "hover:bg-black/5 dark:hover:bg-white/5"
          }`}
          title={`Mission Control (${formatShortcut(shortcuts.missionControl)})`}
          aria-label="Mission Control"
        >
          <LayoutGrid className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => {
            setShowSpotlight(!showSpotlight)
            setShowControlCenter(false)
            setShowNotificationCenter(false)
            setShowMissionControl(false)
          }}
          className={`flex items-center justify-center w-8 h-7 rounded transition-colors ${
            showSpotlight ? "bg-primary/20 text-primary" : "hover:bg-black/5 dark:hover:bg-white/5"
          }`}
          title={`Spotlight Search (${formatShortcut(shortcuts.spotlight)})`}
          aria-label="Spotlight Search"
        >
          <Search className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => {
            setShowControlCenter(!showControlCenter)
            setShowNotificationCenter(false)
            setShowMissionControl(false)
          }}
          className={`flex items-center justify-center w-8 h-7 rounded transition-colors ${
            showControlCenter ? "bg-primary/20 text-primary" : "hover:bg-black/5 dark:hover:bg-white/5"
          }`}
          title="Control Center"
          aria-label="Control Center"
        >
          <Sliders className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => {
            setShowNotificationCenter(!showNotificationCenter)
            setShowControlCenter(false)
            setShowMissionControl(false)
          }}
          className={`flex items-center justify-center w-8 h-7 rounded transition-colors ${
            showNotificationCenter ? "bg-primary/20 text-primary" : "hover:bg-black/5 dark:hover:bg-white/5"
          }`}
          title="Notification Center"
          aria-label="Notification Center"
        >
          {dndOn ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
        </button>

        {truncatedAddress && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/5 mx-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-mono opacity-70">{truncatedAddress}</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            run(() => openApp("clock"))
            setShowControlCenter(false)
            setShowMissionControl(false)
          }}
          className="flex items-center gap-1.5 px-2 h-7 rounded transition-colors hover:bg-black/5 dark:hover:bg-white/5"
          title="Open Clock"
        >
          <span className="text-[13px] opacity-90 tabular-nums">
            {mounted ? `${formattedDate}  ${formattedTime}` : "\u00A0"}
          </span>
        </button>
      </div>
    </div>
  )
}

function MenuRow({
  label,
  shortcut,
  disabled,
  onClick,
}: {
  label: string
  shortcut?: string
  disabled?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      className="w-full text-left px-3 py-1 text-[13px] rounded-[4px] mx-1 transition-colors flex items-center justify-between gap-4 disabled:opacity-40 disabled:pointer-events-none hover:bg-primary hover:text-primary-foreground"
      style={{ width: "calc(100% - 8px)" }}
      onClick={onClick}
      role="menuitem"
    >
      <span className="truncate">{label}</span>
      {shortcut ? (
        <span className="text-[11px] opacity-60 tabular-nums shrink-0 font-normal">{shortcut}</span>
      ) : null}
    </button>
  )
}

function MenuSeparator() {
  return <div className="h-px bg-border my-1 mx-2" role="separator" />
}

function AboutModal({ onClose, appLabel }: { onClose: () => void; appLabel: string }) {
  const { settings } = useOS()
  const sc = settings.shortcuts
  return (
    <div
      className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-popover text-popover-foreground border border-border rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="about-qos-title"
      >
        <div className="text-center space-y-1">
          <div className="text-4xl font-bold tracking-tight">Q</div>
          <h2 id="about-qos-title" className="text-lg font-semibold">
            Q-OS
          </h2>
          <p className="text-sm text-muted-foreground">Version {QOS_VERSION}</p>
          <p className="text-xs text-muted-foreground pt-2">
            A browser-based desktop experience. Active app: <strong>{appLabel}</strong>
          </p>
        </div>
        <div className="border-t border-border pt-3 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Keyboard shortcuts
          </p>
          <ul className="text-xs space-y-1.5 text-foreground/90">
            <li className="flex justify-between gap-2">
              <span>App Switcher</span>
              <kbd className="font-mono opacity-70">{formatShortcut(sc.appSwitcher)}</kbd>
            </li>
            <li className="flex justify-between gap-2">
              <span>Mission Control</span>
              <kbd className="font-mono opacity-70">{formatShortcut(sc.missionControl)}</kbd>
            </li>
            <li className="flex justify-between gap-2">
              <span>Spotlight</span>
              <kbd className="font-mono opacity-70">{formatShortcut(sc.spotlight)}</kbd>
            </li>
            <li className="flex justify-between gap-2">
              <span>Lock Screen</span>
              <kbd className="font-mono opacity-70">{formatShortcut(sc.lockScreen)}</kbd>
            </li>
          </ul>
        </div>
        <button
          type="button"
          className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
          onClick={onClose}
        >
          OK
        </button>
      </div>
    </div>
  )
}

function ForceQuitModal({
  groups,
  onClose,
  onForceQuit,
}: {
  groups: { appId: string; name: string; count: number }[]
  onClose: () => void
  onForceQuit: (appId: string) => void
}) {
  return (
    <div
      className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-popover text-popover-foreground border border-border rounded-2xl shadow-2xl max-w-sm w-full p-4 space-y-3"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="force-quit-title"
      >
        <h2 id="force-quit-title" className="text-base font-semibold">
          Force Quit Applications
        </h2>
        <p className="text-xs text-muted-foreground">
          This immediately closes all windows for an app. Unsaved changes may be lost.
        </p>
        <ul className="max-h-48 overflow-y-auto space-y-1">
          {groups.length === 0 ? (
            <li className="text-sm text-muted-foreground py-2">No open apps.</li>
          ) : (
            groups.map((g) => (
              <li
                key={g.appId}
                className="flex items-center justify-between gap-2 py-1.5 px-2 rounded-lg bg-muted/50"
              >
                <span className="text-sm truncate">
                  {g.name}
                  <span className="text-muted-foreground text-xs ml-1">({g.count})</span>
                </span>
                <button
                  type="button"
                  className="text-xs font-medium px-2 py-1 rounded-md bg-destructive/15 text-destructive hover:bg-destructive/25 shrink-0"
                  onClick={() => onForceQuit(g.appId)}
                >
                  Force Quit
                </button>
              </li>
            ))
          )}
        </ul>
        <button
          type="button"
          className="w-full py-2 rounded-lg border border-border text-sm hover:bg-muted/50"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  )
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
