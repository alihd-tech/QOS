"use client"

import { useState } from "react"
import { Grid3x3, Heart, Clock, Folder, Star } from "lucide-react"

const samplePhotos = [
  { id: 1, color: "#FF6B6B", label: "Sunset Beach", fav: true },
  { id: 2, color: "#4ECDC4", label: "Mountain View", fav: false },
  { id: 3, color: "#45B7D1", label: "Ocean Waves", fav: true },
  { id: 4, color: "#96CEB4", label: "Forest Trail", fav: false },
  { id: 5, color: "#FFEAA7", label: "Golden Hour", fav: true },
  { id: 6, color: "#DDA0DD", label: "Cherry Blossom", fav: false },
  { id: 7, color: "#98D8C8", label: "Green Valley", fav: false },
  { id: 8, color: "#F7DC6F", label: "Sand Dunes", fav: true },
  { id: 9, color: "#BB8FCE", label: "Purple Sky", fav: false },
  { id: 10, color: "#85C1E9", label: "Clear Lake", fav: false },
  { id: 11, color: "#F0B27A", label: "Autumn Leaves", fav: true },
  { id: 12, color: "#82E0AA", label: "Spring Garden", fav: false },
  { id: 13, color: "#F1948A", label: "Rose Garden", fav: false },
  { id: 14, color: "#AED6F1", label: "Winter Morning", fav: true },
  { id: 15, color: "#D7BDE2", label: "Lavender Field", fav: false },
  { id: 16, color: "#A3E4D7", label: "Tropical Reef", fav: false },
  { id: 17, color: "#FAD7A0", label: "Desert Road", fav: false },
  { id: 18, color: "#A9CCE3", label: "Misty Lake", fav: true },
]

const tabs = [
  { id: "all", label: "Library", icon: Grid3x3 },
  { id: "favorites", label: "Favorites", icon: Heart },
  { id: "recents", label: "Recents", icon: Clock },
  { id: "albums", label: "Albums", icon: Folder },
]

export function PhotosApp() {
  const [activeTab, setActiveTab] = useState("all")
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null)

  const photos = activeTab === "favorites" ? samplePhotos.filter((p) => p.fav) : samplePhotos

  if (selectedPhoto !== null) {
    const photo = samplePhotos.find((p) => p.id === selectedPhoto)
    if (photo) {
      return (
        <div className="h-full flex flex-col" style={{ background: "#1a1a1a" }}>
          <div className="flex items-center justify-between px-4 py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            <button
              className="text-[13px] font-medium"
              style={{ color: "#0071e3" }}
              onClick={() => setSelectedPhoto(null)}
            >
              Back to Library
            </button>
            <span className="text-[13px]" style={{ color: "rgba(255,255,255,0.7)" }}>{photo.label}</span>
            <button className="text-[13px]" style={{ color: photo.fav ? "#FF3B30" : "rgba(255,255,255,0.5)" }}>
              <Heart size={16} fill={photo.fav ? "#FF3B30" : "none"} />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center p-8">
            <div
              className="w-full max-w-[400px] aspect-[4/3] rounded-lg flex items-center justify-center"
              style={{ background: photo.color }}
            >
              <span className="text-[18px] font-medium" style={{ color: "rgba(0,0,0,0.3)" }}>
                {photo.label}
              </span>
            </div>
          </div>
        </div>
      )
    }
  }

  return (
    <div className="h-full flex flex-col" style={{ background: "#fafafa" }}>
      {/* Tabs */}
      <div
        className="flex items-center gap-1 px-4 py-2 shrink-0"
        style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] transition-colors ${
              activeTab === tab.id ? "font-semibold" : ""
            }`}
            style={{
              color: activeTab === tab.id ? "#0071e3" : "#86868b",
              background: activeTab === tab.id ? "rgba(0,113,227,0.08)" : "transparent",
            }}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Photo grid */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === "albums" ? (
          <div className="grid grid-cols-3 gap-4 p-2">
            {["Vacation", "Family", "Nature", "Architecture", "Food", "Portraits"].map((album) => (
              <div key={album} className="flex flex-col items-center gap-2">
                <div
                  className="w-full aspect-square rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(0,0,0,0.06)" }}
                >
                  <Folder size={28} style={{ color: "#0071e3", opacity: 0.6 }} />
                </div>
                <span className="text-[12px]" style={{ color: "#1d1d1f" }}>{album}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-1">
            {photos.map((photo) => (
              <button
                key={photo.id}
                className="aspect-square rounded-md overflow-hidden relative group"
                style={{ background: photo.color }}
                onClick={() => setSelectedPhoto(photo.id)}
              >
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                {photo.fav && (
                  <Star
                    size={12}
                    className="absolute top-1.5 right-1.5"
                    fill="#FFD700"
                    stroke="#FFD700"
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Status bar */}
      <div
        className="px-4 py-1.5 text-[11px] shrink-0"
        style={{ color: "#86868b", borderTop: "1px solid rgba(0,0,0,0.06)" }}
      >
        {photos.length} photos
      </div>
    </div>
  )
}
