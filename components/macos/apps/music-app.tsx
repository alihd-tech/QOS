"use client"

import { useState, useEffect, useRef } from "react"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  ListMusic,
  Heart,
  Mic2,
  Album,
  Headphones,
  ChevronRight,
} from "lucide-react"

const tracks = [
  { id: 1, title: "Midnight Drive", artist: "Neon Waves", album: "Electric Dreams", duration: 222, color: "#2196F3" },
  { id: 2, title: "Sunset Boulevard", artist: "Chill Collective", album: "Golden Hour", duration: 255, color: "#FF9800" },
  { id: 3, title: "Digital Rain", artist: "Synthwave FM", album: "Future Retro", duration: 238, color: "#9C27B0" },
  { id: 4, title: "Ocean Breeze", artist: "Ambient Sky", album: "Calm Waters", duration: 320, color: "#00BCD4" },
  { id: 5, title: "City Lights", artist: "Neon Waves", album: "Electric Dreams", duration: 213, color: "#E91E63" },
  { id: 6, title: "Mountain Echo", artist: "Nature Sound", album: "Wilderness", duration: 287, color: "#4CAF50" },
  { id: 7, title: "Stargazer", artist: "Cosmic Drift", album: "Interstellar", duration: 362, color: "#3F51B5" },
  { id: 8, title: "Coffee Shop Jazz", artist: "Smooth Quartet", album: "Morning Cup", duration: 195, color: "#795548" },
  { id: 9, title: "Rainy Day", artist: "Lo-Fi Beats", album: "Chill Hop", duration: 178, color: "#607D8B" },
  { id: 10, title: "Electric Dreams", artist: "Neon Waves", album: "Electric Dreams", duration: 270, color: "#FF5722" },
]

