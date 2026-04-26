/**
 * Wallpaper configuration for the Q-OS environment. 
 */

export const WALLPAPER_DEFAULTS = {
  dark: "/wallpaper/apple/bigsur-dark.jpg",
  light: "/wallpaper/apple/bigsur-light.jpg",
} as const

export type WallpaperTheme = keyof typeof WALLPAPER_DEFAULTS

export const WALLPAPER_CATEGORIES = {
  microsoft: [
    { id: "microsoft-1", path: "/wallpaper/microsoft/1.jpg", label: "Microsoft 1" },
    { id: "microsoft-2", path: "/wallpaper/microsoft/2.jpg", label: "Microsoft 2" },
    { id: "microsoft-3", path: "/wallpaper/microsoft/3.jpg", label: "Microsoft 3" },
    { id: "microsoft-4", path: "/wallpaper/microsoft/4.jpg", label: "Microsoft 4" },
    { id: "microsoft-5", path: "/wallpaper/microsoft/5.jpg", label: "Microsoft 5" },
  ],
  apple: [
    { id: "bigsur-dark", path: "/wallpaper/apple/bigsur-dark.jpg", label: "Big Sur (Dark)" },
    { id: "bigsur-light", path: "/wallpaper/apple/bigsur-light.jpg", label: "Big Sur (Light)" },
  ],
} as const

export const WALLPAPER_STORAGE_KEY = "qos-wallpaper"

export function getDefaultWallpaper(theme: "light" | "dark"): string {
  return theme === "dark" ? WALLPAPER_DEFAULTS.dark : WALLPAPER_DEFAULTS.light
}

/** Resolve wallpaper URL: custom selection or theme default. */
export function resolveWallpaperUrl(
  customUrl: string | null,
  theme: "light" | "dark"
): string {
  return customUrl ?? getDefaultWallpaper(theme)
}
