"use client"

import { useState, useEffect, useRef } from "react"
import {
  Terminal,
  Plug,
  Power,
  Save,
  Trash2,
  Key,
  Lock,
  Server,
  User,
  Globe,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react"

// Mock file system for the simulated SSH session
interface FileEntry {
  type: "file" | "dir"
  name: string
  size?: number
  content?: string
  children?: Record<string, FileEntry>
}

const mockFileSystem: Record<string, FileEntry> = {
  "/": {
    type: "dir",
    name: "/",
    children: {
      home: {
        type: "dir",
        name: "home",
        children: {
          user: {
            type: "dir",
            name: "user",
            children: {
              documents: {
                type: "dir",
                name: "documents",
                children: {
                  "readme.txt": {
                    type: "file",
                    name: "readme.txt",
                    size: 124,
                    content: "Welcome to your SSH simulation!\nThis is a mock environment.\nYou can run basic commands like ls, cd, pwd, cat, echo, mkdir, touch, rm.\n",
                  },
                },
              },
              downloads: { type: "dir", name: "downloads", children: {} },
              ".bashrc": {
                type: "file",
                name: ".bashrc",
                size: 342,
                content: "alias ll='ls -la'\nexport PS1='\\u@ssh-sim:~$ '\n",
              },
            },
          },
        },
      },
      etc: {
        type: "dir",
        name: "etc",
        children: {
          hostname: { type: "file", name: "hostname", size: 8, content: "ssh-sim\n" },
          osrelease: { type: "file", name: "os-release", size: 120, content: "NAME=\"QOS Simulation\"\nVERSION=\"1.0\"\n" },
        },
      },
      tmp: { type: "dir", name: "tmp", children: {} },
      var: { type: "dir", name: "var", children: { log: { type: "dir", name: "log", children: {} } } },
    },
  },
}

// Helper to navigate the mock filesystem
function getNodeAtPath(path: string, fs: Record<string, FileEntry>, cwd: string): { node: FileEntry; fullPath: string } | null {
  let resolvedPath = path.startsWith("/") ? path : `${cwd}/${path}`.replace(/\/+/g, "/")
  // Normalize: remove trailing slash except root, resolve . and ..
  const parts = resolvedPath.split("/").filter(p => p !== "" && p !== ".")
  const stack: string[] = []
  for (const part of parts) {
    if (part === "..") stack.pop()
    else stack.push(part)
  }
  resolvedPath = "/" + stack.join("/")
  let current: FileEntry | undefined = fs["/"]
  let currentPath = "/"
  for (const part of stack) {
    if (current?.type !== "dir" || !current.children || !current.children[part]) return null
    current = current.children[part]
    currentPath = currentPath === "/" ? `/${part}` : `${currentPath}/${part}`
  }
  return current ? { node: current, fullPath: currentPath } : null
}

// Command processor for the simulated shell
function processCommand(input: string, cwd: string, fs: Record<string, FileEntry>): { output: string; newCwd: string } {
  const trimmed = input.trim()
  if (trimmed === "") return { output: "", newCwd: cwd }

  const parts = trimmed.split(/\s+/)
  const cmd = parts[0].toLowerCase()
  const args = parts.slice(1)

  // Help command
  if (cmd === "help") {
    const helpText = `Available commands:
  ls [path]       - List directory contents
  cd <path>       - Change current directory
  pwd             - Print working directory
  cat <file>      - Display file content
  echo <text>     - Print text
  mkdir <name>    - Create directory (simulated)
  touch <file>    - Create empty file (simulated)
  rm <file|dir>   - Remove file/directory (simulated)
  clear           - Clear terminal screen
  whoami          - Show current user
  hostname        - Show hostname
  date            - Show current date/time
  exit            - Disconnect from SSH session
  help            - Show this help`
    return { output: helpText, newCwd: cwd }
  }

  // List directory
  if (cmd === "ls") {
    const targetPath = args[0] || "."
    const target = getNodeAtPath(targetPath, fs, cwd)
    if (!target || target.node.type !== "dir") {
      return { output: `ls: cannot access '${targetPath}': No such directory`, newCwd: cwd }
    }
    const children = target.node.children || {}
    const entries = Object.keys(children).map(name => {
      const entry = children[name]
      return entry.type === "dir" ? `${name}/` : name
    })
    const output = entries.length ? entries.join("  ") : "(empty)"
    return { output, newCwd: cwd }
  }

  // Change directory
  if (cmd === "cd") {
    if (args.length === 0) {
      return { output: "", newCwd: "/home/user" }
    }
    const target = getNodeAtPath(args[0], fs, cwd)
    if (!target || target.node.type !== "dir") {
      return { output: `cd: ${args[0]}: No such directory`, newCwd: cwd }
    }
    return { output: "", newCwd: target.fullPath }
  }

  // Print working directory
  if (cmd === "pwd") {
    return { output: cwd, newCwd: cwd }
  }

  // Cat file
  if (cmd === "cat") {
    if (args.length === 0) return { output: "cat: missing file operand", newCwd: cwd }
    const target = getNodeAtPath(args[0], fs, cwd)
    if (!target || target.node.type !== "file") {
      return { output: `cat: ${args[0]}: No such file`, newCwd: cwd }
    }
    const content = target.node.content || ""
    return { output: content, newCwd: cwd }
  }

  // Echo
  if (cmd === "echo") {
    return { output: args.join(" "), newCwd: cwd }
  }

  // Mkdir (simulated in memory)
  if (cmd === "mkdir") {
    if (args.length === 0) return { output: "mkdir: missing operand", newCwd: cwd }
    const newDirName = args[0]
    const target = getNodeAtPath(".", fs, cwd)
    if (!target || target.node.type !== "dir") {
      return { output: "mkdir: cannot create directory", newCwd: cwd }
    }
    if (target.node.children && target.node.children[newDirName]) {
      return { output: `mkdir: cannot create directory '${newDirName}': File exists`, newCwd: cwd }
    }
    if (!target.node.children) target.node.children = {}
    target.node.children[newDirName] = { type: "dir", name: newDirName, children: {} }
    return { output: "", newCwd: cwd }
  }

  // Touch (simulated)
  if (cmd === "touch") {
    if (args.length === 0) return { output: "touch: missing file operand", newCwd: cwd }
    const fileName = args[0]
    const target = getNodeAtPath(".", fs, cwd)
    if (!target || target.node.type !== "dir") return { output: "touch: cannot create file", newCwd: cwd }
    if (!target.node.children) target.node.children = {}
    if (!target.node.children[fileName]) {
      target.node.children[fileName] = { type: "file", name: fileName, content: "", size: 0 }
    }
    return { output: "", newCwd: cwd }
  }

  // Rm (simulated)
  if (cmd === "rm") {
    if (args.length === 0) return { output: "rm: missing operand", newCwd: cwd }
    const rmPath = args[0]
    const target = getNodeAtPath(rmPath, fs, cwd)
    if (!target) return { output: `rm: cannot remove '${rmPath}': No such file or directory`, newCwd: cwd }
    const parentPath = target.fullPath.substring(0, target.fullPath.lastIndexOf("/")) || "/"
    const parent = getNodeAtPath(parentPath, fs, cwd)
    if (parent && parent.node.children) {
      const name = target.fullPath.split("/").pop()!
      delete parent.node.children[name]
      return { output: "", newCwd: cwd }
    }
    return { output: `rm: cannot remove '${rmPath}': Permission denied`, newCwd: cwd }
  }

  // Clear
  if (cmd === "clear") {
    return { output: "CLEAR", newCwd: cwd }
  }

  // Whoami
  if (cmd === "whoami") {
    return { output: "ssh-user", newCwd: cwd }
  }

  // Hostname
  if (cmd === "hostname") {
    return { output: "ssh-sim.qos.local", newCwd: cwd }
  }

  // Date
  if (cmd === "date") {
    return { output: new Date().toString(), newCwd: cwd }
  }

  // Exit (disconnect)
  if (cmd === "exit") {
    return { output: "EXIT", newCwd: cwd }
  }

  return { output: `bash: ${cmd}: command not found`, newCwd: cwd }
}

// Terminal component (similar to the one in k8s app)
interface TerminalProps {
  onDisconnect: () => void
  connectionInfo: { host: string; username: string }
}

function SshTerminal({ onDisconnect, connectionInfo }: TerminalProps) {
  const [history, setHistory] = useState<{ type: "command" | "output"; content: string }[]>([])
  const [input, setInput] = useState("")
  const [cwd, setCwd] = useState("/home/user")
  const [fs] = useState(() => JSON.parse(JSON.stringify(mockFileSystem))) // deep copy
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [connected, setConnected] = useState(true)

  const scrollToBottom = () => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }

  useEffect(() => {
    // Initial welcome message
    setHistory([
      { type: "output", content: `Connected to ${connectionInfo.host} (SSH-2.0-OpenSSH_8.9)` },
      { type: "output", content: `Last login: ${new Date().toLocaleString()} from localhost` },
      { type: "output", content: `Welcome to ${connectionInfo.host}!` },
      { type: "output", content: `Type 'help' for a list of commands.` },
    ])
    scrollToBottom()
  }, [connectionInfo])

  const handleCommand = () => {
    if (!input.trim()) return
    const cmd = input.trim()
    const prompt = `${connectionInfo.username}@${connectionInfo.host}:${cwd}$ `
    setHistory(prev => [...prev, { type: "command", content: prompt + cmd }])

    const { output, newCwd } = processCommand(cmd, cwd, fs)
    if (output === "CLEAR") {
      setHistory([])
    } else if (output === "EXIT") {
      setHistory(prev => [...prev, { type: "output", content: "Connection closed." }])
      setConnected(false)
      setTimeout(() => onDisconnect(), 1500)
    } else {
      if (output) {
        setHistory(prev => [...prev, { type: "output", content: output }])
      }
      setCwd(newCwd)
    }
    setInput("")
    setTimeout(() => {
      scrollToBottom()
      inputRef.current?.focus()
    }, 0)
  }

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="p-4 rounded-full bg-muted mb-3">
          <Power className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">Disconnected</p>
        <p className="text-xs text-muted-foreground mt-1">Click "New Connection" to reconnect.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl overflow-hidden border border-border bg-secondary">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-primary" />
          <span className="text-xs font-mono text-foreground">
            {connectionInfo.username}@{connectionInfo.host}:{cwd}
          </span>
        </div>
        <button
          onClick={() => {
            setHistory(prev => [...prev, { type: "command", content: "exit" }])
            setTimeout(() => {
              setHistory(prev => [...prev, { type: "output", content: "EXIT" }])
              setConnected(false)
              onDisconnect()
            }, 100)
          }}
          className="p-1 rounded hover:bg-muted-foreground/20 transition-colors"
          title="Disconnect"
        >
          <Power className="w-3.5 h-3.5 text-red-500" />
        </button>
      </div>
      <div
        ref={terminalRef}
        className="h-[400px] overflow-y-auto p-3 font-mono text-xs text-secondary-foreground"
        onClick={() => inputRef.current?.focus()}
      >
        {history.map((item, idx) => (
          <div key={idx} className="mb-1 whitespace-pre-wrap">
            {item.type === "command" ? (
              <span className="text-primary">{item.content}</span>
            ) : (
              <span>{item.content}</span>
            )}
          </div>
        ))}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-primary whitespace-nowrap">{connectionInfo.username}@{connectionInfo.host}:{cwd}$ </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCommand()}
            className="flex-1 bg-transparent outline-none font-mono text-xs text-foreground"
            placeholder="Type a command..."
            autoFocus
          />
        </div>
      </div>
    </div>
  )
}