const playlists = [
  { name: "Recently Played", count: 25, icon: Headphones },
  { name: "Favorites", count: 14, icon: Heart },
  { name: "Chill Vibes", count: 32, icon: ListMusic },
  { name: "Focus Mode", count: 18, icon: Mic2 },
  { name: "Workout Mix", count: 20, icon: Play },
]

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export function MusicApp() {
  const [playing, setPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(tracks[0])
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(70)
  const [repeatMode, setRepeatMode] = useState<"off" | "one" | "all">("off")
  const [shuffle, setShuffle] = useState(false)
  const [activeSection, setActiveSection] = useState<"songs" | "artists" | "albums">("songs")
  const [favorites, setFavorites] = useState<number[]>([])
  const progressInterval = useRef<NodeJS.Timeout | null>(null)

  // Simulate progress update when playing
  useEffect(() => {
    if (playing) {
      progressInterval.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= currentTrack.duration) {
            // Handle track end
            clearInterval(progressInterval.current!)
            setPlaying(false)
            setProgress(0)
            // Auto-advance based on repeat mode
            if (repeatMode === "one") {
              setProgress(0)
              setPlaying(true)
            } else if (repeatMode === "all" || shuffle) {
              const nextIndex = getNextTrackIndex()
              setCurrentTrack(tracks[nextIndex])
              setProgress(0)
              setPlaying(true)
            }
            return 0
          }
          return prev + 1
        })
      }, 1000)
    } else if (progressInterval.current) {
      clearInterval(progressInterval.current)
    }
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current)
    }
  }, [playing, currentTrack, repeatMode, shuffle])

  const getNextTrackIndex = () => {
    const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id)
    if (shuffle) {
      let next = Math.floor(Math.random() * tracks.length)
      while (next === currentIndex && tracks.length > 1) next = Math.floor(Math.random() * tracks.length)
      return next
    }
    return (currentIndex + 1) % tracks.length
  }

  const getPrevTrackIndex = () => {
    const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id)
    if (shuffle) {
      let prev = Math.floor(Math.random() * tracks.length)
      while (prev === currentIndex && tracks.length > 1) prev = Math.floor(Math.random() * tracks.length)
      return prev
    }
    return (currentIndex - 1 + tracks.length) % tracks.length
  }

  const handlePlayPause = () => setPlaying(!playing)
  const handleNext = () => {
    const nextIndex = getNextTrackIndex()
    setCurrentTrack(tracks[nextIndex])
    setProgress(0)
    setPlaying(true)
  }
  const handlePrev = () => {
    const prevIndex = getPrevTrackIndex()
    setCurrentTrack(tracks[prevIndex])
    setProgress(0)
    setPlaying(true)
  }
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const newProgress = Math.floor(percent * currentTrack.duration)
    setProgress(newProgress)
  }
  const toggleFavorite = (trackId: number) => {
    setFavorites((prev) =>
      prev.includes(trackId) ? prev.filter((id) => id !== trackId) : [...prev, trackId]
    )
  }

  const toggleRepeat = () => {
    setRepeatMode((prev) => {
      if (prev === "off") return "one"
      if (prev === "one") return "all"
      return "off"
    })
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-[200px] shrink-0 py-4 overflow-y-auto border-r border-border bg-sidebar/50">
          <div className="px-4 mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Library
            </span>
          </div>
          {["songs", "artists", "albums"].map((section) => {
            const Icon = section === "songs" ? ListMusic : section === "artists" ? Mic2 : Album
            const isActive = activeSection === section
            return (
              <button
                key={section}
                className={`w-full flex items-center gap-2 px-4 py-1.5 text-left text-sm transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-foreground hover:bg-muted"
                }`}
                onClick={() => setActiveSection(section as any)}
              >
                <Icon className="w-4 h-4 opacity-70" />
                <span className="capitalize">{section}</span>
              </button>
            )
          })}
          <div className="mt-6 px-4 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Playlists
            </span>
          </div>
          {playlists.map((playlist) => (
            <button
              key={playlist.name}
              className="w-full flex items-center justify-between px-4 py-1.5 text-left text-sm text-foreground hover:bg-muted transition-colors group"
            >
              <div className="flex items-center gap-2">
                <playlist.icon className="w-3.5 h-3.5 text-muted-foreground" />
                <span>{playlist.name}</span>
              </div>
              <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                {playlist.count}
              </span>
            </button>
          ))}
        </div>

        {/* Track list */}
        <div className="flex-1 overflow-y-auto">
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm px-4 py-2 border-b border-border">
            <div className="flex items-center gap-4 text-xs font-medium uppercase text-muted-foreground">
              <span className="w-8">#</span>
              <span className="flex-1">Title</span>
              <span className="w-[120px] hidden sm:block">Album</span>
              <span className="w-[50px] text-right">⌛</span>
            </div>
          </div>
          <div className="pb-2">
            {tracks.map((track, idx) => {
              const isCurrent = currentTrack.id === track.id
              const isFavorite = favorites.includes(track.id)
              return (
                <div
                  key={track.id}
                  className={`group flex items-center gap-4 px-4 py-2 transition-colors cursor-pointer ${
                    isCurrent ? "bg-primary/5" : "hover:bg-muted/50"
                  }`}
                  onClick={() => {
                    setCurrentTrack(track)
                    setProgress(0)
                    setPlaying(true)
                  }}
                >
                  <div className="w-8 text-sm font-mono text-muted-foreground">
                    {isCurrent && playing ? (
                      <span className="flex gap-0.5 items-center justify-start">
                        <span className="w-0.5 h-3 animate-pulse bg-primary" />
                        <span className="w-0.5 h-2 animate-pulse bg-primary [animation-delay:0.15s]" />
                        <span className="w-0.5 h-3.5 animate-pulse bg-primary [animation-delay:0.3s]" />
                      </span>
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className="w-8 h-8 rounded shadow-sm shrink-0"
                      style={{ background: track.color }}
                    />
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-medium truncate ${
                          isCurrent ? "text-primary" : "text-foreground"
                        }`}
                      >
                        {track.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                    </div>
                  </div>
                  <span className="w-[120px] text-xs text-muted-foreground truncate hidden sm:block">
                    {track.album}
                  </span>
                  <div className="w-[50px] flex items-center justify-end gap-2">
                    <span className="text-xs text-muted-foreground">{formatTime(track.duration)}</span>
                    <button
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFavorite(track.id)
                      }}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Player bar */}
      <div className="shrink-0 border-t border-border bg-card/80 backdrop-blur-sm">
        <div className="flex items-center gap-4 px-4 py-2">
          {/* Track info */}
          <div className="flex items-center gap-3 w-[220px]">
            <div
              className="w-10 h-10 rounded shadow-md shrink-0"
              style={{ background: currentTrack.color }}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">{currentTrack.title}</p>
              <p className="text-xs text-muted-foreground truncate">{currentTrack.artist}</p>
            </div>
            <button onClick={() => toggleFavorite(currentTrack.id)} className="shrink-0">
              <Heart
                className={`w-4 h-4 ${
                  favorites.includes(currentTrack.id)
                    ? "fill-red-500 text-red-500"
                    : "text-muted-foreground hover:text-red-500"
                } transition-colors`}
              />
            </button>
          </div>

          {/* Player controls */}
          <div className="flex-1 flex flex-col items-center gap-1 max-w-[500px] mx-auto">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShuffle(!shuffle)}
                className={`transition-colors ${shuffle ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Shuffle className="w-4 h-4" />
              </button>
              <button onClick={handlePrev} className="text-foreground hover:text-primary transition">
                <SkipBack className="w-5 h-5" />
              </button>
              <button
                onClick={handlePlayPause}
                className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:scale-105 transition-transform"
              >
                {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
              <button onClick={handleNext} className="text-foreground hover:text-primary transition">
                <SkipForward className="w-5 h-5" />
              </button>
              <button
                onClick={toggleRepeat}
                className={`transition-colors relative ${
                  repeatMode !== "off" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Repeat className="w-4 h-4" />
                {repeatMode === "one" && (
                  <span className="absolute -top-1 -right-2 text-[8px] font-bold">1</span>
                )}
              </button>
            </div>
            <div className="flex items-center gap-2 w-full">
              <span className="text-[10px] text-muted-foreground font-mono w-9">
                {formatTime(progress)}
              </span>
              <div
                className="flex-1 h-1 rounded-full bg-muted cursor-pointer"
                onClick={handleSeek}
              >
                <div
                  className="h-full rounded-full bg-primary relative"
                  style={{ width: `${(progress / currentTrack.duration) * 100}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary opacity-0 hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono w-9">
                {formatTime(currentTrack.duration)}
              </span>
            </div>
          </div>

          {/* Volume control */}
          <div className="flex items-center gap-2 w-[120px] justify-end">
            <button
              onClick={() => setVolume(volume === 0 ? 70 : 0)}
              className="text-muted-foreground hover:text-foreground"
            >
              {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <div className="flex-1 h-1 rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${volume}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}