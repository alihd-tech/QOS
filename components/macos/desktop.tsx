"use client"

import { useEffect } from "react"
import { useTheme } from "next-themes"
import { useOS } from "./os-context"
import { useDevice } from "@/hooks/use-device"
import { resolveWallpaperUrl } from "@/lib/wallpaper"
import { MenuBar } from "./menu-bar"
import { Dock } from "./dock"
import { Window } from "./window"
import { MobileShell } from "./mobile-shell"
import { LockScreenOverlay } from "./lock-screen-overlay"
import { AppSwitcherOverlay } from "./app-switcher-overlay"
import { MissionControlOverlay } from "./mission-control-overlay"
import { TaskViewOverlay } from "./task-view-overlay"
import { SpotlightOverlay } from "./spotlight-overlay"
import { ControlCenterOverlay } from "./control-center-overlay"
import { NotificationCenterOverlay } from "./notification-center-overlay"
import {
  FinderIcon,
  SafariIcon,
  CalculatorIcon,
  NotesIcon,
  KubernetesIcon,
  TerminalIcon,
  SettingsIcon,
  AppStoreIcon,
  WeatherIcon,
  PhotosIcon,
  MusicIcon,
  CalendarIcon,
  MapsIcon,
  ClockIcon,
  CodeIcon,
  MediaPlayerIcon,
  NewsIcon,
  QRCodeIcon,
  SolearnIcon,
  SolanaMIcon,
} from "./app-icons"
import { FinderApp } from "./apps/finder-app"
import { CalculatorApp } from "./apps/calculator-app"
import { NotesApp } from "./apps/notes-app"
import { TerminalApp } from "./apps/terminal-app"
import { SafariApp } from "./apps/safari-app"
import { SettingsApp } from "./apps/settings-app"
import { AppStoreApp } from "./apps/appstore-app"
import { WeatherApp } from "./apps/weather-app"
import { PhotosApp } from "./apps/photos-app"
import { MusicApp } from "./apps/music-app"
import { CalendarApp } from "./apps/calendar-app"
import { MapsApp } from "./apps/maps-app"
import { ClockApp } from "./apps/clock-app"
import { CodeEditorApp } from "./apps/code-app"
import { MediaPlayerApp } from "./apps/media-player-app"
import { NewsApp } from "./apps/news-app"
import { QRCodeApp } from "./apps/qr-code-app"
import { SolearnApp } from "./apps/solearn-app"
import { SolanaMApp } from "./apps/solanam-app"
import { K8sApp } from "./apps/k8s-app"
import { DockerApp } from "./apps/docker-app"
import { DsaApp } from "./apps/dsa-app"
import { RustEducationApp } from "./apps/rust-education-app"
import { SshClientApp } from "./apps/ssh-client-app"
import { DatabaseClientApp } from "./apps/database-client-app"

