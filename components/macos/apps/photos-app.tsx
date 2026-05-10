"use client"

import { useState } from "react"
import { Grid3x3, Heart, Clock, Folder, Star, ArrowLeft, Info } from "lucide-react"

// Sample photos – each photo has a color, label, favorite flag, and optional date
const samplePhotos = [
  { id: 1, color: "#FF6B6B", label: "Sunset Beach", fav: true, date: "2024-03-15" },
  { id: 2, color: "#4ECDC4", label: "Mountain View", fav: false, date: "2024-02-20" },
  { id: 3, color: "#45B7D1", label: "Ocean Waves", fav: true, date: "2024-03-01" },
  { id: 4, color: "#96CEB4", label: "Forest Trail", fav: false, date: "2024-01-10" },
  { id: 5, color: "#FFEAA7", label: "Golden Hour", fav: true, date: "2024-03-10" },
  { id: 6, color: "#DDA0DD", label: "Cherry Blossom", fav: false, date: "2024-02-28" },
  { id: 7, color: "#98D8C8", label: "Green Valley", fav: false, date: "2023-12-05" },
  { id: 8, color: "#F7DC6F", label: "Sand Dunes", fav: true, date: "2024-03-12" },
  { id: 9, color: "#BB8FCE", label: "Purple Sky", fav: false, date: "2024-02-14" },
  { id: 10, color: "#85C1E9", label: "Clear Lake", fav: false, date: "2024-01-25" },
  { id: 11, color: "#F0B27A", label: "Autumn Leaves", fav: true, date: "2023-11-02" },
  { id: 12, color: "#82E0AA", label: "Spring Garden", fav: false, date: "2024-03-18" },
  { id: 13, color: "#F1948A", label: "Rose Garden", fav: false, date: "2024-02-09" },
  { id: 14, color: "#AED6F1", label: "Winter Morning", fav: true, date: "2023-12-20" },
  { id: 15, color: "#D7BDE2", label: "Lavender Field", fav: false, date: "2024-03-05" },
  { id: 16, color: "#A3E4D7", label: "Tropical Reef", fav: false, date: "2024-02-17" },
  { id: 17, color: "#FAD7A0", label: "Desert Road", fav: false, date: "2024-01-30" },
  { id: 18, color: "#A9CCE3", label: "Misty Lake", fav: true, date: "2024-03-22" },
]

const tabs = [
  { id: "all", label: "Library", icon: Grid3x3 },
  { id: "favorites", label: "Favorites", icon: Heart },
  { id: "recents", label: "Recents", icon: Clock },
  { id: "albums", label: "Albums", icon: Folder },
]

const albums = [
  { name: "Vacation", count: 24, coverColor: "#FF6B6B" },
  { name: "Family", count: 18, coverColor: "#4ECDC4" },
  { name: "Nature", count: 32, coverColor: "#96CEB4" },
  { name: "Architecture", count: 12, coverColor: "#45B7D1" },
  { name: "Food", count: 9, coverColor: "#F7DC6F" },
  { name: "Portraits", count: 15, coverColor: "#DDA0DD" },
]

// Helper to get recent photos (last 30 days)
const getRecentPhotos = () => {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  return samplePhotos.filter(photo => new Date(photo.date) > thirtyDaysAgo)
}

export function PhotosApp() {
  const [activeTab, setActiveTab] = useState("all")
  const [selectedPhoto, setSelectedPhoto] = useState<typeof samplePhotos[0] | null>(null)

  // Determine which photos to show
  let photos = samplePhotos
  if (activeTab === "favorites") photos = samplePhotos.filter(p => p.fav)
  if (activeTab === "recents") photos = getRecentPhotos()

  // Detail view
  if (selectedPhoto) {
    return (
      <div className="h-full flex flex-col bg-background">
        {/* Navigation bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/50">
          <button
            className="flex items-center gap-1 text-sm font-medium text-primary hover:opacity-80 transition-opacity"
            onClick={() => setSelectedPhoto(null)}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Library
          </button>
          <span className="text-sm font-medium text-foreground">{selectedPhoto.label}</span>
          <button className="p-1 rounded-full hover:bg-muted transition-colors">
            <Info className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Photo content */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div
            className="relative w-full max-w-2xl aspect-video rounded-xl shadow-2xl overflow-hidden group"
            style={{ backgroundColor: selectedPhoto.color }}
          >
            {/* Simulated image placeholder */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-medium text-black/30 dark:text-white/30">
                {selectedPhoto.label}
              </span>
            </div>
            {/* Favorite indicator overlay */}
            {selectedPhoto.fav && (
              <div className="absolute top-3 right-3">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              </div>
            )}
          </div>
        </div>

        {/* Photo info footer */}
        <div className="px-4 py-2 border-t border-border bg-card/50 text-xs text-muted-foreground flex justify-between">
          <span>Added: {new Date(selectedPhoto.date).toLocaleDateString()}</span>
          <button className="flex items-center gap-1 text-primary hover:underline">
            <Heart className={`w-3.5 h-3.5 ${selectedPhoto.fav ? "fill-red-500 text-red-500" : ""}`} />
            {selectedPhoto.fav ? "Favorited" : "Add to Favorites"}
          </button>
        </div>
      </div>
    )
  }

  // Main gallery view
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Tabs */}
      <div className="flex items-center gap-1 px-4 py-2 shrink-0 border-b border-border bg-card/30">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "albums" ? (
          // Albums grid
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {albums.map((album) => (
              <div
                key={album.name}
                className="group cursor-pointer rounded-xl overflow-hidden border border-border bg-card hover:shadow-md transition-all"
              >
                <div
                  className="aspect-square flex items-center justify-center relative"
                  style={{ backgroundColor: album.coverColor }}
                >
                  <Folder className="w-12 h-12 text-white/40 drop-shadow-md" />
                  <span className="absolute bottom-2 right-2 text-xs font-medium text-white/80 bg-black/30 px-1.5 py-0.5 rounded-full">
                    {album.count}
                  </span>
                </div>
                <div className="p-2 text-center">
                  <p className="text-sm font-medium text-foreground truncate">{album.name}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Photo grid
          <>
            {/* Stats row */}
            <div className="flex justify-between items-center mb-4 text-xs text-muted-foreground">
              <span>{photos.length} photo{photos.length !== 1 && "s"}</span>
              {activeTab === "favorites" && (
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3 fill-red-500 text-red-500" /> Favorites
                </span>
              )}
              {activeTab === "recents" && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Last 30 days
                </span>
              )}
            </div>

            {/* Responsive grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {photos.map((photo) => (
                <button
                  key={photo.id}
                  className="group relative aspect-square rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                  style={{ backgroundColor: photo.color }}
                  onClick={() => setSelectedPhoto(photo)}
                >
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  {/* Favorite badge */}
                  {photo.fav && (
                    <div className="absolute top-1.5 right-1.5">
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 drop-shadow-sm" />
                    </div>
                  )}
                  {/* Label on hover */}
                  <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-medium text-white truncate block">
                      {photo.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {photos.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="p-4 rounded-full bg-muted mb-3">
                  <Heart className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">No favorites yet</p>
                <p className="text-xs text-muted-foreground">
                  Photos you mark as favorite will appear here.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}