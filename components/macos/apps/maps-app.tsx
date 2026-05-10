"use client"

import { useState, useRef, useEffect } from "react"
import { 
  Search, 
  MapPin, 
  Navigation, 
  Layers, 
  Menu, 
  X, 
  ChevronRight,
  Compass,
  ZoomIn,
  ZoomOut,
  Star,
  Clock,
  Phone,
  Navigation2,
  Info,
  Share2
} from "lucide-react"

const locations = [
  { name: "San Francisco", lat: "37.7749", lng: "-122.4194", category: "City", rating: 4.8, description: "Cultural and financial center of Northern California." },
  { name: "Golden Gate Bridge", lat: "37.8199", lng: "-122.4783", category: "Landmark", rating: 4.9, description: "Iconic suspension bridge spanning the Golden Gate strait." },
  { name: "Alcatraz Island", lat: "37.8267", lng: "-122.4230", category: "Landmark", rating: 4.7, description: "Historic former prison island." },
  { name: "Fisherman's Wharf", lat: "37.8080", lng: "-122.4177", category: "Attraction", rating: 4.5, description: "Popular waterfront tourist area." },
  { name: "Union Square", lat: "37.7879", lng: "-122.4074", category: "Shopping", rating: 4.6, description: "Major shopping and hotel district." },
  { name: "Chinatown", lat: "37.7941", lng: "-122.4078", category: "Neighborhood", rating: 4.7, description: "One of the oldest Chinatowns in North America." },
]

