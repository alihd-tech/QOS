"use client"

import React, { useState, useEffect } from "react"
import {
  Monitor,
  Volume2,
  Sun,
  Bell,
  HardDrive,
  Accessibility,
  Lock,
  LayoutDashboard,
  Square,
  Command,
  Shield,
  Database,
  Cloud,
  WifiOff,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useOS } from "../os-context"
import {
  WALLPAPER_DEFAULTS,
  WALLPAPER_CATEGORIES,
  type WallpaperTheme,
} from "@/lib/wallpaper"
import { ACCENT_COLORS } from "@/lib/theme"
import {
  SettingsSection,
  SettingRow,
  SettingToggle,
  SettingSlider,
  SettingSelect,
} from "@/components/settings/section"
import {
  type DockPosition,
  type DockSize,
  type TrafficLightsPosition,
  type ShortcutAction,
  type AlertSoundType,
  formatShortcut,
} from "@/lib/settings"
import { getDeviceInfo, type DeviceInfo } from "@/lib/device"
import { playAlertSound } from "@/lib/sound"

const categories = [
  { id: "general", label: "General", icon: Monitor },
  { id: "appearance", label: "Appearance", icon: Sun },
  { id: "dock", label: "Dock", icon: LayoutDashboard },
  { id: "window", label: "Window", icon: Square },
  { id: "shortcuts", label: "Shortcuts", icon: Command },
  { id: "lockScreen", label: "Lock Screen", icon: Shield },
  { id: "accessibility", label: "Accessibility", icon: Accessibility },
  { id: "privacy", label: "Privacy & Security", icon: Lock },
  { id: "sound", label: "Sound", icon: Volume2 },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "storage", label: "Storage", icon: HardDrive },
]

const OS_ABOUT = {
  name: "Q-OS",
  version: "1.3",
  build: "24A013",
  codename: "Quantum",
  description: "A modern Web2/Web3 desktop environment in the browser.",
}

