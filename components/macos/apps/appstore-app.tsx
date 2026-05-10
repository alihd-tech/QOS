"use client"

import { useState, useEffect, useRef } from "react"
import { useOS } from "../os-context"
import { Star, ChevronLeft, Trash2, Search, X } from "lucide-react"

const EXCLUDED_IDS = ["finder", "settings", "appstore"]

export function AppStoreApp() {
  const { apps, installedAppIds, installApp, uninstallApp, isInstalled, openApp } = useOS()

  const [selectedAppId, setSelectedAppId] = useState<string | null>(null)
  const [installingId, setInstallingId] = useState<string | null>(null)
  const [installProgress, setInstallProgress] = useState(0)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Filter out system apps from the store listing
  const storeApps = apps.filter((a) => !EXCLUDED_IDS.includes(a.id))

  const selectedApp = storeApps.find((a) => a.id === selectedAppId)

  // Extract unique categories
  const categories = Array.from(
    new Set(storeApps.map((a) => a.category).filter(Boolean))
  ) as string[]

  // Filter by category and search
  const filteredApps = storeApps.filter((app) => {
    const matchesCategory = !activeCategory || app.category === activeCategory
    const matchesSearch =
      !searchQuery ||
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Simulate installation progress
  useEffect(() => {
    if (!installingId) return
    setInstallProgress(0)
    const interval = setInterval(() => {
      setInstallProgress((prev) => Math.min(prev + Math.random() * 15 + 5, 100))
    }, 200)
    return () => clearInterval(interval)
  }, [installingId])

  // Finish installation when progress reaches 100%
  useEffect(() => {
    if (!installingId || installProgress < 100) return
    installApp(installingId)
    setInstallingId(null)
    setInstallProgress(0)
  }, [installingId, installProgress, installApp])

  const handleInstall = (appId: string) => {
    if (isInstalled(appId) || installingId) return
    setInstallingId(appId)
  }

  const handleUninstall = (appId: string) => {
    uninstallApp(appId)
  }

  const renderInstallButton = (appId: string, large = false) => {
    const installed = isInstalled(appId)
    const installing = installingId === appId

    if (installing) {
      const progress = Math.min(installProgress, 100)
      // Responsive sizes
      const sizeClasses = large
        ? "w-[100px] sm:w-[120px] h-[32px] sm:h-[34px]"
        : "w-[68px] sm:w-[72px] h-[28px] sm:h-[30px]"
      const textClasses = large ? "text-[12px] sm:text-[13px]" : "text-[10px] sm:text-[11px]"
      return (
        <div className={`relative ${sizeClasses}`}>
          <div className="absolute inset-0 rounded-full overflow-hidden bg-muted/30">
            <div
              className="h-full rounded-full transition-all duration-200"
              style={{
                width: `${progress}%`,
                background: "var(--primary-gradient, linear-gradient(90deg, #0071e3, #34aadc))",
              }}
            />
          </div>
          <span className={`absolute inset-0 flex items-center justify-center ${textClasses} font-medium text-foreground`}>
            {Math.round(progress)}%
          </span>
        </div>
      )
    }

    if (installed) {
      return (
        <button
          className={`${
            large
              ? "px-4 sm:px-5 py-1.5 text-[12px] sm:text-[13px]"
              : "px-3 py-1 text-[10px] sm:text-[11px]"
          } rounded-full font-medium transition-colors bg-muted text-muted-foreground hover:bg-muted/80 active:scale-[0.97] touch-manipulation`}
          onClick={(e) => {
            e.stopPropagation()
            openApp(appId)
          }}
        >
          Open
        </button>
      )
    }

    return (
      <button
        className={`${
          large
            ? "px-4 sm:px-5 py-1.5 text-[12px] sm:text-[13px]"
            : "px-3 py-1 text-[10px] sm:text-[11px]"
        } rounded-full font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.97] touch-manipulation`}
        onClick={(e) => {
          e.stopPropagation()
          handleInstall(appId)
        }}
      >
        Get
      </button>
    )
  }

  // Detail view for a selected app
  if (selectedApp) {
    return (
      <div className="h-full flex flex-col bg-background text-foreground">
        {/* Detail top bar */}
        <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 shrink-0 border-b border-border bg-background/95 backdrop-blur-sm">
          <button
            className="flex items-center gap-1 text-[13px] font-medium text-primary hover:opacity-70 transition-opacity active:scale-95 touch-manipulation"
            onClick={() => setSelectedAppId(null)}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <h2 className="flex-1 text-center text-[15px] font-semibold truncate sm:hidden">
            {selectedApp.name}
          </h2>
        </div>

        {/* Detail content */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 py-5 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-5 mb-8">
            {/* App icon large */}
            <div className="flex justify-center sm:block">
              <div className="w-[88px] h-[88px] sm:w-[100px] sm:h-[100px] rounded-[22px] overflow-hidden shrink-0 shadow-lg bg-muted">
                {selectedApp.icon}
              </div>
            </div>
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <h1 className="text-[22px] sm:text-[26px] font-bold leading-tight mb-1 text-foreground">
                {selectedApp.name}
              </h1>
              <p className="text-[12px] sm:text-[13px] mb-2 text-muted-foreground">
                {selectedApp.developer || "QOS Team"}
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5"
                    fill={i < (selectedApp.rating || 4) ? "#FF9500" : "none"}
                    stroke={i < (selectedApp.rating || 4) ? "#FF9500" : "var(--border)"}
                    strokeWidth={1.5}
                  />
                ))}
                <span className="text-[11px] sm:text-[12px] ml-1 text-muted-foreground">
                  {selectedApp.rating || 4}.0
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                {renderInstallButton(selectedApp.id, true)}
                {isInstalled(selectedApp.id) && !selectedApp.isSystemApp && (
                  <button
                    className="flex items-center gap-1.5 px-4 py-1.5 text-[12px] sm:text-[13px] rounded-full font-medium transition-colors bg-destructive/10 text-destructive hover:bg-destructive/20 active:scale-[0.97] touch-manipulation"
                    onClick={() => handleUninstall(selectedApp.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Uninstall</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Info cards - responsive grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-8">
            <InfoCard label="Category" value={selectedApp.category || "Utility"} />
            <InfoCard label="Size" value={selectedApp.size || "12 MB"} />
            <InfoCard label="Compatibility" value="QOS 1.0+" />
            <InfoCard label="Price" value="Free" />
          </div>

          {/* Description */}
          <div className="mb-8">
            <h3 className="text-[14px] sm:text-[15px] font-semibold mb-2 text-foreground">Description</h3>
            <p className="text-[13px] sm:text-[14px] leading-relaxed text-muted-foreground">
              {selectedApp.description ||
                `${selectedApp.name} is a powerful app designed for the QOS desktop environment. It integrates seamlessly with your workflow and provides a native-like experience right in your browser.`}
            </p>
          </div>

          {/* What's New */}
          <div className="mb-8">
            <h3 className="text-[14px] sm:text-[15px] font-semibold mb-2 text-foreground">What's New</h3>
            <p className="text-[11px] sm:text-[12px] mb-1 text-muted-foreground">Version 1.0.0</p>
            <p className="text-[13px] sm:text-[14px] leading-relaxed text-muted-foreground">
              Initial release for QOS. Includes full desktop integration, window management support, and dock compatibility.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Main store listing view
  return (
    <div className="h-full flex flex-col bg-background text-foreground">
      {/* Store top bar - responsive */}
      <div className="sticky top-0 z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 shrink-0 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex items-center justify-between sm:justify-start gap-3">
          <div className="flex items-center gap-2">
            <img src="/icons/store.webp" alt="" className="w-6 h-6 object-contain" />
            <h2 className="text-[15px] font-semibold text-foreground hidden sm:block">QOS App Store</h2>
          </div>
          {/* Mobile title when search not focused */}
          {!isSearchFocused && (
            <h2 className="text-[15px] font-semibold text-foreground sm:hidden">App Store</h2>
          )}
        </div>

        {/* Search input - expands on mobile when focused */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] bg-muted/50 transition-all duration-200 ${
            isSearchFocused ? "w-full sm:w-[220px]" : "w-full sm:w-[200px]"
          }`}
        >
          <Search className="w-3.5 h-3.5 opacity-40 shrink-0" />
          <input
            type="text"
            placeholder="Search apps..."
            className="bg-transparent outline-none text-[12px] w-full text-foreground placeholder:text-muted-foreground"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
          {isSearchFocused && searchQuery && (
            <button
              className="p-0.5 rounded-full hover:bg-muted/50 active:scale-90"
              onClick={() => setSearchQuery("")}
            >
              <X className="w-3.5 h-3.5 opacity-40" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Desktop sidebar - visible on large screens */}
        <div className="hidden lg:block w-[160px] shrink-0 py-3 overflow-y-auto border-r border-border">
          <button
            className={`flex items-center gap-2 w-[calc(100%-8px)] mx-1 px-4 py-1.5 text-[13px] transition-colors rounded-lg ${
              !activeCategory
                ? "bg-primary/10 text-primary font-semibold"
                : "text-foreground hover:bg-muted"
            }`}
            onClick={() => setActiveCategory(null)}
          >
            All Apps
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`flex items-center gap-2 w-[calc(100%-8px)] mx-1 px-4 py-1.5 text-[13px] transition-colors rounded-lg ${
                activeCategory === cat
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-foreground hover:bg-muted"
              }`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Main content area */}
        <div className="flex-1 overflow-y-auto">
          {/* Mobile category chips - horizontal scroll */}
          <div className="lg:hidden sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-2">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mb-1">
              <button
                className={`shrink-0 px-3 py-1.5 text-[12px] font-medium rounded-full whitespace-nowrap transition-all ${
                  !activeCategory
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
                onClick={() => setActiveCategory(null)}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`shrink-0 px-3 py-1.5 text-[12px] font-medium rounded-full whitespace-nowrap transition-all ${
                    activeCategory === cat
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-foreground hover:bg-muted/80"
                  }`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 sm:p-5">
            {/* Featured banner - responsive */}
            {!searchQuery && !activeCategory && (
              <div className="rounded-2xl p-4 sm:p-6 mb-6 relative overflow-hidden bg-gradient-to-br from-primary/20 via-primary/5 to-background border border-border">
                <div className="absolute -right-8 -top-8 w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-primary/20" />
                <div className="absolute -right-4 bottom-0 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary/10" />
                <div className="relative z-10">
                  <p className="text-[10px] sm:text-[11px] font-semibold mb-1 uppercase tracking-wider text-primary/80">
                    Featured
                  </p>
                  <h3 className="text-[18px] sm:text-[22px] font-bold mb-1 text-foreground">Discover QOS Apps</h3>
                  <p className="text-[11px] sm:text-[13px] max-w-[280px] sm:max-w-[340px] text-muted-foreground">
                    Expand your desktop with powerful apps. Browse productivity tools, creative apps, utilities, and more.
                  </p>
                </div>
              </div>
            )}

            {/* Stats bar - responsive */}
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex gap-3">
                <span className="text-[11px] sm:text-[12px] text-muted-foreground">
                  {filteredApps.length} app{filteredApps.length !== 1 ? "s" : ""}
                </span>
                <span className="text-[11px] sm:text-[12px] text-muted-foreground hidden xs:inline">
                  {storeApps.filter((a) => isInstalled(a.id)).length} installed
                </span>
              </div>
              {(searchQuery || activeCategory) && (
                <button
                  className="text-[11px] sm:text-[12px] text-primary font-medium active:scale-95"
                  onClick={() => {
                    setSearchQuery("")
                    setActiveCategory(null)
                  }}
                >
                  Clear filters
                </button>
              )}
            </div>

            {/* App list - responsive with larger tap targets on mobile */}
            <div className="space-y-2 sm:space-y-1">
              {filteredApps.map((app) => (
                <div
                  key={app.id}
                  className="w-full flex items-center gap-3 sm:gap-4 p-3 rounded-xl transition-colors hover:bg-muted/50 active:bg-muted/70 text-left cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedAppId(app.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      setSelectedAppId(app.id)
                    }
                  }}
                >
                  <div className="w-[44px] h-[44px] sm:w-[48px] sm:h-[48px] rounded-[12px] overflow-hidden shrink-0 shadow-sm bg-muted">
                    {app.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-[13px] sm:text-[14px] font-medium truncate text-foreground">
                        {app.name}
                      </h4>
                      {isInstalled(app.id) && (
                        <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full shrink-0 bg-green-500/20 text-green-600 dark:text-green-400">
                          Installed
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] sm:text-[12px] truncate text-muted-foreground">
                      {app.description || `${app.category || "Utility"} app for QOS`}
                    </p>
                    <div className="flex items-center gap-0.5 mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className="w-2 h-2 sm:w-2.5 sm:h-2.5"
                          fill={i < (app.rating || 4) ? "#FF9500" : "none"}
                          stroke={i < (app.rating || 4) ? "#FF9500" : "var(--border)"}
                          strokeWidth={1.5}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="shrink-0">{renderInstallButton(app.id)}</div>
                </div>
              ))}
            </div>

            {filteredApps.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 sm:py-16">
                <img src="/icons/download.ico" alt="" className="w-8 h-8 sm:w-10 sm:h-10 mb-3 opacity-20 object-contain" />
                <p className="text-[13px] sm:text-[14px] font-medium text-muted-foreground">No apps found</p>
                <p className="text-[11px] sm:text-[12px] text-muted-foreground/70">Try a different search or category</p>
                <button
                  className="mt-4 text-[12px] text-primary font-medium"
                  onClick={() => {
                    setSearchQuery("")
                    setActiveCategory(null)
                  }}
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl p-2 sm:p-3 text-center bg-muted/30">
      <p className="text-[10px] sm:text-[11px] mb-0.5 text-muted-foreground">{label}</p>
      <p className="text-[11px] sm:text-[13px] font-medium text-foreground break-words">{value}</p>
    </div>
  )
}