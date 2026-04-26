"use client"

import { useState } from "react"
import { Search, MapPin, Navigation, Layers } from "lucide-react"

const locations = [
  { name: "San Francisco", lat: "37.7749", lng: "-122.4194", category: "City" },
  { name: "Golden Gate Bridge", lat: "37.8199", lng: "-122.4783", category: "Landmark" },
  { name: "Alcatraz Island", lat: "37.8267", lng: "-122.4230", category: "Landmark" },
  { name: "Fisherman's Wharf", lat: "37.8080", lng: "-122.4177", category: "Attraction" },
  { name: "Union Square", lat: "37.7879", lng: "-122.4074", category: "Shopping" },
  { name: "Chinatown", lat: "37.7941", lng: "-122.4078", category: "Neighborhood" },
]

export function MapsApp() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState(locations[0])

  const filtered = searchQuery
    ? locations.filter((l) => l.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : locations

  return (
    <div className="h-full flex" style={{ background: "#fafafa" }}>
      {/* Sidebar */}
      <div
        className="w-[220px] shrink-0 flex flex-col"
        style={{ borderRight: "1px solid rgba(0,0,0,0.06)" }}
      >
        <div className="p-3" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <div
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px]"
            style={{ background: "rgba(0,0,0,0.04)" }}
          >
            <Search className="w-3.5 h-3.5 opacity-40 shrink-0" />
            <input
              type="text"
              placeholder="Search Maps"
              className="bg-transparent outline-none text-[12px] w-full"
              style={{ color: "#1d1d1f" }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {filtered.map((loc) => (
            <button
              key={loc.name}
              className="w-full text-left px-3 py-2 mx-1 rounded-lg transition-colors"
              style={{
                width: "calc(100% - 8px)",
                color: selectedLocation.name === loc.name ? "#0071e3" : "#1d1d1f",
                background: selectedLocation.name === loc.name ? "rgba(0,113,227,0.08)" : "transparent",
              }}
              onClick={() => setSelectedLocation(loc)}
            >
              <div className="flex items-center gap-2">
                <MapPin size={14} style={{ color: selectedLocation.name === loc.name ? "#0071e3" : "#86868b" }} />
                <div>
                  <p className="text-[13px] font-medium">{loc.name}</p>
                  <p className="text-[11px]" style={{ color: "#86868b" }}>{loc.category}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Map area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Simulated map */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 20%, #a5d6a7 40%, #81c784 60%, #c8e6c9 80%, #e8f5e9 100%)
            `,
          }}
        >
          {/* Grid lines simulating a map */}
          <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.15 }}>
            {Array.from({ length: 20 }).map((_, i) => (
              <line key={`h-${i}`} x1="0" y1={`${i * 5}%`} x2="100%" y2={`${i * 5}%`} stroke="#1a1a1a" strokeWidth="0.5" />
            ))}
            {Array.from({ length: 20 }).map((_, i) => (
              <line key={`v-${i}`} x1={`${i * 5}%`} y1="0" x2={`${i * 5}%`} y2="100%" stroke="#1a1a1a" strokeWidth="0.5" />
            ))}
            {/* Roads */}
            <line x1="10%" y1="30%" x2="90%" y2="30%" stroke="#ffffff" strokeWidth="3" />
            <line x1="10%" y1="60%" x2="90%" y2="60%" stroke="#ffffff" strokeWidth="3" />
            <line x1="30%" y1="10%" x2="30%" y2="90%" stroke="#ffffff" strokeWidth="3" />
            <line x1="60%" y1="10%" x2="60%" y2="90%" stroke="#ffffff" strokeWidth="3" />
            <line x1="20%" y1="10%" x2="80%" y2="90%" stroke="#ffffff" strokeWidth="2" opacity="0.5" />
            {/* Water body */}
            <rect x="70%" y="0" width="30%" height="25%" fill="#90CAF9" opacity="0.4" rx="8" />
          </svg>

          {/* Location pin */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
              style={{ background: "#0071e3" }}
            >
              <MapPin size={16} style={{ color: "#ffffff" }} />
            </div>
            <div
              className="mt-1 px-2 py-0.5 rounded text-[11px] font-medium shadow"
              style={{ background: "#ffffff", color: "#1d1d1f" }}
            >
              {selectedLocation.name}
            </div>
          </div>
        </div>

        {/* Map controls */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <button
            className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md"
            style={{ background: "rgba(255,255,255,0.9)" }}
          >
            <Navigation size={14} style={{ color: "#1d1d1f" }} />
          </button>
          <button
            className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md"
            style={{ background: "rgba(255,255,255,0.9)" }}
          >
            <Layers size={14} style={{ color: "#1d1d1f" }} />
          </button>
        </div>

        {/* Location info card */}
        <div
          className="absolute bottom-3 left-3 right-3 rounded-xl p-3 shadow-lg"
          style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(20px)" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[14px] font-semibold" style={{ color: "#1d1d1f" }}>{selectedLocation.name}</h3>
              <p className="text-[12px]" style={{ color: "#86868b" }}>
                {selectedLocation.lat}, {selectedLocation.lng}
              </p>
            </div>
            <button
              className="px-3 py-1 rounded-full text-[12px] font-medium"
              style={{ background: "#0071e3", color: "#ffffff" }}
            >
              Directions
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
