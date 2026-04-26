"use client"

import React from "react"

import { useState } from "react"
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Droplets, Eye, Thermometer } from "lucide-react"

const cities = [
  { name: "San Francisco", temp: 18, high: 21, low: 14, condition: "Partly Cloudy", humidity: 72, wind: 14, visibility: 16, feelsLike: 17, icon: "partlyCloudy" },
  { name: "New York", temp: 8, high: 11, low: 4, condition: "Cloudy", humidity: 65, wind: 22, visibility: 12, feelsLike: 5, icon: "cloudy" },
  { name: "Tokyo", temp: 15, high: 18, low: 12, condition: "Sunny", humidity: 55, wind: 8, visibility: 20, feelsLike: 16, icon: "sunny" },
  { name: "London", temp: 6, high: 8, low: 3, condition: "Rainy", humidity: 88, wind: 18, visibility: 8, feelsLike: 3, icon: "rainy" },
  { name: "Sydney", temp: 26, high: 29, low: 22, condition: "Sunny", humidity: 60, wind: 12, visibility: 25, feelsLike: 28, icon: "sunny" },
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

function WeatherIconSVG({ type, size = 24 }: { type: string; size?: number }) {
  switch (type) {
    case "sunny": return <Sun size={size} style={{ color: "#FDD835" }} />
    case "cloudy": return <Cloud size={size} style={{ color: "#90A4AE" }} />
    case "rainy": return <CloudRain size={size} style={{ color: "#64B5F6" }} />
    case "snowy": return <CloudSnow size={size} style={{ color: "#B0BEC5" }} />
    default: return (
      <div className="relative">
        <Sun size={size} style={{ color: "#FDD835" }} />
        <Cloud size={size * 0.7} className="absolute -bottom-0.5 -right-1" style={{ color: "#90A4AE" }} />
      </div>
    )
  }
}

export function WeatherApp() {
  const [selectedCity, setSelectedCity] = useState(0)
  const city = cities[selectedCity]

  return (
    <div className="h-full flex">
      {/* Sidebar */}
      <div
        className="w-[180px] shrink-0 py-3 overflow-y-auto"
        style={{ background: "rgba(238,237,240,0.95)", borderRight: "1px solid rgba(0,0,0,0.08)" }}
      >
        <div className="px-3 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#86868b" }}>Locations</span>
        </div>
        {cities.map((c, i) => (
          <button
            key={c.name}
            className={`w-full text-left px-3 py-2 mx-1 rounded-lg transition-colors text-[13px] ${
              selectedCity === i ? "font-semibold" : ""
            }`}
            style={{
              width: "calc(100% - 8px)",
              color: selectedCity === i ? "#0071e3" : "#1d1d1f",
              background: selectedCity === i ? "rgba(0,113,227,0.08)" : "transparent",
            }}
            onClick={() => setSelectedCity(i)}
          >
            <div className="flex items-center justify-between">
              <span>{c.name}</span>
              <span className="text-[13px]">{c.temp}°</span>
            </div>
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto" style={{ background: "linear-gradient(180deg, #4FC3F7 0%, #0288D1 100%)" }}>
        <div className="p-6 text-center">
          <h2 className="text-[15px] font-medium mb-1" style={{ color: "rgba(255,255,255,0.8)" }}>{city.name}</h2>
          <div className="text-[64px] font-extralight leading-none mb-1" style={{ color: "#ffffff" }}>{city.temp}°</div>
          <p className="text-[15px] mb-1" style={{ color: "rgba(255,255,255,0.8)" }}>{city.condition}</p>
          <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.6)" }}>
            H:{city.high}° L:{city.low}°
          </p>
        </div>

        {/* Hourly forecast */}
        <div
          className="mx-4 rounded-xl p-4 mb-4"
          style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)" }}
        >
          <p className="text-[11px] font-medium mb-3 uppercase" style={{ color: "rgba(255,255,255,0.6)" }}>Hourly Forecast</p>
          <div className="flex gap-4 overflow-x-auto pb-1">
            {hourlyData.map((h) => (
              <div key={h.time} className="flex flex-col items-center gap-1.5 shrink-0">
                <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.7)" }}>{h.time}</span>
                <WeatherIconSVG type={h.icon} size={18} />
                <span className="text-[13px] font-medium" style={{ color: "#ffffff" }}>{h.temp}°</span>
              </div>
            ))}
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-3 mx-4 pb-6">
          <DetailCard icon={<Thermometer size={14} />} label="Feels Like" value={`${city.feelsLike}°`} />
          <DetailCard icon={<Droplets size={14} />} label="Humidity" value={`${city.humidity}%`} />
          <DetailCard icon={<Wind size={14} />} label="Wind" value={`${city.wind} km/h`} />
          <DetailCard icon={<Eye size={14} />} label="Visibility" value={`${city.visibility} km`} />
        </div>
      </div>
    </div>
  )
}

function DetailCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div
      className="rounded-xl p-3"
      style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)" }}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <span style={{ color: "rgba(255,255,255,0.6)" }}>{icon}</span>
        <span className="text-[11px] uppercase" style={{ color: "rgba(255,255,255,0.6)" }}>{label}</span>
      </div>
      <span className="text-[22px] font-medium" style={{ color: "#ffffff" }}>{value}</span>
    </div>
  )
}
