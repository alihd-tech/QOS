"use client"

import { useState } from "react"
import { Play, Pause, SkipBack, SkipForward, Volume2, Repeat, Shuffle, ListMusic, Heart } from "lucide-react"

const tracks = [
  { id: 1, title: "Midnight Drive", artist: "Neon Waves", album: "Electric Dreams", duration: "3:42", color: "#2196F3" },
  { id: 2, title: "Sunset Boulevard", artist: "Chill Collective", album: "Golden Hour", duration: "4:15", color: "#FF9800" },
  { id: 3, title: "Digital Rain", artist: "Synthwave FM", album: "Future Retro", duration: "3:58", color: "#9C27B0" },
  { id: 4, title: "Ocean Breeze", artist: "Ambient Sky", album: "Calm Waters", duration: "5:20", color: "#00BCD4" },
  { id: 5, title: "City Lights", artist: "Neon Waves", album: "Electric Dreams", duration: "3:33", color: "#E91E63" },
  { id: 6, title: "Mountain Echo", artist: "Nature Sound", album: "Wilderness", duration: "4:47", color: "#4CAF50" },
  { id: 7, title: "Stargazer", artist: "Cosmic Drift", album: "Interstellar", duration: "6:02", color: "#3F51B5" },
  { id: 8, title: "Coffee Shop Jazz", artist: "Smooth Quartet", album: "Morning Cup", duration: "3:15", color: "#795548" },
  { id: 9, title: "Rainy Day", artist: "Lo-Fi Beats", album: "Chill Hop", duration: "2:58", color: "#607D8B" },
  { id: 10, title: "Electric Dreams", artist: "Neon Waves", album: "Electric Dreams", duration: "4:30", color: "#FF5722" },
]

const playlists = [
  { name: "Recently Played", count: 25 },
  { name: "Favorites", count: 14 },
  { name: "Chill Vibes", count: 32 },
  { name: "Focus Mode", count: 18 },
  { name: "Workout Mix", count: 20 },
]