export function SettingsApp() {
  const [selected, setSelected] = useState("general")
  const [showScrollBars, setShowScrollBars] = useState(true)
  const [allowWallpaperTinting, setAllowWallpaperTinting] = useState(true)
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null)
  const { setTheme, resolvedTheme } = useTheme()
  const {
    wallpaperUrl,
    setWallpaper,
    accentColor,
    setAccentColor,
    settings,
    updateDockSettings,
    updateWindowSettings,
    updateLockScreenSettings,
    updateSoundSettings,
    updateNotificationSettings,
    triggerEnvironmentNotification,
  } = useOS()
  const darkMode = resolvedTheme === "dark"
  const effectiveTheme = (resolvedTheme ?? "light") as WallpaperTheme

  useEffect(() => {
    setDeviceInfo(getDeviceInfo())
  }, [])

  return (
    <div className="flex h-full">
      <div
        className="w-[200px] shrink-0 flex flex-col py-2 overflow-y-auto bg-sidebar border-r border-border"
      >
        <div className="px-4 py-2">
          <div className="flex items-center gap-2 px-2 py-1 rounded-md text-[12px] bg-muted">
            <svg className="w-3 h-3 opacity-40" viewBox="0 0 12 12" fill="currentColor">
              <circle cx="6" cy="6" r="5" stroke="currentColor" fill="none" strokeWidth="1.5" />
              <line x1="9" y1="9" x2="11" y2="11" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span className="text-muted-foreground">Search</span>
          </div>
        </div>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`flex items-center gap-2.5 px-4 py-1.5 mx-2 rounded-lg text-[13px] transition-colors ${
              selected === cat.id
                ? "bg-primary/10 text-primary"
                : "hover:bg-muted text-foreground"
            }`}
            onClick={() => setSelected(cat.id)}
          >
            <cat.icon className="w-4 h-4 opacity-70" />
            {cat.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-background text-foreground">
        {selected === "general" && (
          <div>
            <h2 className="text-[22px] font-semibold mb-6">General</h2>
            <div className="space-y-6">
              <SettingsSection
                title="About Q-OS"
                description="Operating system and build information."
              >
                <div className="rounded-xl p-4 bg-muted/50 space-y-3">
                  <div className="flex justify-between text-[13px]">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-medium">{OS_ABOUT.name}</span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-muted-foreground">Version</span>
                    <span className="font-medium">{OS_ABOUT.version}</span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-muted-foreground">Build</span>
                    <span className="font-medium">{OS_ABOUT.build}</span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-muted-foreground">Codename</span>
                    <span className="font-medium">{OS_ABOUT.codename}</span>
                  </div>
                  <p className="text-[12px] text-muted-foreground pt-1">{OS_ABOUT.description}</p>
                </div>
              </SettingsSection>
              <SettingsSection
                title="Device & environment"
                description="Detected device and browser information."
              >
                {deviceInfo ? (
                  <div className="rounded-xl p-4 bg-muted/50 space-y-2">
                    <InfoRow label="Browser" value={deviceInfo.browser} />
                    <InfoRow label="Platform" value={`${deviceInfo.platform} ${deviceInfo.platformVersion}`.trim()} />
                    <InfoRow label="Device type" value={deviceInfo.deviceType} />
                    <InfoRow label="Screen" value={deviceInfo.screenResolution} />
                    <InfoRow label="Pixel ratio" value={String(deviceInfo.pixelRatio)} />
                    <InfoRow label="Language" value={deviceInfo.language} />
                    {deviceInfo.cores != null && (
                      <InfoRow label="CPU cores" value={String(deviceInfo.cores)} />
                    )}
                    {deviceInfo.deviceMemoryGB != null && (
                      <InfoRow label="Device memory" value={`${deviceInfo.deviceMemoryGB} GB`} />
                    )}
                    <InfoRow label="Touch primary" value={deviceInfo.touchPrimary ? "Yes" : "No"} />
                    <details className="mt-2">
                      <summary className="text-[12px] text-muted-foreground cursor-pointer hover:text-foreground">
                        User agent
                      </summary>
                      <pre className="text-[11px] text-muted-foreground mt-1 break-all whitespace-pre-wrap font-mono">
                        {deviceInfo.userAgentShort}
                      </pre>
                    </details>
                  </div>
                ) : (
                  <p className="text-[13px] text-muted-foreground">Loading device info…</p>
                )}
              </SettingsSection>
              <SettingsSection title="Software" description="Updates and login items.">
                <SettingRow label="Software Update">
                  <span className="text-[13px] text-muted-foreground">Your system is up to date</span>
                </SettingRow>
                <SettingRow label="Login Items">
                  <span className="text-[13px] text-muted-foreground">Managed by wallet session</span>
                </SettingRow>
              </SettingsSection>
            </div>
          </div>
        )}

        {selected === "appearance" && (
          <div>
            <h2 className="text-[22px] font-semibold mb-6">Appearance</h2>
            <div className="space-y-6">
              <div>
                <label className="text-[13px] font-medium mb-3 block">Appearance</label>
                <div className="flex gap-4">
                  <AppearanceOption
                    label="Light"
                    active={!darkMode}
                    onClick={() => setTheme("light")}
                    color="#f5f5f7"
                    textColor="#1d1d1f"
                  />
                  <AppearanceOption
                    label="Dark"
                    active={darkMode}
                    onClick={() => setTheme("dark")}
                    color="#1d1d1f"
                    textColor="#f5f5f7"
                  />
                </div>
              </div>
              <div>
                <label className="text-[13px] font-medium mb-3 block">Accent Color</label>
                <div className="flex gap-2">
                  {ACCENT_COLORS.map((color) => (
                    <button
                      key={color}
                      className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                        accentColor === color ? "border-primary ring-2 ring-primary/30" : "border-border"
                      }`}
                      style={{ background: color }}
                      onClick={() => setAccentColor(color)}
                      aria-label={`Set accent color to ${color}`}
                    />
                  ))}
                </div>
              </div>
              <SettingToggle
                label="Show scroll bars"
                checked={showScrollBars}
                onCheckedChange={setShowScrollBars}
              />
              <SettingToggle
                label="Allow wallpaper tinting"
                checked={allowWallpaperTinting}
                onCheckedChange={setAllowWallpaperTinting}
              />
              <div>
                <label className="text-[13px] font-medium mb-3 block">Desktop picture</label>
                <div className="space-y-4">
                  <div>
                    <span className="text-[12px] text-muted-foreground block mb-2">Default</span>
                    <div className="flex flex-wrap gap-2">
                      <WallpaperThumb
                        path={null}
                        label="Automatic (follow theme)"
                        currentPath={wallpaperUrl}
                        effectiveTheme={effectiveTheme}
                        defaultLight={WALLPAPER_DEFAULTS.light}
                        defaultDark={WALLPAPER_DEFAULTS.dark}
                        onSelect={() => setWallpaper(null)}
                      />
                      <WallpaperThumb
                        path={WALLPAPER_DEFAULTS.light}
                        label="Light"
                        currentPath={wallpaperUrl}
                        effectiveTheme={effectiveTheme}
                        defaultLight={WALLPAPER_DEFAULTS.light}
                        defaultDark={WALLPAPER_DEFAULTS.dark}
                        onSelect={() => setWallpaper(WALLPAPER_DEFAULTS.light)}
                      />
                      <WallpaperThumb
                        path={WALLPAPER_DEFAULTS.dark}
                        label="Dark"
                        currentPath={wallpaperUrl}
                        effectiveTheme={effectiveTheme}
                        defaultLight={WALLPAPER_DEFAULTS.light}
                        defaultDark={WALLPAPER_DEFAULTS.dark}
                        onSelect={() => setWallpaper(WALLPAPER_DEFAULTS.dark)}
                      />
                    </div>
                  </div>
                  {(["microsoft", "apple"] as const).map((cat) => (
                    <div key={cat}>
                      <span className="text-[12px] text-muted-foreground block mb-2 capitalize">{cat}</span>
                      <div className="flex flex-wrap gap-2">
                        {WALLPAPER_CATEGORIES[cat].map((w) => (
                          <WallpaperThumb
                            key={w.id}
                            path={w.path}
                            label={w.label}
                            currentPath={wallpaperUrl}
                            effectiveTheme={effectiveTheme}
                            defaultLight={WALLPAPER_DEFAULTS.light}
                            defaultDark={WALLPAPER_DEFAULTS.dark}
                            onSelect={() => setWallpaper(w.path)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {selected === "dock" && (
          <div>
            <h2 className="text-[22px] font-semibold mb-6">Dock</h2>
            <div className="space-y-8">
              <SettingsSection
                title="Size & position"
                description="Adjust dock size and where it appears on screen."
              >
                <SettingSelect<DockSize>
                  label="Dock size"
                  value={settings.dock.size}
                  options={[
                    { value: "small", label: "Small" },
                    { value: "medium", label: "Medium" },
                    { value: "large", label: "Large" },
                  ]}
                  onValueChange={(size) => updateDockSettings({ size })}
                />
                <SettingSelect<DockPosition>
                  label="Position on screen"
                  value={settings.dock.position}
                  options={[
                    { value: "bottom", label: "Bottom" },
                    { value: "left", label: "Left" },
                    { value: "right", label: "Right" },
                  ]}
                  onValueChange={(position) => updateDockSettings({ position })}
                />
              </SettingsSection>
              <SettingsSection
                title="Behavior"
                description="Auto-hide when apps are open; show when hovering the screen edge."
              >
                <SettingToggle
                  label="Auto-hide dock"
                  checked={settings.dock.autoHide}
                  onCheckedChange={(autoHide) => updateDockSettings({ autoHide })}
                />
                <SettingToggle
                  label="Magnification on hover"
                  checked={settings.dock.magnify}
                  onCheckedChange={(magnify) => updateDockSettings({ magnify })}
                />
              </SettingsSection>
              <SettingsSection
                title="Stacking"
                description="Show the dock above open windows and apps when enabled."
              >
                <SettingToggle
                  label="Always on top"
                  checked={settings.dock.alwaysOnTop}
                  onCheckedChange={(alwaysOnTop) => updateDockSettings({ alwaysOnTop })}
                />
              </SettingsSection>
            </div>
          </div>
        )}

        {selected === "window" && (
          <div>
            <h2 className="text-[22px] font-semibold mb-6">Window</h2>
            <div className="space-y-8">
              <SettingsSection
                title="Title bar"
                description="Control the position of close, minimize, and maximize buttons."
              >
                <SettingSelect<TrafficLightsPosition>
                  label="Action buttons position"
                  value={settings.window.trafficLightsPosition}
                  options={[
                    { value: "left", label: "Left" },
                    { value: "right", label: "Right" },
                  ]}
                  onValueChange={(trafficLightsPosition) =>
                    updateWindowSettings({ trafficLightsPosition })
                  }
                />
              </SettingsSection>
              <SettingsSection
                title="Switcher"
                description="Show a window switcher to quickly switch between open app windows."
              >
                <SettingToggle
                  label="Open app windows maximize switcher"
                  checked={settings.window.showMaximizeSwitcher}
                  onCheckedChange={(showMaximizeSwitcher) =>
                    updateWindowSettings({ showMaximizeSwitcher })
                  }
                />
              </SettingsSection>
            </div>
          </div>
        )}

        {selected === "shortcuts" && (
          <div>
            <h2 className="text-[22px] font-semibold mb-6">Shortcuts</h2>
            <div className="space-y-8">
              <SettingsSection
                title="Environment"
                description="Keyboard shortcuts for app switcher, Mission Control, lock screen, and more."
              >
                {(["appSwitcher", "missionControl", "lockScreen", "spotlight"] as ShortcutAction[]).map(
                  (action) => (
                    <SettingRow
                      key={action}
                      label={
                        action === "appSwitcher"
                          ? "App switcher"
                          : action === "missionControl"
                            ? "Mission Control"
                            : action === "lockScreen"
                              ? "Lock screen"
                              : "Spotlight"
                      }
                    >
                      <kbd className="text-[12px] px-2 py-1 rounded bg-muted border border-border font-mono">
                        {formatShortcut(settings.shortcuts[action])}
                      </kbd>
                    </SettingRow>
                  )
                )}
              </SettingsSection>
            </div>
          </div>
        )}

        {selected === "lockScreen" && (
          <div>
            <h2 className="text-[22px] font-semibold mb-6">Lock Screen</h2>
            <div className="space-y-8">
              <SettingsSection
                title="Automatic lock"
                description="Lock the screen after a period of inactivity."
              >
                <SettingSlider
                  label="Idle time before lock"
                  value={settings.lockScreen.idleTimeoutMinutes}
                  min={0}
                  max={60}
                  step={1}
                  unit={settings.lockScreen.idleTimeoutMinutes === 0 ? " (never)" : " min"}
                  onValueChange={(idleTimeoutMinutes) =>
                    updateLockScreenSettings({ idleTimeoutMinutes })
                  }
                />
                <SettingToggle
                  label="Require password on wake"
                  checked={settings.lockScreen.requirePasswordOnWake}
                  onCheckedChange={(requirePasswordOnWake) =>
                    updateLockScreenSettings({ requirePasswordOnWake })
                  }
                />
              </SettingsSection>
            </div>
          </div>
        )}

        {selected === "sound" && (
          <div>
            <h2 className="text-[22px] font-semibold mb-6">Sound</h2>
            <div className="space-y-8">
              <SettingsSection
                title="Output volume"
                description="System and alert volume (browser context)."
              >
                <SettingSlider
                  label="Volume"
                  value={settings.sound.volume}
                  min={0}
                  max={100}
                  step={5}
                  unit="%"
                  onValueChange={(volume) => updateSoundSettings({ volume })}
                />
                <SettingSlider
                  label="Alert volume"
                  value={settings.sound.alertVolume}
                  min={0}
                  max={100}
                  step={5}
                  unit="%"
                  onValueChange={(alertVolume) => updateSoundSettings({ alertVolume })}
                />
              </SettingsSection>
              <SettingsSection
                title="Sound effects"
                description="Play sounds for UI feedback and alerts."
              >
                <SettingToggle
                  label="Sound effects"
                  checked={settings.sound.soundEffects}
                  onCheckedChange={(soundEffects) => updateSoundSettings({ soundEffects })}
                />
                <SettingToggle
                  label="Play feedback sounds"
                  checked={settings.sound.playFeedbackSounds}
                  onCheckedChange={(playFeedbackSounds) => updateSoundSettings({ playFeedbackSounds })}
                />
                <SettingSelect<AlertSoundType>
                  label="Alert sound"
                  value={settings.sound.alertSound}
                  options={[
                    { value: "default", label: "Default" },
                    { value: "glass", label: "Glass" },
                    { value: "pop", label: "Pop" },
                    { value: "submarine", label: "Submarine" },
                    { value: "none", label: "None" },
                  ]}
                  onValueChange={(alertSound) => updateSoundSettings({ alertSound })}
                />
                <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-muted/50">
                  <span className="text-[13px] font-medium">Test alert sound</span>
                  <button
                    type="button"
                    className="text-[12px] px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90"
                    onClick={() =>
                      playAlertSound(settings.sound.alertSound, settings.sound.alertVolume / 100)
                    }
                  >
                    Play
                  </button>
                </div>
              </SettingsSection>
            </div>
          </div>
        )}

        {selected === "notifications" && (
          <div>
            <h2 className="text-[22px] font-semibold mb-6">Notifications</h2>
            <div className="space-y-8">
              <SettingsSection
                title="Environment alerts"
                description="Show and hear notifications within Q-OS (e.g. system alerts)."
              >
                <SettingToggle
                  label="Notifications enabled"
                  checked={settings.notifications.enabled}
                  onCheckedChange={(enabled) => updateNotificationSettings({ enabled })}
                />
                <SettingToggle
                  label="Environment alert"
                  checked={settings.notifications.environmentAlert}
                  onCheckedChange={(environmentAlert) =>
                    updateNotificationSettings({ environmentAlert })
                  }
                />
                <SettingToggle
                  label="Play sound for notifications"
                  checked={settings.notifications.soundEnabled}
                  onCheckedChange={(soundEnabled) =>
                    updateNotificationSettings({ soundEnabled })
                  }
                />
                <SettingToggle
                  label="Show notification preview"
                  checked={settings.notifications.showPreview}
                  onCheckedChange={(showPreview) =>
                    updateNotificationSettings({ showPreview })
                  }
                />
                <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-muted/50">
                  <span className="text-[13px] font-medium">Test notification</span>
                  <button
                    type="button"
                    className="text-[12px] px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90"
                    onClick={() =>
                      triggerEnvironmentNotification("This is a test notification from Q-OS.")
                    }
                  >
                    Send test
                  </button>
                </div>
              </SettingsSection>
            </div>
          </div>
        )}

        {selected === "storage" && (
          <div>
            <h2 className="text-[22px] font-semibold mb-6">Storage</h2>
            <div className="space-y-8">
              <SettingsSection
                title="Standard (Web2) storage"
                description="Traditional storage: online server and offline on-device storage."
              >
                <div className="space-y-4">
                  <div className="rounded-xl p-4 bg-muted/50 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Cloud className="w-4 h-4 text-muted-foreground" />
                      <span className="text-[13px] font-medium">Online (Global)</span>
                    </div>
                    <p className="text-[12px] text-muted-foreground mb-2">
                      Server storage dedicated to your account. Syncs across devices when signed in.
                    </p>
                    <div className="text-[12px] text-muted-foreground">
                      Usage: — (connect wallet to see)
                    </div>
                  </div>
                  <div className="rounded-xl p-4 bg-muted/50 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <WifiOff className="w-4 h-4 text-muted-foreground" />
                      <span className="text-[13px] font-medium">Offline (Local)</span>
                    </div>
                    <p className="text-[12px] text-muted-foreground mb-2">
                      On-device storage: in-app data and browser shared storage (e.g. localStorage, IndexedDB).
                    </p>
                    <StorageUsageBar label="Local storage" used={estimateLocalStorage()} total={5} unit="MB" />
                    <StorageUsageBar label="App data" used={0.5} total={2} unit="MB" />
                  </div>
                </div>
              </SettingsSection>
              <SettingsSection
                title="Modern on-chain (Web3) storage"
                description="Decentralized storage on blockchain and compatible networks."
              >
                <div className="rounded-xl p-4 bg-muted/50 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="w-4 h-4 text-muted-foreground" />
                    <span className="text-[13px] font-medium">On-chain</span>
                  </div>
                  <p className="text-[12px] text-muted-foreground mb-2">
                    Data stored on-chain or via decentralized protocols (e.g. IPFS, Arweave). Connect wallet to manage.
                  </p>
                  <div className="text-[12px] text-muted-foreground">
                    Status: Connect wallet to view on-chain storage
                  </div>
                </div>
              </SettingsSection>
            </div>
          </div>
        )}

        {["accessibility", "privacy"].includes(selected) && (
          <div>
            <h2 className="text-[22px] font-semibold mb-4">
              {categories.find((c) => c.id === selected)?.label}
            </h2>
            <p className="text-[14px] text-muted-foreground">
              Settings panel coming soon.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-[13px]">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

function StorageUsageBar({
  label,
  used,
  total,
  unit,
}: {
  label: string
  used: number
  total: number
  unit: string
}) {
  const pct = total > 0 ? Math.min(100, (used / total) * 100) : 0
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[12px]">
        <span className="text-muted-foreground">{label}</span>
        <span>{used.toFixed(1)} / {total} {unit}</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function estimateLocalStorage(): number {
  if (typeof window === "undefined") return 0
  try {
    let total = 0
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i)
      if (key) total += (key.length + (window.localStorage.getItem(key)?.length ?? 0)) * 2
    }
    return Math.round((total / 1024 / 1024) * 10) / 10
  } catch {
    return 0
  }
}

function AppearanceOption({
  label,
  active,
  onClick,
  color,
  textColor,
}: {
  label: string
  active: boolean
  onClick: () => void
  color: string
  textColor: string
}) {
  return (
    <button
      className="flex flex-col items-center gap-2"
      onClick={onClick}
    >
      <div
        className={`w-[100px] h-[70px] rounded-xl flex items-center justify-center text-[11px] border-2 transition-colors ${
          active ? "border-primary" : "border-border"
        }`}
        style={{
          background: color,
          color: textColor,
        }}
      >
        <div className="space-y-1 text-center">
          <div className="w-12 h-1 rounded opacity-30" style={{ background: textColor }} />
          <div className="w-8 h-1 rounded opacity-20" style={{ background: textColor }} />
        </div>
      </div>
      <span
        className={`text-[12px] ${active ? "text-primary" : "text-foreground"}`}
      >
        {label}
      </span>
    </button>
  )
}

function WallpaperThumb({
  path,
  label,
  currentPath,
  effectiveTheme,
  defaultLight,
  defaultDark,
  onSelect,
}: {
  path: string | null
  label: string
  currentPath: string | null
  effectiveTheme: WallpaperTheme
  defaultLight: string
  defaultDark: string
  onSelect: () => void
}) {
  const isSelected =
    path === null
      ? currentPath === null
      : currentPath === path
  const previewUrl =
    path ?? (effectiveTheme === "dark" ? defaultDark : defaultLight)
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex flex-col items-center gap-1.5 text-left"
      aria-label={`Wallpaper: ${label}`}
    >
      <div
        className={`w-[88px] h-[56px] rounded-lg border-2 bg-cover bg-center shrink-0 transition-colors ${
          isSelected ? "border-primary" : "border-border"
        }`}
        style={{ backgroundImage: `url(${previewUrl})` }}
      />
      <span
        className={`text-[11px] max-w-[88px] truncate block ${
          isSelected ? "text-primary" : "text-foreground"
        }`}
      >
        {label}
      </span>
    </button>
  )
}
