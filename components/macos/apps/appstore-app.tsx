"use client"

import { useState, useEffect, useRef } from "react"
import { useOS } from "../os-context"
import { Star, ChevronLeft, Trash2 } from "lucide-react"

const EXCLUDED_IDS = ["finder", "settings", "appstore"]

export function AppStoreApp() {
  const { apps, installedAppIds, installApp, uninstallApp, isInstalled, openApp } = useOS()

  const [selectedAppId, setSelectedAppId] = useState<string | null>(null)
  const [installingId, setInstallingId] = useState<string | null>(null)
  const [installProgress, setInstallProgress] = useState(0)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
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

  // Finish installation after progress reaches 100%.
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
      return (
        <div className={`relative ${large ? "w-[120px]" : "w-[72px]"}`}>
          <div
            className={`${large ? "h-[32px]" : "h-[26px]"} rounded-full overflow-hidden`}
            style={{ background: "rgba(0,0,0,0.06)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-200"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #0071e3, #34aadc)",
              }}
            />
          </div>
          <span className={`absolute inset-0 flex items-center justify-center ${large ? "text-[13px]" : "text-[11px]"} font-medium`}
            style={{ color: "#1d1d1f" }}
          >
            {Math.round(progress)}%
          </span>
        </div>
      )
    }

    if (installed) {
      return (
        <button
          className={`${large ? "px-5 py-1.5 text-[13px]" : "px-3 py-1 text-[11px]"} rounded-full font-medium transition-colors`}
          style={{
            background: "rgba(0,0,0,0.06)",
            color: "#86868b",
          }}
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
        className={`${large ? "px-5 py-1.5 text-[13px]" : "px-3 py-1 text-[11px]"} rounded-full font-medium transition-colors hover:opacity-80`}
        style={{
          background: "#0071e3",
          color: "#ffffff",
        }}
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
      <div className="h-full flex flex-col" style={{ background: "#fafafa" }}>
        {/* Detail top bar */}
        <div
          className="flex items-center gap-3 px-4 py-3 shrink-0"
          style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
        >
          <button
            className="flex items-center gap-1 text-[13px] font-medium hover:opacity-70 transition-opacity"
            style={{ color: "#0071e3" }}
            onClick={() => setSelectedAppId(null)}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        {/* Detail content */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-6">
          <div className="flex gap-5 mb-8">
            {/* App icon large */}
            <div className="w-[96px] h-[96px] rounded-[22px] overflow-hidden shrink-0 shadow-lg">
              {selectedApp.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-[24px] font-bold leading-tight mb-1" style={{ color: "#1d1d1f" }}>
                {selectedApp.name}
              </h1>
              <p className="text-[13px] mb-1" style={{ color: "#86868b" }}>
                {selectedApp.developer || "QOS Team"}
              </p>
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5"
                    fill={i < (selectedApp.rating || 4) ? "#FF9500" : "none"}
                    stroke={i < (selectedApp.rating || 4) ? "#FF9500" : "#ccc"}
                    strokeWidth={1.5}
                  />
                ))}
                <span className="text-[12px] ml-1" style={{ color: "#86868b" }}>
                  {selectedApp.rating || 4}.0
                </span>
              </div>
              <div className="flex items-center gap-3">
                {renderInstallButton(selectedApp.id, true)}
                {isInstalled(selectedApp.id) && !selectedApp.isSystemApp && (
                  <button
                    className="flex items-center gap-1.5 px-4 py-1.5 text-[13px] rounded-full font-medium transition-colors hover:opacity-80"
                    style={{ background: "rgba(255,59,48,0.1)", color: "#ff3b30" }}
                    onClick={() => handleUninstall(selectedApp.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Uninstall
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Info cards */}
          <div className="flex gap-3 mb-8">
            <InfoCard label="Category" value={selectedApp.category || "Utility"} />
            <InfoCard label="Size" value={selectedApp.size || "12 MB"} />
            <InfoCard label="Compatibility" value="QOS 1.0+" />
            <InfoCard label="Price" value="Free" />
          </div>

          {/* Description */}
          <div className="mb-8">
            <h3 className="text-[15px] font-semibold mb-2" style={{ color: "#1d1d1f" }}>
              Description
            </h3>
            <p className="text-[14px] leading-relaxed" style={{ color: "#555" }}>
              {selectedApp.description ||
                `${selectedApp.name} is a powerful app designed for the QOS desktop environment. It integrates seamlessly with your workflow and provides a native-like experience right in your browser.`}
            </p>
          </div>

          {/* What's New */}
          <div className="mb-8">
            <h3 className="text-[15px] font-semibold mb-2" style={{ color: "#1d1d1f" }}>
              {"What's New"}
            </h3>
            <p className="text-[12px] mb-1" style={{ color: "#86868b" }}>Version 1.0.0</p>
            <p className="text-[14px] leading-relaxed" style={{ color: "#555" }}>
              Initial release for QOS. Includes full desktop integration, window management support, and dock compatibility.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Main store listing view
  return (
    <div className="h-full flex flex-col" style={{ background: "#fafafa" }}>
      {/* Store top bar */}
      <div
        className="flex items-center justify-between px-5 py-3 shrink-0"
        style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
      >
        <div className="flex items-center gap-3">
          <img
            src="/icons/store.ico"
            alt=""
            className="w-6 h-6 object-contain"
          />
          <h2 className="text-[15px] font-semibold" style={{ color: "#1d1d1f" }}>
            QOS App Store
          </h2>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px]"
          style={{ background: "rgba(0,0,0,0.04)", width: 200 }}
        >
          <img src="/icons/search.ico" alt="" className="w-3.5 h-3.5 opacity-40 shrink-0 object-contain" />
          <input
            type="text"
            placeholder="Search apps..."
            className="bg-transparent outline-none text-[12px] w-full"
            style={{ color: "#1d1d1f" }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Category sidebar */}
        <div
          className="w-[160px] shrink-0 py-3 overflow-y-auto"
          style={{ borderRight: "1px solid rgba(0,0,0,0.06)" }}
        >
          <button
            className={`flex items-center gap-2 w-full px-4 py-1.5 text-[13px] transition-colors rounded-lg mx-1 ${
              !activeCategory ? "font-semibold" : ""
            }`}
            style={{
              width: "calc(100% - 8px)",
              color: !activeCategory ? "#0071e3" : "#1d1d1f",
              background: !activeCategory ? "rgba(0,113,227,0.08)" : "transparent",
            }}
            onClick={() => setActiveCategory(null)}
          >
            All Apps
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`flex items-center gap-2 w-full px-4 py-1.5 text-[13px] transition-colors rounded-lg mx-1 ${
                activeCategory === cat ? "font-semibold" : ""
              }`}
              style={{
                width: "calc(100% - 8px)",
                color: activeCategory === cat ? "#0071e3" : "#1d1d1f",
                background: activeCategory === cat ? "rgba(0,113,227,0.08)" : "transparent",
              }}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* App grid */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Featured banner */}
          {!searchQuery && !activeCategory && (
            <div
              className="rounded-2xl p-6 mb-6 relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
              }}
            >
              <div className="relative z-10">
                <p className="text-[11px] font-semibold mb-1 uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.6)" }}>
                  Featured
                </p>
                <h3 className="text-[22px] font-bold mb-1" style={{ color: "#ffffff" }}>
                  Discover QOS Apps
                </h3>
                <p className="text-[13px] max-w-[340px]" style={{ color: "rgba(255,255,255,0.7)" }}>
                  Expand your desktop with powerful apps. Browse productivity tools, creative apps, utilities, and more.
                </p>
              </div>
              {/* Decorative circles */}
              <div
                className="absolute -right-8 -top-8 w-40 h-40 rounded-full opacity-10"
                style={{ background: "#0071e3" }}
              />
              <div
                className="absolute -right-4 bottom-0 w-24 h-24 rounded-full opacity-10"
                style={{ background: "#34aadc" }}
              />
            </div>
          )}

          {/* Stats bar */}
          <div className="flex items-center gap-4 mb-4">
            <span className="text-[12px]" style={{ color: "#86868b" }}>
              {filteredApps.length} app{filteredApps.length !== 1 ? "s" : ""} available
            </span>
            <span className="text-[12px]" style={{ color: "#86868b" }}>
              {storeApps.filter((a) => isInstalled(a.id)).length} installed
            </span>
          </div>

          {/* App list */}
          <div className="space-y-1">
            {filteredApps.map((app) => (
              <div
                key={app.id}
                className="w-full flex items-center gap-4 p-3 rounded-xl transition-colors hover:bg-black/3 text-left cursor-pointer"
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
                <div className="w-[48px] h-[48px] rounded-[12px] overflow-hidden shrink-0 shadow-sm">
                  {app.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-[14px] font-medium truncate" style={{ color: "#1d1d1f" }}>
                      {app.name}
                    </h4>
                    {isInstalled(app.id) && (
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full shrink-0"
                        style={{ background: "rgba(52,199,89,0.12)", color: "#34c759" }}
                      >
                        Installed
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] truncate" style={{ color: "#86868b" }}>
                    {app.description || `${app.category || "Utility"} app for QOS`}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-2.5 h-2.5"
                        fill={i < (app.rating || 4) ? "#FF9500" : "none"}
                        stroke={i < (app.rating || 4) ? "#FF9500" : "#ddd"}
                        strokeWidth={1.5}
                      />
                    ))}
                  </div>
                </div>
                <div className="shrink-0">
                  {renderInstallButton(app.id)}
                </div>
              </div>
            ))}
          </div>

          {filteredApps.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <img src="/icons/download.ico" alt="" className="w-10 h-10 mb-3 opacity-20 object-contain" />
              <p className="text-[14px] font-medium" style={{ color: "#86868b" }}>
                No apps found
              </p>
              <p className="text-[12px]" style={{ color: "#aaa" }}>
                Try a different search or category
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex-1 rounded-xl p-3 text-center"
      style={{ background: "rgba(0,0,0,0.03)" }}
    >
      <p className="text-[11px] mb-0.5" style={{ color: "#86868b" }}>
        {label}
      </p>
      <p className="text-[13px] font-medium" style={{ color: "#1d1d1f" }}>
        {value}
      </p>
    </div>
  )
}
