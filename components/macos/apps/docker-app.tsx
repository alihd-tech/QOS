"use client"

import { useState, useRef, useEffect } from "react"
import { 
  Play,
  Square,
  Trash2,
  RefreshCw,
  Copy,
  Check,
  Terminal,
  FileCode,
  Image,
  HardDrive,
  Cpu,
  Clock,
  Globe,
  Plus,
  Download,
  Search,
} from "lucide-react"

const mockContainers = [
  {
    id: "a1b2c3d4e5f6",
    name: "nginx-web",
    image: "nginx:latest",
    status: "running",
    created: "2 hours ago",
    ports: "0.0.0.0:8080->80/tcp",
  },
  {
    id: "b2c3d4e5f6g7",
    name: "redis-cache",
    image: "redis:alpine",
    status: "running",
    created: "5 hours ago",
    ports: "6379/tcp",
  },
  {
    id: "c3d4e5f6g7h8",
    name: "postgres-db",
    image: "postgres:15",
    status: "exited",
    created: "1 day ago",
    ports: "5432/tcp",
  },
  {
    id: "d4e5f6g7h8i9",
    name: "node-app",
    image: "node:18-alpine",
    status: "stopped",
    created: "3 days ago",
    ports: "3000/tcp",
  },
]

const mockImages = [
  { id: "sha256:abc123", name: "nginx", tag: "latest", size: "137MB", created: "2 weeks ago" },
  { id: "sha256:def456", name: "redis", tag: "alpine", size: "45MB", created: "1 month ago" },
  { id: "sha256:ghi789", name: "postgres", tag: "15", size: "380MB", created: "3 weeks ago" },
  { id: "sha256:jkl012", name: "node", tag: "18-alpine", size: "150MB", created: "2 months ago" },
  { id: "sha256:mno345", name: "alpine", tag: "latest", size: "7MB", created: "1 week ago" },
]

const dockerfileExample = `# Use an official Node.js runtime as base image
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000
CMD ["npm", "start"]`

