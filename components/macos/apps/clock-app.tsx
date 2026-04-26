"use client"

import { useState, useEffect } from "react"

const worldClocks = [
  { city: "San Francisco", timezone: "America/Los_Angeles", label: "PST" },
  { city: "New York", timezone: "America/New_York", label: "EST" },
  { city: "London", timezone: "Europe/London", label: "GMT" },
  { city: "Tokyo", timezone: "Asia/Tokyo", label: "JST" },
  { city: "Sydney", timezone: "Australia/Sydney", label: "AEST" },
  { city: "Dubai", timezone: "Asia/Dubai", label: "GST" },
]

export function ClockApp() {
  const [time, setTime] = useState(new Date())
  const [activeTab, setActiveTab] = useState<"world" | "stopwatch" | "timer">("world")
  const [stopwatchRunning, setStopwatchRunning] = useState(false)
  const [stopwatchTime, setStopwatchTime] = useState(0)
  const [timerMinutes, setTimerMinutes] = useState(5)
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerRemaining, setTimerRemaining] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!stopwatchRunning) return
    const interval = setInterval(() => setStopwatchTime((p) => p + 10), 10)
    return () => clearInterval(interval)
  }, [stopwatchRunning])

  useEffect(() => {
    if (!timerRunning || timerRemaining <= 0) {
      if (timerRemaining <= 0 && timerRunning) setTimerRunning(false)
      return
    }
    const interval = setInterval(() => setTimerRemaining((p) => Math.max(0, p - 1000)), 1000)
    return () => clearInterval(interval)
  }, [timerRunning, timerRemaining])

  const formatStopwatch = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    const centiseconds = Math.floor((ms % 1000) / 10)
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}.${centiseconds.toString().padStart(2, "0")}`
  }

  const formatTimer = (ms: number) => {
    const mins = Math.floor(ms / 60000)
    const secs = Math.floor((ms % 60000) / 1000)
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Analog clock hands
  const seconds = time.getSeconds()
  const minutes = time.getMinutes()
  const hours = time.getHours() % 12

  const secondAngle = seconds * 6
  const minuteAngle = minutes * 6 + seconds * 0.1
  const hourAngle = hours * 30 + minutes * 0.5

  return (
    <div className="h-full flex flex-col" style={{ background: "#fafafa" }}>
      {/* Tabs */}
      <div
        className="flex items-center justify-center gap-1 px-4 py-2 shrink-0"
        style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
      >
        {(["world", "stopwatch", "timer"] as const).map((tab) => (
          <button
            key={tab}
            className="px-4 py-1 rounded-lg text-[12px] capitalize transition-colors"
            style={{
              color: activeTab === tab ? "#0071e3" : "#86868b",
              background: activeTab === tab ? "rgba(0,113,227,0.08)" : "transparent",
              fontWeight: activeTab === tab ? 600 : 400,
            }}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "world" ? "World Clock" : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === "world" && (
          <div className="p-6">
            {/* Analog clock */}
            <div className="flex justify-center mb-6">
              <svg width="140" height="140" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r="65" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="2" />
                {/* Hour markers */}
                {Array.from({ length: 12 }).map((_, i) => {
                  const angle = ((i * 30 - 90) * Math.PI) / 180
                  const x1 = 70 + 55 * Math.cos(angle)
                  const y1 = 70 + 55 * Math.sin(angle)
                  const x2 = 70 + 60 * Math.cos(angle)
                  const y2 = 70 + 60 * Math.sin(angle)
                  return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#1d1d1f" strokeWidth="2" strokeLinecap="round" />
                })}
                {/* Hour hand */}
                <line
                  x1="70" y1="70"
                  x2={70 + 32 * Math.cos(((hourAngle - 90) * Math.PI) / 180)}
                  y2={70 + 32 * Math.sin(((hourAngle - 90) * Math.PI) / 180)}
                  stroke="#1d1d1f" strokeWidth="3.5" strokeLinecap="round"
                />
                {/* Minute hand */}
                <line
                  x1="70" y1="70"
                  x2={70 + 45 * Math.cos(((minuteAngle - 90) * Math.PI) / 180)}
                  y2={70 + 45 * Math.sin(((minuteAngle - 90) * Math.PI) / 180)}
                  stroke="#1d1d1f" strokeWidth="2.5" strokeLinecap="round"
                />
                {/* Second hand */}
                <line
                  x1="70" y1="70"
                  x2={70 + 50 * Math.cos(((secondAngle - 90) * Math.PI) / 180)}
                  y2={70 + 50 * Math.sin(((secondAngle - 90) * Math.PI) / 180)}
                  stroke="#FF3B30" strokeWidth="1" strokeLinecap="round"
                />
                <circle cx="70" cy="70" r="3" fill="#FF3B30" />
              </svg>
            </div>

            {/* World clocks */}
            <div className="space-y-1">
              {worldClocks.map((wc) => {
                const cityTime = new Date(time.toLocaleString("en-US", { timeZone: wc.timezone }))
                return (
                  <div
                    key={wc.city}
                    className="flex items-center justify-between px-4 py-2.5 rounded-xl"
                    style={{ background: "rgba(0,0,0,0.03)" }}
                  >
                    <div>
                      <p className="text-[13px] font-medium" style={{ color: "#1d1d1f" }}>{wc.city}</p>
                      <p className="text-[11px]" style={{ color: "#86868b" }}>{wc.label}</p>
                    </div>
                    <span className="text-[20px] font-light tabular-nums" style={{ color: "#1d1d1f" }}>
                      {cityTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === "stopwatch" && (
          <div className="flex flex-col items-center justify-center p-8 gap-6">
            <div className="text-[48px] font-light tabular-nums" style={{ color: "#1d1d1f" }}>
              {formatStopwatch(stopwatchTime)}
            </div>
            <div className="flex gap-4">
              <button
                className="w-[72px] h-[72px] rounded-full text-[14px] font-medium"
                style={{
                  background: "rgba(0,0,0,0.06)",
                  color: "#1d1d1f",
                }}
                onClick={() => {
                  setStopwatchRunning(false)
                  setStopwatchTime(0)
                }}
              >
                Reset
              </button>
              <button
                className="w-[72px] h-[72px] rounded-full text-[14px] font-medium"
                style={{
                  background: stopwatchRunning ? "rgba(255,59,48,0.12)" : "rgba(52,199,89,0.12)",
                  color: stopwatchRunning ? "#FF3B30" : "#34c759",
                }}
                onClick={() => setStopwatchRunning(!stopwatchRunning)}
              >
                {stopwatchRunning ? "Stop" : "Start"}
              </button>
            </div>
          </div>
        )}

        {activeTab === "timer" && (
          <div className="flex flex-col items-center justify-center p-8 gap-6">
            {!timerRunning && timerRemaining === 0 ? (
              <>
                <div className="flex items-center gap-4">
                  <button
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(0,0,0,0.06)" }}
                    onClick={() => setTimerMinutes(Math.max(1, timerMinutes - 1))}
                  >
                    <span style={{ color: "#1d1d1f" }}>-</span>
                  </button>
                  <span className="text-[48px] font-light tabular-nums" style={{ color: "#1d1d1f" }}>
                    {timerMinutes.toString().padStart(2, "0")}:00
                  </span>
                  <button
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(0,0,0,0.06)" }}
                    onClick={() => setTimerMinutes(timerMinutes + 1)}
                  >
                    <span style={{ color: "#1d1d1f" }}>+</span>
                  </button>
                </div>
                <button
                  className="w-[72px] h-[72px] rounded-full text-[14px] font-medium"
                  style={{ background: "rgba(52,199,89,0.12)", color: "#34c759" }}
                  onClick={() => {
                    setTimerRemaining(timerMinutes * 60000)
                    setTimerRunning(true)
                  }}
                >
                  Start
                </button>
              </>
            ) : (
              <>
                <div className="text-[48px] font-light tabular-nums" style={{ color: "#1d1d1f" }}>
                  {formatTimer(timerRemaining)}
                </div>
                <div className="flex gap-4">
                  <button
                    className="w-[72px] h-[72px] rounded-full text-[14px] font-medium"
                    style={{ background: "rgba(0,0,0,0.06)", color: "#1d1d1f" }}
                    onClick={() => {
                      setTimerRunning(false)
                      setTimerRemaining(0)
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="w-[72px] h-[72px] rounded-full text-[14px] font-medium"
                    style={{
                      background: timerRunning ? "rgba(255,59,48,0.12)" : "rgba(52,199,89,0.12)",
                      color: timerRunning ? "#FF3B30" : "#34c759",
                    }}
                    onClick={() => setTimerRunning(!timerRunning)}
                  >
                    {timerRunning ? "Pause" : "Resume"}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
