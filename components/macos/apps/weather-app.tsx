"use client"

import React, { useState, useEffect } from "react"
import { 
  Cloud, Sun, CloudRain, CloudSnow, Wind, Droplets, Eye, Thermometer, 
  Search, MapPin, Calendar, Sunrise, Sunset, Navigation, X,
  CloudLightning, CloudFog, CloudDrizzle, Moon, Star
} from "lucide-react"

// Extended weather data with more details
const cities = [
  { 
    id: 1, name: "San Francisco", country: "US", temp: 18, high: 21, low: 14, 
    condition: "Partly Cloudy", humidity: 72, wind: 14, visibility: 16, feelsLike: 17, 
    pressure: 1012, uvIndex: 5, sunrise: "6:42 AM", sunset: "7:15 PM", 
    icon: "partlyCloudy", lat: 37.7749, lon: -122.4194,
    forecast: [
      { day: "Mon", high: 19, low: 12, icon: "sunny" },
      { day: "Tue", high: 20, low: 13, icon: "partlyCloudy" },
      { day: "Wed", high: 18, low: 12, icon: "cloudy" },
      { day: "Thu", high: 17, low: 11, icon: "rainy" },
      { day: "Fri", high: 19, low: 13, icon: "sunny" },
    ]
  },
  { 
    id: 2, name: "New York", country: "US", temp: 8, high: 11, low: 4, 
    condition: "Cloudy", humidity: 65, wind: 22, visibility: 12, feelsLike: 5, 
    pressure: 1015, uvIndex: 2, sunrise: "6:15 AM", sunset: "7:30 PM", 
    icon: "cloudy", lat: 40.7128, lon: -74.0060,
    forecast: [
      { day: "Mon", high: 10, low: 3, icon: "cloudy" },
      { day: "Tue", high: 9, low: 2, icon: "rainy" },
      { day: "Wed", high: 12, low: 5, icon: "partlyCloudy" },
      { day: "Thu", high: 11, low: 4, icon: "cloudy" },
      { day: "Fri", high: 13, low: 6, icon: "sunny" },
    ]
  },
  { 
    id: 3, name: "Tokyo", country: "JP", temp: 15, high: 18, low: 12, 
    condition: "Sunny", humidity: 55, wind: 8, visibility: 20, feelsLike: 16, 
    pressure: 1010, uvIndex: 6, sunrise: "5:30 AM", sunset: "6:45 PM", 
    icon: "sunny", lat: 35.6895, lon: 139.6917,
    forecast: [
      { day: "Mon", high: 19, low: 13, icon: "sunny" },
      { day: "Tue", high: 20, low: 14, icon: "sunny" },
      { day: "Wed", high: 18, low: 12, icon: "partlyCloudy" },
      { day: "Thu", high: 17, low: 11, icon: "cloudy" },
      { day: "Fri", high: 19, low: 13, icon: "sunny" },
    ]
  },
  { 
    id: 4, name: "London", country: "GB", temp: 6, high: 8, low: 3, 
    condition: "Rainy", humidity: 88, wind: 18, visibility: 8, feelsLike: 3, 
    pressure: 1008, uvIndex: 1, sunrise: "6:55 AM", sunset: "7:10 PM", 
    icon: "rainy", lat: 51.5074, lon: -0.1278,
    forecast: [
      { day: "Mon", high: 7, low: 2, icon: "rainy" },
      { day: "Tue", high: 8, low: 3, icon: "rainy" },
      { day: "Wed", high: 9, low: 4, icon: "cloudy" },
      { day: "Thu", high: 10, low: 5, icon: "partlyCloudy" },
      { day: "Fri", high: 11, low: 6, icon: "sunny" },
    ]
  },
  { 
    id: 5, name: "Sydney", country: "AU", temp: 26, high: 29, low: 22, 
    condition: "Sunny", humidity: 60, wind: 12, visibility: 25, feelsLike: 28, 
    pressure: 1016, uvIndex: 8, sunrise: "6:10 AM", sunset: "7:25 PM", 
    icon: "sunny", lat: -33.8688, lon: 151.2093,
    forecast: [
      { day: "Mon", high: 30, low: 23, icon: "sunny" },
      { day: "Tue", high: 28, low: 21, icon: "partlyCloudy" },
      { day: "Wed", high: 27, low: 20, icon: "cloudy" },
      { day: "Thu", high: 26, low: 19, icon: "rainy" },
      { day: "Fri", high: 28, low: 21, icon: "sunny" },
    ]
  },
]

