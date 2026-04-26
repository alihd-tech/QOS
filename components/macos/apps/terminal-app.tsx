"use client"

import React from "react"

import { useState, useRef, useEffect, useCallback } from "react"

interface TerminalLine {
  type: "input" | "output"
  text: string
}

const INITIAL_LINES: TerminalLine[] = [
  {
    type: "output",
    text: "Last login: Wed Feb  5 10:00:00 on ttys000",
  },
]

const HELP_TEXT = `Available commands:
  help      - Show this help message
  clear     - Clear terminal
  echo      - Print text
  date      - Show current date
  whoami    - Show current user
  ls        - List files
  pwd       - Show current directory
  uname     - Show system info
  uptime    - Show uptime
  neofetch  - Show system info (styled)
  history   - Show command history
  cat       - Display file contents`

const NEOFETCH = `
                    'c.         user@macOS-web
                 ,xNMM.        ----------------
               .OMMMMo         OS: macOS Web 15.0
               OMMM0,          Host: Next.js
     .;loddo:' loolloddol;.    Kernel: React 19
   cKMMMMMMMMMMNWMMMMMMMMMM0:  Shell: WebTerminal 1.0
 .KMMMMMMMMMMMMMMMMMMMMMMMWd.  Resolution: ${typeof window !== "undefined" ? window.innerWidth : 1920}x${typeof window !== "undefined" ? window.innerHeight : 1080}
 XMMMMMMMMMMMMMMMMMMMMMMMX.   Terminal: WebTerminal
;MMMMMMMMMMMMMMMMMMMMMMMM:    CPU: JavaScript Engine
:MMMMMMMMMMMMMMMMMMMMMMMM:    Memory: Unlimited
.MMMMMMMMMMMMMMMMMMMMMMMMX.
 kMMMMMMMMMMMMMMMMMMMMMMMMWd.
 .XMMMMMMMMMMMMMMMMMMMMMMMMk
  .XMMMMMMMMMMMMMMMMMMMMK.
    kMMMMMMMMMMMMMMMMMMd
     ;KMMMMMMMWXXWMMMKl.
       .cooc,.    .,coo:.`

export function TerminalApp() {
  const [lines, setLines] = useState<TerminalLine[]>(INITIAL_LINES)
  const [currentInput, setCurrentInput] = useState("")
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [lines])

  const focusInput = () => inputRef.current?.focus()

  const processCommand = useCallback(
    (cmd: string) => {
      const trimmed = cmd.trim()
      const parts = trimmed.split(" ")
      const command = parts[0].toLowerCase()
      const args = parts.slice(1).join(" ")

      let output = ""

      switch (command) {
        case "":
          break
        case "help":
          output = HELP_TEXT
          break
        case "clear":
          setLines([])
          setCurrentInput("")
          setHistory((prev) => [...prev, trimmed])
          return
        case "echo":
          output = args || ""
          break
        case "date":
          output = new Date().toString()
          break
        case "whoami":
          output = "user"
          break
        case "ls":
          output =
            "Desktop     Documents   Downloads   Music\nPictures    Public      Applications"
          break
        case "pwd":
          output = "/Users/user"
          break
        case "uname":
          output = args === "-a"
            ? "macOS-Web 15.0 NextJS React19 WASM"
            : "macOS-Web"
          break
        case "uptime":
          output = `${new Date().toLocaleTimeString()} up ${Math.floor(Math.random() * 30 + 1)} days, ${Math.floor(Math.random() * 24)}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`
          break
        case "neofetch":
          output = NEOFETCH
          break
        case "history":
          output = [...history, trimmed]
            .map((h, i) => `  ${i + 1}  ${h}`)
            .join("\n")
          break
        case "cat":
          if (!args) {
            output = "usage: cat <filename>"
          } else {
            output = `cat: ${args}: No such file or directory`
          }
          break
        default:
          output = `zsh: command not found: ${command}`
      }

      setLines((prev) => [
        ...prev,
        { type: "input", text: `user@macOS-web ~ % ${trimmed}` },
        ...(output ? [{ type: "output" as const, text: output }] : []),
      ])
      setHistory((prev) => [...prev, trimmed])
      setHistoryIndex(-1)
      setCurrentInput("")
    },
    [history]
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      processCommand(currentInput)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (history.length > 0) {
        const newIndex =
          historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1)
        setHistoryIndex(newIndex)
        setCurrentInput(history[newIndex])
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1
        if (newIndex >= history.length) {
          setHistoryIndex(-1)
          setCurrentInput("")
        } else {
          setHistoryIndex(newIndex)
          setCurrentInput(history[newIndex])
        }
      }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault()
      setLines([])
    }
  }

  return (
    <div
      className="h-full flex flex-col font-mono text-[13px] leading-5 cursor-text"
      style={{ background: "rgba(30,30,30,0.95)", color: "#f0f0f0" }}
      onClick={focusInput}
    >
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3">
        {lines.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap break-all">
            {line.type === "input" ? (
              <span>
                <span style={{ color: "#4ec96e" }}>
                  {line.text.split(" % ")[0]} %{" "}
                </span>
                <span>{line.text.split(" % ")[1]}</span>
              </span>
            ) : (
              <span style={{ color: "#ccc" }}>{line.text}</span>
            )}
          </div>
        ))}

        {/* Current input line */}
        <div className="flex">
          <span style={{ color: "#4ec96e" }}>user@macOS-web ~ % </span>
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              className="bg-transparent outline-none text-[13px] font-mono w-full caret-white"
              style={{ color: "#f0f0f0" }}
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              spellCheck={false}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