// ----- CLI Playground -----
function DockerCli() {
  const [history, setHistory] = useState<{ type: "command" | "output"; content: string }[]>([
    { type: "output", content: "Docker CLI Playground 🐳\nType 'help' for available commands.\n" },
  ])
  const [input, setInput] = useState("")
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [history])

  const executeCommand = (cmd: string): string => {
    const trimmed = cmd.trim().toLowerCase()
    if (trimmed === "clear") return "CLEAR"
    if (trimmed === "help") {
      return `Available commands:
  docker ps                 - List running containers
  docker ps -a              - List all containers
  docker images             - List images
  docker run hello-world    - Run a test container
  docker stop <container>   - Stop a container
  docker start <container>  - Start a container
  docker rm <container>     - Remove a container
  docker rmi <table>        - Remove an image
  docker version            - Show Docker version
  clear                     - Clear terminal
  help                      - Show this help`
    }
    if (trimmed === "docker ps") {
      return "CONTAINER ID   IMAGE         COMMAND                  CREATED         STATUS         PORTS                    NAMES\na1b2c3d4e5f6   nginx:latest  \"/docker-entrypoint.…\"   2 hours ago     Up 2 hours     0.0.0.0:8080->80/tcp     nginx-web\nb2c3d4e5f6g7   redis:alpine  \"docker-entrypoint.s…\"   5 hours ago     Up 5 hours     6379/tcp                 redis-cache"
    }
    if (trimmed === "docker ps -a") {
      return "CONTAINER ID   IMAGE          COMMAND                  CREATED         STATUS                     PORTS                    NAMES\na1b2c3d4e5f6   nginx:latest   \"/docker-entrypoint.…\"   2 hours ago     Up 2 hours                 0.0.0.0:8080->80/tcp     nginx-web\nb2c3d4e5f6g7   redis:alpine   \"docker-entrypoint.s…\"   5 hours ago     Up 5 hours                 6379/tcp                 redis-cache\nc3d4e5f6g7h8   postgres:15    \"docker-entrypoint.s…\"   1 day ago       Exited (0) 2 hours ago                              postgres-db\nd4e5f6g7h8i9   node:18-alpine \"docker-entrypoint.s…\"   3 days ago      Stopped (0) 1 day ago                                node-app"
    }
    if (trimmed === "docker images") {
      return "REPOSITORY   TAG       IMAGE ID       CREATED        SIZE\nnginx        latest    sha256:abc123   2 weeks ago    137MB\nredis        alpine    sha256:def456   1 month ago    45MB\npostgres     15        sha256:ghi789   3 weeks ago    380MB\nnode         18-alpine sha256:jkl012   2 months ago   150MB\nalpine       latest    sha256:mno345   1 week ago     7MB"
    }
    if (trimmed === "docker run hello-world") {
      return "Unable to find image 'hello-world:latest' locally\nlatest: Pulling from library/hello-world\n719385e32844: Pull complete\nDigest: sha256:abc123\nStatus: Downloaded newer image for hello-world:latest\n\nHello from Docker!\nThis message shows that your installation appears to be working correctly."
    }
    if (trimmed.startsWith("docker stop")) {
      return `Container ${trimmed.split(" ")[2] || "unknown"} stopped successfully.`
    }
    if (trimmed.startsWith("docker start")) {
      return `Container ${trimmed.split(" ")[2] || "unknown"} started successfully.`
    }
    if (trimmed === "docker version") {
      return `Client: Docker Engine - Community\n Version:           24.0.7\n API version:       1.43\nServer: Docker Desktop\n Engine:\n  Version:          24.0.7\n  API version:      1.43\n  Min API version:  1.12`
    }
    return `Error: unknown command "${cmd}"\nType 'help' for available commands.`
  }

  const handleCommand = () => {
    if (!input.trim()) return
    const cmd = input.trim()
    setHistory((prev) => [...prev, { type: "command", content: `$ ${cmd}` }])
    const output = executeCommand(cmd)
    if (output === "CLEAR") {
      setHistory([])
    } else {
      setHistory((prev) => [...prev, { type: "output", content: output }])
    }
    setInput("")
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  return (
    <div className="rounded-xl overflow-hidden border border-border bg-secondary">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted">
        <Terminal className="w-4 h-4 text-primary" />
        <span className="text-xs font-mono text-foreground">docker@docker-desktop</span>
      </div>
      <div
        ref={terminalRef}
        className="h-[300px] overflow-y-auto p-3 font-mono text-xs text-secondary-foreground"
        onClick={() => inputRef.current?.focus()}
      >
        {history.map((item, idx) => (
          <div key={idx} className="mb-1">
            {item.type === "command" ? (
              <span className="text-primary">{item.content}</span>
            ) : (
              <pre className="whitespace-pre-wrap font-mono">{item.content}</pre>
            )}
          </div>
        ))}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-primary">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCommand()}
            className="flex-1 bg-transparent outline-none font-mono text-xs text-foreground"
            placeholder="Type docker command..."
            autoFocus
          />
        </div>
      </div>
    </div>
  )
}