export function Desktop() {
  const { registerApp, windows, activeWindowId, apps, wallpaperUrl, environmentNotification, clearEnvironmentNotification } = useOS()
  const { isMobile, mounted } = useDevice()
  const { resolvedTheme } = useTheme()
  const theme = (resolvedTheme ?? "light") as "light" | "dark"
  const wallpaper = resolveWallpaperUrl(wallpaperUrl, theme)

  useEffect(() => {
    registerApp({
      id: "finder",
      name: "Finder",
      icon: <FinderIcon />,
      defaultWidth: 800,
      defaultHeight: 500,
      minWidth: 500,
      minHeight: 300,
      component: () => <FinderApp />,
      isSystemApp: true,
      category: "System",
      description: "Browse and manage your files and folders.",
    })
    registerApp({
      id: "settings",
      name: "System Preferences",
      icon: <SettingsIcon />,
      defaultWidth: 780,
      defaultHeight: 520,
      minWidth: 600,
      minHeight: 400,
      component: () => <SettingsApp />,
      isSystemApp: true,
      category: "System",
      description: "Customize your QOS experience with system-wide preferences.",
    })
    registerApp({
      id: "appstore",
      name: "QOS App Store",
      icon: <AppStoreIcon />,
      defaultWidth: 820,
      defaultHeight: 560,
      minWidth: 600,
      minHeight: 400,
      component: () => <AppStoreApp />,
      isSystemApp: true,
      category: "System",
      description: "Discover and install apps for your QOS desktop.",
    })
    registerApp({
      id: "safari",
      name: "Safari",
      icon: <SafariIcon />,
      defaultWidth: 900,
      defaultHeight: 600,
      minWidth: 500,
      minHeight: 350,
      component: () => <SafariApp />,
      category: "Productivity",
      description:
        "A fast, secure web browser with tab management, bookmarks, and a built-in start page.",
      developer: "QOS Team",
      rating: 5,
      size: "28 MB",
    })
    registerApp({
      id: "calculator",
      name: "Calculator",
      icon: <CalculatorIcon />,
      defaultWidth: 260,
      defaultHeight: 380,
      minWidth: 220,
      minHeight: 340,
      component: () => <CalculatorApp />,
      category: "Utilities",
      description:
        "A beautifully designed calculator with basic arithmetic operations.",
      developer: "QOS Team",
      rating: 4,
      size: "2 MB",
    })
    registerApp({
      id: "notes",
      name: "Notes",
      icon: <NotesIcon />,
      defaultWidth: 700,
      defaultHeight: 480,
      minWidth: 400,
      minHeight: 300,
      component: () => <NotesApp />,
      category: "Productivity",
      description:
        "Create, organize, and search your notes effortlessly.",
      developer: "QOS Team",
      rating: 4,
      size: "8 MB",
    })
    registerApp({
      id: "terminal",
      name: "Terminal",
      icon: <TerminalIcon />,
      defaultWidth: 640,
      defaultHeight: 420,
      minWidth: 400,
      minHeight: 250,
      component: () => <TerminalApp />,
      category: "Developer Tools",
      description:
        "A command-line interface with support for common commands.",
      developer: "QOS Team",
      rating: 5,
      size: "5 MB",
    })
    registerApp({
      id: "weather",
      name: "Weather",
      icon: <WeatherIcon />,
      defaultWidth: 680,
      defaultHeight: 500,
      minWidth: 500,
      minHeight: 380,
      component: () => <WeatherApp />,
      category: "Utilities",
      description:
        "Check weather conditions across multiple cities worldwide.",
      developer: "QOS Team",
      rating: 4,
      size: "6 MB",
    })
    registerApp({
      id: "photos",
      name: "Photos",
      icon: <PhotosIcon />,
      defaultWidth: 740,
      defaultHeight: 520,
      minWidth: 500,
      minHeight: 350,
      component: () => <PhotosApp />,
      category: "Creative",
      description:
        "Organize and view your photo library with albums and favorites.",
      developer: "QOS Team",
      rating: 4,
      size: "15 MB",
    })
    registerApp({
      id: "music",
      name: "Music",
      icon: <MusicIcon />,
      defaultWidth: 820,
      defaultHeight: 540,
      minWidth: 600,
      minHeight: 400,
      component: () => <MusicApp />,
      category: "Entertainment",
      description:
        "A full-featured music player with playlists and playback controls.",
      developer: "QOS Team",
      rating: 5,
      size: "18 MB",
    })
    registerApp({
      id: "calendar",
      name: "Calendar",
      icon: <CalendarIcon />,
      defaultWidth: 680,
      defaultHeight: 500,
      minWidth: 500,
      minHeight: 380,
      component: () => <CalendarApp />,
      category: "Productivity",
      description:
        "Stay organized with a month-view calendar and event management.",
      developer: "QOS Team",
      rating: 4,
      size: "4 MB",
    })
    registerApp({
      id: "maps",
      name: "Maps",
      icon: <MapsIcon />,
      defaultWidth: 760,
      defaultHeight: 520,
      minWidth: 500,
      minHeight: 350,
      component: () => <MapsApp />,
      category: "Utilities",
      description:
        "Explore locations around the world with an interactive map.",
      developer: "QOS Team",
      rating: 3,
      size: "22 MB",
    })
    registerApp({
      id: "clock",
      name: "Clock",
      icon: <ClockIcon />,
      defaultWidth: 420,
      defaultHeight: 520,
      minWidth: 320,
      minHeight: 400,
      component: () => <ClockApp />,
      category: "Utilities",
      description:
        "World clock, stopwatch, and timer in one elegant app.",
      developer: "QOS Team",
      rating: 4,
      size: "3 MB",
    })
    registerApp({
      id: "code",
      name: "Code",
      icon: <CodeIcon />,
      defaultWidth: 900,
      defaultHeight: 600,
      minWidth: 600,
      minHeight: 400,
      component: () => <CodeEditorApp />,
      category: "Developer Tools",
      description:
        "A code editor with file browser, syntax highlighting, and terminal integration.",
      developer: "QOS Team",
      rating: 5,
      size: "45 MB",
    })
    registerApp({
      id: "mediaplayer",
      name: "Media Player",
      icon: <MediaPlayerIcon />,
      defaultWidth: 900,
      defaultHeight: 580,
      minWidth: 600,
      minHeight: 400,
      component: () => <MediaPlayerApp />,
      category: "Entertainment",
      description:
        "Play audio and video files with playlists, controls, and fullscreen support.",
      developer: "QOS Team",
      rating: 4,
      size: "25 MB",
    })
    registerApp({
      id: "kubernetes",
      name: "DevOps Guide",
      icon: <KubernetesIcon />,
      defaultWidth: 900,
      defaultHeight: 580,
      minWidth: 600,
      minHeight: 400,
      component: () => <K8sApp />,
      category: "Education",
      description:
        "Kuber",
      developer: "QOS Team",
      rating: 4,
      size: "25 MB",
    })
    registerApp({
      id: "news",
      name: "News",
      icon: <NewsIcon />,
      defaultWidth: 880,
      defaultHeight: 620,
      minWidth: 600,
      minHeight: 450,
      component: () => <NewsApp />,
      category: "Productivity",
      description:
        "Stay informed with curated news articles, categories, and bookmarking.",
      developer: "QOS Team",
      rating: 4,
      size: "12 MB",
    })
    registerApp({
      id: "qrcode",
      name: "QR Code",
      icon: <QRCodeIcon />,
      defaultWidth: 820,
      defaultHeight: 640,
      minWidth: 600,
      minHeight: 500,
      component: () => <QRCodeApp />,
      category: "Utilities",
      description:
        "Generate and scan QR codes for text, URLs, WiFi, contacts, and more.",
      developer: "QOS Team",
      rating: 5,
      size: "8 MB",
    })
    registerApp({
      id: "solearn",
      name: "Solearn",
      icon: <SolearnIcon />,
      defaultWidth: 900,
      defaultHeight: 620,
      minWidth: 600,
      minHeight: 450,
      component: () => <SolearnApp />,
      category: "Education",
      description:
        "Learn Solana development with courses, tutorials, and mobile wallet guides.",
      developer: "QOS Team",
      rating: 5,
      size: "15 MB",
    })
    registerApp({
      id: "solanam",
      name: "SolanaM",
      icon: <SolanaMIcon />,
      defaultWidth: 1000,
      defaultHeight: 700,
      minWidth: 700,
      minHeight: 500,
      component: () => <SolanaMApp />,
      category: "Creative",
      description:
        "Graphics and design platform for Solana ecosystem.",
      developer: "SolanaM",
      rating: 4,
      size: "10 MB",
      windowType: "native",
    })
  }, [registerApp])

  // Show nothing until mounted to avoid layout flash
  if (!mounted) {
    return (
      <div
        className="h-[100dvh] w-screen"
        style={{
          backgroundImage: `url(${wallpaper})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
    )
  }

  // Mobile: iOS-like home screen
  if (isMobile) {
    return <MobileShell />
  }

  // Desktop: macOS-like windowed environment
  return (
    <div
      className="h-screen w-screen relative overflow-hidden select-none"
      style={{
        backgroundImage: `url(${wallpaper})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <LockScreenOverlay />
      <AppSwitcherOverlay />
      <MissionControlOverlay />
      <TaskViewOverlay />
      <SpotlightOverlay />
      <ControlCenterOverlay />
      <NotificationCenterOverlay />
      <MenuBar />
      {environmentNotification && (
        <div
          role="alert"
          className="fixed top-10 right-6 z-[10000] max-w-sm rounded-xl border border-border bg-popover/95 backdrop-blur shadow-lg px-4 py-3 text-[13px] text-foreground animate-in fade-in slide-in-from-right-4 duration-200"
          style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.12)" }}
        >
          <p className="font-medium opacity-90">{environmentNotification.message}</p>
          <button
            type="button"
            onClick={clearEnvironmentNotification}
            className="mt-2 text-[11px] text-muted-foreground hover:text-foreground underline"
          >
            Dismiss
          </button>
        </div>
      )}
      {windows.map((win) => {
        const appDef = apps.find((a) => a.id === win.appId)
        if (!appDef) return null
        const AppComponent = appDef.component
        return (
          <Window key={win.id} window={win} isActive={win.id === activeWindowId} appDef={appDef}>
            <AppComponent windowId={win.id} />
          </Window>
        )
      })}
      <Dock />
    </div>
  )
}