export function MusicApp() {
  const [playing, setPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(tracks[0])
  const [progress, setProgress] = useState(35)
  const [activeSection, setActiveSection] = useState("songs")

  return (
    <div className="h-full flex flex-col" style={{ background: "#fafafa" }}>
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div
          className="w-[180px] shrink-0 py-3 overflow-y-auto"
          style={{ background: "rgba(238,237,240,0.95)", borderRight: "1px solid rgba(0,0,0,0.08)" }}
        >
          <div className="px-3 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#86868b" }}>Library</span>
          </div>
          {["songs", "artists", "albums"].map((s) => (
            <button
              key={s}
              className="w-full text-left px-3 py-1.5 mx-1 rounded-lg text-[13px] capitalize transition-colors"
              style={{
                width: "calc(100% - 8px)",
                color: activeSection === s ? "#0071e3" : "#1d1d1f",
                background: activeSection === s ? "rgba(0,113,227,0.08)" : "transparent",
                fontWeight: activeSection === s ? 600 : 400,
              }}
              onClick={() => setActiveSection(s)}
            >
              <div className="flex items-center gap-2">
                <ListMusic size={14} style={{ opacity: 0.6 }} />
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </div>
            </button>
          ))}
          <div className="px-3 mt-4 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#86868b" }}>Playlists</span>
          </div>
          {playlists.map((p) => (
            <button
              key={p.name}
              className="w-full text-left px-3 py-1.5 mx-1 rounded-lg text-[13px] transition-colors hover:bg-black/3"
              style={{ width: "calc(100% - 8px)", color: "#1d1d1f" }}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Track list */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
            <div className="flex items-center gap-4 text-[11px] font-medium uppercase" style={{ color: "#86868b" }}>
              <span className="w-8">#</span>
              <span className="flex-1">Title</span>
              <span className="w-[120px]">Album</span>
              <span className="w-[50px] text-right">Time</span>
            </div>
          </div>
          {tracks.map((track, i) => (
            <button
              key={track.id}
              className={`w-full flex items-center gap-4 px-4 py-2 text-left transition-colors ${
                currentTrack.id === track.id ? "" : "hover:bg-black/3"
              }`}
              style={{
                background: currentTrack.id === track.id ? "rgba(0,113,227,0.06)" : "transparent",
              }}
              onClick={() => {
                setCurrentTrack(track)
                setPlaying(true)
                setProgress(0)
              }}
            >
              <span className="w-8 text-[12px]" style={{ color: currentTrack.id === track.id ? "#0071e3" : "#86868b" }}>
                {currentTrack.id === track.id && playing ? (
                  <span className="flex gap-0.5">
                    <span className="w-0.5 h-3 rounded-full animate-pulse" style={{ background: "#0071e3" }} />
                    <span className="w-0.5 h-2 rounded-full animate-pulse" style={{ background: "#0071e3", animationDelay: "0.15s" }} />
                    <span className="w-0.5 h-3.5 rounded-full animate-pulse" style={{ background: "#0071e3", animationDelay: "0.3s" }} />
                  </span>
                ) : (
                  i + 1
                )}
              </span>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 rounded shrink-0" style={{ background: track.color }} />
                <div className="min-w-0">
                  <p className="text-[13px] font-medium truncate" style={{ color: currentTrack.id === track.id ? "#0071e3" : "#1d1d1f" }}>
                    {track.title}
                  </p>
                  <p className="text-[11px] truncate" style={{ color: "#86868b" }}>{track.artist}</p>
                </div>
              </div>
              <span className="w-[120px] text-[12px] truncate" style={{ color: "#86868b" }}>{track.album}</span>
              <span className="w-[50px] text-right text-[12px]" style={{ color: "#86868b" }}>{track.duration}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Player bar */}
      <div
        className="h-[72px] shrink-0 flex items-center px-4 gap-4"
        style={{ background: "rgba(246,246,246,0.95)", borderTop: "1px solid rgba(0,0,0,0.08)" }}
      >
        {/* Track info */}
        <div className="flex items-center gap-3 w-[200px]">
          <div className="w-10 h-10 rounded shrink-0" style={{ background: currentTrack.color }} />
          <div className="min-w-0">
            <p className="text-[12px] font-medium truncate" style={{ color: "#1d1d1f" }}>{currentTrack.title}</p>
            <p className="text-[11px] truncate" style={{ color: "#86868b" }}>{currentTrack.artist}</p>
          </div>
          <Heart size={14} style={{ color: "#86868b", cursor: "pointer", flexShrink: 0 }} />
        </div>

        {/* Controls */}
        <div className="flex-1 flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-4">
            <Shuffle size={14} style={{ color: "#86868b", cursor: "pointer" }} />
            <SkipBack size={16} style={{ color: "#1d1d1f", cursor: "pointer" }} />
            <button
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "#1d1d1f" }}
              onClick={() => setPlaying(!playing)}
            >
              {playing ? (
                <Pause size={14} style={{ color: "#ffffff" }} />
              ) : (
                <Play size={14} style={{ color: "#ffffff", marginLeft: 1 }} />
              )}
            </button>
            <SkipForward size={16} style={{ color: "#1d1d1f", cursor: "pointer" }} />
            <Repeat size={14} style={{ color: "#86868b", cursor: "pointer" }} />
          </div>
          <div className="flex items-center gap-2 w-full max-w-[400px]">
            <span className="text-[10px]" style={{ color: "#86868b" }}>1:18</span>
            <div className="flex-1 h-1 rounded-full cursor-pointer" style={{ background: "rgba(0,0,0,0.1)" }}>
              <div className="h-full rounded-full" style={{ width: `${progress}%`, background: "#1d1d1f" }} />
            </div>
            <span className="text-[10px]" style={{ color: "#86868b" }}>{currentTrack.duration}</span>
          </div>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2 w-[120px]">
          <Volume2 size={14} style={{ color: "#86868b" }} />
          <div className="flex-1 h-1 rounded-full" style={{ background: "rgba(0,0,0,0.1)" }}>
            <div className="h-full rounded-full w-[70%]" style={{ background: "#1d1d1f" }} />
          </div>
        </div>
      </div>
    </div>
  )
}