// Connection form and saved profiles
interface ConnectionProfile {
  id: string
  name: string
  host: string
  port: number
  username: string
  authType: "password" | "key"
  // For simulation, we don't store actual secrets
}

const STORAGE_KEY = "ssh-client-profiles"

export function SshClientApp() {
  const [profiles, setProfiles] = useState<ConnectionProfile[]>([])
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null)
  const [connected, setConnected] = useState(false)
  const [connectionInfo, setConnectionInfo] = useState({ host: "", username: "" })
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    host: "demo.example.com",
    port: 22,
    username: "user",
    authType: "password" as const,
  })

  // Load profiles from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setProfiles(JSON.parse(stored))
      } catch (e) {}
    }
  }, [])

  const saveProfiles = (newProfiles: ConnectionProfile[]) => {
    setProfiles(newProfiles)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfiles))
  }

  const handleSaveProfile = () => {
    if (!formData.name.trim()) return
    const newProfile: ConnectionProfile = {
      id: Date.now().toString(),
      name: formData.name,
      host: formData.host,
      port: formData.port,
      username: formData.username,
      authType: formData.authType,
    }
    saveProfiles([...profiles, newProfile])
    setShowForm(false)
    setFormData({ name: "", host: "demo.example.com", port: 22, username: "user", authType: "password" })
  }

  const handleDeleteProfile = (id: string) => {
    saveProfiles(profiles.filter(p => p.id !== id))
    if (selectedProfileId === id) setSelectedProfileId(null)
  }

  const handleConnect = (profile: ConnectionProfile) => {
    // For simulation, we just set connected state
    setConnectionInfo({ host: profile.host, username: profile.username })
    setConnected(true)
  }

  const handleDisconnect = () => {
    setConnected(false)
    setSelectedProfileId(null)
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 shrink-0 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-primary">
            <Terminal className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">SSH Client</h2>
            <p className="text-xs text-muted-foreground">Secure remote terminal access</p>
          </div>
        </div>
        {!connected && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plug className="w-3.5 h-3.5" />
            New Connection
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {!connected ? (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Saved profiles */}
            {profiles.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Save className="w-4 h-4 text-muted-foreground" />
                  Saved Connections
                </h3>
                <div className="grid gap-2">
                  {profiles.map(profile => (
                    <div
                      key={profile.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-border bg-card hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-center gap-3">
                        <Server className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{profile.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {profile.username}@{profile.host}:{profile.port}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleConnect(profile)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          Connect
                        </button>
                        <button
                          onClick={() => handleDeleteProfile(profile.id)}
                          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Connection form */}
            {showForm && (
              <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Plug className="w-4 h-4" />
                  New SSH Connection
                </h3>
                <div className="grid gap-4">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Connection Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="My Server"
                      className="w-full px-3 py-1.5 rounded-lg text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">Host</label>
                      <input
                        type="text"
                        value={formData.host}
                        onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                        placeholder="example.com"
                        className="w-full px-3 py-1.5 rounded-lg text-sm border border-border bg-background"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">Port</label>
                      <input
                        type="number"
                        value={formData.port}
                        onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) || 22 })}
                        className="w-full px-3 py-1.5 rounded-lg text-sm border border-border bg-background"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Username</label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="root"
                      className="w-full px-3 py-1.5 rounded-lg text-sm border border-border bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-2">Authentication</label>
                    <div className="flex gap-3">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          checked={formData.authType === "password"}
                          onChange={() => setFormData({ ...formData, authType: "password" })}
                        />
                        Password
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          checked={formData.authType === "key"}
                          onChange={() => setFormData({ ...formData, authType: "key" })}
                        />
                        Private Key
                      </label>
                    </div>
                  </div>
                  {formData.authType === "password" ? (
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full px-3 py-1.5 rounded-lg text-sm border border-border bg-background"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">Private Key (PEM)</label>
                      <textarea
                        rows={3}
                        placeholder="-----BEGIN RSA PRIVATE KEY-----"
                        className="w-full px-3 py-1.5 rounded-lg text-sm font-mono border border-border bg-background"
                      />
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowForm(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Save & Connect
                  </button>
                </div>
                <div className="text-xs text-muted-foreground border-t border-border pt-3 mt-2">
                  <p>ℹ️ This is a <strong>simulated</strong> SSH client for demonstration. Commands run in a mock filesystem.</p>
                  <p className="mt-1">Try: ls, cd, pwd, cat readme.txt, mkdir test, echo hello, help</p>
                </div>
              </div>
            )}

            {!showForm && profiles.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-4 rounded-full bg-muted mb-3">
                  <Terminal className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">No saved connections</p>
                <p className="text-xs text-muted-foreground mt-1">Click "New Connection" to add an SSH server.</p>
              </div>
            )}
          </div>
        ) : (
          // Terminal view when connected
          <div className="max-w-4xl mx-auto">
            <SshTerminal onDisconnect={handleDisconnect} connectionInfo={connectionInfo} />
          </div>
        )}
      </div>
    </div>
  )
}

export default SshClientApp