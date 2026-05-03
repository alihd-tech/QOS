"use client"

import { useState, useRef, useEffect } from "react"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Upload,
  Music,
  FileAudio,
  FileVideo,
  List,
  Shuffle,
  Repeat,
  Film,
  Clock3,
  Heart,
  MoreHorizontal,
  Disc,
} from "lucide-react"

interface MediaFile {
  id: string
  name: string
  url: string
  type: "audio" | "video"
  duration?: number
  size?: number
}

export function MediaPlayerApp() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentMedia, setCurrentMedia] = useState<MediaFile | null>(null)
  const [playlist, setPlaylist] = useState<MediaFile[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showPlaylist, setShowPlaylist] = useState(true) // default open on larger screens
  const [isShuffled, setIsShuffled] = useState(false)
  const [repeatMode, setRepeatMode] = useState<"none" | "one" | "all">("none")
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [isBuffering, setIsBuffering] = useState(false)

  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const previousVolumeRef = useRef(0.8)

  // Sample demo media (replace with your own or keep for testing)
  useEffect(() => {
    const sampleFiles: MediaFile[] = [
      {
        id: "1",
        name: "Ambient Piano",
        url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
        type: "audio",
      },
      {
        id: "2",
        name: "Sample Video",
        url: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        type: "video",
      },
    ]
    setPlaylist(sampleFiles)
    setCurrentMedia(sampleFiles[0])
  }, [])

  // Sync volume with media element
  useEffect(() => {
    if (mediaRef.current) {
      mediaRef.current.volume = isMuted ? 0 : volume
      mediaRef.current.muted = isMuted
    }
  }, [volume, isMuted])

  // Fullscreen listener
  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!currentMedia) return
      const target = e.target as HTMLElement
      if (target?.tagName === "INPUT" || target?.tagName === "SELECT") return

      if (e.code === "Space") {
        e.preventDefault()
        handlePlayPause()
      } else if (e.code === "ArrowRight" && mediaRef.current) {
        mediaRef.current.currentTime = Math.min(mediaRef.current.currentTime + 10, duration)
      } else if (e.code === "ArrowLeft" && mediaRef.current) {
        mediaRef.current.currentTime = Math.max(mediaRef.current.currentTime - 10, 0)
      } else if (e.key === "m") {
        toggleMute()
      } else if (e.key === "f" && currentMedia.type === "video") {
        toggleFullscreen()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [currentMedia, duration])

  const handlePlayPause = () => {
    if (!mediaRef.current) return
    if (isPlaying) {
      mediaRef.current.pause()
    } else {
      mediaRef.current.play().catch(() => setIsPlaying(false))
    }
  }

  const handleTimeUpdate = () => {
    if (mediaRef.current) setCurrentTime(mediaRef.current.currentTime)
  }

  const handleLoadedMetadata = () => {
    if (mediaRef.current && Number.isFinite(mediaRef.current.duration)) {
      setDuration(mediaRef.current.duration)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    if (mediaRef.current) {
      mediaRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value)
    setVolume(vol)
    previousVolumeRef.current = vol > 0 ? vol : previousVolumeRef.current
    if (vol === 0) setIsMuted(true)
    else if (isMuted) setIsMuted(false)
  }

  const toggleMute = () => {
    if (isMuted) {
      setVolume(previousVolumeRef.current)
      setIsMuted(false)
    } else {
      previousVolumeRef.current = volume
      setVolume(0)
      setIsMuted(true)
    }
  }

  const selectMediaByIndex = (index: number) => {
    const selected = playlist[index]
    if (!selected) return
    setCurrentMedia(selected)
    setCurrentIndex(index)
    setCurrentTime(0)
    setIsPlaying(false) // will auto-play after metadata? we can call .play() but let media element handle
    if (mediaRef.current) {
      mediaRef.current.load()
      mediaRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
    }
  }

  const handleNext = () => {
    if (playlist.length === 0) return
    if (isShuffled && playlist.length > 1) {
      let newIndex = currentIndex
      while (newIndex === currentIndex) newIndex = Math.floor(Math.random() * playlist.length)
      selectMediaByIndex(newIndex)
    } else {
      let nextIndex = currentIndex + 1
      if (nextIndex >= playlist.length) {
        if (repeatMode === "all") nextIndex = 0
        else return
      }
      selectMediaByIndex(nextIndex)
    }
  }

  const handlePrevious = () => {
    if (playlist.length === 0) return
    if (mediaRef.current && mediaRef.current.currentTime > 3) {
      mediaRef.current.currentTime = 0
      setCurrentTime(0)
      return
    }
    let prevIndex = currentIndex - 1
    if (prevIndex < 0) {
      if (repeatMode === "all") prevIndex = playlist.length - 1
      else return
    }
    selectMediaByIndex(prevIndex)
  }

  const handleMediaEnded = () => {
    if (repeatMode === "one") {
      mediaRef.current?.play()
    } else {
      handleNext()
    }
  }

  const processIncomingFiles = (files: File[]) => {
    const accepted = files.filter(f => f.type.startsWith("audio/") || f.type.startsWith("video/"))
    if (accepted.length === 0) return
    const newMedia: MediaFile[] = accepted.map((file, i) => ({
      id: `upload-${Date.now()}-${i}`,
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type.startsWith("video/") ? "video" : "audio",
      size: file.size,
    }))
    setPlaylist(prev => [...prev, ...newMedia])
    if (!currentMedia && newMedia.length) {
      setCurrentMedia(newMedia[0])
      setCurrentIndex(playlist.length)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    processIncomingFiles(Array.from(e.target.files || []))
    e.target.value = ""
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    processIncomingFiles(Array.from(e.dataTransfer.files))
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!isFullscreen) containerRef.current.requestFullscreen()
    else document.exitFullscreen()
  }

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60)
    const secs = Math.floor(time % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      ref={containerRef}
      className="h-full flex flex-col bg-background"
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-card/30">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Film className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Media Player</h2>
            <p className="text-xs text-muted-foreground">Audio & video with playlist</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90">
            <Upload className="w-3.5 h-3.5" /> Import
            <input type="file" multiple accept="audio/*,video/*" onChange={handleFileUpload} className="hidden" />
          </label>
          <button
            onClick={() => setShowPlaylist(!showPlaylist)}
            className={`p-2 rounded-lg hover:bg-muted transition-colors ${showPlaylist ? "text-primary" : "text-muted-foreground"}`}
            title="Toggle playlist"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main content: Now Playing + controls */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Media area */}
          <div className="relative flex-1 flex items-center justify-center bg-muted/20 rounded-lg m-4 overflow-hidden">
            {currentMedia ? (
              currentMedia.type === "video" ? (
                <video
                  ref={mediaRef as React.RefObject<HTMLVideoElement>}
                  src={currentMedia.url}
                  className="w-full h-full object-contain rounded-lg"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={handleMediaEnded}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onWaiting={() => setIsBuffering(true)}
                  onPlaying={() => setIsBuffering(false)}
                  controls={false}
                  autoPlay={false}
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-6 p-6">
                  <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center shadow-xl">
                    <Music className="w-20 h-20 text-primary" />
                  </div>
                  <div className="text-center max-w-md">
                    <h3 className="text-xl font-semibold text-foreground truncate">{currentMedia.name}</h3>
                    <p className="text-sm text-muted-foreground">Audio track</p>
                  </div>
                  <audio
                    ref={mediaRef as React.RefObject<HTMLAudioElement>}
                    src={currentMedia.url}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={handleMediaEnded}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onWaiting={() => setIsBuffering(true)}
                    onPlaying={() => setIsBuffering(false)}
                  />
                </div>
              )
            ) : (
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <Disc className="w-16 h-16 opacity-30" />
                <p className="text-sm">No media loaded</p>
                <label className="cursor-pointer px-4 py-2 bg-primary text-primary-foreground rounded-full text-xs font-medium">
                  Browse files
                  <input type="file" multiple accept="audio/*,video/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            )}

            {/* Video fullscreen toggle */}
            {currentMedia?.type === "video" && (
              <button
                onClick={toggleFullscreen}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/40 text-white hover:bg-black/60"
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>
            )}
            {isBuffering && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 rounded-full px-3 py-0.5 text-xs text-white">
                Buffering...
              </div>
            )}
          </div>

          {/* Controls panel */}
          <div className="p-4 border-t border-border bg-card/40 rounded-t-xl mt-auto space-y-3">
            {/* Progress bar */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="w-9">{formatTime(currentTime)}</span>
              <div className="flex-1 h-1.5 bg-muted rounded-full cursor-pointer group">
                <div className="relative h-full bg-primary rounded-full transition-all" style={{ width: `${progressPercent}%` }}>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition" />
                </div>
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <span className="w-9">{formatTime(duration)}</span>
            </div>

            {/* Main control buttons */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setIsShuffled(!isShuffled)}
                className={`p-2 rounded-full transition-colors ${isShuffled ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
              >
                <Shuffle className="w-4 h-4" />
              </button>
              <button
                onClick={handlePrevious}
                disabled={!currentMedia}
                className="p-2 rounded-full hover:bg-muted disabled:opacity-30"
              >
                <SkipBack className="w-5 h-5" />
              </button>
              <button
                onClick={handlePlayPause}
                disabled={!currentMedia}
                className="p-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>
              <button
                onClick={handleNext}
                disabled={!currentMedia}
                className="p-2 rounded-full hover:bg-muted disabled:opacity-30"
              >
                <SkipForward className="w-5 h-5" />
              </button>
              <button
                onClick={() => setRepeatMode(mode => mode === "none" ? "all" : mode === "all" ? "one" : "none")}
                className={`p-2 rounded-full transition-colors ${repeatMode !== "none" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
              >
                <Repeat className="w-4 h-4" />
                {repeatMode === "one" && <span className="absolute text-[10px] font-bold">1</span>}
              </button>
            </div>

            {/* Bottom row: volume, speed, extra */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <button onClick={toggleMute} className="p-1 text-muted-foreground hover:text-foreground">
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <div className="w-24 h-1 bg-muted rounded-full relative">
                  <div className="absolute h-full bg-primary rounded-full" style={{ width: `${isMuted ? 0 : volume * 100}%` }} />
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock3 className="w-3.5 h-3.5" />
                <select
                  value={playbackRate}
                  onChange={(e) => { const rate = parseFloat(e.target.value); setPlaybackRate(rate); if (mediaRef.current) mediaRef.current.playbackRate = rate }}
                  className="bg-transparent border-none text-xs font-medium focus:outline-none"
                >
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                    <option key={rate} value={rate}>{rate}x</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Playlist sidebar (conditionally shown) */}
        {showPlaylist && (
          <div className="w-80 border-l border-border bg-card/50 flex flex-col shrink-0">
            <div className="p-4 border-b border-border flex justify-between items-center">
              <h3 className="font-medium text-sm text-foreground">Playlist</h3>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-primary hover:underline"
              >
                Add files
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {playlist.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-8">Empty – drop media here</div>
              )}
              {playlist.map((media, idx) => {
                const isCurrent = currentMedia?.id === media.id
                return (
                  <div
                    key={media.id}
                    onClick={() => selectMediaByIndex(idx)}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                      isCurrent ? "bg-primary/10 text-primary" : "hover:bg-muted"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-md flex items-center justify-center ${isCurrent ? "bg-primary/20" : "bg-muted"}`}>
                      {media.type === "video" ? <FileVideo className="w-4 h-4" /> : <FileAudio className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{media.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{media.type}</p>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 p-1">
                      <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Hidden file input for standalone add */}
      <input ref={fileInputRef} type="file" multiple accept="audio/*,video/*" onChange={handleFileUpload} className="hidden" />
    </div>
  )
}

export default MediaPlayerApp