const hourlyData = [
  { time: "Now", temp: 18, icon: "partlyCloudy" },
  { time: "1PM", temp: 19, icon: "sunny" },
  { time: "2PM", temp: 20, icon: "sunny" },
  { time: "3PM", temp: 21, icon: "sunny" },
  { time: "4PM", temp: 20, icon: "partlyCloudy" },
  { time: "5PM", temp: 19, icon: "partlyCloudy" },
  { time: "6PM", temp: 17, icon: "cloudy" },
  { time: "7PM", temp: 16, icon: "cloudy" },
  { time: "8PM", temp: 15, icon: "cloudy" },
]

// Improved icon component with better visuals
function WeatherIcon({ type, size = 24, className = "" }: { type: string; size?: number; className?: string }) {
  const icons: Record<string, React.ReactNode> = {
    sunny: <Sun size={size} className="text-yellow-400 drop-shadow-sm" />,
    partlyCloudy: (
      <div className="relative">
        <Sun size={size * 0.7} className="text-yellow-400 absolute -top-1 -left-1" />
        <Cloud size={size} className="text-gray-300" />
      </div>
    ),
    cloudy: <Cloud size={size} className="text-gray-300" />,
    rainy: <CloudRain size={size} className="text-blue-300" />,
    snowy: <CloudSnow size={size} className="text-blue-200" />,
    thunderstorm: <CloudLightning size={size} className="text-purple-300" />,
    drizzle: <CloudDrizzle size={size} className="text-blue-200" />,
    foggy: <CloudFog size={size} className="text-gray-400" />,
    night: <Moon size={size} className="text-indigo-200" />,
  }
  return icons[type] || <Cloud size={size} className="text-gray-300" />
}

function DetailCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white/20 backdrop-blur-md rounded-2xl p-3 transition-all hover:bg-white/30">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-white/70">{icon}</span>
        <span className="text-[10px] uppercase tracking-wider text-white/70">{label}</span>
      </div>
      <span className="text-xl font-semibold text-white">{value}</span>
    </div>
  )
}