// ----- Containers Table -----
function ContainersTab() {
  const [containers, setContainers] = useState(mockContainers)
  const [search, setSearch] = useState("")
  const filtered = containers.filter(c => c.name.includes(search) || c.image.includes(search))

  const handleStart = (id: string) => setContainers(prev => prev.map(c => c.id === id ? { ...c, status: "running" } : c))
  const handleStop = (id: string) => setContainers(prev => prev.map(c => c.id === id ? { ...c, status: "exited" } : c))
  const handleRemove = (id: string) => setContainers(prev => prev.filter(c => c.id !== id))

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running": return "text-green-500"
      case "exited": return "text-yellow-500"
      default: return "text-muted-foreground"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search containers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded-lg text-xs border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-muted hover:bg-muted/80 transition-colors">
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-muted/50">
            <tr className="border-b border-border">
              <th className="text-left p-3 font-medium text-muted-foreground">Name</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Image</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Ports</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Created</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(container => (
              <tr key={container.id} className="hover:bg-muted/30 transition-colors">
                <td className="p-3 font-medium text-foreground">{container.name}</td>
                <td className="p-3 text-primary">{container.image}</td>
                <td className={`p-3 ${getStatusColor(container.status)}`}>
                  <span className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${container.status === "running" ? "bg-green-500" : container.status === "exited" ? "bg-yellow-500" : "bg-gray-400"}`} />
                    {container.status}
                  </span>
                </td>
                <td className="p-3 text-muted-foreground">{container.ports}</td>
                <td className="p-3 text-muted-foreground">{container.created}</td>
                <td className="p-3">
                  <div className="flex gap-1">
                    {container.status !== "running" && (
                      <button onClick={() => handleStart(container.id)} className="p-1.5 rounded-lg hover:bg-muted" title="Start">
                        <Play className="w-3.5 h-3.5 text-green-500" />
                      </button>
                    )}
                    {container.status === "running" && (
                      <button onClick={() => handleStop(container.id)} className="p-1.5 rounded-lg hover:bg-muted" title="Stop">
                        <Square className="w-3.5 h-3.5 text-yellow-500" />
                      </button>
                    )}
                    <button onClick={() => handleRemove(container.id)} className="p-1.5 rounded-lg hover:bg-muted" title="Remove">
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">No containers found</div>
        )}
      </div>
    </div>
  )
}

// ----- Images Table -----
function ImagesTab() {
  const [images, setImages] = useState(mockImages)
  const [search, setSearch] = useState("")
  const filtered = images.filter(i => i.name.includes(search) || i.tag.includes(search))

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search images..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded-lg text-xs border border-border bg-background"
          />
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90">
          <Download className="w-3.5 h-3.5" />
          Pull Image
        </button>
      </div>
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-muted/50">
            <tr className="border-b border-border">
              <th className="text-left p-3 font-medium text-muted-foreground">Repository</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Tag</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Image ID</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Size</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Created</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(image => (
              <tr key={image.id} className="hover:bg-muted/30">
                <td className="p-3 font-medium text-foreground">{image.name}</td>
                <td className="p-3 text-primary">{image.tag}</td>
                <td className="p-3 font-mono text-muted-foreground">{image.id.slice(0,12)}</td>
                <td className="p-3 text-muted-foreground">{image.size}</td>
                <td className="p-3 text-muted-foreground">{image.created}</td>
                <td className="p-3">
                  <button className="p-1.5 rounded-lg hover:bg-muted">
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ----- Dockerfile Editor -----
function DockerfileEditor() {
  const [content, setContent] = useState(dockerfileExample)
  const [copied, setCopied] = useState(false)
  const copy = () => { navigator.clipboard.writeText(content); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Dockerfile</span>
        </div>
        <div className="flex gap-2">
          <button onClick={copy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-muted hover:bg-muted/80">
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90">
            <Play className="w-3.5 h-3.5" />
            Build Image
          </button>
        </div>
      </div>
      <div className="rounded-xl border border-border overflow-hidden">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-[400px] p-4 font-mono text-xs resize-none outline-none bg-muted/20 text-foreground"
          spellCheck={false}
        />
      </div>
      <div className="rounded-xl p-4 bg-primary/5 border border-primary/20">
        <p className="text-xs text-foreground">
          💡 <strong>Tip:</strong> Edit the Dockerfile above, then click "Build Image" to create a new Docker image.
        </p>
      </div>
    </div>
  )
}

// ----- Concept Card (used in Overview) -----
function ConceptCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="p-4 rounded-xl border border-border bg-card hover:shadow-md transition-all cursor-pointer">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}

// ----- Main DockerApp Component -----
export function DockerApp() {
  const [activeTab, setActiveTab] = useState<"overview" | "containers" | "images" | "dockerfile" | "cli">("overview")
  const tabs = [
    { id: "overview", label: "Overview", icon: Terminal },
    { id: "containers", label: "Containers", icon: HardDrive },
    { id: "images", label: "Images", icon: Image },
    { id: "dockerfile", label: "Dockerfile", icon: FileCode },
    { id: "cli", label: "CLI", icon: Terminal },
  ] as const

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 shrink-0 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-primary">
            <Terminal className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Docker Desktop</h2>
            <p className="text-xs text-muted-foreground">Build, ship, and run containers</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted">
          <Cpu className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Docker Engine 24.0.7</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-5 pt-3 border-b border-border">
        {tabs.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-t-lg transition-all ${
                isActive ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Hero */}
            <div className="rounded-2xl p-6 relative overflow-hidden bg-gradient-to-br from-primary/20 to-background border border-primary/20">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Terminal className="w-5 h-5 text-primary" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">Containers made easy</span>
                </div>
                <h3 className="text-2xl font-bold mb-2 text-foreground">Develop with Docker</h3>
                <p className="text-sm text-muted-foreground max-w-[500px]">
                  Package applications into standardized units for development, shipment, and deployment.
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl p-4 text-center border border-border bg-card">
                <HardDrive className="w-5 h-5 mx-auto mb-2 text-primary" />
                <p className="text-xl font-bold text-foreground">{mockContainers.length}</p>
                <p className="text-xs text-muted-foreground">Containers</p>
              </div>
              <div className="rounded-xl p-4 text-center border border-border bg-card">
                <Image className="w-5 h-5 mx-auto mb-2 text-primary" />
                <p className="text-xl font-bold text-foreground">{mockImages.length}</p>
                <p className="text-xs text-muted-foreground">Images</p>
              </div>
              <div className="rounded-xl p-4 text-center border border-border bg-card">
                <Globe className="w-5 h-5 mx-auto mb-2 text-primary" />
                <p className="text-xl font-bold text-foreground">100+</p>
                <p className="text-xs text-muted-foreground">Pull Requests</p>
              </div>
            </div>

            {/* Key Concepts */}
            <h3 className="text-sm font-semibold text-foreground mb-3">Key Concepts</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <ConceptCard icon={HardDrive} title="Containers" description="Lightweight, standalone, executable packages that include everything needed to run software." />
              <ConceptCard icon={Image} title="Images" description="Read-only templates with instructions for creating a container." />
              <ConceptCard icon={FileCode} title="Dockerfile" description="A text file with commands to build a Docker image." />
              <ConceptCard icon={Globe} title="Docker Hub" description="Cloud-based registry to store and distribute container images." />
            </div>

            {/* Quick Actions */}
            <div className="rounded-xl p-5 border border-border bg-card">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-foreground">
                <Clock className="w-4 h-4" />
                Quick Actions
              </h3>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => setActiveTab("containers")} className="flex items-center gap-2 px-4 py-2 rounded-full text-xs bg-muted hover:bg-muted/80">
                  <Play className="w-3.5 h-3.5" /> Manage Containers
                </button>
                <button onClick={() => setActiveTab("images")} className="flex items-center gap-2 px-4 py-2 rounded-full text-xs bg-muted hover:bg-muted/80">
                  <Download className="w-3.5 h-3.5" /> Pull Images
                </button>
                <button onClick={() => setActiveTab("dockerfile")} className="flex items-center gap-2 px-4 py-2 rounded-full text-xs bg-muted hover:bg-muted/80">
                  <Plus className="w-3.5 h-3.5" /> New Dockerfile
                </button>
              </div>
            </div>
          </div>
        )}
        {activeTab === "containers" && <ContainersTab />}
        {activeTab === "images" && <ImagesTab />}
        {activeTab === "dockerfile" && <DockerfileEditor />}
        {activeTab === "cli" && <DockerCli />}
      </div>
    </div>
  )
}

export default DockerApp