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
} from "lucide-react"

interface MediaFile {
  id: string
  name: string
  url: string
  type: 'audio' | 'video'
  duration?: number
  size?: number
}

export function MediaPlayerApp() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentMedia, setCurrentMedia] = useState<MediaFile | null>(null)
  const [playlist, setPlaylist] = useState<MediaFile[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showPlaylist, setShowPlaylist] = useState(false)
  const [isShuffled, setIsShuffled] = useState(false)
  const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>('none')
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [isBuffering, setIsBuffering] = useState(false)

  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const previousVolumeRef = useRef(1)

  // Sample media files for demo
  useEffect(() => {
    const sampleFiles: MediaFile[] = [
      {
        id: '1',
        name: 'Sample Audio Track.mp3',
        url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
        type: 'audio'
      },
      {
        id: '2', 
        name: 'Demo Video.mp4',
        url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        type: 'video'
      }
    ]
    setPlaylist(sampleFiles)
    setCurrentMedia(sampleFiles[0])
  }, [])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!currentMedia) return
      const target = e.target as HTMLElement | null
      if (target?.tagName === "INPUT" || target?.tagName === "SELECT") return

      if (e.code === "Space") {
        e.preventDefault()
        handlePlayPause()
      } else if (e.code === "ArrowRight" && mediaRef.current) {
        mediaRef.current.currentTime = Math.min(mediaRef.current.currentTime + 10, duration || 0)
      } else if (e.code === "ArrowLeft" && mediaRef.current) {
        mediaRef.current.currentTime = Math.max(mediaRef.current.currentTime - 10, 0)
      } else if (e.key.toLowerCase() === "m") {
        toggleMute()
      } else if (e.key.toLowerCase() === "f" && currentMedia.type === "video") {
        toggleFullscreen()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [currentMedia, duration, isMuted, isPlaying, volume])

  useEffect(() => {
    if (!mediaRef.current || !currentMedia) return
    mediaRef.current.playbackRate = playbackRate
    mediaRef.current.volume = isMuted ? 0 : volume
    setCurrentTime(0)
    setDuration(0)
    setIsPlaying(false)
  }, [currentMedia, playbackRate, isMuted, volume])

  const handlePlayPause = () => {
    if (!mediaRef.current) return

    if (isPlaying) {
      mediaRef.current.pause()
    } else {
      mediaRef.current.play().catch(() => {
        setIsPlaying(false)
      })
    }
  }

  const handleTimeUpdate = () => {
    if (mediaRef.current) {
      setCurrentTime(mediaRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (mediaRef.current) {
      setDuration(Number.isFinite(mediaRef.current.duration) ? mediaRef.current.duration : 0)
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
    if (mediaRef.current) {
      mediaRef.current.volume = vol
    }
    const muted = vol === 0
    if (mediaRef.current) {
      mediaRef.current.muted = muted
    }
    setIsMuted(muted)
  }

  const toggleMute = () => {
    if (!mediaRef.current) return

    if (isMuted) {
      const restoredVolume = previousVolumeRef.current || 0.8
      mediaRef.current.muted = false
      mediaRef.current.volume = restoredVolume
      setVolume(restoredVolume)
      setIsMuted(false)
    } else {
      previousVolumeRef.current = volume > 0 ? volume : previousVolumeRef.current
      mediaRef.current.muted = true
      setIsMuted(true)
    }
  }

  const selectMediaByIndex = (index: number) => {
    const selected = playlist[index]
    if (!selected) return
    setCurrentMedia(selected)
    setCurrentIndex(index)
    setCurrentTime(0)
  }

  const handleNext = () => {
    if (playlist.length === 0) return

    if (isShuffled && playlist.length > 1) {
      let randomIndex = currentIndex
      while (randomIndex === currentIndex) {
        randomIndex = Math.floor(Math.random() * playlist.length)
      }
      selectMediaByIndex(randomIndex)
      return
    }

    const nextIndex = currentIndex + 1
    if (nextIndex >= playlist.length) {
      if (repeatMode === "all") {
        selectMediaByIndex(0)
      } else {
        setIsPlaying(false)
      }
      return
    }

    selectMediaByIndex(nextIndex)
  }

  const handlePrevious = () => {
    if (playlist.length === 0) return

    if (mediaRef.current && mediaRef.current.currentTime > 4) {
      mediaRef.current.currentTime = 0
      setCurrentTime(0)
      return
    }

    let prevIndex = currentIndex - 1
    if (prevIndex < 0) {
      prevIndex = repeatMode === 'all' ? playlist.length - 1 : 0
    }

    selectMediaByIndex(prevIndex)
  }

  const processIncomingFiles = (files: File[]) => {
    const acceptedFiles = files.filter((file) => file.type.startsWith("audio/") || file.type.startsWith("video/"))
    if (acceptedFiles.length === 0) return

    const newMediaFiles: MediaFile[] = acceptedFiles.map((file, index) => ({
      id: `upload-${Date.now()}-${index}`,
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video/') ? 'video' : 'audio',
      size: file.size
    }))

    setPlaylist((prev) => [...prev, ...newMediaFiles])
    if (!currentMedia && newMediaFiles.length > 0) {
      setCurrentMedia(newMediaFiles[0])
      setCurrentIndex(playlist.length)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    processIncomingFiles(files)
    e.target.value = ""
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFiles = Array.from(e.dataTransfer.files || [])
    processIncomingFiles(droppedFiles)
  }

  const handleMediaEnded = () => {
    if (repeatMode === 'one') {
      if (mediaRef.current) {
        mediaRef.current.currentTime = 0
        mediaRef.current.play()
      }
    } else {
      handleNext()
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return

    if (!isFullscreen) {
      containerRef.current.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
  }

  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate)
    if (mediaRef.current) {
      mediaRef.current.playbackRate = rate
    }
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      ref={containerRef}
      className="flex h-full flex-col bg-gradient-to-b from-zinc-900 via-neutral-900 to-black text-white"
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between border-b border-white/10 bg-black/30 px-4 py-2 backdrop-blur">
        <div className="flex items-center gap-2">
          <Film className="h-4 w-4 text-blue-300" />
          <span className="text-sm font-semibold text-zinc-200">Media Player</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500"
          >
            Import
          </button>
          <button
            onClick={() => setShowPlaylist((prev) => !prev)}
            className={`rounded-md p-2 hover:bg-white/10 ${showPlaylist ? "text-blue-300" : "text-zinc-300"}`}
            title="Toggle playlist"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Player Area */}
        <div className="flex-1 flex flex-col">
          {/* Media Display */}
          <div className="relative flex flex-1 items-center justify-center bg-black/60">
            {currentMedia ? (
              currentMedia.type === 'video' ? (
                <video
                  ref={mediaRef as React.RefObject<HTMLVideoElement>}
                  src={currentMedia.url}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={handleMediaEnded}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onWaiting={() => setIsBuffering(true)}
                  onPlaying={() => setIsBuffering(false)}
                  className="h-full w-full object-contain"
                  controls={false}
                />
              ) : (
                <div className="flex flex-col items-center justify-center space-y-4">
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
                  <div className="h-36 w-36 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 shadow-2xl shadow-blue-900/50 flex items-center justify-center">
                    <Music className="h-16 w-16 text-white" />
                  </div>
                  <div className="text-center px-4">
                    <h3 className="max-w-lg truncate text-xl font-semibold">{currentMedia.name}</h3>
                    <p className="text-sm text-zinc-400">Audio File</p>
                  </div>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center space-y-4 text-zinc-400">
                <div className="flex h-24 w-24 items-center justify-center rounded-xl border-2 border-dashed border-zinc-600">
                  <Upload className="h-8 w-8" />
                </div>
                <p>No media loaded</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-500"
                >
                  Load audio or video
                </button>
                <p className="text-xs text-zinc-500">You can also drag and drop files here.</p>
              </div>
            )}

            {isDragging && (
              <div className="absolute inset-0 flex items-center justify-center bg-blue-500/20 backdrop-blur-sm">
                <div className="rounded-xl border border-blue-300/40 bg-black/40 px-5 py-3 text-sm">
                  Drop media files to add to playlist
                </div>
              </div>
            )}

            {currentMedia?.type === 'video' && (
              <button
                onClick={toggleFullscreen}
                className="absolute right-4 top-4 rounded-md bg-black/50 p-2 hover:bg-black/70"
              >
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </button>
            )}

            {isBuffering && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-1 text-xs text-zinc-200">
                Buffering...
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="space-y-4 border-t border-white/10 bg-black/45 p-4">
            {/* Progress Bar */}
            <div className="flex items-center gap-2">
              <span className="w-12 text-sm text-zinc-400">{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="h-1 flex-1 cursor-pointer appearance-none rounded-lg bg-zinc-700"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${progressPercent}%, #52525b ${progressPercent}%, #52525b 100%)`
                }}
              />
              <span className="w-12 text-sm text-zinc-400">{formatTime(duration)}</span>
            </div>

            {/* Main Controls */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setIsShuffled(!isShuffled)}
                className={`rounded p-2 hover:bg-white/10 ${isShuffled ? 'text-blue-400' : 'text-zinc-400'}`}
                title="Shuffle"
              >
                <Shuffle className="h-5 w-5" />
              </button>

              <button
                onClick={handlePrevious}
                className="rounded p-2 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={playlist.length === 0}
              >
                <SkipBack className="h-6 w-6" />
              </button>

              <button
                onClick={handlePlayPause}
                className="rounded-full bg-blue-600 p-3 hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={!currentMedia}
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </button>

              <button
                onClick={handleNext}
                className="rounded p-2 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={playlist.length === 0}
              >
                <SkipForward className="h-6 w-6" />
              </button>

              <button
                onClick={() => setRepeatMode(repeatMode === 'none' ? 'all' : repeatMode === 'all' ? 'one' : 'none')}
                className={`relative rounded p-2 hover:bg-white/10 ${repeatMode !== 'none' ? 'text-blue-400' : 'text-zinc-400'}`}
                title={`Repeat: ${repeatMode}`}
              >
                <Repeat className="h-5 w-5" />
                {repeatMode === 'one' && <span className="absolute -right-0.5 -top-0.5 text-[10px] font-bold">1</span>}
              </button>
            </div>

            {/* Volume and Playback Speed */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button onClick={toggleMute} className="rounded p-1 hover:bg-white/10">
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="h-1 w-24 cursor-pointer appearance-none rounded-lg bg-zinc-700"
                />
              </div>

              <div className="flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-zinc-400" />
                <select
                  value={playbackRate}
                  onChange={(e) => handlePlaybackRateChange(parseFloat(e.target.value))}
                  className="rounded bg-zinc-800 px-2 py-1 text-sm text-white"
                >
                  <option value="0.5">0.5x</option>
                  <option value="0.75">0.75x</option>
                  <option value="1">1x</option>
                  <option value="1.25">1.25x</option>
                  <option value="1.5">1.5x</option>
                  <option value="2">2x</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Playlist Sidebar */}
        {showPlaylist && (
          <div className="flex w-80 flex-col border-l border-white/10 bg-zinc-900/80">
            <div className="border-b border-white/10 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Playlist</h3>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-500"
                >
                  Add Files
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {playlist.map((media, index) => (
                <div
                  key={media.id}
                  onClick={() => selectMediaByIndex(index)}
                  className={`cursor-pointer border-b border-white/5 p-3 hover:bg-white/5 ${
                    currentMedia?.id === media.id ? 'bg-white/10' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {media.type === 'video' ? (
                        <FileVideo className="h-5 w-5 text-blue-400" />
                      ) : (
                        <FileAudio className="h-5 w-5 text-green-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{media.name}</p>
                      <p className="text-xs capitalize text-zinc-400">{media.type}</p>
                    </div>
                  </div>
                </div>
              ))}

              {playlist.length === 0 && (
                <div className="p-8 text-center text-zinc-400">
                  <Music className="mx-auto mb-4 h-12 w-12 opacity-50" />
                  <p>No media files in playlist</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="audio/*,video/*"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  )
}