export function WeatherApp() {
  const [selectedCityId, setSelectedCityId] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [unit, setUnit] = useState<"C" | "F">("C")
  
  const city = cities.find(c => c.id === selectedCityId) || cities[0]
  const filteredCities = cities.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.country.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Convert temperature if needed
  const convertTemp = (tempC: number) => unit === "C" ? tempC : Math.round(tempC * 9/5 + 32)
  const displayTemp = convertTemp(city.temp)
  const displayHigh = convertTemp(city.high)
  const displayLow = convertTemp(city.low)
  const displayFeelsLike = convertTemp(city.feelsLike)

  // Get background gradient based on weather condition and time (simulated)
  const getBgGradient = () => {
    const condition = city.condition.toLowerCase()
    if (condition.includes("sunny")) return "from-sky-500 via-blue-500 to-indigo-600"
    if (condition.includes("cloudy")) return "from-gray-500 via-gray-600 to-slate-700"
    if (condition.includes("rain")) return "from-blue-700 via-blue-800 to-indigo-900"
    if (condition.includes("snow")) return "from-cyan-400 via-blue-400 to-indigo-500"
    return "from-sky-600 via-blue-600 to-indigo-700"
  }

  return (
    <div className="h-full flex flex-col lg:flex-row bg-gradient-to-br overflow-hidden rounded-2xl shadow-2xl">
      {/* Sidebar - responsive collapsible on mobile */}
      <div className={`
        ${isSearchOpen ? "absolute inset-0 z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg lg:relative lg:bg-transparent" : "w-full lg:w-72"}
        lg:block lg:bg-white/10 lg:backdrop-blur-md lg:border-r lg:border-white/20 transition-all duration-300
      `}>
        <div className="p-4">
          {/* Search header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-sm uppercase tracking-wider hidden lg:block">Locations</h2>
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="lg:hidden p-2 rounded-full bg-white/20 text-white"
            >
              {isSearchOpen ? <X size={20} /> : <Search size={20} />}
            </button>
            {!isSearchOpen && (
              <button 
                onClick={() => setUnit(unit === "C" ? "F" : "C")}
                className="text-white text-xs font-medium bg-white/20 px-2 py-1 rounded-full"
              >
                °{unit}
              </button>
            )}
          </div>

          {/* Search input */}
          {isSearchOpen && (
            <div className="mb-4">
              <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-2">
                <Search size={16} className="text-white/70" />
                <input
                  type="text"
                  placeholder="Search city..."
                  className="bg-transparent flex-1 outline-none text-white placeholder:text-white/50 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")}>
                    <X size={14} className="text-white/70" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* City list */}
          <div className="space-y-1 max-h-[calc(100vh-120px)] overflow-y-auto">
            {(searchQuery ? filteredCities : cities).map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedCityId(c.id)
                  setIsSearchOpen(false)
                  setSearchQuery("")
                }}
                className={`
                  w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all
                  ${selectedCityId === c.id ? "bg-white/30 text-white shadow-md" : "text-white/80 hover:bg-white/20"}
                `}
              >
                <div className="flex items-center gap-2">
                  <MapPin size={14} />
                  <span className="text-sm font-medium">{c.name}</span>
                  <span className="text-xs text-white/50">{c.country}</span>
                </div>
                <span className="text-sm font-semibold">{convertTemp(c.temp)}°{unit}</span>
              </button>
            ))}
            {searchQuery && filteredCities.length === 0 && (
              <div className="text-center text-white/70 py-4 text-sm">No cities found</div>
            )}
          </div>
        </div>
      </div>

      {/* Main weather display */}
      <div className={`flex-1 overflow-y-auto bg-gradient-to-br ${getBgGradient()} p-5 transition-all duration-500`}>
        {/* City header with temperature unit toggle for mobile */}
        <div className="flex justify-between items-start mb-4 lg:hidden">
          <div>
            <h1 className="text-white text-2xl font-bold">{city.name}</h1>
            <p className="text-white/80 text-sm">{city.country}</p>
          </div>
          <button 
            onClick={() => setUnit(unit === "C" ? "F" : "C")}
            className="text-white text-xs font-medium bg-white/20 px-2 py-1 rounded-full"
          >
            °{unit}
          </button>
        </div>

        {/* Current weather */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2">
            <WeatherIcon type={city.icon} size={80} />
          </div>
          <div className="text-7xl font-light text-white tracking-tighter">
            {displayTemp}°{unit}
          </div>
          <p className="text-white/90 text-lg mt-1">{city.condition}</p>
          <p className="text-white/70 text-sm">
            H: {displayHigh}° L: {displayLow}°
          </p>
          <p className="text-white/60 text-xs mt-1">
            Feels like {displayFeelsLike}°{unit}
          </p>
        </div>

        {/* Hourly forecast */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-5 overflow-x-auto">
          <p className="text-white/70 text-xs uppercase tracking-wider mb-3 flex items-center gap-1">
            <Calendar size={12} /> Hourly Forecast
          </p>
          <div className="flex gap-5 min-w-max">
            {hourlyData.map((h) => (
              <div key={h.time} className="flex flex-col items-center gap-1">
                <span className="text-white/80 text-xs">{h.time}</span>
                <WeatherIcon type={h.icon} size={24} />
                <span className="text-white font-medium text-sm">{convertTemp(h.temp)}°</span>
              </div>
            ))}
          </div>
        </div>

        {/* 5-day forecast */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-5">
          <p className="text-white/70 text-xs uppercase tracking-wider mb-3 flex items-center gap-1">
            <Calendar size={12} /> 5-Day Forecast
          </p>
          <div className="space-y-2">
            {city.forecast.map((day) => (
              <div key={day.day} className="flex items-center justify-between">
                <span className="text-white/90 text-sm w-12">{day.day}</span>
                <WeatherIcon type={day.icon} size={20} />
                <div className="flex gap-3 text-sm">
                  <span className="text-white/80">{convertTemp(day.high)}°</span>
                  <span className="text-white/50">{convertTemp(day.low)}°</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional details grid */}
        <div className="grid grid-cols-2 gap-3">
          <DetailCard icon={<Thermometer size={14} />} label="Feels Like" value={`${displayFeelsLike}°${unit}`} />
          <DetailCard icon={<Droplets size={14} />} label="Humidity" value={`${city.humidity}%`} />
          <DetailCard icon={<Wind size={14} />} label="Wind" value={`${city.wind} km/h`} />
          <DetailCard icon={<Eye size={14} />} label="Visibility" value={`${city.visibility} km`} />
          <DetailCard icon={<Navigation size={14} />} label="Pressure" value={`${city.pressure} hPa`} />
          <DetailCard icon={<Star size={14} />} label="UV Index" value={`${city.uvIndex}`} />
          <DetailCard icon={<Sunrise size={14} />} label="Sunrise" value={city.sunrise} />
          <DetailCard icon={<Sunset size={14} />} label="Sunset" value={city.sunset} />
        </div>
      </div>
    </div>
  )
}