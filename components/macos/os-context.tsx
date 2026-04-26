"use client"

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react"
import { WALLPAPER_STORAGE_KEY } from "@/lib/wallpaper"
import { THEME_STORAGE_KEY, hexToHsl, DEFAULT_ACCENT } from "@/lib/theme"
import {
  loadSettings,
  saveSettings,
  getDefaultSettings,
  type QOSSettings,
  type DockSettings,
  type WindowSettings,
  type ShortcutsSettings,
  type LockScreenSettings,
  type SoundSettings,
  type NotificationSettings,
  type ShortcutBinding,
} from "@/lib/settings"
import { playAlertSound, playFeedbackSound } from "@/lib/sound"

export interface AppWindow {
  id: string
  appId: string
  title: string
  x: number
  y: number
  width: number
  height: number
  minWidth: number
  minHeight: number
  isMinimized: boolean
  isMaximized: boolean
  zIndex: number
  prevBounds?: { x: number; y: number; width: number; height: number }
}

/** "system" = full window chrome (title bar, buttons). "native" = maximized windows show header in menubar. */
export type WindowType = "system" | "native"

export interface AppDefinition {
  id: string
  name: string
  icon: React.ReactNode
  defaultWidth: number
  defaultHeight: number
  minWidth: number
  minHeight: number
  component: React.ComponentType<{ windowId: string }>
  category?: string
  description?: string
  developer?: string
  rating?: number
  size?: string
  isSystemApp?: boolean
  /** Window chrome behavior. "system" (default) = title bar in window. "native" = maximized shows header in menubar. */
  windowType?: WindowType
}

interface OSContextType {
  windows: AppWindow[]
  activeWindowId: string | null
  apps: AppDefinition[]
  installedAppIds: string[]
  registerApp: (app: AppDefinition) => void
  installApp: (appId: string) => void
  uninstallApp: (appId: string) => void
  isInstalled: (appId: string) => boolean
  openApp: (appId: string) => void
  closeWindow: (windowId: string) => void
  minimizeWindow: (windowId: string) => void
  restoreWindow: (windowId: string) => void
  maximizeWindow: (windowId: string) => void
  focusWindow: (windowId: string) => void
  updateWindowPosition: (windowId: string, x: number, y: number) => void
  updateWindowSize: (windowId: string, width: number, height: number) => void
  menuBarApp: string | null
  menuBarWindow: AppWindow | null
  currentTime: Date
  /** Custom wallpaper path, or null to use theme default (dark.jpg / light.jpeg) */
  wallpaperUrl: string | null
  setWallpaper: (url: string | null) => void
  /** User-chosen accent color (hex). Drives primary/ring/highlights. */
  accentColor: string
  setAccentColor: (color: string) => void
  // Settings (dock, window, shortcuts, lock screen)
  settings: QOSSettings
  updateDockSettings: (partial: Partial<DockSettings>) => void
  updateWindowSettings: (partial: Partial<WindowSettings>) => void
  updateShortcutsSettings: (partial: Partial<ShortcutsSettings>) => void
  updateLockScreenSettings: (partial: Partial<LockScreenSettings>) => void
  updateSoundSettings: (partial: Partial<SoundSettings>) => void
  updateNotificationSettings: (partial: Partial<NotificationSettings>) => void
  // Lock screen
  isLocked: boolean
  lockScreen: () => void
  unlockScreen: () => void
  // Environment notification (alert in Q-OS)
  environmentNotification: { message: string; id: number } | null
  triggerEnvironmentNotification: (message: string) => void
  clearEnvironmentNotification: () => void
  // App switcher (Cmd+Tab), Mission Control, Task View
  showAppSwitcher: boolean
  setShowAppSwitcher: (show: boolean) => void
  showMissionControl: boolean
  setShowMissionControl: (show: boolean) => void
  showTaskView: boolean
  setShowTaskView: (show: boolean) => void
  // Spotlight, Control Center, Notification Center
  showSpotlight: boolean
  setShowSpotlight: (show: boolean) => void
  showControlCenter: boolean
  setShowControlCenter: (show: boolean) => void
  showNotificationCenter: boolean
  setShowNotificationCenter: (show: boolean) => void
}