export function MapsApp() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState(locations[0])
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [mapZoom, setMapZoom] = useState(1)
  const [mapCenter, setMapCenter] = useState({ x: 50, y: 50 }) // percentage for simulated map
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [showBottomSheet, setShowBottomSheet] = useState(true)
  const mapContainerRef = useRef<HTMLDivElement>(null)

  const filteredLocations = searchQuery
    ? locations.filter(l => 
        l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : locations

  const handleLocationSelect = (loc: typeof locations[0]) => {
    setSelectedLocation(loc)
    setIsSidebarOpen(false)
    setShowBottomSheet(true)
    // In a real map, you'd pan to the location; here we simulate by resetting center
    setMapCenter({ x: 50, y: 50 })
  }

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true)
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    setDragStart({ x: clientX, y: clientY })
  }

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    const deltaX = clientX - dragStart.x
    const deltaY = clientY - dragStart.y
    // Simulate panning by moving center (percentage)
    setMapCenter(prev => ({
      x: Math.min(100, Math.max(0, prev.x - (deltaX / (mapContainerRef.current?.clientWidth || 1)) * 20)),
      y: Math.min(100, Math.max(0, prev.y - (deltaY / (mapContainerRef.current?.clientHeight || 1)) * 20))
    }))
    setDragStart({ x: clientX, y: clientY })
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  const handleZoomIn = () => {
    setMapZoom(prev => Math.min(2, prev + 0.2))
  }

  const handleZoomOut = () => {
    setMapZoom(prev => Math.max(0.5, prev - 0.2))
  }

  const handleMyLocation = () => {
    setMapCenter({ x: 50, y: 50 })
    // Simulate centering on selected location? Not needed for demo
  }

  // Generate simulated map style with zoom effect
  const getMapStyle = () => {
    const zoomLevel = mapZoom
    const gridSize = Math.max(20, 40 / zoomLevel)
    const roadWidth = Math.max(2, 4 / zoomLevel)
    return { gridSize, roadWidth }
  }

  const { gridSize, roadWidth } = getMapStyle()
  const mapTransform = `scale(${mapZoom}) translate(${(mapCenter.x - 50) * 2}%, ${(mapCenter.y - 50) * 2}%)`

  return (
    <div className="h-full flex flex-col bg-gray-100 dark:bg-gray-900 relative overflow-hidden">
      {/* Top Bar with Search and Menu */}
      <div className="absolute top-0 left-0 right-0 z-20 p-3 bg-gradient-to-b from-black/40 to-transparent pointer-events-none">
        <div className="flex gap-2 pointer-events-auto">
          {/* Menu button */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center active:scale-95 transition-transform"
          >
            <Menu size={20} className="text-gray-700 dark:text-gray-300" />
          </button>

          {/* Search Bar */}
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-full shadow-md flex items-center px-4 py-2 gap-2">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search for places..."
              className="flex-1 bg-transparent outline-none text-sm text-gray-800 dark:text-gray-200 placeholder:text-gray-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")}>
                <X size={16} className="text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div
        ref={mapContainerRef}
        className="flex-1 relative overflow-hidden touch-none"
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        <div
          className="absolute inset-0 transition-transform duration-100 ease-out"
          style={{
            transform: mapTransform,
            transformOrigin: "center",
          }}
        >
          {/* Simulated Map Background */}
          <div
            className="absolute inset-0"
            style={{
              background: `
                linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 20%, #a5d6a7 40%, #81c784 60%, #c8e6c9 80%, #e8f5e9 100%)
              `,
            }}
          >
            {/* Grid Lines */}
            <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.2 }}>
              {Array.from({ length: Math.ceil(100 / (gridSize / 2)) }).map((_, i) => (
                <line
                  key={`h-${i}`}
                  x1="0"
                  y1={`${i * gridSize}%`}
                  x2="100%"
                  y2={`${i * gridSize}%`}
                  stroke="#1a1a1a"
                  strokeWidth="0.5"
                />
              ))}
              {Array.from({ length: Math.ceil(100 / (gridSize / 2)) }).map((_, i) => (
                <line
                  key={`v-${i}`}
                  x1={`${i * gridSize}%`}
                  y1="0"
                  x2={`${i * gridSize}%`}
                  y2="100%"
                  stroke="#1a1a1a"
                  strokeWidth="0.5"
                />
              ))}
              {/* Roads */}
              <line x1="10%" y1="30%" x2="90%" y2="30%" stroke="#ffffff" strokeWidth={roadWidth} />
              <line x1="10%" y1="60%" x2="90%" y2="60%" stroke="#ffffff" strokeWidth={roadWidth} />
              <line x1="30%" y1="10%" x2="30%" y2="90%" stroke="#ffffff" strokeWidth={roadWidth} />
              <line x1="60%" y1="10%" x2="60%" y2="90%" stroke="#ffffff" strokeWidth={roadWidth} />
              <line x1="20%" y1="10%" x2="80%" y2="90%" stroke="#ffffff" strokeWidth={roadWidth * 0.7} opacity="0.5" />
              {/* Water */}
              <rect x="70%" y="0" width="30%" height="25%" fill="#90CAF9" opacity="0.4" rx="8" />
            </svg>

            {/* Location Pin */}
            <div className="absolute" style={{ left: `${mapCenter.x}%`, top: `${mapCenter.y}%`, transform: "translate(-50%, -50%)" }}>
              <div className="relative flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-blue-500 shadow-lg flex items-center justify-center animate-bounce-in">
                  <MapPin size={20} className="text-white" />
                </div>
                <div className="mt-1 px-2 py-0.5 rounded-full bg-white dark:bg-gray-800 text-xs font-medium shadow-md whitespace-nowrap">
                  {selectedLocation.name}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map Controls */}
        <div className="absolute bottom-20 right-3 flex flex-col gap-2 z-10">
          <button
            onClick={handleZoomIn}
            className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center active:scale-95 transition-transform"
          >
            <ZoomIn size={18} className="text-gray-700 dark:text-gray-300" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center active:scale-95 transition-transform"
          >
            <ZoomOut size={18} className="text-gray-700 dark:text-gray-300" />
          </button>
          <button
            onClick={handleMyLocation}
            className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center active:scale-95 transition-transform"
          >
            <Compass size={18} className="text-gray-700 dark:text-gray-300" />
          </button>
          <button
            className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center active:scale-95 transition-transform"
          >
            <Layers size={18} className="text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        {/* My Location Button (additional) */}
        <button
          onClick={handleMyLocation}
          className="absolute bottom-20 left-3 w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center active:scale-95 transition-transform z-10"
        >
          <Navigation2 size={18} className="text-blue-500" />
        </button>
      </div>

      {/* Bottom Sheet for Location Details */}
      <div
        className={`
          absolute bottom-0 left-0 right-0 z-20 bg-white dark:bg-gray-900 rounded-t-2xl shadow-lg transition-transform duration-300 ease-in-out
          ${showBottomSheet ? "translate-y-0" : "translate-y-[calc(100%-64px)]"}
        `}
      >
        {/* Drag Handle */}
        <div
          className="w-full flex justify-center py-2 cursor-pointer"
          onClick={() => setShowBottomSheet(!showBottomSheet)}
        >
          <div className="w-10 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
        </div>

        <div className="p-4 pt-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedLocation.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400">
                  {selectedLocation.category}
                </span>
                <div className="flex items-center gap-0.5">
                  <Star size={12} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">{selectedLocation.rating}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 active:scale-95 transition-transform">
                <Share2 size={16} className="text-gray-600 dark:text-gray-400" />
              </button>
              <button className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 active:scale-95 transition-transform">
                <Info size={16} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{selectedLocation.description}</p>

          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <MapPin size={14} />
              <span>{selectedLocation.lat}, {selectedLocation.lng}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <Clock size={14} />
              <span>Open 24/7</span>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button className="flex-1 py-2 rounded-full bg-blue-500 text-white text-sm font-medium flex items-center justify-center gap-2 active:scale-95 transition-transform">
              <Navigation size={14} />
              Directions
            </button>
            <button className="flex-1 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium flex items-center justify-center gap-2 active:scale-95 transition-transform">
              <Phone size={14} />
              Call
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar (Slide-out) for Locations */}
      <div
        className={`
          fixed inset-0 z-30 bg-white dark:bg-gray-900 transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          w-80 max-w-[85%] shadow-xl
        `}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Places</h2>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-2">
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center gap-2 mb-3">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Filter places..."
              className="flex-1 bg-transparent outline-none text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-1 max-h-[calc(100vh-120px)] overflow-y-auto">
            {filteredLocations.map((loc) => (
              <button
                key={loc.name}
                onClick={() => handleLocationSelect(loc)}
                className={`
                  w-full flex items-center justify-between p-3 rounded-xl transition-all text-left
                  ${selectedLocation.name === loc.name
                    ? "bg-blue-50 dark:bg-blue-900/30"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <MapPin size={18} className={selectedLocation.name === loc.name ? "text-blue-500" : "text-gray-400"} />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{loc.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{loc.category}</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
              </button>
            ))}
            {filteredLocations.length === 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8 text-sm">
                No places found
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay for sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-25"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Add a simple animation keyframes (inject style) */}
      <style jsx>{`
        @keyframes bounce-in {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}