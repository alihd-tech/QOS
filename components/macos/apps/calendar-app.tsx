"use client"

import { useState, useCallback } from "react"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from "lucide-react"

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

  const prevMonth = useCallback(() => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(prev => prev - 1)
    } else {
      setCurrentMonth(prev => prev - 1)
    }
    setSelectedDay(null)
  }, [currentMonth])

  const nextMonth = useCallback(() => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(prev => prev + 1)
    } else {
      setCurrentMonth(prev => prev + 1)
    }
    setSelectedDay(null)
  }, [currentMonth])

  const goToToday = useCallback(() => {
    setCurrentMonth(today.getMonth())
    setCurrentYear(today.getFullYear())
    setSelectedDay(today.getDate())
  }, [today])

  const dayEvents = selectedDay ? events.filter(e => e.day === selectedDay) : []
  const isToday = (day: number) =>
    day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()

  return (
    <div className="h-full flex flex-col lg:flex-row bg-background text-foreground overflow-hidden">
      {/* Main Calendar Section */}
      <div className="flex-1 flex flex-col p-4 sm:p-5 overflow-y-auto">
        {/* Header with month navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
            {MONTHS[currentMonth]} {currentYear}
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="p-2 rounded-full hover:bg-muted transition-colors active:scale-95 touch-manipulation"
              aria-label="Previous month"
            >
              <ChevronLeft size={18} className="text-muted-foreground" />
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors active:scale-95 touch-manipulation"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="p-2 rounded-full hover:bg-muted transition-colors active:scale-95 touch-manipulation"
              aria-label="Next month"
            >
              <ChevronRight size={18} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAYS.map(day => (
            <div
              key={day}
              className="text-center text-xs sm:text-sm font-medium text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1 flex-1 auto-rows-fr">
          {days.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="aspect-square p-1" />
            }
            const hasEvents = events.some(e => e.day === day)
            const isSelected = selectedDay === day
            const isCurrentDay = isToday(day)

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`
                  relative aspect-square p-1 rounded-xl transition-all duration-200
                  flex flex-col items-center justify-center
                  hover:bg-muted/60 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50
                  ${isSelected ? "bg-primary text-primary-foreground shadow-md" : ""}
                  ${!isSelected && isCurrentDay ? "bg-primary/10 text-primary font-semibold" : ""}
                `}
              >
                <span className={`text-sm sm:text-base ${isSelected ? "font-semibold" : "font-medium"}`}>
                  {day}
                </span>
                {hasEvents && (
                  <div
                    className={`
                      w-1.5 h-1.5 rounded-full mt-1 transition-all
                      ${isSelected ? "bg-primary-foreground" : "bg-primary"}
                    `}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Events Sidebar - responsive: below calendar on mobile, right column on desktop */}
      <div className={`
        lg:w-80 w-full border-t lg:border-t-0 lg:border-l border-border
        bg-muted/5 backdrop-blur-sm
        flex flex-col
        ${dayEvents.length > 0 ? "h-auto" : ""}
      `}>
        {/* Sidebar Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon size={18} className="text-primary" />
            <h3 className="text-base sm:text-lg font-semibold">
              {selectedDay
                ? `${MONTHS[currentMonth]} ${selectedDay}`
                : "Select a day"}
            </h3>
          </div>
          {/* Placeholder for add event button - future enhancement */}
          <button
            className="p-1.5 rounded-full hover:bg-muted transition-colors active:scale-95"
            aria-label="Add event (coming soon)"
            disabled
          >
            <Plus size={16} className="text-muted-foreground" />
          </button>
        </div>

        {/* Events List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {selectedDay ? (
            dayEvents.length > 0 ? (
              dayEvents.map((event, idx) => (
                <div
                  key={idx}
                  className="group rounded-xl p-3 transition-all hover:shadow-md cursor-default"
                  style={{ backgroundColor: `${event.color}0c`, borderLeft: `3px solid ${event.color}` }}
                >
                  <p className="text-sm font-medium text-foreground mb-1">
                    {event.title}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: event.color }} />
                    {event.time}
                  </p>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                  <CalendarIcon size={20} className="text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">No events scheduled</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Enjoy your day!</p>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                <CalendarIcon size={20} className="text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Pick a day to see events</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}