const OSContext = createContext<OSContextType | null>(null)

export function useOS() {
  const ctx = useContext(OSContext)
  if (!ctx) throw new Error("useOS must be used within OSProvider")
  return ctx
}

function getStoredWallpaper(): string | null {
  if (typeof window === "undefined") return null
  try {
    const v = localStorage.getItem(WALLPAPER_STORAGE_KEY)
    return v === "" ? null : v
  } catch {
    return null
  }
}

function getStoredAccent(): string {
  if (typeof window === "undefined") return DEFAULT_ACCENT
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY)
    if (v && /^#[0-9a-fA-F]{6}$/.test(v)) return v
    return DEFAULT_ACCENT
  } catch {
    return DEFAULT_ACCENT
  }
}

export function OSProvider({ children }: { children: React.ReactNode }) {
  const [windows, setWindows] = useState<AppWindow[]>([])
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null)
  const [apps, setApps] = useState<AppDefinition[]>([])
  const [installedAppIds, setInstalledAppIds] = useState<string[]>([
    "finder",
    "settings",
    "appstore",
    "calculator",
    "terminal",
    "notes",
    "clock",
    "calendar",
    "mediaplayer",
    "solanam",
  ])
  const [currentTime, setCurrentTime] = useState(new Date())
  const [wallpaperUrl, setWallpaperUrlState] = useState<string | null>(null)
  const [wallpaperHydrated, setWallpaperHydrated] = useState(false)
  const [accentColor, setAccentColorState] = useState<string>(DEFAULT_ACCENT)
  const [accentHydrated, setAccentHydrated] = useState(false)
  const [settings, setSettingsState] = useState<QOSSettings>(getDefaultSettings())
  const [settingsHydrated, setSettingsHydrated] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [showAppSwitcher, setShowAppSwitcher] = useState(false)
  const [showMissionControl, setShowMissionControl] = useState(false)
  const [showTaskView, setShowTaskView] = useState(false)
  const [showSpotlight, setShowSpotlight] = useState(false)
  const [showControlCenter, setShowControlCenter] = useState(false)
  const [showNotificationCenter, setShowNotificationCenter] = useState(false)
  const [environmentNotification, setEnvironmentNotification] = useState<{ message: string; id: number } | null>(null)
  const zIndexCounter = useRef(100)
  const notificationIdRef = useRef(0)
  const notificationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastActivityRef = useRef(Date.now())
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setWallpaperUrlState(getStoredWallpaper())
    setWallpaperHydrated(true)
  }, [])

  useEffect(() => {
    setAccentColorState(getStoredAccent())
    setAccentHydrated(true)
  }, [])

  useEffect(() => {
    setSettingsState(loadSettings())
    setSettingsHydrated(true)
  }, [])

  const setWallpaper = useCallback((url: string | null) => {
    setWallpaperUrlState(url)
    try {
      if (typeof window !== "undefined")
        localStorage.setItem(WALLPAPER_STORAGE_KEY, url ?? "")
    } catch {}
  }, [])

  const setAccentColor = useCallback((color: string) => {
    setAccentColorState(color)
    try {
      if (typeof window !== "undefined")
        localStorage.setItem(THEME_STORAGE_KEY, color)
    } catch {}
  }, [])

  const persistSettings = useCallback((next: QOSSettings) => {
    setSettingsState(next)
    saveSettings(next)
  }, [])

  const updateDockSettings = useCallback(
    (partial: Partial<DockSettings>) => {
      setSettingsState((prev) => {
        const next = { ...prev, dock: { ...prev.dock, ...partial } }
        saveSettings(next)
        return next
      })
    },
    []
  )

  const updateWindowSettings = useCallback(
    (partial: Partial<WindowSettings>) => {
      setSettingsState((prev) => {
        const next = { ...prev, window: { ...prev.window, ...partial } }
        saveSettings(next)
        return next
      })
    },
    []
  )

  const updateShortcutsSettings = useCallback(
    (partial: Partial<ShortcutsSettings>) => {
      setSettingsState((prev) => {
        const next = { ...prev, shortcuts: { ...prev.shortcuts, ...partial } }
        saveSettings(next)
        return next
      })
    },
    []
  )

  const updateLockScreenSettings = useCallback(
    (partial: Partial<LockScreenSettings>) => {
      setSettingsState((prev) => {
        const next = { ...prev, lockScreen: { ...prev.lockScreen, ...partial } }
        saveSettings(next)
        return next
      })
    },
    []
  )

  const updateSoundSettings = useCallback(
    (partial: Partial<SoundSettings>) => {
      setSettingsState((prev) => {
        const next = { ...prev, sound: { ...prev.sound, ...partial } }
        saveSettings(next)
        return next
      })
    },
    []
  )

  const updateNotificationSettings = useCallback(
    (partial: Partial<NotificationSettings>) => {
      setSettingsState((prev) => {
        const next = { ...prev, notifications: { ...prev.notifications, ...partial } }
        saveSettings(next)
        return next
      })
    },
    []
  )

  const settingsRef = useRef(settings)
  settingsRef.current = settings

  const clearEnvironmentNotification = useCallback(() => {
    setEnvironmentNotification(null)
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current)
      notificationTimeoutRef.current = null
    }
  }, [])

  const triggerEnvironmentNotification = useCallback((message: string) => {
    const prev = settingsRef.current
    if (!prev.notifications.enabled || !prev.notifications.environmentAlert) return
    const id = ++notificationIdRef.current
    setEnvironmentNotification({ message, id })
    if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current)
    notificationTimeoutRef.current = setTimeout(() => {
      setEnvironmentNotification((n) => (n?.id === id ? null : n))
      notificationTimeoutRef.current = null
    }, 4000)
    if (prev.notifications.soundEnabled && prev.sound.alertSound !== "none") {
      playAlertSound(prev.sound.alertSound, prev.sound.alertVolume / 100)
    }
  }, [])

  const lockScreen = useCallback(() => {
    if (settingsRef.current.sound.playFeedbackSounds) {
      playFeedbackSound(settingsRef.current.sound.volume / 100)
    }
    setIsLocked(true)
  }, [])
  const unlockScreen = useCallback(() => setIsLocked(false), [])

  // Global keyboard shortcuts (only when not locked)
  useEffect(() => {
    if (!settingsHydrated || isLocked) return
    const s = settings
    const match = (e: KeyboardEvent, binding: ShortcutBinding) => {
      const keyMatch =
        e.key === binding.key ||
        (binding.key.length === 1 && e.key.toLowerCase() === binding.key.toLowerCase())
      return (
        keyMatch &&
        (binding.meta === undefined || binding.meta === e.metaKey) &&
        (binding.ctrl === undefined || binding.ctrl === e.ctrlKey) &&
        (binding.alt === undefined || binding.alt === e.altKey) &&
        (binding.shift === undefined || binding.shift === e.shiftKey)
      )
    }

    const onKeyDown = (e: KeyboardEvent) => {
      lastActivityRef.current = Date.now()
      if (match(e, s.shortcuts.appSwitcher)) {
        e.preventDefault()
        setShowAppSwitcher((v) => !v)
        return
      }
      if (match(e, s.shortcuts.missionControl)) {
        e.preventDefault()
        setShowMissionControl((v) => !v)
        return
      }
      if (match(e, s.shortcuts.lockScreen)) {
        e.preventDefault()
        setIsLocked(true)
        return
      }
      if (match(e, s.shortcuts.spotlight)) {
        e.preventDefault()
        setShowSpotlight((v) => !v)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [settingsHydrated, isLocked, settings.shortcuts])

  // Idle lock: after idleTimeoutMinutes with no activity, lock screen (0 = never)
  useEffect(() => {
    if (!settingsHydrated || isLocked || settings.lockScreen.idleTimeoutMinutes <= 0) return
    const timeoutMs = settings.lockScreen.idleTimeoutMinutes * 60 * 1000

    const resetTimer = () => {
      lastActivityRef.current = Date.now()
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      idleTimerRef.current = setTimeout(() => setIsLocked(true), timeoutMs)
    }

    const onActivity = () => resetTimer()
    resetTimer()
    window.addEventListener("mousemove", onActivity)
    window.addEventListener("keydown", onActivity)
    window.addEventListener("mousedown", onActivity)
    return () => {
      window.removeEventListener("mousemove", onActivity)
      window.removeEventListener("keydown", onActivity)
      window.removeEventListener("mousedown", onActivity)
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    }
  }, [settingsHydrated, isLocked, settings.lockScreen.idleTimeoutMinutes])

  // Apply accent to CSS variables so primary/ring and OS chrome use it
  useEffect(() => {
    if (typeof document === "undefined" || !accentHydrated) return
    const root = document.documentElement
    const hsl = hexToHsl(accentColor)
    root.style.setProperty("--primary", hsl)
    root.style.setProperty("--ring", hsl)
    root.style.setProperty("--accent-user", accentColor)
  }, [accentColor, accentHydrated])

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const registerApp = useCallback((app: AppDefinition) => {
    setApps((prev) => {
      if (prev.find((a) => a.id === app.id)) return prev
      return [...prev, app]
    })
    // Auto-install system apps
    if (app.isSystemApp) {
      setInstalledAppIds((prev) => {
        if (prev.includes(app.id)) return prev
        return [...prev, app.id]
      })
    }
  }, [])

  const installApp = useCallback((appId: string) => {
    setInstalledAppIds((prev) => {
      if (prev.includes(appId)) return prev
      return [...prev, appId]
    })
  }, [])

  const uninstallApp = useCallback(
    (appId: string) => {
      // Don't allow uninstalling system apps
      const app = apps.find((a) => a.id === appId)
      if (app?.isSystemApp) return
      setInstalledAppIds((prev) => prev.filter((id) => id !== appId))
      // Close any open windows for this app
      setWindows((prev) => prev.filter((w) => w.appId !== appId))
    },
    [apps]
  )

  const isInstalled = useCallback(
    (appId: string) => installedAppIds.includes(appId),
    [installedAppIds]
  )

  const openApp = useCallback(
    (appId: string) => {
      const existingWindow = windows.find((w) => w.appId === appId && !w.isMinimized)
      if (existingWindow) {
        zIndexCounter.current += 1
        setWindows((prev) =>
          prev.map((w) =>
            w.id === existingWindow.id ? { ...w, zIndex: zIndexCounter.current } : w
          )
        )
        setActiveWindowId(existingWindow.id)
        return
      }

      const minimized = windows.find((w) => w.appId === appId && w.isMinimized)
      if (minimized) {
        zIndexCounter.current += 1
        setWindows((prev) =>
          prev.map((w) =>
            w.id === minimized.id
              ? { ...w, isMinimized: false, zIndex: zIndexCounter.current }
              : w
          )
        )
        setActiveWindowId(minimized.id)
        return
      }

      const app = apps.find((a) => a.id === appId)
      if (!app) return

      zIndexCounter.current += 1
      const offset = (windows.length % 8) * 30
      const newWindow: AppWindow = {
        id: `${appId}-${Date.now()}`,
        appId,
        title: app.name,
        x: 120 + offset,
        y: 60 + offset,
        width: app.defaultWidth,
        height: app.defaultHeight,
        minWidth: app.minWidth,
        minHeight: app.minHeight,
        isMinimized: false,
        isMaximized: false,
        zIndex: zIndexCounter.current,
      }
      setWindows((prev) => [...prev, newWindow])
      setActiveWindowId(newWindow.id)
    },
    [windows, apps]
  )

  const closeWindow = useCallback(
    (windowId: string) => {
      setWindows((prev) => prev.filter((w) => w.id !== windowId))
      if (activeWindowId === windowId) {
        setActiveWindowId(null)
      }
    },
    [activeWindowId]
  )

  const minimizeWindow = useCallback(
    (windowId: string) => {
      setWindows((prev) =>
        prev.map((w) => (w.id === windowId ? { ...w, isMinimized: true } : w))
      )
      if (activeWindowId === windowId) {
        setActiveWindowId(null)
      }
    },
    [activeWindowId]
  )

  const restoreWindow = useCallback((windowId: string) => {
    zIndexCounter.current += 1
    setWindows((prev) =>
      prev.map((w) =>
        w.id === windowId
          ? { ...w, isMinimized: false, zIndex: zIndexCounter.current }
          : w
      )
    )
    setActiveWindowId(windowId)
  }, [])

  const maximizeWindow = useCallback((windowId: string) => {
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id !== windowId) return w
        if (w.isMaximized) {
          return {
            ...w,
            isMaximized: false,
            x: w.prevBounds?.x ?? 120,
            y: w.prevBounds?.y ?? 60,
            width: w.prevBounds?.width ?? w.width,
            height: w.prevBounds?.height ?? w.height,
            prevBounds: undefined,
          }
        }
        return {
          ...w,
          isMaximized: true,
          prevBounds: { x: w.x, y: w.y, width: w.width, height: w.height },
          x: 0,
          y: 28,
          width: typeof window !== "undefined" ? window.innerWidth : 1280,
          height:
            typeof window !== "undefined" ? window.innerHeight - 28 - 80 : 720,
        }
      })
    )
  }, [])

  const focusWindow = useCallback((windowId: string) => {
    zIndexCounter.current += 1
    setWindows((prev) =>
      prev.map((w) =>
        w.id === windowId ? { ...w, zIndex: zIndexCounter.current } : w
      )
    )
    setActiveWindowId(windowId)
  }, [])

  const updateWindowPosition = useCallback((windowId: string, x: number, y: number) => {
    setWindows((prev) =>
      prev.map((w) =>
        w.id === windowId ? { ...w, x, y, isMaximized: false } : w
      )
    )
  }, [])

  const updateWindowSize = useCallback(
    (windowId: string, width: number, height: number) => {
      setWindows((prev) =>
        prev.map((w) =>
          w.id === windowId ? { ...w, width, height, isMaximized: false } : w
        )
      )
    },
    []
  )

  const menuBarApp = activeWindowId
    ? (windows.find((w) => w.id === activeWindowId)?.appId ?? null)
    : null
  const menuBarWindow = activeWindowId
    ? (windows.find((w) => w.id === activeWindowId) ?? null)
    : null

  return (
    <OSContext.Provider
      value={{
        windows,
        activeWindowId,
        apps,
        installedAppIds,
        registerApp,
        installApp,
        uninstallApp,
        isInstalled,
        openApp,
        closeWindow,
        minimizeWindow,
        restoreWindow,
        maximizeWindow,
        focusWindow,
        updateWindowPosition,
        updateWindowSize,
        menuBarApp,
        menuBarWindow,
        currentTime,
        wallpaperUrl: wallpaperHydrated ? wallpaperUrl : null,
        setWallpaper,
        accentColor: accentHydrated ? accentColor : DEFAULT_ACCENT,
        setAccentColor,
        settings,
        updateDockSettings,
        updateWindowSettings,
        updateShortcutsSettings,
        updateLockScreenSettings,
        updateSoundSettings,
        updateNotificationSettings,
        isLocked,
        lockScreen,
        unlockScreen,
        environmentNotification,
        triggerEnvironmentNotification,
        clearEnvironmentNotification,
        showAppSwitcher,
        setShowAppSwitcher,
        showMissionControl,
        setShowMissionControl,
        showTaskView,
        setShowTaskView,
        showSpotlight,
        setShowSpotlight,
        showControlCenter,
        setShowControlCenter,
        showNotificationCenter,
        setShowNotificationCenter,
      }}
    >
      {children}
    </OSContext.Provider>
  )
}
