"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

const events = [
  { day: 5, title: "Team Standup", time: "9:00 AM", color: "#0071e3" },
  { day: 5, title: "Lunch with Alex", time: "12:30 PM", color: "#34c759" },
  { day: 8, title: "Design Review", time: "2:00 PM", color: "#FF9500" },
  { day: 12, title: "Sprint Planning", time: "10:00 AM", color: "#0071e3" },
  { day: 15, title: "Birthday Party", time: "6:00 PM", color: "#FF3B30" },
  { day: 18, title: "Doctor Appointment", time: "3:00 PM", color: "#AF52DE" },
  { day: 22, title: "Project Deadline", time: "5:00 PM", color: "#FF3B30" },
  { day: 25, title: "Movie Night", time: "7:30 PM", color: "#34c759" },
]

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

export function CalendarApp() {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate())

  const firstDay = new Date(currentYear, currentMonth, 1).getDay()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

  const days: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
    setSelectedDay(null)
  }

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
    setSelectedDay(null)
  }

  const dayEvents = selectedDay ? events.filter((e) => e.day === selectedDay) : []
  const isToday = (day: number) =>
    day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()

  return (
    <div className="h-full flex" style={{ background: "#fafafa" }}>
      {/* Calendar grid */}
      <div className="flex-1 flex flex-col p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[18px] font-semibold" style={{ color: "#1d1d1f" }}>
            {MONTHS[currentMonth]} {currentYear}
          </h2>
          <div className="flex items-center gap-1">
            <button
              className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-black/5 transition-colors"
              onClick={prevMonth}
            >
              <ChevronLeft size={16} style={{ color: "#86868b" }} />
            </button>
            <button
              className="px-3 py-1 rounded-md text-[12px] font-medium hover:bg-black/5 transition-colors"
              style={{ color: "#0071e3" }}
              onClick={() => {
                setCurrentMonth(today.getMonth())
                setCurrentYear(today.getFullYear())
                setSelectedDay(today.getDate())
              }}
            >
              Today
            </button>
            <button
              className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-black/5 transition-colors"
              onClick={nextMonth}
            >
              <ChevronRight size={16} style={{ color: "#86868b" }} />
            </button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-[11px] font-medium py-1" style={{ color: "#86868b" }}>
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1 flex-1">
          {days.map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} />
            const hasEvents = events.some((e) => e.day === day)
            const selected = selectedDay === day
            return (
              <button
                key={day}
                className="flex flex-col items-center justify-start pt-1 rounded-lg transition-colors relative"
                style={{
                  background: selected
                    ? "#0071e3"
                    : isToday(day)
                    ? "rgba(0,113,227,0.08)"
                    : "transparent",
                }}
                onClick={() => setSelectedDay(day)}
              >
                <span
                  className="text-[13px] font-medium"
                  style={{
                    color: selected
                      ? "#ffffff"
                      : isToday(day)
                      ? "#0071e3"
                      : "#1d1d1f",
                  }}
                >
                  {day}
                </span>
                {hasEvents && (
                  <div
                    className="w-1 h-1 rounded-full mt-0.5"
                    style={{
                      background: selected ? "#ffffff" : "#0071e3",
                    }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Event sidebar */}
      <div
        className="w-[200px] shrink-0 p-4 overflow-y-auto"
        style={{ borderLeft: "1px solid rgba(0,0,0,0.06)" }}
      >
        <h3 className="text-[13px] font-semibold mb-3" style={{ color: "#1d1d1f" }}>
          {selectedDay
            ? `${MONTHS[currentMonth]} ${selectedDay}`
            : "Select a day"}
        </h3>
        {dayEvents.length > 0 ? (
          <div className="space-y-2">
            {dayEvents.map((ev, i) => (
              <div
                key={i}
                className="rounded-lg p-2.5"
                style={{ background: `${ev.color}12`, borderLeft: `3px solid ${ev.color}` }}
              >
                <p className="text-[12px] font-medium" style={{ color: "#1d1d1f" }}>
                  {ev.title}
                </p>
                <p className="text-[11px]" style={{ color: "#86868b" }}>{ev.time}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[12px]" style={{ color: "#86868b" }}>
            {selectedDay ? "No events" : "Select a day to see events"}
          </p>
        )}
      </div>
    </div>
  )
}
